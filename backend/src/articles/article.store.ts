import { Injectable } from "@nestjs/common";
import type { Collection } from "mongodb";
import { lazyOnce } from "../database/lazy-once";
import { MongoDbService } from "../database/mongodb.service";
import {
  articleDocumentSchema,
  type ArticleDocument as StoredArticle,
  type Article,
  type ArticleSitemapEntry,
  type ArticleSummary,
} from "@invite/shared";
import { getPublicArticleImageUrl, withPublicArticleImages } from "./article-media";

type ArticleDocument = StoredArticle & { _id: string };

const summaryProjection = {
  _id: 0,
  cover: 1,
  description: 1,
  excerpt: 1,
  publishedAt: 1,
  readingMinutes: 1,
  slug: 1,
  tags: 1,
  title: 1,
  updatedAt: 1,
} as const;

function toSummary(document: ArticleDocument): ArticleSummary {
  return {
    cover: document.cover
      ? { ...document.cover, src: getPublicArticleImageUrl(document.cover.src) }
      : null,
    description: document.description,
    excerpt: document.excerpt,
    publishedAt: document.publishedAt,
    readingMinutes: document.readingMinutes,
    slug: document.slug,
    tags: document.tags,
    title: document.title,
    updatedAt: document.updatedAt,
  };
}

@Injectable()
export class ArticleStore {
  private readonly ensureIndexes = lazyOnce(() => this.createIndexes());

  constructor(private readonly mongoDb: MongoDbService) {}

  private async getCollection(): Promise<Collection<ArticleDocument>> {
    const db = await this.mongoDb.getDb();

    return db.collection<ArticleDocument>("articles");
  }

  private async createIndexes() {
    const collection = await this.getCollection();

    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ status: 1, publishedAt: -1 });
    await collection.createIndex({ status: 1, tags: 1 });
  }

  async listPublished(tag?: string): Promise<ArticleSummary[]> {
    await this.ensureIndexes();

    const collection = await this.getCollection();
    const documents = await collection
      .find(
        { status: "published", ...(tag ? { tags: tag } : {}) },
        { projection: summaryProjection, sort: { publishedAt: -1 } },
      )
      .toArray();

    return documents.map((document) => toSummary(document as ArticleDocument));
  }

  async findPublished(slug: string): Promise<Article | null> {
    await this.ensureIndexes();

    const collection = await this.getCollection();
    // `source` is authoring data — it stays in MongoDB and never reaches the API.
    const document = await collection.findOne(
      { slug, status: "published" },
      { projection: { _id: 0, source: 0 } },
    );

    if (!document) {
      return null;
    }

    const parsed = articleDocumentSchema.omit({ source: true }).safeParse(document);

    return parsed.success ? withPublicArticleImages(parsed.data) : null;
  }

  async listSitemapEntries(): Promise<ArticleSitemapEntry[]> {
    await this.ensureIndexes();

    const collection = await this.getCollection();
    const documents = await collection
      .find(
        { status: "published" },
        {
          projection: { _id: 0, publishedAt: 1, slug: 1, updatedAt: 1 },
          sort: { publishedAt: -1 },
        },
      )
      .toArray();

    return documents.map((document) => ({
      publishedAt: document.publishedAt,
      slug: document.slug,
      updatedAt: document.updatedAt,
    }));
  }
}
