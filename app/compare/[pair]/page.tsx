import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache, type ReactNode } from "react";
import { AiNote, Breadcrumbs, CatalogShell, GetCheckTag, JsonLd, ProductImage, RatingBadge } from "../../_catalog/ui";
import { cautionsOf, cleanCategory, comparePath, getProductPage, isIndexable, productPath, SITE, type Product, type ProductPage } from "@/lib/catalog";

export const revalidate = 3600;
export const generateStaticParams = async () => [];

type Params = Promise<{ pair: string }>;

const parse = (pair: string): [string, string] | null => {
  const m = /^(\d{8,14})-vs-(\d{8,14})$/.exec(pair);
  return m && m[1] !== m[2] ? [m[1], m[2]] : null;
};

const load = cache(async (pair: string): Promise<[ProductPage, ProductPage] | null> => {
  const ids = parse(pair);
  if (!ids) return null;
  const [a, b] = await Promise.all(ids.map(getProductPage));
  return a && b ? [a, b] : null;
});

const short = (p: Product) => (p.name.length > 40 ? `${p.name.slice(0, 38).trim()}…` : p.name);

/** Which one CheckTag rates higher, if the gap means anything. */
function winnerOf(a: Product, b: Product): Product | null {
  if (typeof a.rating !== "number" || typeof b.rating !== "number" || Math.abs(a.rating - b.rating) < 0.2) return null;
  return a.rating > b.rating ? a : b;
}

function verdictLine(a: Product, b: Product): string {
  const w = winnerOf(a, b);
  if (w) {
    const l = w === a ? b : a;
    return `CheckTag rates ${w.name} higher: ${w.rating!.toFixed(1)}/5 against ${l.rating!.toFixed(1)}/5.`;
  }
  if (typeof a.rating === "number" && typeof b.rating === "number") return `CheckTag rates them about the same (${a.rating.toFixed(1)} and ${b.rating.toFixed(1)} out of 5). The differences are in the details below.`;
  return "One of these hasn't been fully rated yet, so compare the ingredients below.";
}

const ingKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/\d+(\.\d+)?\s*%/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function overlap(a: Product, b: Product) {
  const names = (p: Product) => new Map((p.ingredientsDetailed || []).map((i) => [ingKey(i.name), i.name] as const).filter(([k]) => k));
  const A = names(a);
  const B = names(b);
  return {
    shared: [...A].filter(([k]) => B.has(k)).map(([, n]) => n),
    onlyA: [...A].filter(([k]) => !B.has(k)).map(([, n]) => n),
    onlyB: [...B].filter(([k]) => !A.has(k)).map(([, n]) => n),
    known: A.size > 0 && B.size > 0,
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { pair } = await params;
  const pages = await load(pair);
  if (!pages) return { title: "Comparison not found | CheckTag", robots: { index: false } };
  const [a, b] = pages.map((x) => x.product);
  const url = `${SITE}${comparePath(a.barcode, b.barcode)}`;
  const title = `${short(a)} vs ${short(b)}: which is better? | CheckTag`;
  const description = `${a.name} or ${b.name}? ${verdictLine(a, b)} Side-by-side ingredients, flagged additives and shopper reviews.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: isIndexable(a) && isIndexable(b) ? undefined : { index: false, follow: true },
    openGraph: { type: "website", url, title: `${short(a)} vs ${short(b)}`, description, siteName: "CheckTag", images: [{ url: `${SITE}/og/compare/${a.barcode}-vs-${b.barcode}`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: `${short(a)} vs ${short(b)}`, description, images: [`${SITE}/og/compare/${a.barcode}-vs-${b.barcode}`] },
  };
}

export default async function ComparePage({ params }: { params: Params }) {
  const { pair } = await params;
  const ids = parse(pair);
  if (!ids) notFound();
  const canonical = comparePath(ids[0], ids[1]);
  if (`/compare/${pair}` !== canonical) permanentRedirect(canonical);

  const pages = await load(pair);
  if (!pages) notFound();
  const [pa, pb] = pages;
  const a = pa.product;
  const b = pb.product;
  const winner = winnerOf(a, b);
  const ca = cautionsOf(a);
  const cb = cautionsOf(b);
  const ov = overlap(a, b);
  const category = cleanCategory(a.category) ?? cleanCategory(b.category);

  // Higher is better for ratings; fewer is better for flagged ingredients.
  const better = (x?: number | null, y?: number | null, lowerWins = false): [boolean, boolean] => {
    if (typeof x !== "number" || typeof y !== "number" || x === y) return [false, false];
    return lowerWins ? [x < y, y < x] : [x > y, y > x];
  };
  const shopper = (pg: ProductPage) => (pg.reviews.count && pg.reviews.average != null ? `★ ${pg.reviews.average.toFixed(1)} (${pg.reviews.count})` : "No reviews yet");
  const flagged = (list: ReturnType<typeof cautionsOf>, p: Product) => (p.ingredientsDetailed?.length ? String(list.length) : "Not analysed");

  const rows: { label: string; a: ReactNode; b: ReactNode; win?: [boolean, boolean] }[] = [
    { label: "CheckTag rating", a: <RatingBadge rating={a.rating} tone={a.verdictTone} size="sm" />, b: <RatingBadge rating={b.rating} tone={b.verdictTone} size="sm" />, win: better(a.rating, b.rating) },
    { label: "Shopper reviews", a: shopper(pa), b: shopper(pb), win: better(pa.reviews.count ? pa.reviews.average : null, pb.reviews.count ? pb.reviews.average : null) },
    { label: "Flagged ingredients", a: flagged(ca, a), b: flagged(cb, b), win: a.ingredientsDetailed?.length && b.ingredientsDetailed?.length ? better(ca.length, cb.length, true) : undefined },
    { label: "Ingredients listed", a: a.ingredientsDetailed?.length || "—", b: b.ingredientsDetailed?.length || "—" },
    { label: "Allergens", a: a.allergens?.join(", ") || "—", b: b.allergens?.join(", ") || "—" },
    { label: "Net quantity", a: a.netQuantity || "—", b: b.netQuantity || "—" },
    { label: "Safety note", a: a.safetyWarning ? "Yes" : "None", b: b.safetyWarning ? "Yes" : "None" },
  ];

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    ...(category ? [{ name: category.name, href: `/category/${category.slug}` }] : []),
    { name: `${short(a)} vs ${short(b)}` },
  ];

  const more = [...pa.similar.filter((s) => s.barcode !== b.barcode).map((s) => [a, s] as const), ...pb.similar.filter((s) => s.barcode !== a.barcode).map((s) => [b, s] as const)]
    .filter(([, s], i, all) => all.findIndex(([, t]) => t.barcode === s.barcode) === i)
    .slice(0, 6);

  return (
    <CatalogShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${a.name} vs ${b.name}`,
            itemListElement: [a, b].map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${SITE}${productPath(p)}` })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE}${c.href ?? canonical}` })),
          },
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-bold leading-tight md:text-4xl" style={{ textWrap: "balance" }}>
        {a.name} <span className="text-white/40">vs</span> {b.name}
      </h1>
      <p className="mt-3 max-w-3xl text-lg text-white/75">{verdictLine(a, b)}</p>

      {/* The two products */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:gap-6">
        {[a, b].map((p) => (
          <Link
            key={p.barcode}
            href={productPath(p)}
            className={`relative flex flex-col items-center rounded-3xl border p-4 text-center transition hover:bg-white/[0.05] md:p-6 ${winner === p ? "border-[#22AED1]/50 bg-[#22AED1]/[0.06]" : "border-white/10 bg-white/[0.03]"}`}
          >
            {winner === p && <span className="absolute -top-3 rounded-full bg-[#22AED1] px-3 py-0.5 text-xs font-semibold text-[#020817]">Rated higher</span>}
            <ProductImage src={p.imageUrl} alt={p.name} size={112} />
            {p.brand && <div className="mt-3 text-xs font-medium uppercase tracking-wider text-[#22AED1]">{p.brand}</div>}
            <div className="mt-1 line-clamp-2 font-semibold">{p.name}</div>
            <div className="mt-3">
              <RatingBadge rating={p.rating} verdict={p.verdict} tone={p.verdictTone} />
            </div>
          </Link>
        ))}
      </div>

      {/* Side by side */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Side by side</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <thead className="bg-white/[0.04] text-left text-white/60">
              <tr>
                <th className="w-[28%] px-3 py-3 font-medium sm:w-44 sm:px-4" />
                <th className="truncate px-3 py-3 font-medium sm:px-4">{short(a)}</th>
                <th className="truncate px-3 py-3 font-medium sm:px-4">{short(b)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="px-3 py-3 text-left font-normal text-white/50 sm:px-4">
                    {r.label}
                  </th>
                  {[r.a, r.b].map((v, i) => (
                    <td key={i} className={`break-words px-3 py-3 sm:px-4 ${r.win?.[i] ? "font-semibold text-[#22AED1]" : ""}`}>
                      {v}
                      {r.win?.[i] && <span className="ml-1.5 text-xs">✓</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Flagged ingredients */}
      {(ca.length > 0 || cb.length > 0) && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Ingredients worth a second look</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(
              [
                [a, ca],
                [b, cb],
              ] as const
            ).map(([p, list]) => (
              <div key={p.barcode} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="font-semibold">{short(p)}</div>
                {list.length ? (
                  <ul className="mt-3 space-y-2">
                    {list.map((i, k) => (
                      <li key={k} className="text-sm">
                        <span className="font-medium text-amber-200">{i.name}</span>
                        {i.impact && <span className="text-white/60"> — {i.impact}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-white/60">{p.ingredientsDetailed?.length ? "Nothing flagged." : "Ingredients not analysed yet."}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Overlap */}
      {ov.known && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">What&apos;s different inside</h2>
          <p className="mt-2 text-white/60">
            {ov.shared.length ? `They share ${ov.shared.length} ingredient${ov.shared.length === 1 ? "" : "s"}.` : "They don't share any ingredients."}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(
              [
                [`Only in ${short(a)}`, ov.onlyA],
                ["In both", ov.shared],
                [`Only in ${short(b)}`, ov.onlyB],
              ] as const
            ).map(([label, list]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-sm font-semibold text-white/80">{label}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{list.length ? list.join(", ") : "—"}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* More comparisons */}
      {more.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">More comparisons</h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {more.map(([x, s]) => (
              <li key={`${x.barcode}-${s.barcode}`}>
                <Link href={comparePath(x.barcode, s.barcode)} className="block truncate rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-[#22AED1]/40">
                  {short(x)} <span className="text-white/40">vs</span> {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <GetCheckTag />
      <AiNote />
    </CatalogShell>
  );
}
