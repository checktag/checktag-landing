import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { STORES } from "../tg/_lib/telegram";
import { productPath, TELEGRAM_BOT, toneClass, type Tone } from "@/lib/catalog";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");

/** Page frame shared by product, category, compare and browse pages. */
export function CatalogShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#020817] noise-bg text-white">
      <Navbar />
      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-28 md:pt-32">{children}</main>
      <Footer />
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/50">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>›</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-white">
                {it.name}
              </Link>
            ) : (
              <span className="text-white/80">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const verdictTone = (v?: string): Tone | undefined =>
  !v ? undefined : /excellent|good/i.test(v) ? "good" : /poor|bad|avoid/i.test(v) ? "bad" : "warn";

export function RatingBadge({ rating, verdict, tone, size = "md" }: { rating?: number | null; verdict?: string; tone?: Tone; size?: "sm" | "md" | "lg" }) {
  if (typeof rating !== "number") return <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60">Not rated yet</span>;
  const cls = toneClass(tone ?? verdictTone(verdict));
  const big = size === "lg";
  return (
    <span className={`inline-flex items-baseline gap-1.5 rounded-full border ${cls} ${big ? "px-4 py-2" : size === "sm" ? "px-2.5 py-0.5" : "px-3 py-1"}`}>
      <span className={`font-bold tabular-nums ${big ? "text-2xl" : "text-sm"}`}>{rating.toFixed(1)}</span>
      <span className={`opacity-70 ${big ? "text-sm" : "text-xs"}`}>/5</span>
      {verdict && <span className={`font-semibold ${big ? "text-sm" : "text-xs"}`}>· {verdict}</span>}
    </span>
  );
}

export function ProductImage({ src, alt, size }: { src?: string | null; alt: string; size: number }) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white" style={{ width: size, height: size }}>
      {src ? (
        // Product photos come from many hosts (Open Food Facts, Cloudinary…), so a plain <img>.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} width={size} height={size} loading="lazy" className="h-full w-full object-contain p-2" />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[#0A1628]">
          <Image src="/icon-192.png" alt="" width={size / 2.5} height={size / 2.5} className="opacity-40" />
        </div>
      )}
    </div>
  );
}

export function ProductTile({ p }: { p: { barcode: string; name: string; brand?: string | null; imageUrl?: string | null; rating?: number | null; verdict?: string } }) {
  return (
    <Link
      href={productPath(p)}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-[#22AED1]/40 hover:bg-white/[0.05]"
    >
      <ProductImage src={p.imageUrl} alt={p.name} size={64} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{p.name}</div>
        {p.brand && <div className="truncate text-sm text-white/50">{p.brand}</div>}
        <div className="mt-1.5">
          <RatingBadge rating={p.rating} verdict={p.verdict} size="sm" />
        </div>
      </div>
    </Link>
  );
}

/** "Check it yourself": app, Telegram and (if configured) WhatsApp. */
export function GetCheckTag({ barcode }: { barcode?: string }) {
  const tg = `https://t.me/${TELEGRAM_BOT}${barcode ? `?start=p_${barcode}` : ""}`;
  return (
    <section className="mt-12 rounded-3xl border border-[#22AED1]/20 bg-gradient-to-br from-[#0C2E72]/50 to-[#14A6C9]/10 p-6 md:p-8">
      <h2 className="text-xl font-bold md:text-2xl">Scan before you buy</h2>
      <p className="mt-2 max-w-xl text-white/70">
        CheckTag shows what&apos;s inside any product, how it rates, and what other shoppers say. Free on iPhone and Android, or right inside Telegram{WHATSAPP ? " and WhatsApp" : ""}.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={STORES.ios} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#020817] hover:bg-white/90">App Store</a>
        <a href={STORES.play} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#020817] hover:bg-white/90">Google Play</a>
        <a href={tg} className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/5">Telegram</a>
        {WHATSAPP && (
          <a href={`https://wa.me/${WHATSAPP}${barcode ? `?text=${barcode}` : ""}`} className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/5">
            WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}

export function AiNote() {
  return (
    <p className="mt-6 text-xs leading-relaxed text-white/45">
      Ratings and ingredient notes are generated by AI from the product&apos;s available data — a guide, not a diagnosis. Always check the product&apos;s own label, and
      follow your doctor or pharmacist for medicines.
    </p>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
