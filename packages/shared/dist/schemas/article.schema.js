"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArticleSitemapEntry = exports.isArticleSummary = exports.isArticle = exports.articleSitemapEntrySchema = exports.articleSummarySchema = exports.articleDocumentSchema = exports.articleSchema = exports.articleStatusSchema = exports.articleCoverSchema = exports.articleFaqItemSchema = exports.articleSectionSchema = exports.articleBlockSchema = exports.articleSpanSchema = exports.articleSlugSchema = exports.blogImagePathPattern = void 0;
const zod_1 = require("zod");
const field_limits_1 = require("../field-limits");
const zod_helpers_1 = require("./zod-helpers");
const limits = field_limits_1.ARTICLE_FIELD_LIMITS;
/** Internal ("/templates") or absolute http(s) link — keeps `javascript:`/`data:` out of hrefs. */
const articleHrefSchema = zod_1.z
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
    }
    catch {
        return false;
    }
}, { message: "Invalid link protocol." });
/** Public path the backend serves a stored blog image at, derived 1:1 from the S3 key. */
exports.blogImagePathPattern = /^\/api\/blog-images\/[a-z0-9-]+\.[a-z0-9]+$/;
/**
 * Two forms of the same picture: MongoDB keeps the `s3://bucket/blog-images/…` reference,
 * the API rewrites it to `/api/blog-images/…` before the frontend ever sees it.
 */
const articleImageSrcSchema = zod_1.z
    .string()
    .min(1)
    .max(limits.imageSrc)
    .refine((value) => value.startsWith("s3://") || exports.blogImagePathPattern.test(value), { message: "Image must be an s3:// reference or an /api/blog-images/ path." });
exports.articleSlugSchema = zod_1.z
    .string()
    .min(3)
    .max(limits.slug)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase latin kebab-case.");
exports.articleSpanSchema = zod_1.z.object({
    bold: zod_1.z.boolean().optional(),
    href: articleHrefSchema.optional(),
    text: zod_1.z.string().min(1).max(limits.spanText),
});
const spansSchema = zod_1.z.array(exports.articleSpanSchema).min(1).max(limits.spansPerBlock);
exports.articleBlockSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({
        kind: zod_1.z.literal("paragraph"),
        spans: spansSchema,
    }),
    zod_1.z.object({
        items: zod_1.z.array(spansSchema).min(1).max(limits.listItemsMax),
        kind: zod_1.z.literal("list"),
        ordered: zod_1.z.boolean(),
    }),
    zod_1.z.object({
        kind: zod_1.z.literal("quote"),
        spans: spansSchema,
    }),
    zod_1.z.object({
        alt: zod_1.z.string().min(1).max(limits.imageAlt),
        caption: zod_1.z.string().max(limits.imageCaption).optional(),
        kind: zod_1.z.literal("image"),
        src: articleImageSrcSchema,
    }),
    zod_1.z.object({
        href: articleHrefSchema,
        kind: zod_1.z.literal("cta"),
        label: zod_1.z.string().min(1).max(limits.ctaLabel),
        spans: spansSchema,
    }),
]);
exports.articleSectionSchema = zod_1.z.object({
    blocks: zod_1.z.array(exports.articleBlockSchema).min(1).max(limits.blocksPerSection),
    heading: zod_1.z.string().min(1).max(limits.heading),
    id: zod_1.z.string().min(1).max(limits.sectionId),
});
exports.articleFaqItemSchema = zod_1.z.object({
    answer: zod_1.z.string().min(1).max(limits.faqAnswer),
    question: zod_1.z.string().min(1).max(limits.faqQuestion),
});
exports.articleCoverSchema = zod_1.z.object({
    alt: zod_1.z.string().min(1).max(limits.imageAlt),
    src: articleImageSrcSchema,
});
exports.articleStatusSchema = zod_1.z.enum(["draft", "published"]);
const isoDateSchema = zod_1.z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid ISO date.",
});
exports.articleSchema = zod_1.z.object({
    cover: exports.articleCoverSchema.nullable(),
    description: zod_1.z.string().min(1).max(limits.description),
    excerpt: zod_1.z.string().min(1).max(limits.excerpt),
    faq: zod_1.z.array(exports.articleFaqItemSchema).max(limits.faqMax),
    intro: zod_1.z.array(exports.articleBlockSchema).max(limits.introBlocks),
    publishedAt: isoDateSchema,
    readingMinutes: zod_1.z.number().int().min(1).max(120),
    related: zod_1.z.array(exports.articleSlugSchema).max(limits.relatedMax),
    sections: zod_1.z.array(exports.articleSectionSchema).min(1).max(limits.sectionsMax),
    seoTitle: zod_1.z.string().min(1).max(limits.seoTitle).nullable(),
    slug: exports.articleSlugSchema,
    status: exports.articleStatusSchema,
    tags: zod_1.z.array(zod_1.z.string().min(1).max(limits.tag)).max(limits.tagsMax),
    title: zod_1.z.string().min(1).max(limits.title),
    updatedAt: isoDateSchema,
});
/**
 * What MongoDB actually stores. `source` is the markdown the article was published from —
 * it lives in the database, not in git, so an article can be pulled back out and re-edited.
 * The API never returns it.
 */
exports.articleDocumentSchema = exports.articleSchema.extend({
    source: zod_1.z.string().max(limits.source).nullable(),
});
/** Listing payload — no body, so `/blog` stays light. */
exports.articleSummarySchema = exports.articleSchema.pick({
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
exports.articleSitemapEntrySchema = exports.articleSchema.pick({
    publishedAt: true,
    slug: true,
    updatedAt: true,
});
exports.isArticle = (0, zod_helpers_1.createTypeGuard)(exports.articleSchema);
exports.isArticleSummary = (0, zod_helpers_1.createTypeGuard)(exports.articleSummarySchema);
exports.isArticleSitemapEntry = (0, zod_helpers_1.createTypeGuard)(exports.articleSitemapEntrySchema);
