import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";
import { publicSitemapRoutes } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicSitemapRoutes.map((route) => ({
    url: new URL(route.path, brand.url).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
