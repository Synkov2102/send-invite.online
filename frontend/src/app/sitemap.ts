import type { MetadataRoute } from "next";
import { getArticleSitemapEntries } from "@/lib/articles";
import { brand } from "@/lib/brand";
import { publicSitemapRoutes } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticleSitemapEntries();

  return [
    ...publicSitemapRoutes.map((route) => ({
      url: new URL(route.path, brand.url).toString(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...articles.map((article) => ({
      url: new URL(`/blog/${article.slug}`, brand.url).toString(),
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
