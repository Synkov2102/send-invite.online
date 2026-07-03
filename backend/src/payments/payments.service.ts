import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  INVITE_SITE_PRICE,
  INVITE_SITE_SERVICE_NAME,
} from "@invite/shared";
import type { AuthUser } from "../auth/auth.types";
import { SitesService } from "../sites/sites.service";
import { PaymentOrderStore } from "./payment-order.store";
import {
  readRobokassaField,
  readRobokassaShpOrder,
  type RobokassaPayload,
} from "./robokassa-payload";
import {
  createRobokassaSignature,
  isRobokassaSignatureValid,
} from "./robokassa-signature";

type CheckoutBody = {
  site?: unknown;
  siteId?: unknown;
};

type SuccessConfirmBody = {
  invId?: unknown;
  orderId?: unknown;
  outSum?: unknown;
  signature?: unknown;
};

function readString(
  payload: RobokassaPayload,
  ...keys: string[]
): string {
  return readRobokassaField(payload, ...keys);
}

function getPaymentPasswords(testMode: boolean) {
  return testMode
    ? {
        password1: process.env.ROBOKASSA_TEST_PASSWORD1,
        password2: process.env.ROBOKASSA_TEST_PASSWORD2,
      }
    : {
        password1: process.env.ROBOKASSA_PASSWORD1,
        password2: process.env.ROBOKASSA_PASSWORD2,
      };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly orders: PaymentOrderStore,
    private readonly sites: SitesService,
  ) {}

  async createCheckout(body: unknown, user: AuthUser) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BadRequestException({ error: "Некорректные данные заказа." });
    }

    const checkout = body as CheckoutBody;
    const siteId =
      typeof checkout.siteId === "string" && checkout.siteId.trim()
        ? checkout.siteId.trim()
        : null;
    const site = siteId
      ? await this.sites.updateDraftForCheckout(user.id, siteId, checkout.site)
      : await this.sites.createDraftForCheckout(checkout.site, user.id);
    const existingPending = await this.orders.getLatestPendingOrderForSite(site.id);
    const order =
      existingPending ??
      (await this.orders.createOrder({
        amount: INVITE_SITE_PRICE,
        email: user.email,
        ownerId: user.id,
        siteId: site.id,
      }));

    return {
      action: "https://auth.robokassa.ru/Merchant/Index.aspx",
      fields: this.createPaymentFields(order, user.email),
      order: {
        amount: order.amount,
        id: order.id,
        siteId: site.id,
        status: order.status,
      },
    };
  }

  async getOwnedOrder(orderId: string, ownerId: string) {
    const order = await this.orders.getOwnedOrder(orderId, ownerId);

    if (!order) {
      throw new NotFoundException({ error: "Заказ не найден." });
    }

    return this.toOrderStatusResponse(order);
  }

  async getPublicOrderStatus(orderId: string) {
    const order = await this.orders.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException({ error: "Заказ не найден." });
    }

    return this.toOrderStatusResponse(order);
  }

  private toOrderStatusResponse(order: {
    amount: string;
    id: string;
    paidAt: string | null;
    siteId: string;
    status: "pending" | "paid";
  }) {
    return {
      amount: order.amount,
      id: order.id,
      paidAt: order.paidAt,
      siteId: order.siteId,
      siteUrl: order.status === "paid" ? `/invite/sites/${order.siteId}` : null,
      status: order.status,
    };
  }

  async processResult(payload: RobokassaPayload) {
    const outSum = readString(payload, "OutSum", "outSum");
    const invIdRaw = readString(payload, "InvId", "InvID", "invoiceID");
    const signature = readString(payload, "SignatureValue", "signatureValue");
    const orderId = readRobokassaShpOrder(payload);
    const paymentMethod = readString(payload, "PaymentMethod") || null;
    const invId = Number(invIdRaw);

    if (!outSum || !Number.isSafeInteger(invId) || invId < 1 || !signature || !orderId) {
      this.logger.warn(
        `Invalid Result URL payload: outSum=${Boolean(outSum)}, invId=${invIdRaw}, signature=${Boolean(signature)}, orderId=${Boolean(orderId)}`,
      );
      throw new BadRequestException("Invalid payment notification.");
    }

    const config = this.getConfig();
    const expectedSignature = createRobokassaSignature([
      outSum,
      invIdRaw,
      config.password2,
      `Shp_order=${orderId}`,
    ]);

    if (!isRobokassaSignatureValid(expectedSignature, signature)) {
      this.logger.warn(`Invalid Result URL signature for order ${orderId}, invId ${invIdRaw}`);
      throw new UnauthorizedException("Invalid payment signature.");
    }

    return this.completePayment({
      invIdRaw,
      orderId,
      outSum,
      paymentMethod,
    });
  }

  async processSuccessRedirect(body: unknown) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BadRequestException("Invalid success confirmation.");
    }

    const payload = body as SuccessConfirmBody;
    const outSum = typeof payload.outSum === "string" ? payload.outSum.trim() : "";
    const invIdRaw = typeof payload.invId === "string" ? payload.invId.trim() : "";
    const signature = typeof payload.signature === "string" ? payload.signature.trim() : "";
    const orderId = typeof payload.orderId === "string" ? payload.orderId.trim() : "";
    const invId = Number(invIdRaw);

    if (!outSum || !Number.isSafeInteger(invId) || invId < 1 || !signature || !orderId) {
      throw new BadRequestException("Invalid success confirmation.");
    }

    const config = this.getConfig();
    const expectedSignature = createRobokassaSignature([
      outSum,
      invIdRaw,
      config.password1,
      `Shp_order=${orderId}`,
    ]);

    if (!isRobokassaSignatureValid(expectedSignature, signature)) {
      this.logger.warn(`Invalid Success URL signature for order ${orderId}, invId ${invIdRaw}`);
      throw new UnauthorizedException("Invalid payment signature.");
    }

    return this.completePayment({
      invIdRaw,
      orderId,
      outSum,
      paymentMethod: null,
    });
  }

  private async completePayment(input: {
    invIdRaw: string;
    orderId: string;
    outSum: string;
    paymentMethod: string | null;
  }) {
    const invId = Number(input.invIdRaw);
    const order = await this.orders.getOrderByInvoice(invId);

    if (
      !order ||
      order.id !== input.orderId ||
      Math.abs(Number(order.amount) - Number(input.outSum)) > 0.000001
    ) {
      this.logger.warn(
        `Payment mismatch for order ${input.orderId}, invId ${input.invIdRaw}`,
      );
      throw new BadRequestException("Payment does not match the order.");
    }

    await this.orders.markPaidIfPending(invId, input.paymentMethod);
    await this.sites.publishAfterPayment(order.siteId);
    this.logger.log(`Payment completed for order ${order.id}, site ${order.siteId}`);
    return `OK${input.invIdRaw}`;
  }

  private createPaymentFields(
    order: Awaited<ReturnType<PaymentOrderStore["createOrder"]>>,
    email: string | null,
  ) {
    const config = this.getConfig();
    const origin = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    );
    const receipt = encodeURIComponent(
      JSON.stringify({
        items: [
          {
            name: INVITE_SITE_SERVICE_NAME,
            payment_method: "full_payment",
            payment_object: "service",
            quantity: 1,
            sum: Number(INVITE_SITE_PRICE),
            tax: "none",
          },
        ],
      }),
    );
    const successUrl = `${origin}/payment/success?order=${encodeURIComponent(order.id)}`;
    const failUrl = `${origin}/payment/fail?order=${encodeURIComponent(order.id)}`;
    const signature = createRobokassaSignature([
      config.merchantLogin,
      order.amount,
      String(order.invId),
      receipt,
      successUrl,
      "GET",
      failUrl,
      "GET",
      config.password1,
      `Shp_order=${order.id}`,
    ]);

    return {
      Culture: "ru",
      Description: INVITE_SITE_SERVICE_NAME,
      Email: email ?? "",
      Encoding: "utf-8",
      FailUrl2: failUrl,
      FailUrl2Method: "GET",
      InvId: String(order.invId),
      IsTest: config.testMode ? "1" : "0",
      MerchantLogin: config.merchantLogin,
      OutSum: order.amount,
      Receipt: receipt,
      Shp_order: order.id,
      SignatureValue: signature,
      SuccessUrl2: successUrl,
      SuccessUrl2Method: "GET",
    };
  }

  private getConfig() {
    const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
    const testMode = process.env.ROBOKASSA_TEST_MODE === "true";
    const { password1, password2 } = getPaymentPasswords(testMode);

    if (!merchantLogin || !password1 || !password2) {
      throw new ServiceUnavailableException({
        error: "Оплата временно недоступна: магазин Robokassa не настроен.",
      });
    }

    return { merchantLogin, password1, password2, testMode };
  }
}
