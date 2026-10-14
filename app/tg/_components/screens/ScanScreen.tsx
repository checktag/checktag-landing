"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Globe2, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, enc } from "../../_lib/api";
import { useApp } from "../../_lib/app";
import { ago, countryName, flagOf, fmtN, fmtUsd } from "../../_lib/format";
import { haptic, notify } from "../../_lib/telegram";
import type { Feed } from "../../_lib/types";
import { TopBar } from "../Shell";
import { Card, Empty, Pill, Segmented, Skel, Thumb, cx, ease, itemVariants, listVariants } from "../ui";

type Controls = { stop(): void };

export function ScanScreen({ visible }: { visible: boolean }) {
  return (
    <>
      <TopBar />
      <div className="mx-auto max-w-[540px] px-4 pb-10">
        <Scanner active={visible} />
        <LiveFeed active={visible} />
      </div>
    </>
  );
}

function Scanner({ active }: { active: boolean }) {
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
        if (!cancelled) setHint("Couldn’t open the camera — type the barcode number below.");
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
    const v = code.replace(/\s+/g, "");
    if (/^\d{8,14}$/.test(v)) {
      (document.activeElement as HTMLElement | null)?.blur();
      setCode("");
      open(v);
    } else {
      haptic("rigid");
      toast("Enter the 8–14 digit number under the barcode.");
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
          Barcode number
        </label>
        <input
          id="barcode"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="or type the barcode number"
          className="h-11 min-w-0 flex-1 rounded-[14px] border border-ct-border bg-ct-surface-alt px-4 text-[16px] text-ct-text outline-none placeholder:text-ct-text-3 focus:border-ct-accent"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          aria-label="Look up barcode"
          className="ct-grad grid h-11 w-12 place-items-center rounded-[14px] text-white"
        >
          <ArrowRight size={19} />
        </motion.button>
      </form>
    </Card>
  );
}

// ------------------------------------------------------------------ live feed

function LiveFeed({ active }: { active: boolean }) {
  const { me, push } = useApp();
  const [scope, setScope] = useState<"all" | "mine">("all");
  const [feed, setFeed] = useState<Feed | null>(null);
  const [failed, setFailed] = useState(false);
  const cc = me?.region?.country || null;
  const effective = cc ? scope : "all";

  useEffect(() => {
    if (!active) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      if (document.visibilityState === "hidden") {
        timer = setTimeout(load, 30000);
        return;
      }
      try {
        const d = await api<Feed>(`/api/feed?limit=12${effective === "mine" && cc ? `&country=${enc(cc)}` : ""}`, { anon: true });
        if (!stop) {
          setFeed(d);
          setFailed(false);
        }
      } catch {
        if (!stop) setFailed(true);
      }
      if (!stop) timer = setTimeout(load, 30000);
    };
    load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [active, effective, cc]);

  if (failed && !feed) return null;
  const s = feed?.last24h || {};
  return (
    <section className="mt-7" aria-labelledby="feed-title">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 id="feed-title" className="text-[17px] font-bold tracking-[-0.01em] text-ct-text">
          Live around the world
        </h2>
        {cc && (
          <Segmented
            layoutId="feed-scope"
            label="Show scans from"
            value={effective}
            onChange={(v) => {
              haptic();
              setFeed(null);
              setScope(v);
            }}
            options={[
              { value: "all", label: "All" },
              { value: "mine", label: "My country" },
            ]}
          />
        )}
      </div>
      <Card className="overflow-hidden">
        {!feed ? (
          <div className="space-y-4 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skel className="h-12 w-12 rounded-[12px]" />
                <div className="flex-1 space-y-2">
                  <Skel className="h-3.5 w-3/4" />
                  <Skel className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-ct-border px-4 py-3 text-[12.5px] text-ct-text-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ct-primary">
                <i className="ct-live inline-block h-2 w-2 rounded-full bg-ct-accent" aria-hidden />
                Last 24 h
              </span>
              <span>
                <b className="text-ct-text">{fmtN(s.scans)}</b> {Number(s.scans) === 1 ? "scan" : "scans"}
              </span>
              <span>
                <b className="text-ct-text">{fmtN(s.countries)}</b> {Number(s.countries) === 1 ? "country" : "countries"}
              </span>
              <span>
                <b className="text-ct-text">{fmtUsd(s.usdValue, s.pointsEarned)}</b> cash-back
              </span>
            </div>
            {feed.items.length === 0 ? (
              <Empty
                icon={<Globe2 size={20} />}
                text={effective === "mine" ? "No scans in your country this week yet. Be the first." : "No scans this week yet."}
              />
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.ul key={effective} variants={listVariants} initial="hidden" animate="show" className="divide-y divide-ct-border">
                  {feed.items.map((it) => {
                    const c = /^[A-Za-z]{2}$/.test(String(it.country || "")) ? String(it.country).toUpperCase() : "";
                    return (
                      <motion.li key={`${it.barcode}-${it.at}`} variants={itemVariants}>
                        <button
                          type="button"
                          onClick={() => push({ k: "product", barcode: it.barcode, lookup: true })}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-ct-surface-alt"
                        >
                          <Thumb src={it.imageUrl} size={46} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[14.5px] font-semibold text-ct-text">{it.name}</div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-ct-text-3">
                              <span>
                                {c ? `${flagOf(c)} ${countryName(c, it.countryName)}` : "Scanned"} · {ago(it.at)}
                              </span>
                              {it.earnedCashback && <Pill tone="soft">Earned cash-back</Pill>}
                            </div>
                          </div>
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </AnimatePresence>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
