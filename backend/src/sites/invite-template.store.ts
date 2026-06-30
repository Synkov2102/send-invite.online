import { Injectable, type OnModuleInit } from "@nestjs/common";
import type { Collection } from "mongodb";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";
import {
  defaultInviteTemplates,
  getInviteTemplate,
  isInviteTemplate,
  type InviteTemplate,
} from "@invite/shared";

type InviteTemplateDocument = InviteTemplate & {
  _id: string;
  createdAt: string;
  sortOrder: number;
  updatedAt: string;
};

function toTemplate(document: InviteTemplateDocument): InviteTemplate {
  return {
    coverType: document.coverType,
    defaultPaletteId: document.defaultPaletteId,
    recommendedPaletteIds: document.recommendedPaletteIds,
    description: document.description,
    id: document.id,
    name: document.name,
    preview: document.preview,
    screenshot: document.screenshot,
    tags: document.tags,
  };
}

@Injectable()
export class InviteTemplateStore implements OnModuleInit {
  private readonly ensureDefaultTemplates = lazyOnce(() => this.seedDefaultTemplates());

  constructor(private readonly mongoDb: MongoDbService) {}

  async onModuleInit() {
    await this.ensureDefaultTemplates();
  }

  private async getTemplatesCollection(): Promise<Collection<InviteTemplateDocument>> {
    const db = await this.mongoDb.getDb();

    return db.collection<InviteTemplateDocument>("templates");
  }

  private async seedDefaultTemplates() {
    const collection = await this.getTemplatesCollection();
    const now = new Date().toISOString();

    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ sortOrder: 1 });

    await Promise.all(
      defaultInviteTemplates.map((template, index) =>
        collection.updateOne(
          { id: template.id },
          {
            $set: {
              coverType: template.coverType,
              defaultPaletteId: template.defaultPaletteId,
              recommendedPaletteIds: [...template.recommendedPaletteIds],
              description: template.description,
              name: template.name,
              preview: template.preview,
              screenshot: template.screenshot,
              tags: template.tags,
              sortOrder: index,
              updatedAt: now,
            },
            $setOnInsert: {
              _id: template.id,
              createdAt: now,
            },
          },
          { upsert: true },
        ),
      ),
    );

    await collection.deleteMany({
      id: { $nin: defaultInviteTemplates.map((template) => template.id) },
    });
  }

  async getInviteTemplateFromStore(id: string | null | undefined) {
    await this.ensureDefaultTemplates();

    if (!id) {
      return defaultInviteTemplates[0];
    }

    return (await this.findInviteTemplate(id)) ?? getInviteTemplate(id);
  }

  async findInviteTemplate(id: string) {
    await this.ensureDefaultTemplates();

    const collection = await this.getTemplatesCollection();
    const document = await collection.findOne({ id });

    if (document && isInviteTemplate(document)) {
      return toTemplate(document);
    }

    return defaultInviteTemplates.find((template) => template.id === id) ?? null;
  }
}
