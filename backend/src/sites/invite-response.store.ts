import { randomUUID } from "crypto";
import { Injectable } from "@nestjs/common";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";

export type InviteResponseAnswer = {
  question: string;
  questionIndex: number;
  values: string[];
};

export type InviteResponse = {
  answers: InviteResponseAnswer[];
  createdAt: string;
  guestName: string;
  id: string;
  responseKey: string;
  siteId: string;
  updatedAt: string;
};

type InviteResponseDocument = InviteResponse & {
  _id: string;
};

function toResponse(document: InviteResponseDocument): InviteResponse {
  return {
    answers: document.answers,
    createdAt: document.createdAt,
    guestName: document.guestName,
    id: document.id,
    responseKey: document.responseKey,
    siteId: document.siteId,
    updatedAt: document.updatedAt,
  };
}

@Injectable()
export class InviteResponseStore {
  private readonly ensureIndexes = lazyOnce(() => this.ensureResponseIndexes());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getCollection() {
    const db = await this.mongoDb.getDb();

    return db.collection<InviteResponseDocument>("invite_responses");
  }

  private async ensureResponseIndexes() {
    const collection = await this.getCollection();

    await collection.createIndex({ siteId: 1, responseKey: 1 }, { unique: true });
    await collection.createIndex({ siteId: 1, createdAt: -1 });
  }

  async upsertResponse(input: {
    answers: InviteResponseAnswer[];
    guestName: string;
    responseKey: string;
    siteId: string;
  }) {
    await this.ensureIndexes();

    const collection = await this.getCollection();
    const existing = await collection.findOne({
      responseKey: input.responseKey,
      siteId: input.siteId,
    });
    const now = new Date().toISOString();
    const response: InviteResponse = {
      ...input,
      createdAt: existing?.createdAt ?? now,
      id: existing?.id ?? randomUUID(),
      updatedAt: now,
    };

    await collection.updateOne(
      {
        responseKey: input.responseKey,
        siteId: input.siteId,
      },
      {
        $set: response,
        $setOnInsert: {
          _id: response.id,
        },
      },
      { upsert: true },
    );

    return response;
  }

  async listResponsesBySite(siteId: string) {
    await this.ensureIndexes();

    const collection = await this.getCollection();
    const responses = await collection.find({ siteId }).sort({ createdAt: -1 }).toArray();

    return responses.map(toResponse);
  }

  async countResponsesBySites(siteIds: string[]) {
    if (siteIds.length === 0) {
      return new Map<string, number>();
    }

    await this.ensureIndexes();

    const collection = await this.getCollection();
    const counts = await collection
      .aggregate<{ _id: string; count: number }>([
        { $match: { siteId: { $in: siteIds } } },
        { $group: { _id: "$siteId", count: { $sum: 1 } } },
      ])
      .toArray();

    return new Map(counts.map((item) => [item._id, item.count]));
  }
}
