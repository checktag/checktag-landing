"use client";
import { useEffect, useMemo, useState } from "react";
import { brandApi } from "@/lib/brandApi";
import { Button, Card } from "../../admin/_components/ui";
import { countryName, Loading, num, SectionHead, tone, Pill, usePortal } from "./shared";
import { PackagePlus, RefreshCw } from "lucide-react";

// Scans of the brand's products (plain barcode scans and CheckTag codes) for a
// chosen period, where they happened (country only), what shoppers saw, and the
// all-time counts for codes, alerts and recalls.

interface OverviewData {
  days: number;
  products: number;
  scans: number;
  people: number;
  series: { day: string; scans: number }[];
  countries: { country: string; scans: number }[];
  results: Record<string, number>;
  topProducts: { barcode: string; name: string | null; scans: number }[];
  reviews: { count: number; average: number | null };
  codesIssued: number;
  codesReleased: number;
  openAlerts: number;
  activeRecalls: number;
}

const PERIODS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
];

// What each scan result means, in the order shown.
const RESULTS: { key: string; label: string; cls: string }[] = [
  { key: "GENUINE", label: "No problem found", cls: tone.good },
  { key: "SUSPICIOUS", label: "Possible copied code", cls: tone.warn },
  { key: "RECALL", label: "Shown a recall or notice", cls: tone.bad },
  { key: "EXPIRED", label: "Batch past its expiry date", cls: tone.warn },
  { key: "NON_CONSUMER", label: "Code not released yet", cls: tone.muted },
  { key: "INVALID", label: "Invalid or cancelled code", cls: tone.bad },
];

export default function Overview() {
  const { notify, go, canEdit } = usePortal();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(d = days) {
    setLoading(true);
    try {
      setData(await brandApi<OverviewData>(`/brand/overview?days=${d}`));
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const resultTotal = data ? Object.values(data.results).reduce((a, b) => a + b, 0) : 0;
  const countryTotal = data ? data.countries.reduce((a, c) => a + c.scans, 0) : 0;
  const period = PERIODS.find((p) => p.days === days)?.label ?? `${days} days`;

  return (
    <div>
      <SectionHead
        title="Overview"
        actions={
          <>
            <div role="group" aria-label="Period" className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setDays(p.days)}
                  aria-pressed={days === p.days}
                  className={
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition " +
                    (days === p.days ? "bg-brand-cyan/15 text-brand-cyan-soft" : "text-slate-400 hover:text-slate-200")
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => load()}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </>
        }
      >
        Scans of your products in the last {period.toLowerCase()}, by country. CheckTag never shows you who scanned.
      </SectionHead>

      {loading && !data ? (
        <Loading />
      ) : !data ? null : (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          {data.products === 0 && (
            <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">No verified products yet</p>
                <p className="text-sm text-slate-400">Claim your products first. Once CheckTag approves a claim, its scans show up here.</p>
              </div>
              {canEdit && (
                <Button size="sm" onClick={() => go("claims")}>
                  <PackagePlus className="h-4 w-4" /> Claim products
                </Button>
              )}
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label={`Scans, ${period.toLowerCase()}`} value={num(data.scans)} />
            <Kpi label="Signed-in people who scanned" value={num(data.people)} />
            <Kpi label="Verified products" value={num(data.products)} onClick={() => go("products")} />
            <Kpi
              label="Reviews (average)"
              value={data.reviews.average != null ? `★ ${data.reviews.average.toFixed(1)}` : "—"}
              note={`${num(data.reviews.count)} review${data.reviews.count === 1 ? "" : "s"}`}
              onClick={() => go("reviews")}
            />
            <Kpi label="Codes made" value={num(data.codesIssued)} note="All time" onClick={() => go("codes")} />
            <Kpi label="Codes released for sale" value={num(data.codesReleased)} note="All time" onClick={() => go("codes")} />
            <Kpi label="Open clone alerts" value={num(data.openAlerts)} warn={data.openAlerts > 0} onClick={() => go("alerts")} />
            <Kpi label="Active recalls" value={num(data.activeRecalls)} warn={data.activeRecalls > 0} onClick={() => go("recalls")} />
          </div>

          <Card className="mt-6 p-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">Scans over time</h3>
              <span className="text-xs text-slate-500">{days === 365 ? "Per week" : "Per day"} · times in UTC</span>
            </div>
            <ScansChart series={data.series} days={days} />
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold">Countries</h3>
              <p className="mb-4 text-xs text-slate-500">Country only. CheckTag never records a precise location.</p>
              {data.countries.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No scans in this period.</p>
              ) : (
                <ul className="space-y-2.5">
                  {data.countries.map((c) => {
                    const share = countryTotal ? c.scans / countryTotal : 0;
                    return (
                      <li key={c.country} className="text-sm">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="min-w-0 truncate text-slate-200">
                            {countryName(c.country)}
                            {c.country !== "Unknown" && <span className="ml-1.5 text-xs text-slate-500">{c.country}</span>}
                          </span>
                          <span className="shrink-0 tabular-nums text-slate-300">
                            {num(c.scans)} <span className="text-xs text-slate-500">· {Math.round(share * 100)}%</span>
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-brand-accent" style={{ width: `${Math.max(2, share * 100)}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <div className="space-y-6">
              <Card className="p-5">
                <h3 className="mb-4 font-semibold">What shoppers saw</h3>
                {resultTotal === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">No scans in this period.</p>
                ) : (
                  <ul className="space-y-2">
                    {[...RESULTS, ...Object.keys(data.results).filter((k) => !RESULTS.some((r) => r.key === k)).map((k) => ({ key: k, label: k, cls: tone.muted }))]
                      .filter((r) => data.results[r.key])
                      .map((r) => (
                        <li key={r.key} className="flex items-center justify-between gap-3 text-sm">
                          <Pill cls={r.cls}>{r.label}</Pill>
                          <span className="tabular-nums text-slate-300">
                            {num(data.results[r.key])} <span className="text-xs text-slate-500">· {Math.round((data.results[r.key] / resultTotal) * 100)}%</span>
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-slate-500">Plain barcode scans count as &ldquo;No problem found&rdquo; unless a recall applies.</p>
              </Card>

              <Card className="p-5">
                <h3 className="mb-4 font-semibold">Most scanned products</h3>
                {data.topProducts.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">No scans in this period.</p>
                ) : (
                  <ol className="space-y-1">
                    {data.topProducts.map((p, i) => (
                      <li key={p.barcode}>
                        <button onClick={() => go("products", p.barcode)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-white/5">
                          <span className="w-5 shrink-0 text-xs tabular-nums text-slate-500">{i + 1}</span>
                          <span className="min-w-0 flex-1 truncate text-slate-200">{p.name || p.barcode}</span>
                          <span className="shrink-0 tabular-nums text-slate-300">{num(p.scans)}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, note, warn, onClick }: { label: string; value: string; note?: string; warn?: boolean; onClick?: () => void }) {
  const body = (
    <>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={"mt-1 text-2xl font-semibold tabular-nums " + (warn ? "text-amber-300" : "text-slate-50")}>{value}</p>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
    </>
  );
  const cls = "flex flex-col items-start justify-start rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left";
  return onClick ? (
    <button onClick={onClick} className={cls + " transition hover:border-brand-accent/30 hover:bg-white/[0.05]"}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// ------------------------------------------------------------------ chart

/** Rounds a maximum up to 1, 2 or 5 × 10ⁿ so the gridlines land on round numbers. */
function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

const fmtDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/**
 * One bar per day (per week for 12 months), with empty days filled in. Drawn
 * with HTML boxes rather than a scaled SVG so the labels stay readable on a phone.
 */
function ScansChart({ series, days }: { series: { day: string; scans: number }[]; days: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const bars = useMemo(() => {
    const byDay = new Map(series.map((s) => [s.day, s.scans]));
    const list: { from: string; to: string; scans: number }[] = [];
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const step = days === 365 ? 7 : 1;
    for (let i = days - 1; i >= 0; i -= step) {
      const from = new Date(today - i * 86400000).toISOString().slice(0, 10);
      let scans = 0;
      let to = from;
      for (let j = 0; j < step && i - j >= 0; j++) {
        to = new Date(today - (i - j) * 86400000).toISOString().slice(0, 10);
        scans += byDay.get(to) || 0;
      }
      list.push({ from, to, scans });
    }
    return list;
  }, [series, days]);

  const max = niceMax(Math.max(...bars.map((b) => b.scans), 0));
  const ticks = [max, max / 2, 0];
  const label = (b: (typeof bars)[number]) => (b.from === b.to ? fmtDay(b.from) : `${fmtDay(b.from)} – ${fmtDay(b.to)}`);
  const xLabels = [0, Math.floor(bars.length / 2), bars.length - 1];
  const h = hover != null ? bars[hover] : null;
  const center = (i: number) => ((i + 0.5) / bars.length) * 100;

  return (
    <div className="relative pl-9">
      <div className="relative h-44 sm:h-52" onMouseLeave={() => setHover(null)}>
        {/* Gridlines and their values */}
        {ticks.map((t) => (
          <div key={t} className="pointer-events-none absolute inset-x-0 border-t border-white/[0.07]" style={{ top: `${(1 - t / max) * 100}%` }}>
            <span className="absolute -left-9 w-7 -translate-y-1/2 text-right text-[11px] tabular-nums text-slate-500">{num(t)}</span>
          </div>
        ))}
        <div className={`absolute inset-0 flex items-end ${bars.length > 60 ? "gap-px" : "gap-[2px]"}`} role="img" aria-label="Scans over time">
          {bars.map((b, i) => (
            // The whole column is the hover target, so thin bars are easy to point at.
            <div key={b.from} className="flex h-full min-w-0 flex-1 items-end" onMouseEnter={() => setHover(i)}>
              {b.scans > 0 && (
                <div
                  className={`w-full rounded-t-[3px] transition-colors ${hover === i ? "bg-brand-sky" : "bg-brand-accent"}`}
                  style={{ height: `${Math.max((b.scans / max) * 100, 1)}%` }}
                />
              )}
            </div>
          ))}
        </div>
        {h && hover != null && (
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-white/10 bg-brand-raised px-2.5 py-1.5 text-xs shadow-xl"
            style={{ left: `${Math.min(85, Math.max(15, center(hover)))}%` }}
          >
            <span className="text-slate-400">{label(h)}</span> <span className="ml-1 font-semibold tabular-nums text-slate-100">{num(h.scans)} scan{h.scans === 1 ? "" : "s"}</span>
          </div>
        )}
      </div>
      <div className="relative mt-2 h-4 text-[11px] text-slate-500">
        {xLabels.map((i, k) => (
          <span
            key={k}
            className={`absolute whitespace-nowrap ${k === 0 ? "" : k === 2 ? "-translate-x-full" : "-translate-x-1/2"}`}
            style={{ left: k === 0 ? 0 : k === 2 ? "100%" : `${center(i)}%` }}
          >
            {fmtDay(bars[i].from)}
          </span>
        ))}
      </div>
      {/* The same numbers for screen readers. */}
      <table className="sr-only">
        <caption>Scans per {days === 365 ? "week" : "day"}</caption>
        <tbody>
          {bars.map((b) => (
            <tr key={b.from}>
              <th scope="row">{label(b)}</th>
              <td>{b.scans}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
