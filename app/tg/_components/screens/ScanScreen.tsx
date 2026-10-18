"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ScanLine, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, enc } from "../../_lib/api";
import { useApp } from "../../_lib/app";
import { ago } from "../../_lib/format";
import { haptic, notify } from "../../_lib/telegram";
import type { Feed, HistoryItem } from "../../_lib/types";
import { TopBar } from "../Shell";
import { Card, Empty, Skel, Thumb, cx, ease, itemVariants, listVariants } from "../ui";

type Found = { barcode: string; name: string; brand: string | null; imageUrl: string | null; aiRating: number | null };

type Controls = { stop(): void };

// Home: scan (or type a barcode / name), then your recent scans. Everything
// else is one tap away in the menu.
export function ScanScreen({ visible }: { visible: boolean }) {
  const [query, setQuery] = useState("");
  return (
    <>
      <TopBar />
      <div className="mx-auto max-w-[540px] px-4 pb-10">
        <Scanner active={visible} onSearch={setQuery} />
        {query ? <Results q={query} onClear={() => setQuery("")} /> : <Recent active={visible} />}
      </div>
    </>
  );
}

function Scanner({ active, onSearch }: { active: boolean; onSearch: (q: string) => void }) {
  const { push, toast } = useApp();
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<Controls | null>(null);
  const [hint, setHint] = useState("Line up a product barcode inside the frame");
  const [live, setLive] = useState(false);
  const [code, setCode] = useState("");

  const open = useCallback(
    (barcode: string) => {
      controls.current?.stop();
      controls.current = null;
      push({ k: "product", barcode });
    },
    [push],
  );

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        if (cancelled || !video.current) return;
        const reader = new BrowserMultiFormatReader();
        const c = await reader.decodeFromVideoDevice(undefined, video.current, (res) => {
          const t = res?.getText();
          if (t && /^\d{8,14}$/.test(t)) {
            notify("success");
            open(t);
          }
        });
        if (cancelled) c.stop();
        else {
          controls.current = c;
          setLive(true);
          setHint("Line up a product barcode inside the frame");
        }
      } catch {
        if (!cancelled) setHint("Couldn’t open the camera. Type a barcode or product name below.");
      }
    })();
    return () => {
      cancelled = true;
      controls.current?.stop();
      controls.current = null;
      setLive(false);
    };
  }, [active, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = code.trim();
    const digits = v.replace(/\s+/g, "");
    if (/^\d{8,14}$/.test(digits)) {
      (document.activeElement as HTMLElement | null)?.blur();
      setCode("");
      open(digits);
    } else if (/^\d+$/.test(digits)) {
      haptic("rigid");
      toast("Enter the 8–14 digit number under the barcode.");
    } else if (v.length >= 2) {
      (document.activeElement as HTMLElement | null)?.blur();
      onSearch(v);
    }
  };

  return (
    <Card className="p-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      <div className="relative isolate aspect-[4/3] overflow-hidden rounded-[16px] bg-[#05080f]">
        <video ref={video} muted playsInline className="h-full w-full scale-[1.01] object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,transparent_42%,rgba(3,7,18,0.6)_80%)]" />
        <div className="pointer-events-none absolute left-[13%] right-[13%] top-[18%] bottom-[18%]">
          {(["left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-[14px]", "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-[14px]", "left-0 bottom-0 border-l-[3px] border-b-[3px] rounded-bl-[14px]", "right-0 bottom-0 border-r-[3px] border-b-[3px] rounded-br-[14px]"] as const).map((c) => (
            <span key={c} className={cx("absolute h-7 w-7 border-white/90", c)} />
          ))}
          {live && <div className="ct-laser absolute left-[6%] right-[6%] h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,#3bc6e6,transparent)]" />}
        </div>
        {!live && (
          <div className="absolute inset-0 grid place-items-center text-white/70">
            <ScanLine size={34} strokeWidth={1.6} />
          </div>
        )}
      </div>
      <p className="px-2 pb-1 pt-3 text-center text-[13.5px] text-ct-text-2">{hint}</p>
      <form onSubmit={submit} className="mt-2 flex gap-2">
        <label htmlFor="barcode" className="sr-only">
          Barcode number or product name
        </label>
        <input
          id="barcode"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          maxLength={60}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Barcode or product name"
          className="h-11 min-w-0 flex-1 rounded-[14px] border border-ct-border bg-ct-surface-alt px-4 text-[16px] text-ct-text outline-none placeholder:text-ct-text-3 focus:border-ct-accent"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          aria-label="Look up"
          className="ct-grad grid h-11 w-12 place-items-center rounded-[14px] text-white"
        >
          <ArrowRight size={19} />
        </motion.button>
      </form>
    </Card>
  );
}

// ------------------------------------------------------------------ search

function Results({ q, onClear }: { q: string; onClear: () => void }) {
  const { push } = useApp();
  const [items, setItems] = useState<Found[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let stop = false;
    setItems(null);
    setFailed(false);
    api<{ items: Found[] }>(`/api/catalog/search?q=${enc(q)}&limit=20`, { anon: true }).then(
      (d) => !stop && setItems(d.items || []),
      () => !stop && setFailed(true),
    );
    return () => {
      stop = true;
    };
  }, [q]);
  return (
    <section className="mt-6" aria-labelledby="results-title">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 id="results-title" className="truncate text-[17px] font-bold tracking-[-0.01em] text-ct-text">
          Results for “{q}”
        </h2>
        <button type="button" onClick={() => (haptic(), onClear())} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-ct-primary">
          <X size={14} />
          Clear
        </button>
      </div>
      <Card className="overflow-hidden">
        {failed ? (
          <Empty icon={<Search size={20} />} text="Search isn’t available right now. Scan the barcode instead." />
        ) : !items ? (
          <Rows />
        ) : !items.length ? (
          <Empty icon={<Search size={20} />} title="Nothing yet" text="We haven’t rated a product by that name. Scan its barcode and we’ll analyse it in seconds." />
        ) : (
          <List
            items={items.map((it) => ({
              barcode: it.barcode,
              name: it.name,
              imageUrl: it.imageUrl,
              sub: [it.brand, typeof it.aiRating === "number" ? `${it.aiRating.toFixed(1)} ★` : null].filter(Boolean).join(" · "),
            }))}
            onOpen={(b) => push({ k: "product", barcode: b, lookup: true })}
          />
        )}
      </Card>
    </section>
  );
}

// ------------------------------------------------------------------ recent

/** Your last few scans; before you've scanned anything, what others just scanned. */
function Recent({ active }: { active: boolean }) {
  const { me, push } = useApp();
  const [rows, setRows] = useState<{ title: string; mine: boolean; items: { barcode: string; name: string; imageUrl?: string | null; sub: string }[] } | null>(null);
  const signedIn = !!me?.signedIn;

  useEffect(() => {
    if (!active) return;
    let stop = false;
    (async () => {
      if (signedIn) {
        const h = await api<{ items: HistoryItem[] }>("/api/me/history").catch(() => null);
        if (stop) return;
        if (h?.items.length) {
          setRows({
            title: "Your recent scans",
            mine: true,
            items: h.items.slice(0, 4).map((it) => ({
              barcode: it.barcode,
              name: it.name,
              imageUrl: it.imageUrl,
              sub: [it.verdict, typeof it.rating === "number" ? `${it.rating.toFixed(1)} ★` : null].filter(Boolean).join(" · ") || ago(it.scannedAt),
            })),
          });
          return;
        }
      }
      const f = await api<Feed>("/api/feed?limit=5", { anon: true }).catch(() => null);
      if (stop) return;
      setRows(
        f?.items.length
          ? { title: "Just scanned", mine: false, items: f.items.slice(0, 5).map((it) => ({ barcode: it.barcode, name: it.name, imageUrl: it.imageUrl, sub: `Scanned ${ago(it.at)}` })) }
          : { title: "", mine: false, items: [] },
      );
    })();
    return () => {
      stop = true;
    };
  }, [active, signedIn]);

  if (rows && !rows.items.length) return null;
  return (
    <section className="mt-6" aria-labelledby="recent-title">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 id="recent-title" className="text-[17px] font-bold tracking-[-0.01em] text-ct-text">
          {rows?.title || "Recent"}
        </h2>
        {rows?.mine && (
          <button type="button" onClick={() => (haptic(), push({ k: "history" }))} className="text-[13px] font-semibold text-ct-primary">
            See all
          </button>
        )}
      </div>
      <Card className="overflow-hidden">{!rows ? <Rows /> : <List items={rows.items} onOpen={(b) => push({ k: "product", barcode: b, lookup: true })} />}</Card>
    </section>
  );
}

function List({ items, onOpen }: { items: { barcode: string; name: string; imageUrl?: string | null; sub: string }[]; onOpen: (barcode: string) => void }) {
  return (
    <motion.ul variants={listVariants} initial="hidden" animate="show" className="divide-y divide-ct-border">
      {items.map((it, i) => (
        <motion.li key={`${it.barcode}-${i}`} variants={itemVariants}>
          <button type="button" onClick={() => onOpen(it.barcode)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-ct-surface-alt">
            <Thumb src={it.imageUrl} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-semibold text-ct-text">{it.name}</span>
              {it.sub && <span className="mt-0.5 block truncate text-[12.5px] text-ct-text-3">{it.sub}</span>}
            </span>
          </button>
        </motion.li>
      ))}
    </motion.ul>
  );
}

function Rows() {
  return (
    <div className="space-y-4 p-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skel className="h-11 w-11 rounded-[12px]" />
          <div className="flex-1 space-y-2">
            <Skel className="h-3.5 w-3/4" />
            <Skel className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
