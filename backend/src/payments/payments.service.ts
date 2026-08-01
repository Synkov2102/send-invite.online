import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  INVITE_SITE_SERVICE_NAME,
  parseCheckoutBody,
  parsePromoPreviewBody,
  type PromoPricing,
} from "@invite/shared";
import type { AuthUser } from "../auth/auth.types";
import { SitesService } from "../sites/sites.service";
import { PaymentOrderStore, type PaymentOrder } from "./payment-order.store";
import { PromoService } from "./promo.service";
import type { PromoCode } from "./promo-code.store";
import {
  readRobokassaField,
  readRobokassaShpOrder,
  type RobokassaPayload,
} from "./robokassa-payload";
import {
  createRobokassaSignature,
  isRobokassaSignatureValid,
} from "./robokassa-signature";

type SuccessConfirmBody = {
  invId?: unknown;
  orderId?: unknown;
  outSum?: unknown;
  signature?: unknown;
};

const STALE_PENDING_SWEEP_MS = 5 * 60 * 1000;

function readString(payload: RobokassaPayload, ...keys: string[]): string {
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

function samePromoSnapshot(
  order: PaymentOrder,
  pricing: PromoPricing,
  promo: PromoCode | null,
) {
  return (
    order.amount === pricing.amount &&
    order.originalAmount === pricing.originalAmount &&
    order.discountAmount === pricing.discountAmount &&
    order.promoCodeId === (promo?.id ?? null) &&
    order.promoCode === (promo?.code ?? null)
  );
}

@Injectable()
export class PaymentsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsService.name);
  private stalePendingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly orders: PaymentOrderStore,
    private readonly sites: SitesService,
    private readonly promoService: PromoService,
  ) {}

  onModuleInit() {
    void this.sweepStalePendingReservations();
    this.stalePendingTimer = setInterval(() => {
      void this.sweepStalePendingReservations();
    }, STALE_PENDING_SWEEP_MS);
  }

  onModuleDestroy() {
    if (this.stalePendingTimer) {
      clearInterval(this.stalePendingTimer);
      this.stalePendingTimer = null;
    }
  }

  private async sweepStalePendingReservations() {
    try {
      const released = await this.promoService.expireStalePendingReservations();
      if (released > 0) {
        this.logger.log(`Released ${released} stale pending promo reservation(s).`);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to expire stale pending reservations: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  getPricing() {
    return this.promoService.getPublicPricing();
  }

  async previewPromo(body: unknown, user: AuthUser, ip: string | null) {
    const parsed = parsePromoPreviewBody(body);

    if (!parsed.ok) {
      throw new BadRequestException({ error: parsed.error });
    }

    const preview = await this.promoService.preview(parsed.payload.promoCode, user.id, ip);

    if (!preview.ok) {
      throw new BadRequestException({ error: preview.error });
    }

    return {
      amount: preview.pricing.amount,
      discountAmount: preview.pricing.discountAmount,
      originalAmount: preview.pricing.originalAmount,
      promoCode: preview.promoCode,
    };
  }

  async createCheckout(body: unknown, user: AuthUser, ip: string | null) {
    await this.sweepStalePendingReservations();

    const parsed = parseCheckoutBody(body);

    if (!parsed.ok) {
      throw new BadRequestException({ error: parsed.error });
    }

    const { promoCode: rawPromoCode, site: sitePayload, siteId: rawSiteId } = parsed.payload;
    const siteId = rawSiteId ?? null;
    const site = siteId
      ? await this.sites.updateDraftForCheckout(user.id, siteId, sitePayload)
      : await this.sites.createDraftForCheckout(sitePayload, user.id);

    const resolved = await this.promoService.resolveForCheckout(rawPromoCode, user.id, {
      ip,
      siteId: site.id,
    });

    if (!resolved.ok) {
      throw new BadRequestException({ error: resolved.error });
    }

    const { pricing, promo } = resolved;
    const existingPending = await this.orders.getLatestPendingOrderForSite(site.id);
    let order: PaymentOrder;

    if (existingPending && samePromoSnapshot(existingPending, pricing, promo)) {
      order = existingPending;
    } else {
      const cancelled = await this.orders.cancelPendingOrdersForSite(site.id);
      await this.promoService.releaseReservations(cancelled);

      if (promo) {
        const reserved = await this.promoService.reserveForNewOrder(promo, {
          ip,
          siteId: site.id,
          userId: user.id,
        });

        if (!reserved.ok) {
          throw new BadRequestException({ error: reserved.error });
        }
      }

      try {
        order = await this.orders.createOrder({
          amount: pricing.amount,
          discountAmount: pricing.discountAmount,
          email: user.email,
          originalAmount: pricing.originalAmount,
          ownerId: user.id,
          promoCode: promo?.code ?? null,
          promoCodeId: promo?.id ?? null,
          siteId: site.id,
        });
      } catch (error) {
        if (promo) {
          await this.promoService.releaseReservation({
            amount: pricing.amount,
            codeNormalized: promo.code,
            discountAmount: pricing.discountAmount,
            originalAmount: pricing.originalAmount,
            promoCodeId: promo.id,
            reason: "order_create_failed",
            siteId: site.id,
            userId: user.id,
          });
        }
        throw error;
      }

      if (promo) {
        this.promoService.logCheckoutApply({
          amount: pricing.amount,
          codeNormalized: promo.code,
          discountAmount: pricing.discountAmount,
          ip,
          orderId: order.id,
          originalAmount: pricing.originalAmount,
          promoCodeId: promo.id,
          siteId: site.id,
          userId: user.id,
        });
      }
    }

    if (Number(order.amount) <= 0) {
      await this.completeFreeOrder(order);
      const paidOrder = (await this.orders.getOrderById(order.id)) ?? {
        ...order,
        paidAt: new Date().toISOString(),
        status: "paid" as const,
      };
      return {
        free: true as const,
        order: this.toOwnedOrderStatusResponse(paidOrder),
      };
    }

    return {
      action: "https://auth.robokassa.ru/Merchant/Index.aspx",
      fields: this.createPaymentFields(order, user.email),
      free: false as const,
      order: {
        amount: order.amount,
        discountAmount: order.discountAmount,
        id: order.id,
        originalAmount: order.originalAmount,
        promoCode: order.promoCode,
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

    return this.toOwnedOrderStatusResponse(order);
  }

  async getPublicOrderStatus(orderId: string) {
    const order = await this.orders.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException({ error: "Заказ не найден." });
    }

    return this.toPublicOrderStatusResponse(order);
  }

  private toPublicOrderStatusResponse(order: PaymentOrder) {
    return {
      amount: order.amount,
      discountAmount: order.discountAmount,
      id: order.id,
      originalAmount: order.originalAmount,
      paidAt: order.paidAt,
      siteId: order.siteId,
      siteUrl: order.status === "paid" ? `/invite/sites/${order.siteId}` : null,
      status: order.status,
    };
  }

  private toOwnedOrderStatusResponse(order: PaymentOrder) {
    return {
      ...this.toPublicOrderStatusResponse(order),
      promoCode: order.promoCode,
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

  private async completeFreeOrder(order: PaymentOrder) {
    if (order.status === "cancelled") {
      throw new BadRequestException({ error: "Заказ недоступен для оплаты." });
    }

    if (order.status === "pending") {
      const paid = await this.orders.markPaidIfPending(order.invId, "promo_free");

      if (!paid) {
        const current = await this.orders.getOrderById(order.id);

        if (current?.status !== "paid") {
          throw new BadRequestException({ error: "Не удалось применить промокод." });
        }
      }
    }

    const paidOrder = await this.orders.getOrderById(order.id);

    if (!paidOrder || paidOrder.status !== "paid") {
      throw new BadRequestException({ error: "Не удалось применить промокод." });
    }

    const confirmed = await this.promoService.confirmReservationForPaidOrder(paidOrder);

    if (!confirmed.ok) {
      throw new BadRequestException({ error: "Не удалось применить промокод." });
    }

    await this.sites.publishAfterPayment(order.siteId);
    this.logger.log(`Free promo checkout completed for order ${order.id}, site ${order.siteId}`);
  }

  private async completePayment(input: {
    invIdRaw: string;
    orderId: string;
    outSum: string;
    paymentMethod: string | null;
  }) {
    const invId = Number(input.invIdRaw);
    const order = await this.orders.getOrderByInvoice(invId);
    const paidAmount = Number(input.outSum);
    const orderAmount = order ? Number(order.amount) : Number.NaN;
    const amountMatches =
      Number.isFinite(paidAmount) &&
      Number.isFinite(orderAmount) &&
      Math.abs(orderAmount - paidAmount) <= 0.000001;

    if (!order || order.id !== input.orderId || !amountMatches) {
      this.logger.warn(
        `Payment mismatch for order ${input.orderId}, invId ${input.invIdRaw}`,
      );
      throw new BadRequestException("Payment does not match the order.");
    }

    if (order.status === "cancelled") {
      this.logger.warn(`Payment for cancelled order ${order.id}, invId ${input.invIdRaw}`);
      throw new BadRequestException("Payment does not match the order.");
    }

    let paidOrder =
      order.status === "paid"
        ? order
        : await this.orders.markPaidIfPending(invId, input.paymentMethod);

    if (!paidOrder) {
      // Re-read: another worker may have paid, or order was cancelled mid-flight.
      paidOrder = await this.orders.getOrderById(order.id);
    }

    if (!paidOrder || paidOrder.status !== "paid") {
      this.logger.warn(
        `Payment completion refused for order ${order.id}: status=${paidOrder?.status ?? "missing"}`,
      );
      throw new BadRequestException("Payment does not match the order.");
    }

    await this.promoService.confirmReservationForPaidOrder(paidOrder);
    await this.sites.publishAfterPayment(paidOrder.siteId);
    this.logger.log(`Payment completed for order ${paidOrder.id}, site ${paidOrder.siteId}`);
    return `OK${input.invIdRaw}`;
  }

  private createPaymentFields(order: PaymentOrder, email: string | null) {
    const config = this.getConfig();
    const origin = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    );
    const receiptSum = Number(order.amount);
    const receipt = encodeURIComponent(
      JSON.stringify({
        items: [
          {
            name: INVITE_SITE_SERVICE_NAME,
            payment_method: "full_payment",
            payment_object: "service",
            quantity: 1,
            sum: receiptSum,
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
