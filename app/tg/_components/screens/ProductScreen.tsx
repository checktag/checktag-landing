"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Link2,
  Loader2,
  PartyPopper,
  ScanLine,
  Search,
  Share2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { api, ApiError, enc, errText } from "../../_lib/api";
import { useApp, type View } from "../../_lib/app";
import { nkey, ratingTier } from "../../_lib/format";
import { haptic, LINK_COPY, notify, shareToChat } from "../../_lib/telegram";
import { productPath, SITE } from "@/lib/links";
import type { IngredientDetail, Product, ScanResult } from "../../_lib/types";
import { ActionBar, TopBar } from "../Shell";
import { GlobalSection, SimilarSection } from "./ProductExtras";
import { ReviewsSection } from "./ReviewsSection";
import { Bar, Button, Card, Empty, Pill, RatingRing, Skel, Thumb, cx, ease, itemVariants, listVariants, spring } from "../ui";

export function ProductScreen({ barcode, lookup, view, visible }: { barcode: string; lookup?: boolean; view?: View; visible: boolean }) {
  const { popTo, push, toast } = useApp();
  const [data, setData] = useState<ScanResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const globalRef = useRef<HTMLDivElement>(null);
  const wantView = useRef<View | undefined>(view);

  // Load (a lookup for known products, else a real scan that may earn points).
  useEffect(() => {
    let stop = false;
    setData(null);
    setError(null);
    const scan = () =>
      api<ScanResult>("/api/scan", { method: "POST", json: { barcode }, timeout: 45000 }).then((d) => ({ ...d, fromScan: true }));
    (async () => {
      try {
        const d = lookup
          ? await api<ScanResult>(`/api/products/${enc(barcode)}`).catch((e) => {
              if (e instanceof ApiError && e.status === 404) return scan();
              throw e;
            })
          : await scan();
        if (stop) return;
        setData(d);
        if (d.fromScan && d.signedIn && d.rewardEligible) notify("success");
        if (wantView.current === "label") {
          wantView.current = undefined;
          push({ k: "label", barcode, name: d.product.name });
        }
      } catch (e) {
        if (!stop) setError(e);
      }
    })();
    return () => {
      stop = true;
    };
  }, [barcode, lookup, attempt, push]);

  // Keep polling while the AI analysis is still being written.
  const pending = data?.product.aiStatus === "pending";
  useEffect(() => {
    if (!pending) return;
    let n = 0;
    const t = setInterval(async () => {
      n++;
      try {
        const d = await api<{ product: Product }>(`/api/products/${enc(barcode)}`);
        const done = d.product.aiStatus !== "pending";
        if (!done && n >= 30) d.product.aiStatus = "stalled";
        setData((prev) => (prev ? { ...prev, product: d.product } : prev));
        if (done || n >= 30) clearInterval(t);
      } catch {
        if (n >= 30) clearInterval(t);
      }
    }, 2000);
    return () => clearInterval(t);
  }, [pending, barcode]);

  const scrollTo = useCallback((k: "reviews" | "cashback") => {
    if (wantView.current !== k) return;
    wantView.current = undefined;
    const el = k === "reviews" ? reviewsRef.current : globalRef.current;
    setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }, []);

  const p = data?.product;
  return (
    <>
      <TopBar title={p?.name || "Product"} />
      <div className="mx-auto max-w-[540px] px-4" style={{ paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))" }}>
        {error ? (
          <ErrorState error={error} barcode={barcode} onRetry={() => setAttempt((a) => a + 1)} />
        ) : !p ? (
          <ProductSkeleton />
        ) : (
          // One summary, the verdict, then everything else folded away until asked for.
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
            <motion.div variants={itemVariants}>
              <Summary p={p} d={data!} onLink={() => toast(LINK_COPY)} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Verdict p={p} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Details
                p={p}
                barcode={barcode}
                globalOpen={view === "cashback"}
                globalRef={globalRef}
                onGlobalLoaded={() => scrollTo("cashback")}
                onLabel={() => push({ k: "label", barcode, name: p.name })}
              />
            </motion.div>
            <div ref={reviewsRef} className="scroll-mt-20 pt-1">
              <ReviewsSection barcode={barcode} product={p} onLoaded={() => scrollTo("reviews")} />
            </div>
            <div className="pt-2">
              <SimilarSection barcode={barcode} />
            </div>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {visible && (
          <ActionBar>
            <div className="flex gap-2">
              <Button block size="lg" icon={<ScanLine size={18} />} onClick={() => (haptic(), popTo("scan"))}>
                Scan another
              </Button>
              {p && (
                <Button
                  size="lg"
                  variant="outline"
                  aria-label="Share this product"
                  icon={<Share2 size={18} />}
                  className="shrink-0 px-5"
                  onClick={() => {
                    haptic();
                    shareToChat(`${SITE}${productPath(p)}`, typeof p.rating === "number" ? `${p.name}: ${p.rating.toFixed(1)}/5 on CheckTag` : `${p.name} on CheckTag`);
                  }}
                >
                  Share
                </Button>
              )}
            </div>
          </ActionBar>
        )}
      </AnimatePresence>
    </>
  );
}

// ------------------------------------------------------------------ pieces

/** Photo, name and how it rates — the whole answer at a glance. */
function Summary({ p, d, onLink }: { p: Product; d: ScanResult; onLink: () => void }) {
  const rated = typeof p.rating === "number";
  const hasReviews = (p.reviewCount || 0) > 0 && typeof p.communityRating === "number";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <Thumb src={p.imageUrl} size={84} radius={18} className="bg-white" />
        <div className="min-w-0 flex-1">
          <h2 className="text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-ct-text [overflow-wrap:anywhere]">{p.name || "Unknown product"}</h2>
          {p.brand && <p className="mt-0.5 truncate text-[13.5px] text-ct-text-2">{p.brand}</p>}
          {rated && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* The server's verdict, so the app, website and bots all use the same word. */}
              <Pill tone="soft" className="px-2.5 py-1 text-[13px]">
                {p.verdict || ratingTier(p.rating!)}
              </Pill>
              {hasReviews && (
                <span className="text-[12.5px] font-semibold text-ct-text-3">
                  ★ {p.communityRating!.toFixed(1)} · {p.reviewCount} review{p.reviewCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
          )}
        </div>
        {rated && <RatingRing value={p.rating!} size={52} stroke={4.5} />}
      </div>
      {p.ratingSummary && <p className="mt-3 text-[13.5px] leading-snug text-ct-text-2">{p.ratingSummary}</p>}
      <Chips d={d} onLink={onLink} />
    </Card>
  );
}

function Chips({ d, onLink }: { d: ScanResult; onLink: () => void }) {
  const pending = d.product.aiStatus === "pending";
  const earned = d.fromScan && d.signedIn && d.rewardEligible;
  const guest = d.fromScan && !d.signedIn;
  if (!pending && !earned && !guest) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {earned && (
        <motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
          <Pill tone="soft" className="px-3 py-1.5 text-[12.5px]" icon={<PartyPopper size={14} />}>
            Points added
          </Pill>
        </motion.span>
      )}
      {guest && (
        <button type="button" onClick={onLink}>
          <Pill tone="muted" className="px-3 py-1.5 text-[12.5px]" icon={<Link2 size={14} />}>
            Link your account to earn points
          </Pill>
        </button>
      )}
      {pending && (
        <Pill tone="muted" className="px-3 py-1.5 text-[12.5px]" icon={<Loader2 size={13} className="ct-spin" />}>
          Analyzing ingredients…
        </Pill>
      )}
    </div>
  );
}

/** What CheckTag thinks, in plain words, plus any real safety warning. */
function Verdict({ p }: { p: Product }) {
  if (!p.aiOverview && !p.safetyWarning) {
    if (p.aiStatus !== "pending") return null;
    return (
      <Card className="space-y-2.5 p-4">
        <Skel className="h-3.5 w-11/12" />
        <Skel className="h-3.5 w-4/5" />
        <Skel className="h-3.5 w-2/3" />
      </Card>
    );
  }
  return (
    <Card className="space-y-3 p-4">
      {p.aiOverview && <p className="text-[15px] leading-relaxed text-ct-text">{p.aiOverview}</p>}
      {p.safetyWarning && (
        // Real safety warnings keep their warm signal colour.
        <div className="flex gap-2.5 rounded-[14px] bg-ct-warn-soft p-3.5">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-ct-warn" />
          <p className="text-[14px] leading-relaxed text-ct-text">{p.safetyWarning}</p>
        </div>
      )}
    </Card>
  );
}

// ------------------------------------------------------------------ details

const hasFacts = (p: Product) =>
  !!(p.netQuantity || p.servingSize || (p.details && Object.keys(p.details).length) || p.certifications?.length || (p.consumable !== false && p.allergens?.length));

/** One tap-to-open row. Closed rows cost nothing: content mounts on open. */
function Fold({ title, meta, open: initial = false, children }: { title: string; meta?: ReactNode; open?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initial);
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => (haptic(), setOpen((o) => !o))} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <span className="min-w-0 flex-1 text-[15px] font-semibold text-ct-text">{title}</span>
        {meta && <span className="shrink-0 text-[12.5px] font-medium text-ct-text-3">{meta}</span>}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-ct-text-3">
          <ChevronDown size={17} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Details({
  p,
  barcode,
  globalOpen,
  globalRef,
  onGlobalLoaded,
  onLabel,
}: {
  p: Product;
  barcode: string;
  globalOpen: boolean;
  globalRef: React.RefObject<HTMLDivElement | null>;
  onGlobalLoaded: () => void;
  onLabel: () => void;
}) {
  const ings = p.ingredientsDetailed?.length ? p.ingredientsDetailed : (p.ingredients || []).map(parseRaw);
  const flagged = ings.filter((i) => i.tone === "warn" || i.tone === "bad").length;
  const consumable = p.consumable !== false;
  const nutrition = consumable && p.nutrition && Object.keys(p.nutrition).length > 0;
  return (
    <Card className="divide-y divide-ct-border overflow-hidden">
      {ings.length > 0 && (
        <Fold title={consumable ? "Ingredients" : "Materials"} meta={`${ings.length}${flagged ? ` · ${flagged} flagged` : ""}`}>
          <IngredientsPanel p={p} />
          <AiNotice consumable={consumable} />
        </Fold>
      )}
      {nutrition && (
        <Fold title="Nutrition">
          <NutritionPanel p={p} />
          <AiNotice consumable />
        </Fold>
      )}
      {hasFacts(p) && (
        <Fold title="From the label" meta={p.verifiedFields?.length ? "✓ verified" : undefined}>
          <OverviewPanel p={p} />
          {!!p.certifications?.length && (
            <div className="mt-4">
              <SubHead title="Certifications" verified={p.verifiedFields?.includes("certifications")} />
              <CertPanel p={p} />
            </div>
          )}
        </Fold>
      )}
      <div ref={globalRef} className="scroll-mt-20">
        <Fold title="Around the world" meta="Scans & cash-back" open={globalOpen}>
          <GlobalSection barcode={barcode} onLoaded={onGlobalLoaded} bare />
        </Fold>
      </div>
      <button type="button" onClick={() => (haptic(), onLabel())} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <Camera size={17} className="shrink-0 text-ct-primary" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ct-text">Update from label</span>
          <span className="block text-[12.5px] text-ct-text-3">Photograph the label, earn points when it’s approved</span>
        </span>
        <ChevronRight size={17} className="text-ct-text-3" />
      </button>
    </Card>
  );
}

function VerifiedMark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-ct-accent-soft px-2.5 py-1 text-[11.5px] font-bold text-ct-good">
      <Check size={13} strokeWidth={2.8} />
      Verified from label
    </div>
  );
}

function OverviewPanel({ p }: { p: Product }) {
  const vf = p.verifiedFields || [];
  const rows: [string, string, boolean][] = [];
  if (p.netQuantity) rows.push(["Net quantity", p.netQuantity, vf.includes("netQuantity")]);
  if (p.servingSize) rows.push(["Serving size", p.servingSize, vf.includes("servingSize")]);
  for (const [k, v] of Object.entries(p.details || {})) if (v != null && String(v).trim()) rows.push([k, String(v), vf.includes("extraFields")]);
  return (
    <div className="space-y-4">
      {p.consumable !== false && !!p.allergens?.length && (
        <div>
          <SubHead title="Allergens" verified={vf.includes("allergens")} />
          <div className="flex flex-wrap gap-1.5">
            {p.allergens.map((a) => (
              <span key={a} className="rounded-full border border-ct-border-strong px-2.5 py-1 text-[12.5px] font-semibold text-ct-text">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
      {rows.length > 0 && (
        <div>
          <SubHead title="Label details" verified={rows.some((r) => r[2])} />
          <div className="divide-y divide-ct-border overflow-hidden rounded-[14px] border border-ct-border">
            {rows.map(([k, v, ver]) => (
              <div key={k} className="flex items-start justify-between gap-4 px-3.5 py-2.5 text-[14px]">
                <span className="inline-flex items-center gap-1 text-ct-text-2">
                  {k}
                  {ver && <Check size={12} strokeWidth={3} className="text-ct-good" aria-label="Verified from label" />}
                </span>
                <span className="text-right font-semibold text-ct-text">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubHead({ title, verified }: { title: string; verified?: boolean }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ct-text-3">{title}</span>
      {verified && (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ct-good">
          <Check size={12} strokeWidth={3} />
          Verified from label
        </span>
      )}
    </div>
  );
}

// Ingredients: the AI's verdict per item, shown in the brand palette.
type Verdict = { label: string; kind: "good" | "alert" } | null;

function verdictOf(it: IngredientDetail): Verdict {
  if (it.tone === "good") return { label: "Beneficial", kind: "good" };
  if (it.tone === "warn") return { label: "Caution", kind: "alert" };
  if (it.tone === "bad") return { label: "Avoid", kind: "alert" };
  return null;
}

function parseRaw(raw: string): IngredientDetail {
  const s = String(raw);
  let i = s.indexOf(" - Health Impact:");
  const key = i >= 0 ? " - Health Impact:".length : 3;
  if (i < 0) i = s.indexOf(" - ");
  return i >= 0 ? { name: s.slice(0, i).trim(), impact: s.slice(i + key).trim() } : { name: s.trim() };
}

function IngredientsPanel({ p }: { p: Product }) {
  const items: IngredientDetail[] = (p.ingredientsDetailed?.length ? p.ingredientsDetailed : (p.ingredients || []).map(parseRaw)).slice(0, 40);
  const [open, setOpen] = useState<Set<number>>(new Set());
  return (
    <div>
      <VerifiedMark show={!!p.verifiedFields?.includes("ingredients")} />
      {p.consumable !== false && !!p.allergens?.length && (
        <p className="mb-3 text-[13.5px] text-ct-text-2">
          <b className="text-ct-text">Allergens:</b> {p.allergens.join(", ")}
        </p>
      )}
      <ul>
        {items.map((it, i) => {
          const v = verdictOf(it);
          const isOpen = open.has(i);
          const dot = v?.kind === "good" ? "bg-ct-good" : v?.kind === "alert" ? "bg-ct-alert" : "bg-ct-border-strong";
          // Category in brackets, e.g. "Sugar (Sweetener)".
          const m = /\(([^)]+)\)\s*$/.exec(it.name);
          const name = m ? it.name.slice(0, m.index).trim() : it.name;
          return (
            <li key={i} className="relative pl-6">
              <span className="absolute bottom-0 left-[7px] top-0 w-px bg-ct-border" style={{ top: i === 0 ? 18 : 0, bottom: i === items.length - 1 ? "calc(100% - 18px)" : 0 }} />
              <span className={cx("absolute left-[3px] top-[13px] h-[9px] w-[9px] rounded-full ring-2 ring-ct-surface", dot)} />
              <button
                type="button"
                disabled={!it.impact}
                onClick={() => {
                  haptic();
                  setOpen((s) => {
                    const n = new Set(s);
                    if (n.has(i)) n.delete(i);
                    else n.add(i);
                    return n;
                  });
                }}
                className="flex w-full items-start gap-2 py-2 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold text-ct-text">{name}</span>
                  {m && <span className="block text-[12.5px] text-ct-text-3">{m[1]}</span>}
                </span>
                {v && (
                  <Pill tone={v.kind} icon={v.kind === "good" ? <Check size={11} strokeWidth={3} /> : <span className="font-black">!</span>}>
                    {v.label}
                  </Pill>
                )}
                {it.impact && (
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="mt-0.5 text-ct-text-3">
                    <ChevronDown size={16} />
                  </motion.span>
                )}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && it.impact && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease }}
                    className="overflow-hidden pb-2 pr-6 text-[13.5px] leading-relaxed text-ct-text-2"
                  >
                    {it.impact}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Nutrition: daily-value bars in one brand ramp, with "High" / "Good" labels.
type Kind = "neutral" | "good" | "limit";
const DV: Record<string, { label: string; dv: number; unit: string; kind: Kind; parent?: string }> = {
  calories: { label: "Calories", dv: 2000, unit: "kcal", kind: "neutral" },
  energy: { label: "Calories", dv: 2000, unit: "kcal", kind: "neutral" },
  totalfat: { label: "Total fat", dv: 78, unit: "g", kind: "neutral" },
  fat: { label: "Total fat", dv: 78, unit: "g", kind: "neutral" },
  saturatedfat: { label: "Saturated", dv: 20, unit: "g", kind: "limit", parent: "fat" },
  transfat: { label: "Trans", dv: 2, unit: "g", kind: "limit", parent: "fat" },
  totalcarbohydrate: { label: "Carbohydrate", dv: 275, unit: "g", kind: "neutral" },
  carbohydrates: { label: "Carbohydrate", dv: 275, unit: "g", kind: "neutral" },
  dietaryfiber: { label: "Fiber", dv: 28, unit: "g", kind: "good", parent: "carb" },
  fiber: { label: "Fiber", dv: 28, unit: "g", kind: "good", parent: "carb" },
  sugars: { label: "Sugars", dv: 50, unit: "g", kind: "limit", parent: "carb" },
  protein: { label: "Protein", dv: 50, unit: "g", kind: "good" },
  sodium: { label: "Sodium", dv: 2300, unit: "mg", kind: "limit" },
  cholesterol: { label: "Cholesterol", dv: 300, unit: "mg", kind: "limit" },
  vitamind: { label: "Vitamin D", dv: 20, unit: "mcg", kind: "good" },
  calcium: { label: "Calcium", dv: 1300, unit: "mg", kind: "good" },
  iron: { label: "Iron", dv: 18, unit: "mg", kind: "good" },
  potassium: { label: "Potassium", dv: 4700, unit: "mg", kind: "good" },
};
const ORDER = ["calories", "energy", "totalfat", "fat", "saturatedfat", "transfat", "totalcarbohydrate", "carbohydrates", "dietaryfiber", "fiber", "sugars", "protein", "sodium", "cholesterol", "vitamind", "calcium", "iron", "potassium"];
const norm = (k: string) => k.toLowerCase().replace(/[^a-z]/g, "");

function NutritionPanel({ p }: { p: Product }) {
  const entries = Object.entries(p.nutrition || {}).filter(([, v]) => v != null && String(v).trim() !== "");
  const known: { key: string; raw: string | number; info: (typeof DV)[string] }[] = [];
  const other: [string, string | number][] = [];
  for (const [k, v] of entries) {
    const info = DV[norm(k)];
    // Vitamins and minerals only show when there's an actual amount.
    const micro = ["vitamind", "calcium", "iron", "potassium"].includes(norm(k));
    if (info && micro && !(parseFloat(String(v)) > 0)) continue;
    if (info && !known.some((x) => x.info.label === info.label)) known.push({ key: norm(k), raw: v, info });
    else if (!info) other.push([k, v]);
  }
  known.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  return (
    <div>
      <VerifiedMark show={!!p.verifiedFields?.includes("nutrition")} />
      {p.servingSize && (
        <p className="mb-3 text-[13.5px] text-ct-text-2">
          <b className="text-ct-text">Per serving:</b> {p.servingSize}
        </p>
      )}
      <div>
        {known.map(({ key, raw, info }) => {
          const value = parseFloat(String(raw).replace(",", "."));
          const n = Number.isFinite(value) ? value : 0;
          const unitMatch = typeof raw === "string" ? /[a-zμµ]+\s*$/i.exec(raw) : null;
          const unit = unitMatch ? unitMatch[0].trim() : info.unit;
          const shown = Number.isFinite(value) ? (value % 1 === 0 ? String(value) : value.toFixed(1)) : String(raw);
          const pct = Math.round((n / info.dv) * 100);
          const good = info.kind === "good" && pct >= 10;
          const high = info.kind === "limit" && pct >= 20;
          const color = good ? "var(--ct-good)" : high ? "var(--ct-alert)" : "var(--ct-tone)";
          const child = !!info.parent;
          return (
            <div key={key} className={cx("flex items-center gap-3 py-2", child && "ml-3 border-l border-ct-border pl-3")}>
              <div className="flex min-w-0 flex-[5] items-center gap-1.5">
                <span className={cx("truncate text-[14px]", child ? "text-ct-text-2" : "font-semibold text-ct-text")}>{info.label}</span>
                {high && <Pill tone="alert">High</Pill>}
                {good && <Pill tone="good">Good</Pill>}
              </div>
              <div className="flex-[5]">
                <Bar frac={n / info.dv} color={color} />
              </div>
              <div className="w-[70px] text-right">
                <div className="text-[14px] font-bold text-ct-text tabular-nums">
                  {shown} {unit}
                </div>
                <div className={cx("text-[11.5px]", high || good ? "font-bold" : "text-ct-text-3")} style={high || good ? { color } : undefined}>
                  {pct}% DV
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {other.length > 0 && (
        <div className="mt-3 divide-y divide-ct-border overflow-hidden rounded-[14px] border border-ct-border">
          {other.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-3.5 py-2.5 text-[14px]">
              <span className="text-ct-text-2">{nkey(k)}</span>
              <span className="font-semibold text-ct-text">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CertPanel({ p }: { p: Product }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(p.certifications || []).map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-ct-primary-soft px-3 py-1.5 text-[13px] font-semibold text-ct-primary">
            <Check size={13} strokeWidth={2.6} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function AiNotice({ consumable }: { consumable: boolean }) {
  return (
    <div className="mt-3">
      <p className="text-[12px] leading-relaxed text-ct-text-3">
        {consumable
          ? "AI-generated from available data — a guide, not a diagnosis. Always check ingredients and allergens on the product’s own label."
          : "AI-generated from available data — a guide, not a guarantee. Always check the details on the product’s own label."}
      </p>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="space-y-4 pt-1">
      <div className="flex items-center gap-4">
        <Skel className="h-[92px] w-[92px] rounded-[20px]" />
        <div className="flex-1 space-y-2.5">
          <Skel className="h-5 w-4/5" />
          <Skel className="h-3.5 w-1/2" />
        </div>
      </div>
      <Skel className="h-[100px] rounded-[18px]" />
      <div className="flex gap-2">
        <Skel className="h-9 w-24 rounded-full" />
        <Skel className="h-9 w-28 rounded-full" />
      </div>
      <Skel className="h-[180px] rounded-[18px]" />
    </div>
  );
}

function ErrorState({ error, barcode, onRetry }: { error: unknown; barcode: string; onRetry: () => void }) {
  const nf = error instanceof ApiError && error.status === 404;
  return (
    <Card className="mt-2">
      <Empty
        icon={nf ? <Search size={20} /> : <AlertCircle size={20} />}
        title={nf ? "Product not found" : "Couldn’t load this product"}
        text={nf ? `We couldn’t find barcode ${barcode} yet. Check the number and try again, or scan another item.` : errText(error)}
        action={
          !nf && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )
        }
      />
    </Card>
  );
}
