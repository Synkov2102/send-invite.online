import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";

export type PromoCodeEventAction =
  | "preview_ok"
  | "preview_fail"
  | "checkout_apply"
  | "checkout_reject"
  | "reservation_release"
  | "redeem"
  | "redeem_fail";

export type PromoCodeEvent = {
  action: PromoCodeEventAction;
  amount: string | null;
  codeNormalized: string;
  createdAt: string;
  discountAmount: string | null;
  id: string;
  ip: string | null;
  orderId: string | null;
  originalAmount: string | null;
  promoCodeId: string | null;
  reason: string | null;
  siteId: string | null;
  userId: string | null;
};

type PromoCodeEventDocument = PromoCodeEvent & {
  _id: string;
};

@Injectable()
export class PromoCodeEventStore {
  private readonly ensureIndexes = lazyOnce(() => this.ensureEventIndexes());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getCollection() {
    const db = await this.mongoDb.getDb();
    return db.collection<PromoCodeEventDocument>("promo_code_events");
  }

  private async ensureEventIndexes() {
    const events = await this.getCollection();
    await events.createIndex({ createdAt: -1 });
    await events.createIndex({ codeNormalized: 1, createdAt: -1 });
    await events.createIndex({ userId: 1, createdAt: -1 });
    await events.createIndex({ orderId: 1, action: 1 });
    await events.createIndex({ promoCodeId: 1, createdAt: -1 });
  }

  async write(input: {
    action: PromoCodeEventAction;
    amount?: string | null;
    codeNormalized: string;
    discountAmount?: string | null;
    ip?: string | null;
    orderId?: string | null;
    originalAmount?: string | null;
    promoCodeId?: string | null;
    reason?: string | null;
    siteId?: string | null;
    userId?: string | null;
  }) {
    await this.ensureIndexes();
    const id = randomUUID();
    const document: PromoCodeEventDocument = {
      _id: id,
      action: input.action,
      amount: input.amount ?? null,
      codeNormalized: input.codeNormalized,
      createdAt: new Date().toISOString(),
      discountAmount: input.discountAmount ?? null,
      id,
      ip: input.ip ?? null,
      orderId: input.orderId ?? null,
      originalAmount: input.originalAmount ?? null,
      promoCodeId: input.promoCodeId ?? null,
      reason: input.reason ?? null,
      siteId: input.siteId ?? null,
      userId: input.userId ?? null,
    };
    const events = await this.getCollection();
    await events.insertOne(document);
    return document;
  }
}
