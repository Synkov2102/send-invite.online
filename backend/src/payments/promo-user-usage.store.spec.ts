import { Test } from "@nestjs/testing";
import { MongoDbService } from "../database/mongodb.service";
import { PromoUserUsageStore } from "./promo-user-usage.store";
import {
  createMongoCollectionMock,
  createMongoDbServiceMock,
} from "./test/mongo-collection.mock";

describe("PromoUserUsageStore", () => {
  let store: PromoUserUsageStore;
  let collection: ReturnType<typeof createMongoCollectionMock>;

  beforeEach(async () => {
    collection = createMongoCollectionMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PromoUserUsageStore,
        { provide: MongoDbService, useValue: createMongoDbServiceMock(collection) },
      ],
    }).compile();

    store = moduleRef.get(PromoUserUsageStore);
  });

  describe("reserveIfAvailable", () => {
    it("inserts the first per-user slot", async () => {
      collection.findOneAndUpdate.mockResolvedValueOnce(null);
      collection.insertOne.mockResolvedValueOnce({ acknowledged: true });
      collection.findOne.mockResolvedValueOnce({
        _id: "promo-1:user-1",
        count: 1,
        promoCodeId: "promo-1",
        userId: "user-1",
      });

      const reserved = await store.reserveIfAvailable("promo-1", "user-1", 1);

      expect(reserved?.count).toBe(1);
      expect(collection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "promo-1:user-1",
          count: 1,
          promoCodeId: "promo-1",
          userId: "user-1",
        }),
      );
    });

    it("rejects a second reserve when maxUsesPerUser is already reached", async () => {
      collection.findOneAndUpdate
        .mockResolvedValueOnce(null) // initial update miss
        .mockResolvedValueOnce(null); // post-duplicate retry also miss
      collection.insertOne.mockRejectedValueOnce({ code: 11000 });

      const reserved = await store.reserveIfAvailable("promo-1", "user-1", 1);

      expect(reserved).toBeNull();
      expect(collection.findOneAndUpdate).toHaveBeenCalledTimes(2);
    });

    it("increments when under the per-user cap", async () => {
      collection.findOneAndUpdate.mockResolvedValueOnce({
        _id: "promo-1:user-1",
        count: 2,
        promoCodeId: "promo-1",
        userId: "user-1",
      });

      const reserved = await store.reserveIfAvailable("promo-1", "user-1", 3);

      expect(reserved?.count).toBe(2);
      expect(collection.insertOne).not.toHaveBeenCalled();
    });
  });

  describe("release", () => {
    it("decrements only when count > 0", async () => {
      collection.findOneAndUpdate.mockResolvedValueOnce({
        _id: "promo-1:user-1",
        count: 0,
      });

      await store.release("promo-1", "user-1");

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "promo-1:user-1", count: { $gt: 0 } },
        expect.objectContaining({ $inc: { count: -1 } }),
        expect.objectContaining({ returnDocument: "after" }),
      );
    });
  });
});
