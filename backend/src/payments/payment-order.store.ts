import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";

export type PaymentOrderStatus = "pending" | "paid";

export type PaymentOrder = {
  amount: string;
  createdAt: string;
  email: string | null;
  id: string;
  invId: number;
  ownerId: string;
  paidAt: string | null;
  paymentMethod: string | null;
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
  }

  private async nextInvoiceId() {
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

  async createOrder(input: {
    amount: string;
    email: string | null;
    ownerId: string;
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
      status: "pending",
      updatedAt: now,
    };
    const orders = await this.getOrdersCollection();
    await orders.insertOne(order);
    return order;
  }

  async getOrderByInvoice(invId: number) {
    await this.ensureIndexes();
    return this.getOrdersCollection().then((orders) => orders.findOne({ invId }));
  }

  async getOrderById(id: string) {
    await this.ensureIndexes();
    return this.getOrdersCollection().then((orders) => orders.findOne({ id }));
  }

  async getOwnedOrder(id: string, ownerId: string) {
    await this.ensureIndexes();
    return this.getOrdersCollection().then((orders) => orders.findOne({ id, ownerId }));
  }

  async getLatestPendingOrderForSite(siteId: string) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    return orders.findOne(
      { siteId, status: "pending" },
      { sort: { createdAt: -1 } },
    );
  }

  async markPaidIfPending(invId: number, paymentMethod: string | null) {
    await this.ensureIndexes();
    const orders = await this.getOrdersCollection();
    const now = new Date().toISOString();
    return orders.findOneAndUpdate(
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
  }

  async markPaid(invId: number, paymentMethod: string | null) {
    return this.markPaidIfPending(invId, paymentMethod);
  }
}
