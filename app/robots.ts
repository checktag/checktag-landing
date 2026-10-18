import type { MetadataRoute } from "next";
import { SITE } from "@/lib/catalog";

export default function robots(): MetadataRoute.Robots {
  return {
    // /og/ stays crawlable: link-preview bots (X, Facebook…) honour robots.txt.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/tg"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
