import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";

export type PaymentOrderStatus = "pending" | "paid" | "cancelled";

/** Abandoned pending checkouts release promo reservations after this TTL. */
export const PAYMENT_PENDING_TTL_MS = 60 * 60 * 1000;

export type PaymentOrder = {
  amount: string;
  createdAt: string;
  discountAmount: string;
  email: string | null;
  id: string;
  invId: number;
  originalAmount: string;
  ownerId: string;
  paidAt: string | null;
  paymentMethod: string | null;
  promoCode: string | null;
  promoCodeId: string | null;
  promoRedeemedAt: string | null;
  siteId: string;
  status: PaymentOrderStatus;
  updatedAt: string;
};

type PaymentOrderDocument = PaymentOrder & {
  _id: string;
};

type CounterDocument = {
  _id: string;
  sequence: number;
};

@Injectable()
export class PaymentOrderStore {
  private readonly ensureIndexes = lazyOnce(() => this.ensureOrderIndexes());
  private readonly ensureInvoiceCounter = lazyOnce(() => this.syncInvoiceCounter());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getOrdersCollection() {
    const db = await this.mongoDb.getDb();
    return db.collection<PaymentOrderDocument>("payment_orders");
  }

  private async getCountersCollection() {
    const db = await this.mongoDb.getDb();
    return db.collection<CounterDocument>("counters");
  }

  private async ensureOrderIndexes() {
    const orders = await this.getOrdersCollection();
    await orders.createIndex({ id: 1 }, { unique: true });
    await orders.createIndex({ invId: 1 }, { unique: true });
    await orders.createIndex({ ownerId: 1, createdAt: -1 });
    await orders.createIndex({ siteId: 1, createdAt: -1 });
    await orders.createIndex({ ownerId: 1, promoCodeId: 1, status: 1 });
    await orders.createIndex({ status: 1, createdAt: 1 });
  }

  /**
   * Robokassa отвергает повторный InvId, а счётчик живёт в отдельной коллекции:
   * после восстановления Mongo из бэкапа он может откатиться на уже выданные
   * номера. Один раз за процесс подтягиваем его до максимума в заказах.
   */
  private async syncInvoiceCounter() {
    const orders = await this.getOrdersCollection();
    const latest = await orders.findOne({}, { sort: { invId: -1 } });
    const highest = latest?.invId ?? 0;
    const counters = await this.getCountersCollection();

    await counters.updateOne(
      { _id: "robokassa_invoice" },
      [{ $set: { sequence: { $max: [{ $ifNull: ["$sequence", 0] }, highest] } } }],
      { upsert: true },
    );
  }

  private async nextInvoiceId() {
    await this.ensureInvoiceCounter();

    const counters = await this.getCountersCollection();
    const counter = await counters.findOneAndUpdate(
      { _id: "robokassa_invoice" },
      { $inc: { sequence: 1 } },
      { returnDocument: "after", upsert: true },
    );

    if (!counter) {
      throw new Error("Failed to allocate invoice id.");
    }

    return counter.sequence;
  }

  private normalizeOrder(order: PaymentOrderDocument): PaymentOrderDocument {
    return {
      ...order,
      discountAmount: order.discountAmount ?? "0.00",
      originalAmount: order.originalAmount ?? order.amount,
      promoCode: order.promoCode ?? null,
      promoCodeId: order.promoCodeId ?? null,
      promoRedeemedAt: order.promoRedeemedAt ?? null,
    };
  }

  async createOrder(input: {
    amount: string;
    discountAmount: string;
    email: string | null;
    originalAmount: string;
    ownerId: string;
    promoCode: string | null;
    promoCodeId: string | null;
    siteId: string;
  }) {
    await this.ensureIndexes();
    const now = new Date().toISOString();
    const id = randomUUID();
    const order: PaymentOrderDocument = {
      ...input,
      _id: id,
      createdAt: now,
      id,
      invId: await this.nextInvoiceId(),
      paidAt: null,
      paymentMethod: null,
      promoRedeemedAt: null,
      status: "pending",
      updatedAt: now,
    };
    const orders = await this.getOrdersCollection();
    await orders.insertOne(order);
    return order;
  }

  async getOrderByInvoice(invId: number) {
    await this.ensureIndexes();
    const order = await this.getOrdersCollection().then((orders) => orders.findOne({ invId }));
    return order ? this.normalizeOrder(order) : null;
  }

  async getOrderById(id: string) {
    await this.ensureIndexes();
    const order = await this.getOrdersCollection().then((orders) => orders.findOne({ id }));
    return order ? this.normalizeOrder(order) : null;
  }

  async getOwnedOrder(id: string, ownerId: string) {
    await this.ensureIndexes();
    const order = await this.getOrdersCollection().then((orders) =>
      orders.findOne({ id, ownerId }),
    );
    return order ? this.normalizeOrder(order) : null;
  }

  async getLatestPendingOrderForSite(siteId: string) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const order = await orders.findOne({ siteId, status: "pending" }, { sort: { createdAt: -1 } });
    return order ? this.normalizeOrder(order) : null;
  }

  /**
   * Cancels pending orders one-by-one so only the winner of each
   * findOneAndUpdate may release the associated promo reservation.
   */
  async cancelPendingOrdersForSite(siteId: string) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const cancelled: PaymentOrderDocument[] = [];
    const now = new Date().toISOString();

    for (;;) {
      const previous = await orders.findOneAndUpdate(
        { siteId, status: "pending" },
        {
          $set: {
            status: "cancelled",
            updatedAt: now,
          },
        },
        { returnDocument: "before", sort: { createdAt: 1 } },
      );

      if (!previous) {
        break;
      }

      cancelled.push(this.normalizeOrder(previous));
    }

    return cancelled;
  }

  /** Заказы, ожидающие подтверждения от Robokassa, для фоновой сверки. */
  async listPendingOrders(limit: number) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const documents = await orders
      .find({ status: "pending" })
      .sort({ createdAt: 1 })
      .limit(limit)
      .toArray();

    return documents.map((document) => this.normalizeOrder(document));
  }

  async getPaidOrderForSite(siteId: string) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const order = await orders.findOne({ siteId, status: "paid" });

    return order ? this.normalizeOrder(order) : null;
  }

  /** Отменённый заказ, по которому всё-таки пришли деньги, возвращается в оборот. */
  async restoreCancelledToPending(id: string) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const updated = await orders.findOneAndUpdate(
      { id, status: "cancelled" },
      {
        $set: {
          status: "pending",
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );

    return updated ? this.normalizeOrder(updated) : null;
  }

  async cancelOrderIfPending(id: string) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const now = new Date().toISOString();
    const updated = await orders.findOneAndUpdate(
      { id, status: "pending" },
      {
        $set: {
          status: "cancelled",
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );

    return updated ? this.normalizeOrder(updated) : null;
  }

  /** Atomically cancels stale pending orders older than TTL. */
  async cancelExpiredPendingOrders(olderThanIso: string) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const cancelled: PaymentOrderDocument[] = [];
    const now = new Date().toISOString();

    for (;;) {
      const previous = await orders.findOneAndUpdate(
        {
          status: "pending",
          createdAt: { $lt: olderThanIso },
        },
        {
          $set: {
            status: "cancelled",
            updatedAt: now,
          },
        },
        { returnDocument: "before", sort: { createdAt: 1 } },
      );

      if (!previous) {
        break;
      }

      cancelled.push(this.normalizeOrder(previous));
    }

    return cancelled;
  }

  async markPaidIfPending(invId: number, paymentMethod: string | null) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const now = new Date().toISOString();
    const updated = await orders.findOneAndUpdate(
      { invId, status: "pending" },
      {
        $set: {
          paidAt: now,
          paymentMethod,
          status: "paid",
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );
    return updated ? this.normalizeOrder(updated) : null;
  }

  async markPromoRedeemed(orderId: string) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const now = new Date().toISOString();
    return orders.findOneAndUpdate(
      { id: orderId, promoRedeemedAt: null, status: "paid" },
      {
        $set: {
          promoRedeemedAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );
  }

  async markPaid(invId: number, paymentMethod: string | null) {
    return this.markPaidIfPending(invId, paymentMethod);
  }
}
