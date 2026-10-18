"use client";

import { motion } from "framer-motion";
import { Coins, Globe2, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api, enc } from "../../_lib/api";
import { useApp } from "../../_lib/app";
import { countryName, flagOf, fmtN, fmtUsd } from "../../_lib/format";
import type { GlobalStats, Similar } from "../../_lib/types";
import { Bar, Card, Pill, SectionTitle, Skel, Stars, Thumb, itemVariants, listVariants } from "../ui";

export function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-[14px] bg-ct-surface-alt px-3 py-3">
      <div className="text-[19px] font-extrabold tracking-tight text-ct-text tabular-nums">{n}</div>
      <div className="mt-0.5 text-[12px] leading-tight text-ct-text-3">{label}</div>
    </div>
  );
}

/** Anonymous, country-level stats for this product. */
export function GlobalSection({ barcode, onLoaded, bare }: { barcode: string; onLoaded?: () => void; bare?: boolean }) {
  const [d, setD] = useState<GlobalStats | null>(null);
  const [gone, setGone] = useState(false);
  const loaded = useRef(onLoaded);
  loaded.current = onLoaded;
  useEffect(() => {
    let stop = false;
    api<GlobalStats>(`/api/products/${enc(barcode)}/global`, { anon: true })
      .then((x) => {
        if (stop) return;
        setD(x);
        loaded.current?.();
      })
      .catch(() => !stop && setGone(true));
    return () => {
      stop = true;
    };
  }, [barcode]);
  if (gone) return null;

  const sc = d?.scans || {};
  const cb = d?.cashback || {};
  const pts = Number(cb.pointsEarned) || 0;
  const regs = (d?.topRegions || []).filter((r) => /^[A-Za-z]{2}$/.test(String(r.country || "")));
  const max = Math.max(1, ...regs.map((r) => Number(r.scans) || 0));
  // `bare`: inside the product screen's "Around the world" row, which supplies the frame and title.
  const Frame = bare ? "div" : Card;
  return (
    <Frame className={bare ? undefined : "p-4"}>
      {!bare && <SectionTitle title="Around the world" sub="Anonymous · country-level only" right={<Globe2 size={18} className="text-ct-text-3" />} />}
      {!d ? (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <Skel key={i} className="h-[62px] rounded-[14px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat n={fmtN(sc.total)} label={Number(sc.total) === 1 ? "scan worldwide" : "scans worldwide"} />
            <Stat n={fmtN(sc.last30Days)} label="last 30 days" />
            <Stat n={fmtN(sc.uniqueScanners)} label={Number(sc.uniqueScanners) === 1 ? "unique scanner" : "unique scanners"} />
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-[14px] border border-ct-border px-3.5 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ct-primary-soft text-ct-primary">
              <Coins size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-ct-text">Cash-back earned</div>
              <div className="text-[12.5px] text-ct-text-3">By everyone who scanned it</div>
            </div>
            <div className="text-right">
              <div className="text-[14px] font-bold text-ct-text tabular-nums">{fmtN(pts)} pts</div>
              <div className="text-[12px] text-ct-text-3">{fmtUsd(cb.usdValue, pts)}</div>
            </div>
          </div>
          {regs.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.07em] text-ct-text-3">Top regions</div>
              <div className="space-y-2.5">
                {regs.map((r) => {
                  const cc = r.country.toUpperCase();
                  const n = Number(r.scans) || 0;
                  return (
                    <div key={cc} className="flex items-center gap-2.5 text-[13.5px]">
                      <span aria-hidden>{flagOf(cc)}</span>
                      <span className="w-[34%] truncate text-ct-text">{countryName(cc, r.name)}</span>
                      <div className="flex-1">
                        <Bar frac={n / max} color="var(--ct-primary)" height={7} />
                      </div>
                      <span className="w-10 text-right font-semibold text-ct-text-2 tabular-nums">{fmtN(n)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <p className="mt-4 flex gap-2 text-[12px] leading-relaxed text-ct-text-3">
            <Lock size={13} className="mt-0.5 shrink-0" />
            Counts are anonymous. We only ever record a country — never who scanned or where exactly.
          </p>
        </>
      )}
    </Frame>
  );
}

export function SimilarSection({ barcode }: { barcode: string }) {
  const { hint, push, me } = useApp();
  const [d, setD] = useState<Similar | null>(null);
  const region = me?.region?.country;
  useEffect(() => {
    let stop = false;
    api<Similar>(`/api/products/${enc(barcode)}/similar${hint ? `?hint=${hint}` : ""}`)
      .then((x) => !stop && setD(x))
      .catch(() => {});
    return () => {
      stop = true;
    };
  }, [barcode, hint, region]);
  if (!d?.items.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ct-text">Similar products</h2>
        {d.category && <span className="text-[12.5px] text-ct-text-3">{d.category}</span>}
      </div>
      <motion.div variants={listVariants} initial="hidden" animate="show" className="ct-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {d.items.map((it) => (
          <motion.button
            key={it.barcode}
            variants={itemVariants}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => push({ k: "product", barcode: it.barcode, lookup: true })}
            className="ct-card w-[132px] shrink-0 p-2 text-left"
          >
            <div className="relative">
              <Thumb src={it.imageUrl} size={116} radius={12} className="!w-full bg-white" />
              {it.availableInRegion && (
                <span className="absolute left-1.5 top-1.5">
                  <Pill tone="alert">In your region</Pill>
                </span>
              )}
            </div>
            <div className="mt-2 line-clamp-2 text-[13.5px] font-semibold leading-snug text-ct-text">{it.name}</div>
            {typeof it.rating === "number" && (
              <div className="mt-1 flex items-center gap-1.5">
                <Stars value={it.rating} size={11} />
                <span className="text-[12px] font-bold text-ct-text-2">{it.rating.toFixed(1)}</span>
              </div>
            )}
            {it.availableInRegion && <div className="mt-1 text-[11.5px] leading-snug text-ct-text-3">{it.why}</div>}
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
