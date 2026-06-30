import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";
import type { CreateInviteSitePayload, PublishedInviteSite } from "@invite/shared";

const siteIdPattern = /^[a-z0-9-]{36}$/;

type InviteSiteDocument = PublishedInviteSite & {
  _id: string;
  isPublished?: boolean;
  ownerId?: string;
};

export type StoredInviteSite = PublishedInviteSite & {
  isPublished: boolean;
  ownerId: string | null;
};

function toSite(document: InviteSiteDocument): StoredInviteSite {
  return {
    createdAt: document.createdAt,
    id: document.id,
    invite: document.invite,
    isPublished: document.isPublished !== false,
    ownerId: document.ownerId ?? null,
    palette: document.palette,
    templateId: document.templateId,
    updatedAt: document.updatedAt,
  };
}

@Injectable()
export class InviteSiteStore {
  private readonly ensureIndexes = lazyOnce(() => this.ensureSiteIndexes());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getSitesCollection() {
    const db = await this.mongoDb.getDb();

    return db.collection<InviteSiteDocument>("sites");
  }

  private async ensureSiteIndexes() {
    const collection = await this.getSitesCollection();

    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ ownerId: 1, createdAt: -1 });
  }

  async saveInviteSite(payload: CreateInviteSitePayload, ownerId: string) {
    await this.ensureIndexes();

    const now = new Date().toISOString();
    const site: PublishedInviteSite = {
      ...payload,
      createdAt: now,
      id: randomUUID(),
      updatedAt: now,
    };
    const collection = await this.getSitesCollection();

    await collection.insertOne({
      ...site,
      _id: site.id,
      isPublished: true,
      ownerId,
    });

    return { ...site, isPublished: true, ownerId };
  }

  async getInviteSite(id: string) {
    if (!siteIdPattern.test(id)) {
      return null;
    }

    await this.ensureIndexes();

    const collection = await this.getSitesCollection();
    const site = await collection.findOne({ id });

    return site ? toSite(site) : null;
  }

  async listInviteSitesByOwner(ownerId: string) {
    await this.ensureIndexes();

    const collection = await this.getSitesCollection();
    const sites = await collection.find({ ownerId }).sort({ createdAt: -1 }).toArray();

    return sites.map(toSite);
  }

  async updateInviteSite(
    id: string,
    ownerId: string,
    payload: CreateInviteSitePayload,
  ) {
    await this.ensureIndexes();

    const collection = await this.getSitesCollection();
    const updatedAt = new Date().toISOString();
    const result = await collection.findOneAndUpdate(
      { id, ownerId },
      {
        $set: {
          ...payload,
          updatedAt,
        },
      },
      { returnDocument: "after" },
    );

    return result ? toSite(result) : null;
  }

  async setInviteSitePublished(id: string, ownerId: string, isPublished: boolean) {
    await this.ensureIndexes();

    const collection = await this.getSitesCollection();
    const result = await collection.findOneAndUpdate(
      { id, ownerId },
      {
        $set: {
          isPublished,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );

    return result ? toSite(result) : null;
  }
}
