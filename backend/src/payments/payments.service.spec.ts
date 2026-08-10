import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { INVITE_SITE_PRICE, applyPromoDiscount, INVITE_SITE_PRICE_RUB } from "@invite/shared";
import type { AuthUser } from "../auth/auth.types";
import { SitesService } from "../sites/sites.service";
import { PaymentOrderStore, type PaymentOrder } from "./payment-order.store";
import { PaymentsService } from "./payments.service";
import { PromoService } from "./promo.service";
import type { PromoCode } from "./promo-code.store";
import {
  ROBOKASSA_RESULT_CODE,
  ROBOKASSA_STATE_CODE,
  RobokassaOpStateClient,
} from "./robokassa-op-state";
import { createRobokassaSignature } from "./robokassa-signature";

const user: AuthUser = {
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  email: "buyer@example.com",
  id: "user-1",
  login: "buyer",
  name: "Buyer",
  updatedAt: "2026-01-01T00:00:00.000Z",
  yandexId: "yandex-1",
};

function makeOrder(overrides: Partial<PaymentOrder> = {}): PaymentOrder {
  return {
    amount: INVITE_SITE_PRICE,
    createdAt: "2026-01-01T00:00:00.000Z",
    discountAmount: "0.00",
    email: user.email,
    id: "order-1",
    invId: 42,
    originalAmount: INVITE_SITE_PRICE,
    ownerId: user.id,
    paidAt: null,
    paymentMethod: null,
    promoCode: null,
    promoCodeId: null,
    promoRedeemedAt: null,
    siteId: "site-1",
    status: "pending",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makePromo(): PromoCode {
  return {
    code: "FREE100",
    createdAt: "2026-01-01T00:00:00.000Z",
    expiresAt: null,
    id: "promo-free",
    isActive: true,
    maxUses: 5,
    maxUsesPerUser: 1,
    note: null,
    startsAt: null,
    type: "percent",
    updatedAt: "2026-01-01T00:00:00.000Z",
    usedCount: 0,
    value: 100,
  };
}

describe("PaymentsService", () => {
  let service: PaymentsService;
  let orders: {
    getLatestPendingOrderForSite: jest.Mock;
    cancelPendingOrdersForSite: jest.Mock;
    createOrder: jest.Mock;
    getOrderById: jest.Mock;
    getOwnedOrder: jest.Mock;
    getOrderByInvoice: jest.Mock;
    markPaidIfPending: jest.Mock;
    listPendingOrders: jest.Mock;
    cancelOrderIfPending: jest.Mock;
    getPaidOrderForSite: jest.Mock;
    restoreCancelledToPending: jest.Mock;
  };
  let opState: { fetchOperationState: jest.Mock };

  /**
   * Опрос состояния запускается без await, чтобы ответ API не ждал Robokassa.
   * Один макротик даёт цепочке промисов доработать до конца.
   */
  const flushReconcile = () => new Promise((resolve) => setImmediate(resolve));
  let sites: {
    createDraftForCheckout: jest.Mock;
    updateDraftForCheckout: jest.Mock;
    publishAfterPayment: jest.Mock;
  };
  let promoService: {
    expireStalePendingReservations: jest.Mock;
    resolveForCheckout: jest.Mock;
    reserveForNewOrder: jest.Mock;
    releaseReservations: jest.Mock;
    releaseReservation: jest.Mock;
    logCheckoutApply: jest.Mock;
    confirmReservationForPaidOrder: jest.Mock;
    reclaimReservationForOrder: jest.Mock;
    preview: jest.Mock;
  };

  const previousEnv = {
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
    ROBOKASSA_HASH_ALGORITHM: process.env.ROBOKASSA_HASH_ALGORITHM,
    ROBOKASSA_MERCHANT_LOGIN: process.env.ROBOKASSA_MERCHANT_LOGIN,
    ROBOKASSA_PASSWORD1: process.env.ROBOKASSA_PASSWORD1,
    ROBOKASSA_PASSWORD2: process.env.ROBOKASSA_PASSWORD2,
    ROBOKASSA_TEST_MODE: process.env.ROBOKASSA_TEST_MODE,
    ROBOKASSA_TEST_PASSWORD1: process.env.ROBOKASSA_TEST_PASSWORD1,
    ROBOKASSA_TEST_PASSWORD2: process.env.ROBOKASSA_TEST_PASSWORD2,
  };

  beforeEach(async () => {
    process.env.FRONTEND_ORIGIN = "http://localhost:3000";
    process.env.ROBOKASSA_HASH_ALGORITHM = "md5";
    process.env.ROBOKASSA_MERCHANT_LOGIN = "demo";
    process.env.ROBOKASSA_TEST_MODE = "true";
    process.env.ROBOKASSA_TEST_PASSWORD1 = "password1";
    process.env.ROBOKASSA_TEST_PASSWORD2 = "password2";

    orders = {
      getLatestPendingOrderForSite: jest.fn().mockResolvedValue(null),
      cancelPendingOrdersForSite: jest.fn().mockResolvedValue([]),
      createOrder: jest.fn(),
      getOrderById: jest.fn(),
      getOwnedOrder: jest.fn(),
      getOrderByInvoice: jest.fn(),
      markPaidIfPending: jest.fn(),
      listPendingOrders: jest.fn().mockResolvedValue([]),
      cancelOrderIfPending: jest.fn(),
      getPaidOrderForSite: jest.fn().mockResolvedValue(null),
      restoreCancelledToPending: jest.fn(),
    };
    opState = { fetchOperationState: jest.fn().mockResolvedValue(null) };
    sites = {
      createDraftForCheckout: jest.fn().mockResolvedValue({ id: "site-1" }),
      updateDraftForCheckout: jest.fn().mockResolvedValue({ id: "site-1" }),
      publishAfterPayment: jest.fn().mockResolvedValue({ id: "site-1" }),
    };
    promoService = {
      expireStalePendingReservations: jest.fn().mockResolvedValue(0),
      resolveForCheckout: jest.fn().mockResolvedValue({
        ok: true,
        pricing: {
          amount: INVITE_SITE_PRICE,
          discountAmount: "0.00",
          originalAmount: INVITE_SITE_PRICE,
        },
        promo: null,
      }),
      reserveForNewOrder: jest.fn().mockResolvedValue({ ok: true }),
      releaseReservations: jest.fn().mockResolvedValue(undefined),
      releaseReservation: jest.fn().mockResolvedValue(undefined),
      logCheckoutApply: jest.fn(),
      confirmReservationForPaidOrder: jest.fn().mockResolvedValue({ ok: true }),
      reclaimReservationForOrder: jest.fn().mockResolvedValue(undefined),
      preview: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentOrderStore, useValue: orders },
        { provide: SitesService, useValue: sites },
        { provide: PromoService, useValue: promoService },
        { provide: RobokassaOpStateClient, useValue: opState },
      ],
    }).compile();

    service = moduleRef.get(PaymentsService);
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  describe("createCheckout", () => {
    it("creates a full-price Robokassa checkout", async () => {
      const pending = makeOrder();
      orders.createOrder.mockResolvedValue(pending);

      const result = await service.createCheckout({ site: { any: true } }, user, null);

      expect(orders.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: INVITE_SITE_PRICE,
          discountAmount: "0.00",
          originalAmount: INVITE_SITE_PRICE,
          ownerId: user.id,
          promoCode: null,
          promoCodeId: null,
          siteId: "site-1",
        }),
      );
      expect(promoService.reserveForNewOrder).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          free: false,
          action: "https://auth.robokassa.ru/Merchant/Index.aspx",
          fields: expect.objectContaining({
            OutSum: INVITE_SITE_PRICE,
            InvId: "42",
            MerchantLogin: "demo",
          }),
          order: expect.objectContaining({ id: "order-1", amount: INVITE_SITE_PRICE }),
        }),
      );
      expect(result.free).toBe(false);
      if (!result.free) {
        expect(result.fields.SignatureValue).toEqual(expect.any(String));
        expect(result.fields.SignatureValue.length).toBeGreaterThan(0);
      }
    });

    it("reuses a pending order with the same promo snapshot", async () => {
      const pending = makeOrder();
      orders.getLatestPendingOrderForSite.mockResolvedValue(pending);

      const result = await service.createCheckout(
        { site: { any: true }, siteId: "site-1" },
        user,
        null,
      );

      expect(sites.updateDraftForCheckout).toHaveBeenCalledWith(
        user.id,
        "site-1",
        expect.anything(),
      );
      expect(orders.createOrder).not.toHaveBeenCalled();
      expect(orders.cancelPendingOrdersForSite).not.toHaveBeenCalled();
      expect(promoService.reserveForNewOrder).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          free: false,
          order: expect.objectContaining({ id: "order-1" }),
        }),
      );
    });

    it("completes a free promo checkout without Robokassa", async () => {
      const promo = makePromo();
      const pricing = applyPromoDiscount(INVITE_SITE_PRICE_RUB, "percent", 100);
      promoService.resolveForCheckout.mockResolvedValue({
        ok: true,
        pricing,
        promo,
      });

      const freeOrder = makeOrder({
        amount: pricing.amount,
        discountAmount: pricing.discountAmount,
        originalAmount: pricing.originalAmount,
        promoCode: promo.code,
        promoCodeId: promo.id,
      });
      orders.createOrder.mockResolvedValue(freeOrder);
      orders.markPaidIfPending.mockResolvedValue({
        ...freeOrder,
        status: "paid",
        paidAt: "2026-01-01T01:00:00.000Z",
        paymentMethod: "promo_free",
      });
      orders.getOrderById.mockResolvedValue({
        ...freeOrder,
        status: "paid",
        paidAt: "2026-01-01T01:00:00.000Z",
        promoRedeemedAt: "2026-01-01T01:00:00.000Z",
      });

      const result = await service.createCheckout(
        { site: { any: true }, promoCode: "FREE100" },
        user,
        "127.0.0.1",
      );

      expect(orders.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: "0.00",
          discountAmount: "4000.00",
          promoCode: "FREE100",
          promoCodeId: "promo-free",
        }),
      );
      expect(promoService.reserveForNewOrder).toHaveBeenCalledWith(
        promo,
        expect.objectContaining({ siteId: "site-1", userId: user.id }),
      );
      expect(promoService.confirmReservationForPaidOrder).toHaveBeenCalled();
      expect(sites.publishAfterPayment).toHaveBeenCalledWith("site-1");
      expect(result).toEqual(
        expect.objectContaining({
          free: true,
          order: expect.objectContaining({
            status: "paid",
            siteUrl: "/invite/sites/site-1",
            amount: "0.00",
          }),
        }),
      );
      expect(result).not.toHaveProperty("action");
      expect(result).not.toHaveProperty("fields");
    });

    it("rejects checkout when promo resolve fails", async () => {
      promoService.resolveForCheckout.mockResolvedValue({
        ok: false,
        error: "Промокод недействителен или уже недоступен.",
      });

      await expect(
        service.createCheckout({ site: { any: true }, promoCode: "BAD" }, user, null),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(orders.createOrder).not.toHaveBeenCalled();
      expect(promoService.reserveForNewOrder).not.toHaveBeenCalled();
      expect(sites.publishAfterPayment).not.toHaveBeenCalled();
    });

    it("cancels previous pending and reserves again when promo snapshot changes", async () => {
      const previous = makeOrder({
        amount: "2000.00",
        discountAmount: "2000.00",
        promoCode: "OLD50",
        promoCodeId: "promo-old",
      });
      const pricing = applyPromoDiscount(INVITE_SITE_PRICE_RUB, "percent", 25);
      const promo = makePromo();
      promo.code = "NEW25";
      promo.id = "promo-new";
      promo.value = 25;

      orders.getLatestPendingOrderForSite.mockResolvedValue(previous);
      orders.cancelPendingOrdersForSite.mockResolvedValue([previous]);
      promoService.resolveForCheckout.mockResolvedValue({
        ok: true,
        pricing,
        promo,
      });
      const nextOrder = makeOrder({
        id: "order-2",
        invId: 43,
        amount: pricing.amount,
        discountAmount: pricing.discountAmount,
        originalAmount: pricing.originalAmount,
        promoCode: promo.code,
        promoCodeId: promo.id,
      });
      orders.createOrder.mockResolvedValue(nextOrder);

      const result = await service.createCheckout(
        { site: { any: true }, siteId: "site-1", promoCode: "NEW25" },
        user,
        null,
      );

      expect(orders.cancelPendingOrdersForSite).toHaveBeenCalledWith("site-1");
      expect(promoService.releaseReservations).toHaveBeenCalledWith([previous]);
      expect(promoService.reserveForNewOrder).toHaveBeenCalledWith(
        promo,
        expect.objectContaining({ siteId: "site-1", userId: user.id }),
      );
      expect(orders.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: pricing.amount,
          promoCode: "NEW25",
          promoCodeId: "promo-new",
        }),
      );
      expect(result.free).toBe(false);
      if (!result.free) {
        expect(result.order.id).toBe("order-2");
        expect(result.fields.OutSum).toBe(pricing.amount);
      }
    });

    it("does not publish free checkout when promo confirm fails", async () => {
      const promo = makePromo();
      const pricing = applyPromoDiscount(INVITE_SITE_PRICE_RUB, "percent", 100);
      promoService.resolveForCheckout.mockResolvedValue({
        ok: true,
        pricing,
        promo,
      });
      promoService.confirmReservationForPaidOrder.mockResolvedValue({ ok: false });

      const freeOrder = makeOrder({
        amount: pricing.amount,
        discountAmount: pricing.discountAmount,
        originalAmount: pricing.originalAmount,
        promoCode: promo.code,
        promoCodeId: promo.id,
      });
      orders.createOrder.mockResolvedValue(freeOrder);
      orders.markPaidIfPending.mockResolvedValue({
        ...freeOrder,
        status: "paid",
        paidAt: "2026-01-01T01:00:00.000Z",
      });
      orders.getOrderById.mockResolvedValue({
        ...freeOrder,
        status: "paid",
        paidAt: "2026-01-01T01:00:00.000Z",
      });

      await expect(
        service.createCheckout({ site: { any: true }, promoCode: "FREE100" }, user, null),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(sites.publishAfterPayment).not.toHaveBeenCalled();
    });
  });

  describe("completePayment via Result URL", () => {
    it("marks paid, confirms promo, and publishes", async () => {
      const order = makeOrder({
        amount: "2000.00",
        discountAmount: "2000.00",
        originalAmount: "4000.00",
        promoCode: "SAVE50",
        promoCodeId: "promo-1",
      });
      orders.getOrderByInvoice.mockResolvedValue(order);
      orders.markPaidIfPending.mockResolvedValue({
        ...order,
        status: "paid",
        paidAt: "2026-01-01T01:00:00.000Z",
      });

      const outSum = order.amount;
      const invIdRaw = String(order.invId);
      const signature = createRobokassaSignature([
        outSum,
        invIdRaw,
        "password2",
        `Shp_order=${order.id}`,
      ]);

      const response = await service.processResult({
        OutSum: outSum,
        InvId: invIdRaw,
        SignatureValue: signature,
        Shp_order: order.id,
        PaymentMethod: "BankCard",
      });

      expect(response).toBe("OK42");
      expect(orders.markPaidIfPending).toHaveBeenCalledWith(42, "BankCard");
      expect(promoService.confirmReservationForPaidOrder).toHaveBeenCalledWith(
        expect.objectContaining({ id: "order-1", status: "paid" }),
      );
      expect(sites.publishAfterPayment).toHaveBeenCalledWith("site-1");
    });

    it("does not publish when the order was cancelled before markPaid", async () => {
      const order = makeOrder();
      orders.getOrderByInvoice.mockResolvedValue(order);
      orders.markPaidIfPending.mockResolvedValue(null);
      orders.getOrderById.mockResolvedValue({ ...order, status: "cancelled" });

      const outSum = order.amount;
      const invIdRaw = String(order.invId);
      const signature = createRobokassaSignature([
        outSum,
        invIdRaw,
        "password2",
        `Shp_order=${order.id}`,
      ]);

      await expect(
        service.processResult({
          OutSum: outSum,
          InvId: invIdRaw,
          SignatureValue: signature,
          Shp_order: order.id,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(orders.markPaidIfPending).toHaveBeenCalledWith(42, null);
      expect(promoService.confirmReservationForPaidOrder).not.toHaveBeenCalled();
      expect(sites.publishAfterPayment).not.toHaveBeenCalled();
    });

    it("rejects amount mismatch even with a valid signature for the forged sum", async () => {
      const order = makeOrder({ amount: "4000.00" });
      orders.getOrderByInvoice.mockResolvedValue(order);

      const outSum = "1.00";
      const invIdRaw = String(order.invId);
      const signature = createRobokassaSignature([
        outSum,
        invIdRaw,
        "password2",
        `Shp_order=${order.id}`,
      ]);

      await expect(
        service.processResult({
          OutSum: outSum,
          InvId: invIdRaw,
          SignatureValue: signature,
          Shp_order: order.id,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(orders.markPaidIfPending).not.toHaveBeenCalled();
      expect(promoService.confirmReservationForPaidOrder).not.toHaveBeenCalled();
      expect(sites.publishAfterPayment).not.toHaveBeenCalled();
    });

    it("rejects an invalid Result URL signature", async () => {
      const order = makeOrder();
      orders.getOrderByInvoice.mockResolvedValue(order);

      await expect(
        service.processResult({
          OutSum: order.amount,
          InvId: String(order.invId),
          SignatureValue: "0".repeat(32),
          Shp_order: order.id,
        }),
      ).rejects.toThrow();

      expect(orders.markPaidIfPending).not.toHaveBeenCalled();
      expect(sites.publishAfterPayment).not.toHaveBeenCalled();
    });

    it("rejects payment for a cancelled order that cannot be revived", async () => {
      const order = makeOrder({ status: "cancelled" });
      orders.getOrderByInvoice.mockResolvedValue(order);
      // Гонка: заказ перестал быть cancelled между чтением и восстановлением.
      orders.restoreCancelledToPending.mockResolvedValue(null);

      const outSum = order.amount;
      const invIdRaw = String(order.invId);
      const signature = createRobokassaSignature([
        outSum,
        invIdRaw,
        "password2",
        `Shp_order=${order.id}`,
      ]);

      await expect(
        service.processResult({
          OutSum: outSum,
          InvId: invIdRaw,
          SignatureValue: signature,
          Shp_order: order.id,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(orders.markPaidIfPending).not.toHaveBeenCalled();
      expect(sites.publishAfterPayment).not.toHaveBeenCalled();
    });
  });

  describe("order status responses", () => {
    it("omits promoCode from the public status payload", async () => {
      orders.getOrderById.mockResolvedValue(
        makeOrder({
          promoCode: "SECRET10",
          status: "paid",
          paidAt: "2026-01-01T01:00:00.000Z",
        }),
      );

      const result = await service.getPublicOrderStatus("order-1");

      expect(result).toMatchObject({
        id: "order-1",
        status: "paid",
        siteUrl: "/invite/sites/site-1",
      });
      expect(result).not.toHaveProperty("promoCode");
    });

    it("includes promoCode for the order owner", async () => {
      orders.getOwnedOrder.mockResolvedValue(
        makeOrder({
          promoCode: "SECRET10",
          status: "paid",
          paidAt: "2026-01-01T01:00:00.000Z",
        }),
      );

      const result = await service.getOwnedOrder("order-1", user.id);

      expect(result.promoCode).toBe("SECRET10");
    });
  });

  describe("reconciling pending orders with Robokassa", () => {
    const HOUR_MS = 60 * 60 * 1000;

    function enableProductionMode() {
      process.env.ROBOKASSA_TEST_MODE = "false";
      process.env.ROBOKASSA_PASSWORD1 = "live1";
      process.env.ROBOKASSA_PASSWORD2 = "live2";
    }

    function makeState(overrides: Record<string, unknown> = {}) {
      return {
        outSum: INVITE_SITE_PRICE,
        paymentMethod: "SBP",
        resultCode: ROBOKASSA_RESULT_CODE.ok,
        stateCode: ROBOKASSA_STATE_CODE.completed,
        ...overrides,
      };
    }

    beforeEach(() => {
      enableProductionMode();
    });

    it("pays and publishes an order Robokassa reports as completed", async () => {
      const pending = makeOrder();
      const paid = makeOrder({ status: "paid", paidAt: "2026-01-01T01:00:00.000Z" });
      orders.getOrderById.mockResolvedValue(pending);
      orders.markPaidIfPending.mockResolvedValue(paid);
      opState.fetchOperationState.mockResolvedValue(makeState());

      // Ответ отдаётся до опроса, поэтому здесь ещё прежний снимок заказа.
      const result = await service.getPublicOrderStatus("order-1");
      expect(result.status).toBe("pending");

      await flushReconcile();

      expect(opState.fetchOperationState).toHaveBeenCalledWith({
        invId: 42,
        merchantLogin: "demo",
        password2: "live2",
      });
      expect(orders.markPaidIfPending).toHaveBeenCalledWith(42, "SBP");
      expect(promoService.confirmReservationForPaidOrder).toHaveBeenCalledWith(paid);
      expect(sites.publishAfterPayment).toHaveBeenCalledWith("site-1");
    });

    it("answers the status poll without waiting for Robokassa", async () => {
      orders.getOrderById.mockResolvedValue(makeOrder());
      // Опрос, который никогда не завершится: ответ API не должен от него зависеть.
      opState.fetchOperationState.mockReturnValue(new Promise(() => {}));

      await expect(service.getPublicOrderStatus("order-1")).resolves.toMatchObject({
        status: "pending",
      });
    });

    it("keeps the order pending while the payment is still in flight", async () => {
      const inFlight = [
        ROBOKASSA_STATE_CODE.hold,
        ROBOKASSA_STATE_CODE.crediting,
        ROBOKASSA_STATE_CODE.suspended,
      ];

      for (const [index, stateCode] of inFlight.entries()) {
        // Свой id на итерацию: дебаунс живёт per-order и иначе съел бы вызов.
        const orderId = `order-inflight-${index}`;
        orders.getOrderById.mockResolvedValue(
          makeOrder({
            createdAt: new Date(Date.now() - 2 * HOUR_MS).toISOString(),
            id: orderId,
          }),
        );
        opState.fetchOperationState.mockResolvedValue(makeState({ stateCode }));

        await service.getPublicOrderStatus(orderId);
        await flushReconcile();
      }

      expect(orders.markPaidIfPending).not.toHaveBeenCalled();
      expect(orders.cancelOrderIfPending).not.toHaveBeenCalled();
    });

    it("cancels the order and releases the promo slot when Robokassa refunded it", async () => {
      const pending = makeOrder({ promoCode: "SALE", promoCodeId: "promo-1" });
      const cancelled = { ...pending, status: "cancelled" as const };
      orders.getOrderById.mockResolvedValue(pending);
      orders.cancelOrderIfPending.mockResolvedValue(cancelled);
      opState.fetchOperationState.mockResolvedValue(
        makeState({ stateCode: ROBOKASSA_STATE_CODE.refunded }),
      );

      await service.getPublicOrderStatus("order-1");
      await flushReconcile();

      expect(orders.cancelOrderIfPending).toHaveBeenCalledWith("order-1");
      expect(promoService.releaseReservations).toHaveBeenCalledWith([cancelled]);
    });

    it("keeps an unpaid but fresh order pending, and cancels it once expired", async () => {
      opState.fetchOperationState.mockResolvedValue(
        makeState({ outSum: null, stateCode: ROBOKASSA_STATE_CODE.initialized }),
      );
      orders.getOrderById.mockResolvedValue(
        makeOrder({ createdAt: new Date(Date.now() - 60_000).toISOString() }),
      );

      await service.getPublicOrderStatus("order-1");
      await flushReconcile();

      expect(orders.cancelOrderIfPending).not.toHaveBeenCalled();

      const expired = makeOrder({
        createdAt: new Date(Date.now() - 2 * HOUR_MS).toISOString(),
        id: "order-2",
      });
      orders.getOrderById.mockResolvedValue(expired);
      orders.cancelOrderIfPending.mockResolvedValue({ ...expired, status: "cancelled" });

      await service.getPublicOrderStatus("order-2");
      await flushReconcile();

      expect(orders.cancelOrderIfPending).toHaveBeenCalledWith("order-2");
    });

    it("never cancels an expired order while Robokassa is unreachable", async () => {
      orders.getOrderById.mockResolvedValue(
        makeOrder({ createdAt: new Date(Date.now() - 2 * HOUR_MS).toISOString() }),
      );
      opState.fetchOperationState.mockResolvedValue(null);

      await service.getPublicOrderStatus("order-1");
      await flushReconcile();

      expect(orders.cancelOrderIfPending).not.toHaveBeenCalled();
      expect(orders.markPaidIfPending).not.toHaveBeenCalled();
    });

    it("refuses to pay an order whose amount does not match Robokassa", async () => {
      orders.getOrderById.mockResolvedValue(makeOrder());
      opState.fetchOperationState.mockResolvedValue(makeState({ outSum: "1.00" }));

      await service.getPublicOrderStatus("order-1");
      await flushReconcile();

      expect(orders.markPaidIfPending).not.toHaveBeenCalled();
      expect(sites.publishAfterPayment).not.toHaveBeenCalled();
    });

    it("does not query Robokassa for orders that are already settled", async () => {
      orders.getOrderById.mockResolvedValue(
        makeOrder({ status: "paid", paidAt: "2026-01-01T01:00:00.000Z" }),
      );

      await service.getPublicOrderStatus("order-1");

      expect(opState.fetchOperationState).not.toHaveBeenCalled();
    });

    it("skips the pull channel in test mode, where OpStateExt has no data", async () => {
      process.env.ROBOKASSA_TEST_MODE = "true";
      orders.getOrderById.mockResolvedValue(makeOrder());

      const result = await service.getPublicOrderStatus("order-1");

      expect(opState.fetchOperationState).not.toHaveBeenCalled();
      expect(result.status).toBe("pending");
    });

    it("debounces repeated status polls for the same order", async () => {
      orders.getOrderById.mockResolvedValue(makeOrder());
      opState.fetchOperationState.mockResolvedValue(
        makeState({ stateCode: ROBOKASSA_STATE_CODE.crediting }),
      );

      await service.getPublicOrderStatus("order-1");
      await service.getPublicOrderStatus("order-1");
      await service.getPublicOrderStatus("order-1");
      await flushReconcile();

      expect(opState.fetchOperationState).toHaveBeenCalledTimes(1);
    });

    describe("receipt email for accounts that have none", () => {
      const noEmailUser: AuthUser = { ...user, email: "" };

      it("refuses a paid checkout without an email to send the receipt to", async () => {
        await expect(
          service.createCheckout({ site: { any: true } }, noEmailUser, null),
        ).rejects.toThrow(BadRequestException);

        expect(orders.createOrder).not.toHaveBeenCalled();
      });

      it("uses the supplied email for the order and the Robokassa receipt", async () => {
        orders.createOrder.mockResolvedValue(makeOrder({ email: "guest@example.com" }));

        const result = await service.createCheckout(
          { email: " Guest@example.com ", site: { any: true } },
          noEmailUser,
          null,
        );

        expect(orders.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({ email: "Guest@example.com" }),
        );
        expect(result).toMatchObject({
          fields: expect.objectContaining({ Email: "Guest@example.com" }),
        });
      });

      it("rejects a malformed email before creating anything", async () => {
        await expect(
          service.createCheckout({ email: "не-почта", site: { any: true } }, noEmailUser, null),
        ).rejects.toThrow(BadRequestException);

        expect(sites.createDraftForCheckout).not.toHaveBeenCalled();
        expect(orders.createOrder).not.toHaveBeenCalled();
      });

      it("allows a free promo checkout without an email — there is no receipt", async () => {
        const promo = makePromo();
        promoService.resolveForCheckout.mockResolvedValue({
          ok: true,
          pricing: applyPromoDiscount(INVITE_SITE_PRICE_RUB, promo.type, promo.value),
          promo,
        });
        const freeOrder = makeOrder({ amount: "0.00", promoCode: promo.code, promoCodeId: promo.id });
        orders.createOrder.mockResolvedValue(freeOrder);
        orders.markPaidIfPending.mockResolvedValue({ ...freeOrder, status: "paid" });
        orders.getOrderById.mockResolvedValue({ ...freeOrder, status: "paid" });

        const result = await service.createCheckout({ site: { any: true } }, noEmailUser, null);

        expect(result).toMatchObject({ free: true });
        expect(sites.publishAfterPayment).toHaveBeenCalledWith("site-1");
      });
    });

    describe("re-checkout while a payment is still in flight", () => {
      it("refuses to cancel an order whose money is already moving", async () => {
        const pending = makeOrder();
        orders.getLatestPendingOrderForSite.mockResolvedValue(pending);
        opState.fetchOperationState.mockResolvedValue(
          makeState({ stateCode: ROBOKASSA_STATE_CODE.crediting }),
        );
        // Другой промокод — прежний заказ пошёл бы под отмену.
        promoService.resolveForCheckout.mockResolvedValue({
          ok: true,
          pricing: applyPromoDiscount(INVITE_SITE_PRICE_RUB, "percent", 10),
          promo: makePromo(),
        });

        await expect(
          service.createCheckout({ site: { any: true }, siteId: "site-1" }, user, null),
        ).rejects.toThrow(BadRequestException);

        expect(orders.cancelPendingOrdersForSite).not.toHaveBeenCalled();
        expect(orders.createOrder).not.toHaveBeenCalled();
      });

      it("cancels the previous order once Robokassa confirms it will not be paid", async () => {
        const pending = makeOrder({ createdAt: new Date(Date.now() - 2 * HOUR_MS).toISOString() });
        orders.getLatestPendingOrderForSite.mockResolvedValueOnce(pending);
        orders.getLatestPendingOrderForSite.mockResolvedValue(null);
        orders.cancelOrderIfPending.mockResolvedValue({ ...pending, status: "cancelled" });
        orders.createOrder.mockResolvedValue(makeOrder({ id: "order-2", invId: 43 }));
        opState.fetchOperationState.mockResolvedValue(
          makeState({ stateCode: ROBOKASSA_STATE_CODE.cancelled, outSum: null }),
        );

        const result = await service.createCheckout(
          { site: { any: true }, siteId: "site-1" },
          user,
          null,
        );

        expect(orders.createOrder).toHaveBeenCalled();
        expect(result).toMatchObject({ free: false });
      });

      it("does not query Robokassa on a first checkout without a site", async () => {
        orders.createOrder.mockResolvedValue(makeOrder());

        await service.createCheckout({ site: { any: true } }, user, null);

        expect(opState.fetchOperationState).not.toHaveBeenCalled();
      });
    });

    describe("payment arriving for an order that was already cancelled", () => {
      function signResult(order: PaymentOrder) {
        return createRobokassaSignature([
          order.amount,
          String(order.invId),
          "live2",
          `Shp_order=${order.id}`,
        ]);
      }

      it("revives the order and publishes the site", async () => {
        const cancelled = makeOrder({ status: "cancelled" });
        const revived = makeOrder();
        const paid = makeOrder({ status: "paid", paidAt: "2026-01-01T01:00:00.000Z" });
        orders.getOrderByInvoice.mockResolvedValue(cancelled);
        orders.getPaidOrderForSite.mockResolvedValue(null);
        orders.restoreCancelledToPending.mockResolvedValue(revived);
        orders.markPaidIfPending.mockResolvedValue(paid);

        const result = await service.processResult({
          InvId: "42",
          OutSum: cancelled.amount,
          Shp_order: cancelled.id,
          SignatureValue: signResult(cancelled),
        });

        expect(orders.restoreCancelledToPending).toHaveBeenCalledWith("order-1");
        expect(promoService.reclaimReservationForOrder).toHaveBeenCalledWith(revived);
        expect(sites.publishAfterPayment).toHaveBeenCalledWith("site-1");
        expect(result).toBe("OK42");
      });

      it("refuses when the site already has another paid order", async () => {
        const cancelled = makeOrder({ status: "cancelled" });
        orders.getOrderByInvoice.mockResolvedValue(cancelled);
        orders.getPaidOrderForSite.mockResolvedValue(makeOrder({ id: "order-9", status: "paid" }));

        await expect(
          service.processResult({
            InvId: "42",
            OutSum: cancelled.amount,
            Shp_order: cancelled.id,
            SignatureValue: signResult(cancelled),
          }),
        ).rejects.toThrow(BadRequestException);

        expect(orders.restoreCancelledToPending).not.toHaveBeenCalled();
        expect(sites.publishAfterPayment).not.toHaveBeenCalled();
      });
    });
  });
});
