import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { AiNote, Breadcrumbs, CatalogShell, GetCheckTag, JsonLd, ProductImage, RatingBadge } from "../../../_catalog/ui";
import {
  cautionsOf,
  cleanCategory,
  comparePath,
  getProductPage,
  GREENBOOK_URL,
  gtinKey,
  isIndexable,
  nafdacNumber,
  plainText,
  productPath,
  SITE,
  slugify,
  toneClass,
  type Product,
} from "@/lib/catalog";

// Rendered on first visit, then served from cache and refreshed hourly.
export const revalidate = 3600;
export const generateStaticParams = async () => [];

type Params = Promise<{ barcode: string; slug?: string[] }>;

const load = cache((barcode: string) => getProductPage(barcode));

const titleOf = (p: Product) => `${p.name}${p.brand && !p.name.toLowerCase().includes(p.brand.toLowerCase()) ? ` by ${p.brand}` : ""}`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { barcode } = await params;
  const page = await load(barcode);
  if (!page) return { title: "Product not found | CheckTag", robots: { index: false } };
  const p = page.product;
  const url = `${SITE}${productPath(p)}`;
  const title = `${titleOf(p)}: ingredients, rating and reviews | CheckTag`;
  const description =
    plainText(p.aiOverview, 155) ||
    `What's inside ${p.name}${p.brand ? ` by ${p.brand}` : ""}: ingredients, CheckTag rating and shopper reviews. Scan before you buy.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: isIndexable(p) ? undefined : { index: false, follow: true },
    openGraph: { type: "website", url, title: titleOf(p), description, siteName: "CheckTag", images: [{ url: `${SITE}/og/product/${p.barcode}`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: titleOf(p), description, images: [`${SITE}/og/product/${p.barcode}`] },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { barcode, slug } = await params;
  const page = await load(barcode);
  if (!page) notFound();
  const { product: p, reviews, similar } = page;

  const canonical = productPath(p);
  if (slug?.length !== 1 || slug[0] !== slugify(p.name)) permanentRedirect(canonical);

  const category = cleanCategory(p.category);
  const cautions = cautionsOf(p);
  const nafdac = nafdacNumber(p);
  const verified = new Set(p.verifiedFields || []);
  const labelFacts: { label: string; value: string; verified?: boolean }[] = [
    p.netQuantity && { label: "Net quantity", value: p.netQuantity, verified: verified.has("netQuantity") },
    p.servingSize && { label: "Serving size", value: p.servingSize, verified: verified.has("servingSize") },
    p.allergens?.length && { label: "Allergens", value: p.allergens.join(", "), verified: verified.has("allergens") },
    p.certifications?.length && { label: "On the label", value: p.certifications.join(", "), verified: verified.has("certifications") },
    ...Object.entries(p.details || {}).map(([label, value]) => ({ label, value: String(value), verified: verified.has("extraFields") })),
  ].filter(Boolean) as { label: string; value: string; verified?: boolean }[];
  // Nutrients present get a row; the zeros share one line ("None: fat, protein…").
  const nutrients = Object.entries(p.nutrition || {}).filter(([k]) => k !== "basis");
  const isZero = (v: string | number) => /^0+(\.0+)?\s*[a-zµ]*$/i.test(String(v).trim());
  const nutrition = nutrients.filter(([, v]) => !isZero(v));
  const zeroNutrients = nutrients.filter(([, v]) => isZero(v)).map(([k]) => k.replace(/_/g, " "));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    ...(category ? [{ name: category.name, href: `/category/${category.slug}` }] : []),
    { name: p.name },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      ...(p.brand && { brand: { "@type": "Brand", name: p.brand } }),
      [gtinKey(p.barcode)]: p.barcode,
      sku: p.barcode,
      url: `${SITE}${canonical}`,
      ...(p.imageUrl && { image: [p.imageUrl] }),
      ...(category && { category: category.name }),
      ...(p.aiOverview && { description: plainText(p.aiOverview, 500) }),
      // Ratings in structured data come only from real shopper reviews, never the AI score.
      ...(reviews.count > 0 &&
        reviews.average != null && {
          aggregateRating: { "@type": "AggregateRating", ratingValue: reviews.average, reviewCount: reviews.count, bestRating: 5, worstRating: 1 },
          review: reviews.items
            .filter((r) => r.body)
            .map((r) => ({
              "@type": "Review",
              author: { "@type": "Person", name: r.author },
              datePublished: r.createdAt.slice(0, 10),
              reviewBody: r.body,
              reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            })),
        }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE}${c.href ?? canonical}` })),
    },
  ];

  return (
    <CatalogShell>
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={crumbs} />

      {/* Summary */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ProductImage src={p.imageUrl} alt={p.name} size={168} />
        <div className="min-w-0 flex-1">
          {p.brand && <div className="text-sm font-medium uppercase tracking-wider text-[#22AED1]">{p.brand}</div>}
          <h1 className="mt-1 text-3xl font-bold leading-tight md:text-4xl" style={{ textWrap: "balance" }}>
            {p.name}
          </h1>
          <div className="mt-1 font-mono text-sm text-white/40">Barcode {p.barcode}</div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <RatingBadge rating={p.rating} verdict={p.verdict} tone={p.verdictTone} size="lg" />
            {reviews.count > 0 && reviews.average != null && (
              <a href="#reviews" className="text-sm text-white/60 hover:text-white">
                ★ {reviews.average.toFixed(1)} from {reviews.count} shopper{reviews.count === 1 ? "" : "s"}
              </a>
            )}
          </div>
          {p.ratingSummary && <p className="mt-3 max-w-2xl text-white/70">{p.ratingSummary}</p>}
        </div>
      </header>

      {p.safetyWarning && (
        <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-100">
          <div className="text-sm font-semibold">Safety note</div>
          <p className="mt-1 text-sm leading-relaxed">{p.safetyWarning}</p>
        </div>
      )}

      {nafdac && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
          <div className="text-sm">
            <span className="font-semibold text-emerald-200">NAFDAC No. {nafdac}</span>
            <span className="text-white/60"> is printed on this product&apos;s label.</span>
          </div>
          <a href={GREENBOOK_URL} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-emerald-400/30 px-3 py-1.5 text-sm font-medium text-emerald-200 hover:bg-emerald-400/10">
            Check it on the NAFDAC Greenbook ↗
          </a>
        </div>
      )}

      {/* What CheckTag found */}
      {p.aiOverview && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">What&apos;s the verdict?</h2>
          <div className="mt-3 max-w-3xl space-y-3 leading-relaxed text-white/80">
            {p.aiOverview
              .split(/\n{2,}/)
              .map((para) => para.trim())
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para.replace(/[*_#`]/g, "")}</p>
              ))}
          </div>
        </section>
      )}

      {/* Ingredients / materials */}
      {!!p.ingredientsDetailed?.length && (
        <section className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold">{p.consumable ? "Ingredients" : "What it's made of"}</h2>
            <span className="text-sm text-white/50">
              {p.ingredientsDetailed.length} listed{cautions.length ? ` · ${cautions.length} flagged` : ""}
              {verified.has("ingredients") ? " · read from the label" : ""}
            </span>
          </div>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {p.ingredientsDetailed.map((ing, i) => (
              <li key={i} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{ing.name}</span>
                  {ing.verdict && <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${toneClass(ing.tone)}`}>{ing.verdict}</span>}
                </div>
                {ing.impact && <p className="mt-1 text-sm leading-relaxed text-white/60">{ing.impact}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Label facts + nutrition */}
      {(labelFacts.length > 0 || nutrients.length > 0) && (
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          {labelFacts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold">From the label</h2>
              <dl className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
                {labelFacts.map((f, i) => (
                  <div key={i} className="flex gap-4 px-4 py-3 text-sm">
                    <dt className="w-32 shrink-0 text-white/50">{f.label}</dt>
                    <dd className="min-w-0 flex-1">
                      {f.value}
                      {f.verified && <span className="ml-2 whitespace-nowrap text-xs text-emerald-300">✓ verified</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {nutrients.length > 0 && (
            <div>
              <h2 className="text-xl font-bold">Nutrition{p.nutrition?.basis ? <span className="ml-2 text-sm font-normal text-white/50">{String(p.nutrition.basis)}</span> : null}</h2>
              <table className="mt-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-sm">
                <tbody className="divide-y divide-white/10">
                  {nutrition.map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row" className="px-4 py-2.5 text-left font-normal capitalize text-white/60">
                        {k.replace(/_/g, " ")}
                      </th>
                      <td className="px-4 py-2.5 text-right tabular-nums">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {zeroNutrients.length > 0 && <p className="mt-3 text-sm text-white/50">None: {zeroNutrients.join(", ")}.</p>}
            </div>
          )}
        </section>
      )}

      {/* Reviews */}
      <section id="reviews" className="mt-10 scroll-mt-28">
        <h2 className="text-xl font-bold">What shoppers say</h2>
        {reviews.count === 0 ? (
          <p className="mt-3 text-white/60">No reviews yet. Scan it in the CheckTag app to leave the first one.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {reviews.items.map((r) => (
              <figure key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-amber-300" aria-label={`${r.rating} out of 5`}>
                    {"★".repeat(r.rating)}
                    <span className="text-white/20">{"★".repeat(5 - r.rating)}</span>
                  </span>
                  <span className="text-white/40">{new Date(r.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                </div>
                {r.body && <blockquote className="mt-2 leading-relaxed text-white/80">{r.body}</blockquote>}
                <figcaption className="mt-2 text-xs text-white/50">
                  {r.author}
                  {r.verifiedScan && " · scanned it"}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* Comparisons */}
      {similar.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Compare {p.name} with</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {similar.map((s) => (
              <li key={s.barcode} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <ProductImage src={s.imageUrl} alt={s.name} size={52} />
                <div className="min-w-0 flex-1">
                  <Link href={productPath(s)} className="block truncate font-medium hover:text-[#22AED1]">
                    {s.name}
                  </Link>
                  <div className="mt-1">
                    <RatingBadge rating={s.rating} verdict={s.verdict} size="sm" />
                  </div>
                </div>
                <Link href={comparePath(p.barcode, s.barcode)} className="shrink-0 rounded-lg border border-[#22AED1]/30 px-3 py-1.5 text-sm text-[#22AED1] hover:bg-[#22AED1]/10">
                  Compare
                </Link>
              </li>
            ))}
          </ul>
          {category && (
            <Link href={`/category/${category.slug}`} className="mt-4 inline-block text-sm text-white/60 hover:text-white">
              See all {category.name} →
            </Link>
          )}
        </section>
      )}

      <GetCheckTag barcode={p.barcode} />
      <AiNote />
    </CatalogShell>
  );
}
