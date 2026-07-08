import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";
import { publicSitemapRoutes } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicSitemapRoutes.map((route) => ({
    url: new URL(route.path, brand.url).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
