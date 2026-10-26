import type { MetadataRoute } from "next";
import { SITE } from "@/lib/catalog";

export default function robots(): MetadataRoute.Robots {
  return {
    // /og/ stays crawlable: link-preview bots (X, Facebook…) honour robots.txt.
    // /v/ (CheckTag code checks): every visit counts as a scan of that pack.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/tg", "/v/"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
