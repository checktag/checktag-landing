// Server-side data for checktag.io's public product, category and comparison
// pages. Reads the backend's read-only catalogue (never starts AI work), cached
// with ISR so pages are fast and crawlers don't hammer the API.

import { slugify } from "./links";

export { comparePath, productPath, SITE, slugify, TELEGRAM_BOT } from "./links";

export const API = process.env.NEXT_PUBLIC_API_URL || "https://api.checktag.io";

export type Tone = "good" | "warn" | "bad";

export interface IngredientDetail {
  name: string;
  impact?: string;
  verdict?: string;
  tone?: Tone;
}

export interface Product {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  category?: string;
  aiStatus: "pending" | "ready" | "failed" | "none";
  aiOverview?: string;
  safetyWarning?: string;
  rating?: number;
  aiRating?: number;
  communityRating?: number;
  reviewCount?: number;
  ratingSummary?: string;
  verdict?: string;
  verdictTone?: Tone;
  ingredients?: string[];
  ingredientsDetailed?: IngredientDetail[];
  description?: string;
  nutrition?: Record<string, string | number>;
  certifications?: string[];
  consumable: boolean;
  allergens?: string[];
  netQuantity?: string;
  servingSize?: string;
  details?: Record<string, string>;
  verifiedFields?: string[];
}

export interface CatalogItem {
  barcode: string;
  name: string;
  brand: string | null;
  category: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
  aiRating: number | null;
  updatedAt: string | null;
}

export interface Review {
  id: string;
  rating: number;
  body: string | null;
  author: string;
  createdAt: string;
  verifiedScan: boolean;
}

export interface Similar {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  rating?: number;
  verdict?: string;
  why: string;
}

// Server-only (never NEXT_PUBLIC_): lets the API tell these page renders apart
// from the public, so crawlers visiting many pages don't trip its rate limit.
const SITE_KEY = process.env.SITE_FETCH_KEY;

async function get<T>(path: string, revalidate = 3600): Promise<T | null> {
  try {
    const r = await fetch(`${API}${path}`, { next: { revalidate }, headers: SITE_KEY ? { "x-site-key": SITE_KEY } : undefined });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const BARCODE_RE = /^\d{8,14}$/;


/** A product page is worth indexing once it has a real analysis. */
export const isIndexable = (p: Product) => p.aiStatus === "ready" && !!p.aiOverview;

export async function getProduct(barcode: string): Promise<Product | null> {
  if (!BARCODE_RE.test(barcode)) return null;
  return (await get<{ product: Product }>(`/api/catalog/product/${barcode}`, 3600))?.product ?? null;
}

export interface ProductPage {
  product: Product;
  reviews: { count: number; average: number | null; items: Review[] };
  similar: Similar[];
}

/** Product, its most helpful reviews and similar products, in one call. */
export async function getProductPage(barcode: string): Promise<ProductPage | null> {
  if (!BARCODE_RE.test(barcode)) return null;
  const r = await get<Partial<ProductPage>>(`/api/catalog/product/${barcode}?full=1`, 3600);
  if (!r?.product) return null;
  return { product: r.product, reviews: r.reviews ?? { count: 0, average: null, items: [] }, similar: r.similar ?? [] };
}

export async function getCategories(): Promise<{ slug: string; name: string; count: number }[]> {
  return (await get<{ items: { slug: string; name: string; count: number }[] }>(`/api/catalog/categories`, 3600))?.items ?? [];
}

export async function getCategory(slug: string): Promise<CatalogItem[]> {
  return (await get<{ items: CatalogItem[] }>(`/api/catalog/categories/${encodeURIComponent(slug)}?limit=60`, 3600))?.items ?? [];
}

export async function searchProducts(q: string): Promise<CatalogItem[]> {
  if (q.trim().length < 2) return [];
  return (await get<{ items: CatalogItem[] }>(`/api/catalog/search?q=${encodeURIComponent(q.trim())}&limit=30`, 300))?.items ?? [];
}

/** Every listed product (for the sitemap), following the cursor. */
export async function getAllProducts(max = 45000): Promise<CatalogItem[]> {
  const out: CatalogItem[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 100 && out.length < max; i++) {
    const page: { items: CatalogItem[]; next: string | null } | null = await get(`/api/catalog/products?limit=1000${cursor ? `&cursor=${cursor}` : ""}`, 3600);
    if (!page?.items.length) break;
    out.push(...page.items);
    if (!page.next || page.items.length < 1000) break;
    cursor = page.next;
  }
  return out.slice(0, max);
}

export const toneClass = (t?: Tone) =>
  t === "good" ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/25" : t === "bad" ? "text-rose-300 bg-rose-400/10 border-rose-400/25" : t === "warn" ? "text-amber-300 bg-amber-400/10 border-amber-400/25" : "text-slate-300 bg-white/5 border-white/15";

export const cautionsOf = (p: Product) =>
  (p.ingredientsDetailed || []).filter((i) => i.tone === "warn" || i.tone === "bad" || /caution|avoid/i.test(i.verdict || ""));

/** Same rule as the API: last part of a category path; "None"/"Unknown" → none. */
export function cleanCategory(raw?: string | null): { name: string; slug: string } | null {
  const name = String(raw || "").replace(/^.*>/, "").trim();
  if (!name || /^(none|null|unknown|n\/a)$/i.test(name)) return null;
  const slug = slugify(name);
  return slug && slug !== "product" ? { name, slug } : null;
}

/** A NAFDAC registration number printed on the label (from approved label scans). */
export function nafdacNumber(p: Product): string | null {
  const texts = [...(p.certifications || []), ...Object.entries(p.details || {}).map(([k, v]) => `${k} ${v}`)];
  for (const t of texts) {
    if (!/nafdac/i.test(t)) continue;
    const m = /\b([A-Z]\d|\d{2})-\d{3,7}[A-Z]?\b/i.exec(t);
    if (m) return m[0].toUpperCase();
  }
  return null;
}

export const GREENBOOK_URL = "https://greenbook.nafdac.gov.ng/";

/** Lagos State Consumer Protection Agency's free line for fake / expired goods (launched Oct 2026). */
export const LASCOPA_LINE = "0800 0052 726";
export const LASCOPA_TEL = "08000052726";

/** schema.org GTIN property for a barcode of this length. */
export const gtinKey = (barcode: string) => (({ 8: "gtin8", 12: "gtin12", 13: "gtin13", 14: "gtin14" }) as Record<number, string>)[barcode.length] || "gtin";

export const plainText = (s?: string, max = 160) => {
  const t = String(s || "").replace(/[*_#>`]/g, "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : t;
};
