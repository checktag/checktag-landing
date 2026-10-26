import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BadgeCheck, CalendarX, Clock, ShieldAlert, ShieldCheck, ShieldX, Siren } from "lucide-react";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/stores";
import { productPath } from "@/lib/links";
import { safeHttpUrl } from "@/lib/utils";
import checktagLogo from "/public/checktag-logo.svg";

// What a shopper sees after scanning a CheckTag code (checktag.io/v/<code>).
// Rendered on the server when the site key is set, otherwise in the browser
// (see ClientVerify), so it has no hooks and nothing server-only.

export type Result = "GENUINE" | "SUSPICIOUS" | "NON_CONSUMER" | "INVALID" | "EXPIRED" | "RECALL";

export interface VerifyResponse {
  result: Result;
  reason: string;
  message: string;
  product: { barcode: string; name: string; brand: string | null; imageUrl: string | null; category: string | null } | null;
  brand: { name: string; verified: true } | null;
  unit: { serial: string; lot: string | null; mfg: string | null; exp: string | null; firstScanAt: string | null; scans: number; countries: number } | null;
  recall: { id: string; kind: "recall" | "safety_notice" | "counterfeit_warning"; title: string; body: string; lots: string[]; brand: string | null; publishedAt: string | null } | null;
}

/** The shape of a CheckTag code: <kid>-<serial>-<signature>. */
export const CODE_RE = /^k[0-9a-z]{5}-[0-9a-z]{16}-[0-9a-z]{13}$/;

const day = (s: string | null | undefined) => (s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : null);

const RECALL_KIND: Record<string, string> = { recall: "Recall", safety_notice: "Safety notice", counterfeit_warning: "Counterfeit warning" };

/** Page frame: the CheckTag logo, the content, a short footer. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#020817] text-white">
      <div className="pointer-events-none fixed -top-40 right-0 h-[26rem] w-[26rem] rounded-full bg-[#14A6C9]/10 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-48 -left-40 h-[26rem] w-[26rem] rounded-full bg-[#103C8F]/20 blur-[130px]" />
      <header className="relative mx-auto flex max-w-lg items-center justify-between px-4 py-5">
        <Link href="/" aria-label="CheckTag home">
          <Image src={checktagLogo} alt="CheckTag" width={120} height={24} className="brightness-0 invert" priority />
        </Link>
        <span className="text-xs text-white/40">Code check</span>
      </header>
      <main className="relative mx-auto max-w-lg px-4 pb-16">{children}</main>
      <footer className="relative mx-auto max-w-lg px-4 pb-10 text-xs leading-relaxed text-white/35">
        To check a code, CheckTag uses only the country you&apos;re in, worked out from your connection. Your IP address isn&apos;t stored.{" "}
        <Link href="/privacy" className="text-white/50 underline-offset-2 hover:text-white hover:underline">
          Privacy policy
        </Link>
      </footer>
    </div>
  );
}

const STYLE: Record<Result, { ring: string; icon: string; Icon: typeof ShieldCheck }> = {
  GENUINE: { ring: "border-emerald-400/40 bg-emerald-400/[0.08]", icon: "bg-emerald-400 text-[#022c1c]", Icon: ShieldCheck },
  SUSPICIOUS: { ring: "border-amber-400/40 bg-amber-400/[0.08]", icon: "bg-amber-400 text-[#2b1a00]", Icon: ShieldAlert },
  NON_CONSUMER: { ring: "border-amber-400/30 bg-amber-400/[0.06]", icon: "bg-amber-300 text-[#2b1a00]", Icon: Clock },
  INVALID: { ring: "border-rose-400/40 bg-rose-500/[0.10]", icon: "bg-rose-500 text-white", Icon: ShieldX },
  EXPIRED: { ring: "border-orange-400/40 bg-orange-400/[0.08]", icon: "bg-orange-400 text-[#2b1100]", Icon: CalendarX },
  RECALL: { ring: "border-rose-400/50 bg-rose-500/[0.12]", icon: "bg-rose-500 text-white", Icon: Siren },
};

function titleOf(v: VerifyResponse): string {
  switch (v.result) {
    case "GENUINE":
      return "Genuine";
    case "SUSPICIOUS":
      return "Check this pack";
    case "NON_CONSUMER":
      return "Not released for sale yet";
    case "EXPIRED":
      return "Past its expiry date";
    case "RECALL":
      return RECALL_KIND[v.recall?.kind || "recall"] || "Recall";
    case "INVALID":
      return v.reason === "voided" ? "This code was cancelled" : "This code isn't genuine";
  }
}

/** The verdict for a code the server checked (anything but "not a CheckTag code"). */
export function VerdictView({ v, code }: { v: VerifyResponse; code: string }) {
  if (v.result === "INVALID" && v.reason === "not_a_code") return <NotRecognised />;
  const s = STYLE[v.result] || STYLE.INVALID;
  const p = v.product;
  const brand = v.brand?.name || v.recall?.brand || p?.brand || null;
  const image = safeHttpUrl(p?.imageUrl);
  // Anything but genuine (or a recall, which the brand itself published) is worth reporting.
  const reportable = v.result !== "GENUINE" && v.result !== "RECALL";
  const facts = [
    v.unit?.lot && ["Lot", v.unit.lot],
    day(v.unit?.mfg) && ["Made", day(v.unit?.mfg)],
    day(v.unit?.exp) && ["Expires", day(v.unit?.exp)],
    v.unit && ["Checked", `${v.unit.scans.toLocaleString("en-GB")} time${v.unit.scans === 1 ? "" : "s"}${v.unit.countries > 1 ? `, in ${v.unit.countries} countries` : ""}`],
    day(v.unit?.firstScanAt) && ["First checked", day(v.unit?.firstScanAt)],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="space-y-4">
      <section className={`rounded-3xl border p-6 ${s.ring}`} aria-live="polite">
        <div className="flex items-start gap-4">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${s.icon}`}>
            <s.Icon className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">{titleOf(v)}</h1>
            {v.result === "GENUINE" && brand && (
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-emerald-100/90">
                Checked by {brand}
                {v.brand?.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified brand
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-white/85">{v.message}</p>

        {v.result === "RECALL" && v.recall && (
          <div className="mt-4 rounded-2xl border border-rose-300/30 bg-[#020817]/40 p-4">
            {v.recall.title !== v.message && <p className="font-semibold">{v.recall.title}</p>}
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">{v.recall.body}</p>
            <p className="mt-3 text-sm text-rose-100">
              {v.recall.lots.length ? `Affected lots: ${v.recall.lots.join(", ")}.` : "Every pack of this product is affected."}
              {v.unit?.lot && v.recall.lots.length > 0 && ` This pack is lot ${v.unit.lot}.`}
            </p>
            {(v.recall.brand || day(v.recall.publishedAt)) && (
              <p className="mt-1 text-xs text-white/50">{[v.recall.brand && `From ${v.recall.brand}`, day(v.recall.publishedAt) && `published ${day(v.recall.publishedAt)}`].filter(Boolean).join(", ")}</p>
            )}
          </div>
        )}

        {reportable && (
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={`mailto:support@checktag.io?subject=${encodeURIComponent(`Report: ${titleOf(v)} (${code})`)}&body=${encodeURIComponent(
                `I checked this CheckTag code and got "${titleOf(v)}".\n\nCode: ${code}\nProduct: ${p?.name || "unknown"}\nWhere I bought it (shop, town):\nWhen:\n\nPlease attach photos of the pack and the receipt if you have them.`,
              )}`}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#020817] hover:bg-white/90"
            >
              Report it
            </a>
          </div>
        )}
      </section>

      {p && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white">
              {image ? (
                // Product photos come from many hosts, so a plain <img>.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={p.name} width={80} height={80} className="h-full w-full object-contain p-1.5" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-[#0A1628]">
                  <Image src="/icon-192.png" alt="" width={32} height={32} className="opacity-40" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              {p.brand && <p className="text-xs font-medium uppercase tracking-wider text-[#22AED1]">{p.brand}</p>}
              <p className="text-lg font-bold leading-snug [overflow-wrap:anywhere]">{p.name}</p>
              <p className="font-mono text-xs text-white/40">Barcode {p.barcode}</p>
            </div>
          </div>
          {facts.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-sm">
              {facts.map(([k, val]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs text-white/45">{k}</dt>
                  <dd className="text-white/85 [overflow-wrap:anywhere]">{val}</dd>
                </div>
              ))}
            </dl>
          )}
          <Link href={productPath(p)} className="mt-4 inline-block text-sm font-semibold text-[#22AED1] hover:text-white">
            See what&apos;s inside, ratings and reviews →
          </Link>
        </section>
      )}

      <GetTheApp />
    </div>
  );
}

/** Scanned something that isn't a CheckTag code: not alarming, just not ours. */
export function NotRecognised() {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-2xl font-bold tracking-tight">We don&apos;t recognise this code</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/70">
          This link isn&apos;t a complete CheckTag code. Check you scanned the whole QR code, or open the CheckTag app and scan the product&apos;s barcode instead.
        </p>
        <p className="mt-3 text-sm text-white/45">Not every product has a CheckTag code yet. That on its own doesn&apos;t mean anything is wrong.</p>
      </section>
      <GetTheApp />
    </div>
  );
}

/** The check itself failed (network, too many checks). Nothing was decided. */
export function CheckFailed({ busy }: { busy?: boolean }) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-2xl font-bold tracking-tight">We couldn&apos;t check this code just now</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/70">
          {busy ? "A lot of codes are being checked from your network right now." : "Something went wrong on our side."} Wait a minute, then try again.
        </p>
        <a href="" className="mt-5 inline-block rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#020817] hover:bg-white/90">
          Try again
        </a>
      </section>
      <GetTheApp />
    </div>
  );
}

/** Link previews and crawlers: say what the page is without counting a scan. */
export function OpenOnPhone() {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-2xl font-bold tracking-tight">Check this pack with CheckTag</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/70">Open this link on your phone to see whether the pack it came from is genuine.</p>
      </section>
      <GetTheApp />
    </div>
  );
}

function GetTheApp() {
  return (
    <section className="rounded-3xl border border-[#22AED1]/20 bg-gradient-to-br from-[#0C2E72]/50 to-[#14A6C9]/10 p-5">
      <p className="font-bold">Get the CheckTag app</p>
      <p className="mt-1 text-sm text-white/65">Scan any product&apos;s barcode to see what&apos;s inside, how it rates and what other shoppers say. Free.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={APP_STORE_URL} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#020817] hover:bg-white/90">
          App Store
        </a>
        <a href={PLAY_STORE_URL} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#020817] hover:bg-white/90">
          Google Play
        </a>
      </div>
    </section>
  );
}
