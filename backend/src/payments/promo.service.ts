import { Injectable } from "@nestjs/common";
import {
  INVITE_SITE_PRICE_RUB,
  applyPromoDiscount,
  buildListPricing,
  isValidPromoCodeFormat,
  normalizePromoCode,
  type PromoPricing,
} from "@invite/shared";
import {
  PAYMENT_PENDING_TTL_MS,
  PaymentOrderStore,
  type PaymentOrder,
} from "./payment-order.store";
import { PromoCodeEventStore } from "./promo-code-event.store";
import { PromoCodeStore, type PromoCode } from "./promo-code.store";
import { PromoUserUsageStore } from "./promo-user-usage.store";
import { SitePricingStore, type SitePricing } from "./site-pricing.store";

export type PromoValidationFailure = {
  ok: false;
  reason:
    | "invalid_format"
    | "not_found"
    | "inactive"
    | "not_started"
    | "expired"
    | "exhausted"
    | "per_user_limit";
};

export type PromoValidationSuccess = {
  ok: true;
  pricing: PromoPricing;
  promo: PromoCode;
};

export type PromoValidationResult = PromoValidationFailure | PromoValidationSuccess;

const PUBLIC_PROMO_ERROR = "Промокод недействителен или уже недоступен.";

@Injectable()
export class PromoService {
  constructor(
    private readonly promoCodes: PromoCodeStore,
    private readonly events: PromoCodeEventStore,
    private readonly orders: PaymentOrderStore,
    private readonly userUsage: PromoUserUsageStore,
    private readonly sitePricing: SitePricingStore,
  ) {}

  getPublicErrorMessage() {
    return PUBLIC_PROMO_ERROR;
  }

  /** Current effective list price, falling back to the built-in price when no sale is configured. */
  private async getSitePricing(): Promise<SitePricing> {
    const pricing = await this.sitePricing.get();

    return {
      currentPriceRub: pricing?.currentPriceRub ?? INVITE_SITE_PRICE_RUB,
      originalPriceRub: pricing?.originalPriceRub ?? null,
    };
  }

  /** Public pricing for display (e.g. the homepage hero price). */
  async getPublicPricing(): Promise<SitePricing> {
    return this.getSitePricing();
  }

  async validateForUser(
    rawCode: string,
    userId: string,
    options: { excludeSiteId?: string } = {},
  ): Promise<PromoValidationResult> {
    const codeNormalized = normalizePromoCode(rawCode);

    if (!isValidPromoCodeFormat(codeNormalized)) {
      return { ok: false, reason: "invalid_format" };
    }

    const promo = await this.promoCodes.getByCode(codeNormalized);

    if (!promo) {
      return { ok: false, reason: "not_found" };
    }

    if (!promo.isActive) {
      return { ok: false, reason: "inactive" };
    }

    const now = Date.now();

    if (promo.startsAt && Date.parse(promo.startsAt) > now) {
      return { ok: false, reason: "not_started" };
    }

    if (promo.expiresAt && Date.parse(promo.expiresAt) <= now) {
      return { ok: false, reason: "expired" };
    }

    // Pending order for this site already holds a reserved slot — don't block reuse.
    const pendingForSite = options.excludeSiteId
      ? await this.orders.getLatestPendingOrderForSite(options.excludeSiteId)
      : null;
    const holdsOwnPendingSlot =
      pendingForSite?.promoCodeId === promo.id &&
      pendingForSite.ownerId === userId;

    if (promo.maxUses !== null) {
      const effectiveUsed = holdsOwnPendingSlot
        ? Math.max(0, promo.usedCount - 1)
        : promo.usedCount;

      if (effectiveUsed >= promo.maxUses) {
        return { ok: false, reason: "exhausted" };
      }
    }

    if (promo.maxUsesPerUser !== null) {
      const userCount = await this.userUsage.getCount(promo.id, userId);
      const effectiveCount = holdsOwnPendingSlot
        ? Math.max(0, userCount - 1)
        : userCount;

      if (effectiveCount >= promo.maxUsesPerUser) {
        return { ok: false, reason: "per_user_limit" };
      }
    }

    const { currentPriceRub } = await this.getSitePricing();

    return {
      ok: true,
      pricing: applyPromoDiscount(currentPriceRub, promo.type, promo.value),
      promo,
    };
  }

  async preview(rawCode: string, userId: string, ip: string | null) {
    const codeNormalized = normalizePromoCode(rawCode);
    const result = await this.validateForUser(rawCode, userId);

    if (!result.ok) {
      void this.events.write({
        action: "preview_fail",
        codeNormalized,
        ip,
        reason: result.reason,
        userId,
      });

      return {
        error: this.getPublicErrorMessage(),
        ok: false as const,
      };
    }

    void this.events.write({
      action: "preview_ok",
      amount: result.pricing.amount,
      codeNormalized,
      discountAmount: result.pricing.discountAmount,
      ip,
      originalAmount: result.pricing.originalAmount,
      promoCodeId: result.promo.id,
      userId,
    });

    return {
      ok: true as const,
      pricing: result.pricing,
      promoCode: result.promo.code,
    };
  }

  async resolveForCheckout(
    rawCode: string | undefined,
    userId: string,
    context: { ip: string | null; siteId: string },
  ): Promise<
    | { ok: true; pricing: PromoPricing; promo: PromoCode | null }
    | { ok: false; error: string }
  > {
    if (!rawCode) {
      const { currentPriceRub } = await this.getSitePricing();
      return { ok: true, pricing: buildListPricing(currentPriceRub), promo: null };
    }

    const codeNormalized = normalizePromoCode(rawCode);
    const result = await this.validateForUser(rawCode, userId, {
      excludeSiteId: context.siteId,
    });

    if (!result.ok) {
      void this.events.write({
        action: "checkout_reject",
        codeNormalized,
        ip: context.ip,
        reason: result.reason,
        siteId: context.siteId,
        userId,
      });

      return { ok: false, error: this.getPublicErrorMessage() };
    }

    return { ok: true, pricing: result.pricing, promo: result.promo };
  }

  /**
   * Reserves global + per-user slots. Call only when creating a new pending order.
   */
  async reserveForNewOrder(
    promo: PromoCode,
    context: {
      ip: string | null;
      siteId: string;
      userId: string;
    },
  ) {
    const reservedGlobal = await this.promoCodes.reserveIfAvailable(promo.id);

    if (!reservedGlobal) {
      void this.events.write({
        action: "checkout_reject",
        codeNormalized: promo.code,
        ip: context.ip,
        promoCodeId: promo.id,
        reason: "exhausted",
        siteId: context.siteId,
        userId: context.userId,
      });
      return { ok: false as const, error: this.getPublicErrorMessage() };
    }

    if (promo.maxUsesPerUser !== null) {
      const reservedUser = await this.userUsage.reserveIfAvailable(
        promo.id,
        context.userId,
        promo.maxUsesPerUser,
      );

      if (!reservedUser) {
        await this.promoCodes.releaseReservation(promo.id);
        void this.events.write({
          action: "checkout_reject",
          codeNormalized: promo.code,
          ip: context.ip,
          promoCodeId: promo.id,
          reason: "per_user_limit",
          siteId: context.siteId,
          userId: context.userId,
        });
        return { ok: false as const, error: this.getPublicErrorMessage() };
      }
    }

    return { ok: true as const };
  }

  async releaseReservation(input: {
    amount?: string | null;
    codeNormalized: string;
    discountAmount?: string | null;
    orderId?: string | null;
    originalAmount?: string | null;
    promoCodeId: string;
    reason: string;
    siteId?: string | null;
    userId?: string | null;
  }) {
    await this.promoCodes.releaseReservation(input.promoCodeId);

    if (input.userId) {
      await this.userUsage.release(input.promoCodeId, input.userId);
    }

    void this.events.write({
      action: "reservation_release",
      amount: input.amount ?? null,
      codeNormalized: input.codeNormalized,
      discountAmount: input.discountAmount ?? null,
      orderId: input.orderId ?? null,
      originalAmount: input.originalAmount ?? null,
      promoCodeId: input.promoCodeId,
      reason: input.reason,
      siteId: input.siteId ?? null,
      userId: input.userId ?? null,
    });
  }

  async releaseReservations(orders: PaymentOrder[]) {
    for (const order of orders) {
      if (!order.promoCodeId || order.promoRedeemedAt) {
        continue;
      }

      await this.releaseReservation({
        amount: order.amount,
        codeNormalized: order.promoCode ?? "",
        discountAmount: order.discountAmount,
        orderId: order.id,
        originalAmount: order.originalAmount,
        promoCodeId: order.promoCodeId,
        reason: "pending_cancelled",
        siteId: order.siteId,
        userId: order.ownerId,
      });
    }
  }

  async expireStalePendingReservations() {
    const cutoff = new Date(Date.now() - PAYMENT_PENDING_TTL_MS).toISOString();
    const expired = await this.orders.cancelExpiredPendingOrders(cutoff);

    if (expired.length === 0) {
      return 0;
    }

    await this.releaseReservations(
      expired.map((order) => ({
        ...order,
        // Treat as cancelled for release logic.
        status: "cancelled" as const,
      })),
    );

    return expired.length;
  }

  logCheckoutApply(input: {
    amount: string;
    codeNormalized: string;
    discountAmount: string;
    ip: string | null;
    orderId: string;
    originalAmount: string;
    promoCodeId: string;
    siteId: string;
    userId: string;
  }) {
    void this.events.write({
      action: "checkout_apply",
      amount: input.amount,
      codeNormalized: input.codeNormalized,
      discountAmount: input.discountAmount,
      ip: input.ip,
      orderId: input.orderId,
      originalAmount: input.originalAmount,
      promoCodeId: input.promoCodeId,
      siteId: input.siteId,
      userId: input.userId,
    });
  }

  /**
   * Confirms a previously reserved promo after payment.
   * Does not change usedCount — the slot was taken at checkout.
   */
  async confirmReservationForPaidOrder(order: {
    amount: string;
    discountAmount: string;
    id: string;
    originalAmount: string;
    ownerId: string;
    promoCode: string | null;
    promoCodeId: string | null;
    siteId: string;
  }) {
    if (!order.promoCodeId || !order.promoCode) {
      return { ok: true as const };
    }

    const claimed = await this.orders.markPromoRedeemed(order.id);

    if (!claimed) {
      const current = await this.orders.getOrderById(order.id);
      if (current?.promoRedeemedAt) {
        return { ok: true as const };
      }

      void this.events.write({
        action: "redeem_fail",
        amount: order.amount,
        codeNormalized: order.promoCode,
        discountAmount: order.discountAmount,
        orderId: order.id,
        originalAmount: order.originalAmount,
        promoCodeId: order.promoCodeId,
        reason: "confirm_failed",
        siteId: order.siteId,
        userId: order.ownerId,
      });
      return { ok: false as const };
    }

    void this.events.write({
      action: "redeem",
      amount: order.amount,
      codeNormalized: order.promoCode,
      discountAmount: order.discountAmount,
      orderId: order.id,
      originalAmount: order.originalAmount,
      promoCodeId: order.promoCodeId,
      siteId: order.siteId,
      userId: order.ownerId,
    });

    return { ok: true as const };
  }
}
