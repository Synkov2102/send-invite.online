import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/templates", "/contacts", "/offer", "/payment-and-refund", "/privacy", "/invite/"],
        disallow: [
          "/api/",
          "/auth",
          "/dashboard",
          "/editor",
          "/payment/",
          "/downloads/",
        ],
      },
    ],
    host: brand.url,
    sitemap: `${brand.url}/sitemap.xml`,
  };
}
