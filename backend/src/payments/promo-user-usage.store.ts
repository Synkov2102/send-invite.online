import { Injectable } from "@nestjs/common";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";

type PromoUserUsageDocument = {
  _id: string;
  count: number;
  createdAt: string;
  promoCodeId: string;
  updatedAt: string;
  userId: string;
};

function usageKey(promoCodeId: string, userId: string) {
  return `${promoCodeId}:${userId}`;
}

@Injectable()
export class PromoUserUsageStore {
  private readonly ensureIndexes = lazyOnce(() => this.ensureUsageIndexes());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getCollection() {
    const db = await this.mongoDb.getDb();
    return db.collection<PromoUserUsageDocument>("promo_user_usage");
  }

  private async ensureUsageIndexes() {
    const usage = await this.getCollection();
    await usage.createIndex({ promoCodeId: 1, userId: 1 }, { unique: true });
  }

  /**
   * Atomically reserves one per-user slot.
   * Returns null when the user already holds maxUsesPerUser slots.
   */
  async reserveIfAvailable(
    promoCodeId: string,
    userId: string,
    maxUsesPerUser: number,
  ) {
    await this.ensureIndexes();
    const usage = await this.getCollection();
    const now = new Date().toISOString();
    const id = usageKey(promoCodeId, userId);

    const updated = await usage.findOneAndUpdate(
      { _id: id, count: { $lt: maxUsesPerUser } },
      {
        $inc: { count: 1 },
        $set: { promoCodeId, updatedAt: now, userId },
        $setOnInsert: { createdAt: now },
      },
      { returnDocument: "after", upsert: false },
    );

    if (updated) {
      return updated;
    }

    try {
      await usage.insertOne({
        _id: id,
        count: 1,
        createdAt: now,
        promoCodeId,
        updatedAt: now,
        userId,
      });
      return usage.findOne({ _id: id });
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? (error as { code?: number }).code
          : undefined;

      if (code !== 11000) {
        throw error;
      }

      return usage.findOneAndUpdate(
        { _id: id, count: { $lt: maxUsesPerUser } },
        {
          $inc: { count: 1 },
          $set: { updatedAt: now },
        },
        { returnDocument: "after" },
      );
    }
  }

  async getCount(promoCodeId: string, userId: string) {
    await this.ensureIndexes();
    const usage = await this.getCollection();
    const document = await usage.findOne({ _id: usageKey(promoCodeId, userId) });
    return document?.count ?? 0;
  }

  async release(promoCodeId: string, userId: string) {
    await this.ensureIndexes();
    const usage = await this.getCollection();
    const now = new Date().toISOString();
    return usage.findOneAndUpdate(
      { _id: usageKey(promoCodeId, userId), count: { $gt: 0 } },
      {
        $inc: { count: -1 },
        $set: { updatedAt: now },
      },
      { returnDocument: "after" },
    );
  }
}
