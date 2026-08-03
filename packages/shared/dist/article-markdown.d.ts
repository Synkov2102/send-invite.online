import { type Article, type ArticleSpan } from "./schemas/article.schema";
/** Latin kebab-case id for anchors and slugs. */
export declare function slugifyArticleText(value: string): string;
/** Only bold and links — everything else stays literal text. */
export declare function parseArticleSpans(text: string): ArticleSpan[];
export type ParsedArticle = {
    article: Article;
    ok: true;
} | {
    error: string;
    ok: false;
};
/**
 * Parse an authored markdown file into the validated document stored in MongoDB.
 * `updatedAt` defaults to publish time so `dateModified` and the sitemap stay honest.
 */
export declare function parseArticleDocument(source: string, options?: {
    now?: string;
}): ParsedArticle;
