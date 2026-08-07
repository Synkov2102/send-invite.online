import { Test } from "@nestjs/testing";
import { applyPromoDiscount, INVITE_SITE_PRICE_RUB } from "@invite/shared";
import { PaymentOrderStore, type PaymentOrder } from "./payment-order.store";
import { PromoCodeEventStore } from "./promo-code-event.store";
import { PromoCodeStore, type PromoCode } from "./promo-code.store";
import { PromoService } from "./promo.service";
import { PromoUserUsageStore } from "./promo-user-usage.store";
import { SitePricingStore } from "./site-pricing.store";

function makeOrder(overrides: Partial<PaymentOrder> = {}): PaymentOrder {
  return {
    amount: "2000.00",
    createdAt: "2026-01-01T00:00:00.000Z",
    discountAmount: "2000.00",
    email: null,
    id: "order-1",
    invId: 1,
    originalAmount: "4000.00",
    ownerId: "user-1",
    paidAt: null,
    paymentMethod: null,
    promoCode: "SAVE50",
    promoCodeId: "promo-1",
    promoRedeemedAt: null,
    siteId: "site-1",
    status: "cancelled",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makePromo(overrides: Partial<PromoCode> = {}): PromoCode {
  return {
    code: "SAVE50",
    createdAt: "2026-01-01T00:00:00.000Z",
    expiresAt: null,
    id: "promo-1",
    isActive: true,
    maxUses: 10,
    maxUsesPerUser: 1,
    note: null,
    startsAt: null,
    type: "percent",
    updatedAt: "2026-01-01T00:00:00.000Z",
    usedCount: 0,
    value: 50,
    ...overrides,
  };
}

describe("PromoService", () => {
  let service: PromoService;
  let promoCodes: {
    getByCode: jest.Mock;
    reserveIfAvailable: jest.Mock;
    releaseReservation: jest.Mock;
  };
  let userUsage: {
    getCount: jest.Mock;
    reserveIfAvailable: jest.Mock;
    release: jest.Mock;
  };
  let orders: {
    getLatestPendingOrderForSite: jest.Mock;
    cancelExpiredPendingOrders: jest.Mock;
    markPromoRedeemed: jest.Mock;
    getOrderById: jest.Mock;
  };
  let events: { write: jest.Mock };
  let sitePricing: { get: jest.Mock };

  beforeEach(async () => {
    promoCodes = {
      getByCode: jest.fn(),
      reserveIfAvailable: jest.fn(),
      releaseReservation: jest.fn(),
    };
    userUsage = {
      getCount: jest.fn().mockResolvedValue(0),
      reserveIfAvailable: jest.fn(),
      release: jest.fn(),
    };
    orders = {
      getLatestPendingOrderForSite: jest.fn().mockResolvedValue(null),
      cancelExpiredPendingOrders: jest.fn().mockResolvedValue([]),
      markPromoRedeemed: jest.fn(),
      getOrderById: jest.fn(),
    };
    events = { write: jest.fn().mockResolvedValue(undefined) };
    sitePricing = { get: jest.fn().mockResolvedValue(null) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PromoService,
        { provide: PromoCodeStore, useValue: promoCodes },
        { provide: PromoCodeEventStore, useValue: events },
        { provide: PaymentOrderStore, useValue: orders },
        { provide: PromoUserUsageStore, useValue: userUsage },
        { provide: SitePricingStore, useValue: sitePricing },
      ],
    }).compile();

    service = moduleRef.get(PromoService);
  });

  describe("preview", () => {
    it("returns discounted pricing for a valid promo", async () => {
      const promo = makePromo();
      promoCodes.getByCode.mockResolvedValue(promo);

      const result = await service.preview("save50", "user-1", "127.0.0.1");

      expect(promoCodes.getByCode).toHaveBeenCalledWith("SAVE50");
      expect(result).toEqual({
        ok: true,
        promoCode: "SAVE50",
        pricing: applyPromoDiscount(INVITE_SITE_PRICE_RUB, "percent", 50),
      });
    });

    it("rejects exhausted promos with a generic public error", async () => {
      promoCodes.getByCode.mockResolvedValue(makePromo({ usedCount: 10, maxUses: 10 }));

      const result = await service.preview("SAVE50", "user-1", null);

      expect(result).toEqual({
        ok: false,
        error: service.getPublicErrorMessage(),
      });
      expect(events.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: "preview_fail", reason: "exhausted" }),
      );
    });

    it("applies the discount on top of an active sale price, not the built-in price", async () => {
      sitePricing.get.mockResolvedValue({ currentPriceRub: 2000, originalPriceRub: 4000 });
      promoCodes.getByCode.mockResolvedValue(makePromo());

      const result = await service.preview("save50", "user-1", null);

      expect(result).toEqual({
        ok: true,
        promoCode: "SAVE50",
        pricing: applyPromoDiscount(2000, "percent", 50),
      });
    });
  });

  describe("resolveForCheckout", () => {
    it("uses the built-in price when no sale is configured and no code is given", async () => {
      const result = await service.resolveForCheckout(undefined, "user-1", {
        ip: null,
        siteId: "site-1",
      });

      expect(result).toEqual({
        ok: true,
        promo: null,
        pricing: {
          amount: INVITE_SITE_PRICE_RUB.toFixed(2),
          discountAmount: "0.00",
          originalAmount: INVITE_SITE_PRICE_RUB.toFixed(2),
        },
      });
    });

    it("charges the configured sale price when no code is given", async () => {
      sitePricing.get.mockResolvedValue({ currentPriceRub: 2990, originalPriceRub: 4000 });

      const result = await service.resolveForCheckout(undefined, "user-1", {
        ip: null,
        siteId: "site-1",
      });

      expect(result).toEqual({
        ok: true,
        promo: null,
        pricing: { amount: "2990.00", discountAmount: "0.00", originalAmount: "2990.00" },
      });
    });
  });

  describe("getPublicPricing", () => {
    it("falls back to the built-in price when no sale is configured", async () => {
      await expect(service.getPublicPricing()).resolves.toEqual({
        currentPriceRub: INVITE_SITE_PRICE_RUB,
        originalPriceRub: null,
      });
    });

    it("returns the configured sale price", async () => {
      sitePricing.get.mockResolvedValue({ currentPriceRub: 2990, originalPriceRub: 4000 });

      await expect(service.getPublicPricing()).resolves.toEqual({
        currentPriceRub: 2990,
        originalPriceRub: 4000,
      });
    });

    it("serves repeat reads from cache", async () => {
      sitePricing.get.mockResolvedValue({ currentPriceRub: 2990, originalPriceRub: 4000 });

      await service.getPublicPricing();
      await service.getPublicPricing();

      expect(sitePricing.get).toHaveBeenCalledTimes(1);
    });

    it("re-reads pricing once the cache expires", async () => {
      sitePricing.get.mockResolvedValue({ currentPriceRub: 2990, originalPriceRub: 4000 });
      const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_000_000);

      await service.getPublicPricing();
      nowSpy.mockReturnValue(1_000_000 + 60_001);

      await expect(service.getPublicPricing()).resolves.toEqual({
        currentPriceRub: 2990,
        originalPriceRub: 4000,
      });
      expect(sitePricing.get).toHaveBeenCalledTimes(2);

      nowSpy.mockRestore();
    });

    it("never lets the display cache decide the checkout price", async () => {
      sitePricing.get.mockResolvedValue({ currentPriceRub: 2990, originalPriceRub: 4000 });
      await service.getPublicPricing();

      sitePricing.get.mockResolvedValue({ currentPriceRub: 1990, originalPriceRub: 4000 });

      const result = await service.resolveForCheckout(undefined, "user-1", {
        ip: null,
        siteId: "site-1",
      });

      expect(result).toEqual({
        ok: true,
        promo: null,
        pricing: { amount: "1990.00", discountAmount: "0.00", originalAmount: "1990.00" },
      });
    });
  });

  describe("reserveForNewOrder", () => {
    it("reserves global and per-user slots", async () => {
      const promo = makePromo();
      promoCodes.reserveIfAvailable.mockResolvedValue(promo);
      userUsage.reserveIfAvailable.mockResolvedValue({ count: 1 });

      const result = await service.reserveForNewOrder(promo, {
        ip: null,
        siteId: "site-1",
        userId: "user-1",
      });

      expect(result).toEqual({ ok: true });
      expect(promoCodes.reserveIfAvailable).toHaveBeenCalledWith("promo-1");
      expect(userUsage.reserveIfAvailable).toHaveBeenCalledWith("promo-1", "user-1", 1);
    });

    it("rolls back global reserve when per-user limit is hit", async () => {
      const promo = makePromo();
      promoCodes.reserveIfAvailable.mockResolvedValue(promo);
      userUsage.reserveIfAvailable.mockResolvedValue(null);

      const result = await service.reserveForNewOrder(promo, {
        ip: null,
        siteId: "site-1",
        userId: "user-1",
      });

      expect(result.ok).toBe(false);
      expect(promoCodes.releaseReservation).toHaveBeenCalledWith("promo-1");
    });
  });

  describe("confirmReservationForPaidOrder", () => {
    it("is idempotent when promoRedeemedAt is already set", async () => {
      orders.markPromoRedeemed.mockResolvedValue(null);
      orders.getOrderById.mockResolvedValue({
        id: "order-1",
        promoRedeemedAt: "2026-01-02T00:00:00.000Z",
      });

      const result = await service.confirmReservationForPaidOrder({
        amount: "2000.00",
        discountAmount: "2000.00",
        id: "order-1",
        originalAmount: "4000.00",
        ownerId: "user-1",
        promoCode: "SAVE50",
        promoCodeId: "promo-1",
        siteId: "site-1",
      });

      expect(result).toEqual({ ok: true });
      expect(events.write).not.toHaveBeenCalled();
    });

    it("fails when claim cannot be completed", async () => {
      orders.markPromoRedeemed.mockResolvedValue(null);
      orders.getOrderById.mockResolvedValue({
        id: "order-1",
        promoRedeemedAt: null,
        status: "paid",
      });

      const result = await service.confirmReservationForPaidOrder({
        amount: "2000.00",
        discountAmount: "2000.00",
        id: "order-1",
        originalAmount: "4000.00",
        ownerId: "user-1",
        promoCode: "SAVE50",
        promoCodeId: "promo-1",
        siteId: "site-1",
      });

      expect(result).toEqual({ ok: false });
      expect(events.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: "redeem_fail", reason: "confirm_failed" }),
      );
    });
  });

  describe("releaseReservations", () => {
    it("releases global and per-user slots for cancelled pending orders", async () => {
      await service.releaseReservations([makeOrder()]);

      expect(promoCodes.releaseReservation).toHaveBeenCalledWith("promo-1");
      expect(userUsage.release).toHaveBeenCalledWith("promo-1", "user-1");
      expect(events.write).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "reservation_release",
          reason: "pending_cancelled",
        }),
      );
    });

    it("skips orders that already confirmed redemption", async () => {
      await service.releaseReservations([
        makeOrder({ promoRedeemedAt: "2026-01-02T00:00:00.000Z", status: "paid" }),
      ]);

      expect(promoCodes.releaseReservation).not.toHaveBeenCalled();
      expect(userUsage.release).not.toHaveBeenCalled();
    });
  });

  describe("expireStalePendingReservations", () => {
    it("cancels expired pending orders and releases their promo slots", async () => {
      const expired = makeOrder({ status: "pending" });
      orders.cancelExpiredPendingOrders.mockResolvedValue([expired]);

      const count = await service.expireStalePendingReservations();

      expect(count).toBe(1);
      expect(orders.cancelExpiredPendingOrders).toHaveBeenCalledWith(expect.any(String));
      expect(promoCodes.releaseReservation).toHaveBeenCalledWith("promo-1");
      expect(userUsage.release).toHaveBeenCalledWith("promo-1", "user-1");
    });

    it("returns zero when there is nothing stale", async () => {
      orders.cancelExpiredPendingOrders.mockResolvedValue([]);

      await expect(service.expireStalePendingReservations()).resolves.toBe(0);
      expect(promoCodes.releaseReservation).not.toHaveBeenCalled();
    });
  });
});
