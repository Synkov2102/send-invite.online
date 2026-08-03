import { Injectable } from "@nestjs/common";
import type { SitePricing } from "@invite/shared";
import { MongoDbService } from "../database/mongodb.service";

export type { SitePricing };

type SitePricingDocument = SitePricing & { _id: string; updatedAt: string };

/** Single-document collection: one active pricing record for the whole site. */
const SITE_PRICING_DOC_ID = "current";

@Injectable()
export class SitePricingStore {
  constructor(private readonly mongoDb: MongoDbService) {}

  private async getCollection() {
    const db = await this.mongoDb.getDb();
    return db.collection<SitePricingDocument>("site_pricing");
  }

  async get(): Promise<SitePricing | null> {
    const collection = await this.getCollection();
    const document = await collection.findOne({ _id: SITE_PRICING_DOC_ID });

    if (!document) {
      return null;
    }

    return {
      currentPriceRub: document.currentPriceRub,
      originalPriceRub: document.originalPriceRub,
    };
  }
}
