import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, CatalogShell, GetCheckTag, ProductTile } from "../_catalog/ui";
import { BARCODE_RE, getCategories, searchProducts, SITE } from "@/lib/catalog";

type Search = Promise<{ q?: string | string[] }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: "Browse products: ingredients, ratings and reviews | CheckTag",
    description: "Look up any product CheckTag has scanned: what's inside, how it rates, and what other shoppers say. Compare products side by side before you buy.",
    alternates: { canonical: `${SITE}/products` },
    // Search result pages are for people, not the index.
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Search }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw || "").trim().slice(0, 60);
  const [results, cats] = await Promise.all([q ? searchProducts(q) : Promise.resolve([]), getCategories()]);

  return (
    <CatalogShell>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Products" }]} />
      <h1 className="text-3xl font-bold md:text-4xl">Know what you&apos;re buying</h1>
      <p className="mt-3 max-w-2xl text-white/70">Search the products CheckTag shoppers have scanned, by name, brand or barcode.</p>

      <form action="/products" className="mt-6 flex max-w-xl gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Product name, brand or barcode
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="e.g. Indomie, Dettol, 5449000000996"
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/35 focus:border-[#22AED1]/60 focus:outline-none"
        />
        <button className="rounded-xl bg-[#22AED1] px-5 py-3 font-semibold text-[#020817] hover:bg-[#22AED1]/90">Search</button>
      </form>

      {q && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-white/50">
            {results.length ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : `Nothing found for “${q}”`}
          </h2>
          {results.length > 0 ? (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {results.map((p) => (
                <li key={p.barcode}>
                  <ProductTile p={{ ...p, rating: p.aiRating }} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 max-w-xl text-white/60">
              {BARCODE_RE.test(q) ? "No one has scanned this barcode yet." : "We haven't rated a product by that name yet."} Scan it with CheckTag and it&apos;ll be analysed in seconds.
            </p>
          )}
        </section>
      )}

      {cats.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Browse by category</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {cats.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-[#22AED1]/40">
                <span className="truncate">{c.name}</span>
                <span className="shrink-0 tabular-nums text-white/40">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <GetCheckTag />
    </CatalogShell>
  );
}
