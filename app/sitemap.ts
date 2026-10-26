import type { MetadataRoute } from "next";
import { getAllProducts, getCategories, productPath, SITE } from "@/lib/catalog";

// Rebuilt hourly from the public catalogue (only products with a real analysis).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly") => ({ url: `${SITE}${path}`, priority, changeFrequency });
  return [
    page("/", 1, "weekly"),
    page("/products", 0.9, "daily"),
    page("/business", 0.6, "monthly"),
    page("/brand", 0.3, "monthly"),
    page("/privacy", 0.2, "monthly"),
    page("/terms-and-conditions", 0.2, "monthly"),
    page("/community-guidelines", 0.2, "monthly"),
    ...categories.filter((c) => c.count >= 3).map((c) => page(`/category/${c.slug}`, 0.7, "daily")),
    ...products.map((p) => ({
      url: `${SITE}${productPath(p)}`,
      ...(p.updatedAt && !Number.isNaN(Date.parse(p.updatedAt)) && { lastModified: new Date(p.updatedAt) }),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
