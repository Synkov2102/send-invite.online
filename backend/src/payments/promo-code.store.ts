import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import type { PromoDiscountType } from "@invite/shared";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";

export type PromoCode = {
  code: string;
  createdAt: string;
  expiresAt: string | null;
  id: string;
  isActive: boolean;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  note: string | null;
  startsAt: string | null;
  type: PromoDiscountType;
  updatedAt: string;
  /** Consumed + reserved slots. Reserved at checkout; kept after payment. */
  usedCount: number;
  value: number;
};

type PromoCodeDocument = PromoCode & {
  _id: string;
};

@Injectable()
export class PromoCodeStore {
  private readonly ensureIndexes = lazyOnce(() => this.ensurePromoIndexes());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getCollection() {
    const db = await this.mongoDb.getDb();
    return db.collection<PromoCodeDocument>("promo_codes");
  }

  private async ensurePromoIndexes() {
    const promoCodes = await this.getCollection();
    await promoCodes.createIndex({ code: 1 }, { unique: true });
    await promoCodes.createIndex({ id: 1 }, { unique: true });
    await promoCodes.createIndex({ isActive: 1, expiresAt: 1 });
  }

  async getByCode(code: string) {
    await this.ensureIndexes();
    const promoCodes = await this.getCollection();
    return promoCodes.findOne({ code });
  }

  async getById(id: string) {
    await this.ensureIndexes();
    const promoCodes = await this.getCollection();
    return promoCodes.findOne({ id });
  }

  async create(input: {
    code: string;
    expiresAt?: string | null;
    isActive?: boolean;
    maxUses?: number | null;
    maxUsesPerUser?: number | null;
    note?: string | null;
    startsAt?: string | null;
    type: PromoDiscountType;
    value: number;
  }) {
    await this.ensureIndexes();
    const now = new Date().toISOString();
    const id = randomUUID();
    const document: PromoCodeDocument = {
      _id: id,
      code: input.code,
      createdAt: now,
      expiresAt: input.expiresAt ?? null,
      id,
      isActive: input.isActive ?? true,
      maxUses: input.maxUses ?? null,
      maxUsesPerUser: input.maxUsesPerUser ?? 1,
      note: input.note ?? null,
      startsAt: input.startsAt ?? null,
      type: input.type,
      updatedAt: now,
      usedCount: 0,
      value: input.value,
    };
    const promoCodes = await this.getCollection();
    await promoCodes.insertOne(document);
    return document;
  }

  /** Atomically reserves one global use slot at checkout. */
  async reserveIfAvailable(id: string) {
    await this.ensureIndexes();
    const promoCodes = await this.getCollection();
    const now = new Date().toISOString();
    return promoCodes.findOneAndUpdate(
      {
        id,
        isActive: true,
        $expr: {
          $or: [
            { $eq: ["$maxUses", null] },
            { $lt: ["$usedCount", "$maxUses"] },
          ],
        },
      },
      {
        $inc: { usedCount: 1 },
        $set: { updatedAt: now },
      },
      { returnDocument: "after" },
    );
  }

  /** Releases a checkout reservation when a pending order is cancelled. */
  async releaseReservation(id: string) {
    await this.ensureIndexes();
    const promoCodes = await this.getCollection();
    const now = new Date().toISOString();
    return promoCodes.findOneAndUpdate(
      {
        id,
        usedCount: { $gt: 0 },
      },
      {
        $inc: { usedCount: -1 },
        $set: { updatedAt: now },
      },
      { returnDocument: "after" },
    );
  }
}
