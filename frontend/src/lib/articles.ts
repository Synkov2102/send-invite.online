import "server-only";

import {
  isArticle,
  isArticleSitemapEntry,
  isArticleSummary,
  type Article,
  type ArticleSitemapEntry,
  type ArticleSummary,
} from "@invite/shared";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

export type { Article, ArticleSitemapEntry, ArticleSummary };

/** Articles change through the publish script, so ISR keeps pages fresh without a redeploy. */
const revalidateSeconds = 300;

async function fetchArticlesJson(path: string): Promise<unknown> {
  const response = await fetch(`${getServerApiBaseUrl()}/api/articles${path}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}`);
  }

  return response.json();
}

/** The listing and the sitemap are prerendered, so a backend outage must not fail the build. */
export async function getArticles(): Promise<ArticleSummary[]> {
  try {
    const data = await fetchArticlesJson("");
    const articles = (data as { articles?: unknown })?.articles;

    return Array.isArray(articles) ? articles.filter(isArticleSummary) : [];
  } catch {
    return [];
  }
}

/**
 * Only a real 404 returns null. A network blip or a 5xx must throw rather than degrade into
 * `notFound()` — a published article answering 404 gets dropped from the index.
 */
export async function getArticle(slug: string): Promise<Article | null> {
  const data = await fetchArticlesJson(`/${encodeURIComponent(slug)}`);

  if (data === null) {
    return null;
  }

  if (!isArticle(data)) {
    throw new Error(`Article "${slug}" does not match the schema.`);
  }

  return data;
}

export async function getArticleSitemapEntries(): Promise<ArticleSitemapEntry[]> {
  try {
    const data = await fetchArticlesJson("/sitemap");
    const entries = (data as { entries?: unknown })?.entries;

    return Array.isArray(entries) ? entries.filter(isArticleSitemapEntry) : [];
  } catch {
    return [];
  }
}

export function getRelatedArticles(article: Article, all: ArticleSummary[]) {
  if (article.related.length === 0) {
    return [];
  }

  return article.related
    .filter((slug) => slug !== article.slug)
    .map((slug) => all.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is ArticleSummary => Boolean(candidate));
}

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
