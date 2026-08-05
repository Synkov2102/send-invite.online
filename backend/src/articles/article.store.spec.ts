import { Test } from "@nestjs/testing";
import type { Article } from "@invite/shared";
import { MongoDbService } from "../database/mongodb.service";
import {
  createMongoCollectionMock,
  createMongoDbServiceMock,
} from "../payments/test/mongo-collection.mock";
import { ArticleStore } from "./article.store";

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    cover: null,
    description: "Описание статьи.",
    excerpt: "Короткий анонс.",
    faq: [],
    intro: [{ kind: "paragraph", spans: [{ text: "Вступление." }] }],
    publishedAt: "2026-08-01T00:00:00.000Z",
    readingMinutes: 4,
    related: [],
    sections: [
      {
        blocks: [{ kind: "paragraph", spans: [{ text: "Текст." }] }],
        heading: "Раздел",
        id: "razdel",
      },
    ],
    seoTitle: null,
    slug: "kak-sdelat-sajt-priglashenie",
    status: "published",
    tags: ["приглашения"],
    title: "Как сделать сайт-приглашение",
    updatedAt: "2026-08-02T00:00:00.000Z",
    ...overrides,
  };
}

function createFindMock(documents: unknown[]) {
  return jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue(documents) });
}

async function createStore(collection: ReturnType<typeof createMongoCollectionMock>) {
  const module = await Test.createTestingModule({
    providers: [
      ArticleStore,
      { provide: MongoDbService, useValue: createMongoDbServiceMock(collection) },
    ],
  }).compile();

  return module.get(ArticleStore);
}

describe("ArticleStore", () => {
  it("returns only published articles, newest first", async () => {
    const find = createFindMock([makeArticle()]);
    const collection = createMongoCollectionMock({ find });
    const store = await createStore(collection);

    const articles = await store.listPublished();

    expect(find).toHaveBeenCalledWith(
      { status: "published" },
      expect.objectContaining({ sort: { publishedAt: -1 } }),
    );
    expect(articles).toHaveLength(1);
    expect(articles[0]).not.toHaveProperty("sections");
  });

  it("filters the listing by tag", async () => {
    const find = createFindMock([]);
    const collection = createMongoCollectionMock({ find });
    const store = await createStore(collection);

    await store.listPublished("rsvp");

    expect(find).toHaveBeenCalledWith(
      { status: "published", tags: "rsvp" },
      expect.anything(),
    );
  });

  it("creates the slug and status indexes once", async () => {
    const collection = createMongoCollectionMock({ find: createFindMock([]) });
    const store = await createStore(collection);

    await store.listPublished();
    await store.listPublished();

    expect(collection.createIndex).toHaveBeenCalledWith({ slug: 1 }, { unique: true });
    expect(collection.createIndex).toHaveBeenCalledTimes(3);
  });

  it("looks a single article up by slug and published status", async () => {
    const article = makeArticle();
    const collection = createMongoCollectionMock({
      findOne: jest.fn().mockResolvedValue(article),
    });
    const store = await createStore(collection);

    await expect(store.findPublished(article.slug)).resolves.toEqual(article);
    expect(collection.findOne).toHaveBeenCalledWith(
      { slug: article.slug, status: "published" },
      expect.anything(),
    );
  });

  it("rewrites stored s3 references into public image paths", async () => {
    const article = makeArticle({
      cover: { alt: "Обложка", src: "s3://invite-media/blog-images/cover-1.webp" },
      sections: [
        {
          blocks: [
            {
              alt: "Схема",
              kind: "image",
              src: "s3://invite-media/blog-images/inline-1.webp",
            },
          ],
          heading: "Раздел",
          id: "razdel",
        },
      ],
    });
    const collection = createMongoCollectionMock({
      findOne: jest.fn().mockResolvedValue(article),
    });
    const store = await createStore(collection);

    const found = await store.findPublished(article.slug);

    expect(found?.cover?.src).toBe("/api/blog-images/cover-1.webp");
    expect(found?.sections[0].blocks[0]).toMatchObject({
      src: "/api/blog-images/inline-1.webp",
    });
  });

  it("never returns the stored markdown source", async () => {
    const collection = createMongoCollectionMock({
      findOne: jest.fn().mockResolvedValue({ ...makeArticle(), source: "---\nslug: x\n---" }),
    });
    const store = await createStore(collection);

    const found = await store.findPublished("kak-sdelat-sajt-priglashenie");

    expect(found).not.toBeNull();
    expect(found).not.toHaveProperty("source");
    expect(collection.findOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ projection: { _id: 0, source: 0 } }),
    );
  });

  it("rejects a stored document that no longer matches the schema", async () => {
    const collection = createMongoCollectionMock({
      findOne: jest.fn().mockResolvedValue({ ...makeArticle(), sections: [] }),
    });
    const store = await createStore(collection);

    await expect(store.findPublished("kak-sdelat-sajt-priglashenie")).resolves.toBeNull();
  });
});
