import { z } from "zod";
import { ARTICLE_FIELD_LIMITS } from "../field-limits";
import { createTypeGuard } from "./zod-helpers";

const limits = ARTICLE_FIELD_LIMITS;

/** Internal ("/templates") or absolute http(s) link — keeps `javascript:`/`data:` out of hrefs. */
const articleHrefSchema = z
  .string()
  .min(1)
  .max(limits.href)
  .refine((value) => {
    if (value.startsWith("/")) {
      return !value.startsWith("//");
    }

    try {
      const { protocol } = new URL(value);

      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "Invalid link protocol." });

const localImageSchema = z.string().min(1).max(limits.imageSrc).startsWith("/images/");

export const articleSlugSchema = z
  .string()
  .min(3)
  .max(limits.slug)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase latin kebab-case.");

export const articleSpanSchema = z.object({
  bold: z.boolean().optional(),
  href: articleHrefSchema.optional(),
  text: z.string().min(1).max(limits.spanText),
});

const spansSchema = z.array(articleSpanSchema).min(1).max(limits.spansPerBlock);

export const articleBlockSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("paragraph"),
    spans: spansSchema,
  }),
  z.object({
    items: z.array(spansSchema).min(1).max(limits.listItemsMax),
    kind: z.literal("list"),
    ordered: z.boolean(),
  }),
  z.object({
    kind: z.literal("quote"),
    spans: spansSchema,
  }),
  z.object({
    alt: z.string().min(1).max(limits.imageAlt),
    caption: z.string().max(limits.imageCaption).optional(),
    kind: z.literal("image"),
    src: localImageSchema,
  }),
  z.object({
    href: articleHrefSchema,
    kind: z.literal("cta"),
    label: z.string().min(1).max(limits.ctaLabel),
    spans: spansSchema,
  }),
]);

export const articleSectionSchema = z.object({
  blocks: z.array(articleBlockSchema).min(1).max(limits.blocksPerSection),
  heading: z.string().min(1).max(limits.heading),
  id: z.string().min(1).max(limits.sectionId),
});

export const articleFaqItemSchema = z.object({
  answer: z.string().min(1).max(limits.faqAnswer),
  question: z.string().min(1).max(limits.faqQuestion),
});

export const articleCoverSchema = z.object({
  alt: z.string().min(1).max(limits.imageAlt),
  src: localImageSchema,
});

export const articleStatusSchema = z.enum(["draft", "published"]);

const isoDateSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid ISO date.",
});

export const articleSchema = z.object({
  cover: articleCoverSchema.nullable(),
  description: z.string().min(1).max(limits.description),
  excerpt: z.string().min(1).max(limits.excerpt),
  faq: z.array(articleFaqItemSchema).max(limits.faqMax),
  intro: z.array(articleBlockSchema).max(limits.introBlocks),
  publishedAt: isoDateSchema,
  readingMinutes: z.number().int().min(1).max(120),
  related: z.array(articleSlugSchema).max(limits.relatedMax),
  sections: z.array(articleSectionSchema).min(1).max(limits.sectionsMax),
  seoTitle: z.string().min(1).max(limits.seoTitle).nullable(),
  slug: articleSlugSchema,
  status: articleStatusSchema,
  tags: z.array(z.string().min(1).max(limits.tag)).max(limits.tagsMax),
  title: z.string().min(1).max(limits.title),
  updatedAt: isoDateSchema,
});

/** Listing payload — no body, so `/blog` stays light. */
export const articleSummarySchema = articleSchema.pick({
  cover: true,
  description: true,
  excerpt: true,
  publishedAt: true,
  readingMinutes: true,
  slug: true,
  tags: true,
  title: true,
  updatedAt: true,
});

export const articleSitemapEntrySchema = articleSchema.pick({
  publishedAt: true,
  slug: true,
  updatedAt: true,
});

export type ArticleSpan = z.infer<typeof articleSpanSchema>;
export type ArticleBlock = z.infer<typeof articleBlockSchema>;
export type ArticleSection = z.infer<typeof articleSectionSchema>;
export type ArticleFaqItem = z.infer<typeof articleFaqItemSchema>;
export type ArticleCover = z.infer<typeof articleCoverSchema>;
export type ArticleStatus = z.infer<typeof articleStatusSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ArticleSummary = z.infer<typeof articleSummarySchema>;
export type ArticleSitemapEntry = z.infer<typeof articleSitemapEntrySchema>;

export const isArticle = createTypeGuard(articleSchema);
export const isArticleSummary = createTypeGuard(articleSummarySchema);
export const isArticleSitemapEntry = createTypeGuard(articleSitemapEntrySchema);
