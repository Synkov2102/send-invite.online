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
import {
  PAYMENT_PENDING_TTL_MS,
  PaymentOrderStore,
  type PaymentOrder,
} from "./payment-order.store";
import { PromoService } from "./promo.service";
import type { PromoCode } from "./promo-code.store";
import {
  ROBOKASSA_RESULT_CODE,
  ROBOKASSA_STATE_CODE,
  RobokassaOpStateClient,
  type RobokassaOperationState,
} from "./robokassa-op-state";
import {
  readRobokassaField,
  readRobokassaShpOrder,
  type RobokassaPayload,
} from "./robokassa-payload";
import { createRobokassaSignature, isRobokassaSignatureValid } from "./robokassa-signature";

type SuccessConfirmBody = {
  invId?: unknown;
  orderId?: unknown;
  outSum?: unknown;
  signature?: unknown;
};

const STALE_PENDING_SWEEP_MS = 5 * 60 * 1000;
const PENDING_RECONCILE_LIMIT = 100;
/** Статус заказа опрашивается по чтению; дебаунс бережёт XML-интерфейс от поллинга фронта. */
const PENDING_RECONCILE_DEBOUNCE_MS = 5_000;
const RECONCILE_DEBOUNCE_ENTRIES_LIMIT = 5_000;

function amountsMatch(left: number, right: number) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= 0.000001;
}

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

function samePromoSnapshot(order: PaymentOrder, pricing: PromoPricing, promo: PromoCode | null) {
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
  private readonly reconcileCheckedAt = new Map<string, number>();
  private stalePendingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly orders: PaymentOrderStore,
    private readonly sites: SitesService,
    private readonly promoService: PromoService,
    private readonly opState: RobokassaOpStateClient,
  ) {}

  onModuleInit() {
    void this.sweepPendingOrders();
    this.stalePendingTimer = setInterval(() => {
      void this.sweepPendingOrders();
    }, STALE_PENDING_SWEEP_MS);
  }

  onModuleDestroy() {
    if (this.stalePendingTimer) {
      clearInterval(this.stalePendingTimer);
      this.stalePendingTimer = null;
    }
  }

  private async sweepStalePendingReservations() {
    // Слепая отмена по TTL убивает платежи, которые Robokassa ещё подтверждает
    // (СБП зачисляется асинхронно). Когда доступен опрос состояния, судьбу
    // заказа решает reconcilePendingOrder, а не возраст записи.
    if (this.getReconcileConfig()) {
      return;
    }

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

  private async sweepPendingOrders() {
    if (!this.getReconcileConfig()) {
      await this.sweepStalePendingReservations();
      return;
    }

    try {
      const pending = await this.orders.listPendingOrders(PENDING_RECONCILE_LIMIT);

      for (const order of pending) {
        await this.reconcilePendingOrder(order);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to reconcile pending orders: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Опрос состояния платежа у Robokassa. Result URL остаётся основным каналом,
   * но для СБП он единственный: плательщик уходит в приложение банка и в браузер
   * не возвращается, поэтому подтверждения через Success URL не будет вовсе.
   */
  private async reconcilePendingOrder(order: PaymentOrder) {
    const config = this.getReconcileConfig();

    if (!config || order.status !== "pending") {
      return { order, state: null };
    }

    const state = await this.opState.fetchOperationState({
      invId: order.invId,
      merchantLogin: config.merchantLogin,
      password2: config.password2,
    });

    if (!state) {
      return { order, state };
    }

    if (
      state.resultCode === ROBOKASSA_RESULT_CODE.ok &&
      state.stateCode === ROBOKASSA_STATE_CODE.completed
    ) {
      // Сумму запросили мы сами по своей подписи, так что это проверка на
      // рассинхрон, а не защита от подделки: отсутствие OutSum не повод
      // держать оплаченный заказ в pending.
      if (state.outSum !== null && !amountsMatch(Number(order.amount), Number(state.outSum))) {
        this.logger.warn(
          `OpStateExt amount mismatch for order ${order.id}: order=${order.amount}, robokassa=${state.outSum}`,
        );
        return { order, state };
      }

      const paid = await this.finalizePaidOrder(order, state.paymentMethod);

      if (paid) {
        this.reconcileCheckedAt.delete(order.id);
        return { order: paid, state };
      }

      return { order, state };
    }

    if (this.isDeadOperation(state, order)) {
      const cancelled = await this.orders.cancelOrderIfPending(order.id);

      if (cancelled) {
        await this.promoService.releaseReservations([cancelled]);
        this.reconcileCheckedAt.delete(order.id);
        this.logger.log(
          `Order ${order.id} cancelled: Robokassa state=${state.stateCode ?? "none"}, result=${state.resultCode}`,
        );
        return { order: cancelled, state };
      }
    }

    return { order, state };
  }

  private async reconcileLatestPendingForSite(siteId: string) {
    if (!this.getReconcileConfig()) {
      return null;
    }

    const pending = await this.orders.getLatestPendingOrderForSite(siteId);

    return pending ? this.reconcilePendingOrder(pending) : null;
  }

  /** Деньги уже в пути либо получены — такой заказ отменять нельзя. */
  private isPaymentInFlight(state: RobokassaOperationState | null) {
    if (!state || state.resultCode !== ROBOKASSA_RESULT_CODE.ok) {
      return false;
    }

    return (
      state.stateCode === ROBOKASSA_STATE_CODE.hold ||
      state.stateCode === ROBOKASSA_STATE_CODE.crediting ||
      state.stateCode === ROBOKASSA_STATE_CODE.suspended ||
      state.stateCode === ROBOKASSA_STATE_CODE.completed
    );
  }

  /** Оплаты не будет: операцию отменили, деньги вернули либо до неё не дошли. */
  private isDeadOperation(state: RobokassaOperationState, order: PaymentOrder) {
    const expired = Date.parse(order.createdAt) + PAYMENT_PENDING_TTL_MS <= Date.now();

    if (state.resultCode === ROBOKASSA_RESULT_CODE.ok) {
      if (
        state.stateCode === ROBOKASSA_STATE_CODE.cancelled ||
        state.stateCode === ROBOKASSA_STATE_CODE.refunded
      ) {
        return true;
      }

      return state.stateCode === ROBOKASSA_STATE_CODE.initialized && expired;
    }

    // Операции нет: до платёжной страницы Robokassa так и не дошли.
    return state.resultCode === ROBOKASSA_RESULT_CODE.operationNotFound && expired;
  }

  /**
   * Опрос при чтении статуса — то, что делает поллинг фронта самовосстанавливающимся.
   * Намеренно без await: наш ответ не должен зависеть от времени ответа Robokassa,
   * а результат заберёт следующий опрос фронта через пару секунд.
   */
  private scheduleReconcileOnRead(order: PaymentOrder) {
    if (order.status !== "pending" || !this.getReconcileConfig()) {
      return;
    }

    const now = Date.now();

    if (now - (this.reconcileCheckedAt.get(order.id) ?? 0) < PENDING_RECONCILE_DEBOUNCE_MS) {
      return;
    }

    if (this.reconcileCheckedAt.size >= RECONCILE_DEBOUNCE_ENTRIES_LIMIT) {
      this.reconcileCheckedAt.clear();
    }

    this.reconcileCheckedAt.set(order.id, now);

    void this.reconcilePendingOrder(order).catch((error: unknown) => {
      this.logger.warn(
        `Failed to reconcile order ${order.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    });
  }

  private getReconcileConfig() {
    const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;

    // OpStateExt не отдаёт информацию по тестовым платежам.
    if (!merchantLogin || process.env.ROBOKASSA_TEST_MODE === "true") {
      return null;
    }

    const { password2 } = getPaymentPasswords(false);

    return password2 ? { merchantLogin, password2 } : null;
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

    const {
      email: providedEmail,
      promoCode: rawPromoCode,
      site: sitePayload,
      siteId: rawSiteId,
    } = parsed.payload;
    const siteId = rawSiteId ?? null;
    // Yandex ID отдаёт аккаунты без почты — тогда её спрашивает форма оплаты.
    const receiptEmail = user.email?.trim() || providedEmail || null;
    // Платёж по прошлой попытке мог дойти, пока пользователь оформлял новую —
    // для СБП это минуты. Сверяемся до updateDraftForCheckout: если заказ
    // оплатился, тот откажет понятным «Этот сайт уже оплачен».
    const previousPending = siteId ? await this.reconcileLatestPendingForSite(siteId) : null;
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

    // Без адреса Robokassa не сформирует чек, и операция зависает, не дойдя до
    // Result URL. Бесплатной публикации по промокоду чек не нужен.
    if (Number(pricing.amount) > 0 && !receiptEmail) {
      throw new BadRequestException({
        error: "Укажите email — на него придёт чек об оплате.",
      });
    }

    const existingPending = await this.orders.getLatestPendingOrderForSite(site.id);
    let order: PaymentOrder;

    if (existingPending && samePromoSnapshot(existingPending, pricing, promo)) {
      order = existingPending;
    } else {
      // Отмена ниже сделала бы платёж непроводимым: completePayment откажет
      // отменённому заказу, а деньги уже списаны.
      if (this.isPaymentInFlight(previousPending?.state ?? null)) {
        throw new BadRequestException({
          error: "Предыдущий платёж ещё обрабатывается. Подождите пару минут и обновите страницу.",
        });
      }

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
          email: receiptEmail,
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
      // Переиспользованный pending мог быть создан до того, как пользователь
      // ввёл почту, — в форму всегда идёт актуальная.
      fields: this.createPaymentFields(order, receiptEmail),
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

    this.scheduleReconcileOnRead(order);

    return this.toOwnedOrderStatusResponse(order);
  }

  async getPublicOrderStatus(orderId: string) {
    const order = await this.orders.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException({ error: "Заказ не найден." });
    }

    this.scheduleReconcileOnRead(order);

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
    return this.verifyAndComplete({
      channel: "Result URL",
      invIdRaw: readString(payload, "InvId", "InvID", "invoiceID"),
      orderId: readRobokassaShpOrder(payload),
      outSum: readString(payload, "OutSum", "outSum"),
      password: this.getConfig().password2,
      paymentMethod: readString(payload, "PaymentMethod") || null,
      signature: readString(payload, "SignatureValue", "signatureValue"),
    });
  }

  async processSuccessRedirect(body: unknown) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BadRequestException("Invalid success confirmation.");
    }

    const payload = body as SuccessConfirmBody;
    const readField = (value: unknown) => (typeof value === "string" ? value.trim() : "");

    return this.verifyAndComplete({
      channel: "Success URL",
      invIdRaw: readField(payload.invId),
      orderId: readField(payload.orderId),
      outSum: readField(payload.outSum),
      password: this.getConfig().password1,
      paymentMethod: null,
      signature: readField(payload.signature),
    });
  }

  /**
   * Общая проверка обоих каналов подтверждения: различаются они только
   * источником полей и паролем (Result URL — Password2, Success URL — Password1).
   */
  private async verifyAndComplete(input: {
    channel: "Result URL" | "Success URL";
    invIdRaw: string;
    orderId: string;
    outSum: string;
    password: string;
    paymentMethod: string | null;
    signature: string;
  }) {
    const invId = Number(input.invIdRaw);

    if (
      !input.outSum ||
      !Number.isSafeInteger(invId) ||
      invId < 1 ||
      !input.signature ||
      !input.orderId
    ) {
      this.logger.warn(
        `Invalid ${input.channel} payload: outSum=${Boolean(input.outSum)}, invId=${input.invIdRaw}, signature=${Boolean(input.signature)}, orderId=${Boolean(input.orderId)}`,
      );
      throw new BadRequestException("Invalid payment notification.");
    }

    const expectedSignature = createRobokassaSignature([
      input.outSum,
      input.invIdRaw,
      input.password,
      `Shp_order=${input.orderId}`,
    ]);

    if (!isRobokassaSignatureValid(expectedSignature, input.signature)) {
      this.logger.warn(
        `Invalid ${input.channel} signature for order ${input.orderId}, invId ${input.invIdRaw}`,
      );
      throw new UnauthorizedException("Invalid payment signature.");
    }

    return this.completePayment({
      invIdRaw: input.invIdRaw,
      orderId: input.orderId,
      outSum: input.outSum,
      paymentMethod: input.paymentMethod,
    });
  }

  private async completeFreeOrder(order: PaymentOrder) {
    if (order.status === "cancelled") {
      throw new BadRequestException({ error: "Заказ недоступен для оплаты." });
    }

    // Здесь промокод и есть оплата, поэтому неудачное подтверждение резерва —
    // отказ, а не примечание в логе, как на платном пути.
    const paidOrder = await this.finalizePaidOrder(order, "promo_free", {
      requirePromoConfirmation: true,
    });

    if (!paidOrder) {
      throw new BadRequestException({ error: "Не удалось применить промокод." });
    }

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

    if (
      !order ||
      order.id !== input.orderId ||
      !amountsMatch(Number(order.amount), Number(input.outSum))
    ) {
      this.logger.warn(`Payment mismatch for order ${input.orderId}, invId ${input.invIdRaw}`);
      throw new BadRequestException("Payment does not match the order.");
    }

    const payable = order.status === "cancelled" ? await this.reviveCancelledOrder(order) : order;

    if (!payable) {
      throw new BadRequestException("Payment does not match the order.");
    }

    const paidOrder = await this.finalizePaidOrder(payable, input.paymentMethod);

    if (!paidOrder) {
      throw new BadRequestException("Payment does not match the order.");
    }

    return `OK${input.invIdRaw}`;
  }

  /**
   * Деньги пришли по заказу, который успели отменить (повторный checkout,
   * пока платёж шёл). Отказать нельзя — списание уже произошло. Оживляем,
   * если по сайту нет другого оплаченного заказа: иначе это двойная оплата
   * и разбираться с ней надо возвратом, а не публикацией.
   */
  private async reviveCancelledOrder(order: PaymentOrder) {
    const alreadyPaid = await this.orders.getPaidOrderForSite(order.siteId);

    if (alreadyPaid) {
      this.logger.warn(
        `Payment for cancelled order ${order.id}: site ${order.siteId} is already paid by order ${alreadyPaid.id}`,
      );
      return null;
    }

    const revived = await this.orders.restoreCancelledToPending(order.id);

    if (!revived) {
      this.logger.warn(`Failed to revive cancelled order ${order.id}`);
      return null;
    }

    // Отмена освободила промо-слот; без возврата confirmReservationForPaidOrder
    // спишет промокод, не заняв слот обратно.
    await this.promoService.reclaimReservationForOrder(revived);
    this.logger.log(`Cancelled order ${order.id} revived: payment arrived after cancellation`);

    return revived;
  }

  /** Общий финал всех трёх путей: Result URL, опроса состояния и бесплатного промо. */
  private async finalizePaidOrder(
    order: PaymentOrder,
    paymentMethod: string | null,
    options: { requirePromoConfirmation?: boolean } = {},
  ) {
    let paidOrder =
      order.status === "paid"
        ? order
        : await this.orders.markPaidIfPending(order.invId, paymentMethod);

    if (!paidOrder) {
      // Re-read: another worker may have paid, or order was cancelled mid-flight.
      paidOrder = await this.orders.getOrderById(order.id);
    }

    if (!paidOrder || paidOrder.status !== "paid") {
      this.logger.warn(
        `Payment completion refused for order ${order.id}: status=${paidOrder?.status ?? "missing"}`,
      );
      return null;
    }

    const confirmed = await this.promoService.confirmReservationForPaidOrder(paidOrder);

    if (!confirmed.ok && options.requirePromoConfirmation) {
      return null;
    }

    await this.sites.publishAfterPayment(paidOrder.siteId);
    this.logger.log(`Payment completed for order ${paidOrder.id}, site ${paidOrder.siteId}`);

    return paidOrder;
  }

  private createPaymentFields(order: PaymentOrder, email: string | null) {
    const config = this.getConfig();
    const origin = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
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
