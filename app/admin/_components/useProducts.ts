"use client";
import { useEffect, useState } from "react";
import { publicGet } from "@/lib/adminApi";

/** The public product shape (subset) from GET /api/products/:barcode. */
export interface PublicProduct {
  barcode: string;
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  ingredients?: string[];
  allergens?: string[];
  nutrition?: Record<string, unknown>;
  servingSize?: string | null;
  netQuantity?: string | null;
  certifications?: string[];
  details?: Record<string, unknown>;
  verifiedFields?: string[];
}

// Shared across tabs for the session: a product is fetched at most once.
const cache = new Map<string, Promise<PublicProduct | null>>();

function fetchProduct(barcode: string): Promise<PublicProduct | null> {
  let p = cache.get(barcode);
  if (!p) {
    p = publicGet<{ product: PublicProduct }>(
      `/api/products/${encodeURIComponent(barcode)}`,
    ).then((d) => d?.product ?? null);
    cache.set(barcode, p);
  }
  return p;
}

/**
 * Looks up public product info for a set of barcodes. Entries are `undefined`
 * while loading and `null` when the product couldn't be found.
 */
export function useProducts(barcodes: (string | null | undefined)[]) {
  const [products, setProducts] = useState<
    Record<string, PublicProduct | null>
  >({});
  const key = [...new Set(barcodes.filter(Boolean) as string[])]
    .sort()
    .join(",");

  useEffect(() => {
    if (!key) return;
    let alive = true;
    for (const code of key.split(",")) {
      fetchProduct(code).then((p) => {
        if (alive) setProducts((prev) => ({ ...prev, [code]: p }));
      });
    }
    return () => {
      alive = false;
    };
  }, [key]);

  return products;
}
