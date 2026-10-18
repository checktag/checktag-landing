import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AiNote, Breadcrumbs, CatalogShell, GetCheckTag, JsonLd, ProductTile } from "../../_catalog/ui";
import { comparePath, getCategories, getCategory, productPath, SITE } from "@/lib/catalog";

export const revalidate = 3600;
export const generateStaticParams = async () => [];

type Params = Promise<{ slug: string }>;

const load = cache(async (slug: string) => {
  const [items, cats] = await Promise.all([getCategory(slug), getCategories()]);
  const name = cats.find((c) => c.slug === slug)?.name ?? items[0]?.category ?? null;
  return { items, name, cats };
});

// A hub with only a product or two is thin; keep it out of search until it grows.
const MIN_INDEXED = 3;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { items, name } = await load(slug);
  if (!items.length || !name) return { title: "Category not found | CheckTag", robots: { index: false } };
  const url = `${SITE}/category/${slug}`;
  const title = `Best ${name}: ingredients and ratings compared | CheckTag`;
  const description = `${items.length} ${name.toLowerCase()} products rated by CheckTag, best first. See what's inside each one and compare them side by side before you buy.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: items.length >= MIN_INDEXED ? undefined : { index: false, follow: true },
    openGraph: { type: "website", url, title: `Best ${name}`, description, siteName: "CheckTag" },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { items, name, cats } = await load(slug);
  if (!items.length || !name) notFound();

  const rated = items.filter((i) => typeof i.aiRating === "number");
  const avg = rated.length ? rated.reduce((s, i) => s + (i.aiRating as number), 0) / rated.length : null;
  const top = items.slice(0, 4);
  const pairs = top.flatMap((x, i) => top.slice(i + 1).map((y) => [x, y] as const)).slice(0, 6);
  const others = cats.filter((c) => c.slug !== slug).slice(0, 12);

  return (
    <CatalogShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Best ${name}`,
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            itemListElement: items.slice(0, 30).map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${SITE}${productPath(p)}` })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "Products", item: `${SITE}/products` },
              { "@type": "ListItem", position: 3, name, item: `${SITE}/category/${slug}` },
            ],
          },
        ]}
      />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Products", href: "/products" }, { name }]} />

      <h1 className="text-3xl font-bold md:text-4xl">Best {name}</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        {items.length} product{items.length === 1 ? "" : "s"} scanned and rated by CheckTag
        {avg != null ? `, averaging ${avg.toFixed(1)} out of 5` : ""}. Highest rated first.
      </p>

      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {items.map((p) => (
          <li key={p.barcode}>
            <ProductTile p={{ ...p, rating: p.aiRating }} />
          </li>
        ))}
      </ul>

      {pairs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Popular comparisons</h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {pairs.map(([x, y]) => (
              <li key={`${x.barcode}-${y.barcode}`}>
                <Link href={comparePath(x.barcode, y.barcode)} className="block truncate rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-[#22AED1]/40">
                  {x.name} <span className="text-white/40">vs</span> {y.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">More categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:border-[#22AED1]/40 hover:text-white">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <GetCheckTag />
      <AiNote />
    </CatalogShell>
  );
}
