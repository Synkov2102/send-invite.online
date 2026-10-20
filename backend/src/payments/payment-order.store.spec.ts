import { Test } from "@nestjs/testing";
import { MongoDbService } from "../database/mongodb.service";
import { PaymentOrderStore } from "./payment-order.store";
import {
  createMongoCollectionMock,
  createMongoDbServiceMock,
} from "./test/mongo-collection.mock";

describe("PaymentOrderStore", () => {
  let store: PaymentOrderStore;
  let collection: ReturnType<typeof createMongoCollectionMock>;

  beforeEach(async () => {
    collection = createMongoCollectionMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentOrderStore,
        { provide: MongoDbService, useValue: createMongoDbServiceMock(collection) },
      ],
    }).compile();

    store = moduleRef.get(PaymentOrderStore);
  });

  describe("cancelPendingOrdersForSite", () => {
    it("returns only orders won by findOneAndUpdate (no double-release list)", async () => {
      const first = {
        _id: "o1",
        id: "o1",
        siteId: "site-1",
        status: "pending",
        amount: "2000.00",
        discountAmount: "2000.00",
        originalAmount: "4000.00",
        promoCode: "SAVE50",
        promoCodeId: "promo-1",
        promoRedeemedAt: null,
        ownerId: "user-1",
        email: null,
        invId: 1,
        paidAt: null,
        paymentMethod: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      const second = { ...first, _id: "o2", id: "o2", invId: 2 };

      collection.findOneAndUpdate
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(null);

      const cancelled = await store.cancelPendingOrdersForSite("site-1");

      expect(cancelled.map((order) => order.id)).toEqual(["o1", "o2"]);
      expect(collection.findOneAndUpdate).toHaveBeenCalledTimes(3);
      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
        { siteId: "site-1", status: "pending" },
        expect.objectContaining({
          $set: expect.objectContaining({ status: "cancelled" }),
        }),
        expect.objectContaining({ returnDocument: "before" }),
      );
    });

    it("returns empty when another worker already cancelled all pending", async () => {
      collection.findOneAndUpdate.mockResolvedValue(null);

      const cancelled = await store.cancelPendingOrdersForSite("site-1");

      expect(cancelled).toEqual([]);
      expect(collection.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe("cancelExpiredPendingOrders", () => {
    it("cancels only stale pending rows matched by createdAt cutoff", async () => {
      const stale = {
        _id: "old",
        id: "old",
        siteId: "site-1",
        status: "pending",
        amount: "4000.00",
        discountAmount: "0.00",
        originalAmount: "4000.00",
        promoCode: "SAVE50",
        promoCodeId: "promo-1",
        promoRedeemedAt: null,
        ownerId: "user-1",
        email: null,
        invId: 9,
        paidAt: null,
        paymentMethod: null,
        createdAt: "2020-01-01T00:00:00.000Z",
        updatedAt: "2020-01-01T00:00:00.000Z",
      };

      collection.findOneAndUpdate
        .mockResolvedValueOnce(stale)
        .mockResolvedValueOnce(null);

      const cancelled = await store.cancelExpiredPendingOrders("2026-01-01T00:00:00.000Z");

      expect(cancelled).toHaveLength(1);
      expect(cancelled[0]?.promoCodeId).toBe("promo-1");
      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
        {
          status: "pending",
          createdAt: { $lt: "2026-01-01T00:00:00.000Z" },
        },
        expect.any(Object),
        expect.objectContaining({ returnDocument: "before" }),
      );
    });
  });

  describe("listPaidAtForPromo", () => {
    it("queries only paid orders of the code in the half-open [from, to) range", async () => {
      const toArray = jest
        .fn()
        .mockResolvedValue([
          { paidAt: "2026-10-01T10:00:00.000Z" },
          { paidAt: null },
          { paidAt: "2026-10-02T10:00:00.000Z" },
        ]);
      const find = jest.fn().mockReturnValue({ toArray });
      Object.assign(collection, { find });

      const paidAt = await store.listPaidAtForPromo(
        "promo-1",
        "2026-09-30T21:00:00.000Z",
        "2026-10-02T21:00:00.000Z",
      );

      expect(find).toHaveBeenCalledWith(
        {
          paidAt: { $gte: "2026-09-30T21:00:00.000Z", $lt: "2026-10-02T21:00:00.000Z" },
          promoCodeId: "promo-1",
          status: "paid",
        },
        { projection: { _id: 0, paidAt: 1 } },
      );
      expect(paidAt).toEqual(["2026-10-01T10:00:00.000Z", "2026-10-02T10:00:00.000Z"]);
    });
  });
});
