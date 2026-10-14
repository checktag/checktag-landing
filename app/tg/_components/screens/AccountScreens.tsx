"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  AlertCircle,
  Ban,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  FileText,
  Globe2,
  Link2,
  Mail,
  MessageCircle,
  Palette,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { api, ApiError, errText } from "../../_lib/api";
import { useApp } from "../../_lib/app";
import { countryList, fmtN, fmtUsd, monthAbbr, monthLong, plural } from "../../_lib/format";
import { closeApp, haptic, LINK_COPY, openLink, STORES, SUPPORT } from "../../_lib/telegram";
import type { Cashback, HistoryItem, Region } from "../../_lib/types";
import { TopBar } from "../Shell";
import { BlockedListBody } from "../sheets/ReviewSheets";
import { Bar, Button, Card, Empty, Overline, Pill, Segmented, SectionTitle, Skel, Thumb, cx, ease, itemVariants, listVariants } from "../ui";

function Row({
  icon,
  title,
  desc,
  right,
  onClick,
  danger,
}: {
  icon: ReactNode;
  title: string;
  desc?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  const body = (
    <>
      <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-[11px]", danger ? "bg-ct-danger-soft text-ct-danger" : "bg-ct-primary-soft text-ct-primary")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cx("block text-[15px] font-semibold", danger ? "text-ct-danger" : "text-ct-text")}>{title}</span>
        {desc && <span className="mt-0.5 block text-[13px] leading-snug text-ct-text-3">{desc}</span>}
      </span>
      {right ?? (onClick && <ChevronRight size={18} className="text-ct-text-3" />)}
    </>
  );
  return onClick ? (
    <button type="button" onClick={() => (haptic(), onClick())} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-ct-surface-alt">
      {body}
    </button>
  ) : (
    <div className="flex items-center gap-3 px-4 py-3.5">{body}</div>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <Card className="divide-y divide-ct-border overflow-hidden">{children}</Card>;
}

// ------------------------------------------------------------------ settings

export function SettingsScreen({ visible }: { visible: boolean }) {
  const { me, signedIn, loadMe, push, theme, setTheme, openSheet, toast } = useApp();
  useEffect(() => {
    if (visible) loadMe();
  }, [visible, loadMe]);
  const copySupport = () =>
    navigator.clipboard?.writeText(SUPPORT).then(
      () => toast(`${SUPPORT} copied`),
      () => toast(`Email us at ${SUPPORT}`),
    );
  return (
    <>
      <TopBar title="Settings" />
      <motion.div variants={listVariants} initial="hidden" animate="show" className="mx-auto max-w-[540px] px-4 pb-12">
        <motion.div variants={itemVariants}>
          <Overline>Account</Overline>
          <Group>
            <Row
              icon={<User size={18} />}
              title={!me ? "Account" : me.signedIn ? (me.name ? `Hi, ${me.name}` : "Account linked") : "Not linked yet"}
              desc={!me ? "Checking…" : me.signedIn ? "Your scans earn cash-back points to your CheckTag account." : LINK_COPY}
              right={<Pill tone={signedIn ? "good" : "muted"}>{!me ? "…" : signedIn ? "Linked" : "Guest"}</Pill>}
            />
            {me && !signedIn && <Row icon={<MessageCircle size={18} />} title="Back to the chat to link" desc="Opens your CheckTag bot chat." onClick={closeApp} />}
            <Row icon={<Coins size={18} />} title="Your cash-back" desc="Points, earnings and your top products." onClick={() => push({ k: "cashback" })} />
            <Row
              icon={<Palette size={18} />}
              title="Appearance"
              right={
                <Segmented
                  layoutId="theme-seg"
                  label="Appearance"
                  value={theme}
                  onChange={(t) => (haptic(), setTheme(t))}
                  options={[
                    { value: "auto", label: "Auto" },
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                />
              }
            />
            <RegionRow />
            {signedIn && <Row icon={<Ban size={18} />} title="Blocked authors" desc="People whose reviews you’ve hidden." onClick={() => openSheet({ title: "Blocked authors", body: <BlockedListBody /> })} />}
          </Group>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Overline>Get the app</Overline>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: "ios", top: "Download on the", name: "App Store", url: STORES.ios },
              { k: "play", top: "Get it on", name: "Google Play", url: STORES.play },
            ].map((s) => (
              <motion.button
                key={s.k}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => (haptic(), openLink(s.url))}
                className="ct-card px-3.5 py-3 text-left"
              >
                <span className="block text-[10px] font-medium uppercase tracking-wider text-ct-text-3">{s.top}</span>
                <span className="block text-[15px] font-semibold text-ct-text">{s.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Overline>Help & legal</Overline>
          <Group>
            <Row icon={<Mail size={18} />} title="Contact support" desc={SUPPORT} onClick={copySupport} />
            <Row icon={<FileText size={18} />} title="Terms & Conditions" onClick={() => openLink("https://checktag.io/terms-and-conditions")} />
            <Row icon={<ShieldCheck size={18} />} title="Privacy Policy" onClick={() => openLink("https://checktag.io/privacy")} />
          </Group>
          <p className="mt-6 text-center text-[12.5px] text-ct-text-3">CheckTag · Scan to know</p>
        </motion.div>
      </motion.div>
    </>
  );
}

function RegionRow() {
  const { me, signedIn, loadMe, toast } = useApp();
  const r = me?.region;
  const [busy, setBusy] = useState(false);
  const list = signedIn ? countryList() : [];
  const desc = "Country only — never your precise location.";
  if (!signedIn || !list.length) {
    return <Row icon={<Globe2 size={18} />} title="Your region" desc={desc} right={<Pill tone="muted">{r?.name || (me ? "Not detected" : "…")}</Pill>} />;
  }
  const auto = r && r.source !== "user" && r.name ? `Automatic · ${r.name}` : "Automatic";
  return (
    <Row
      icon={<Globe2 size={18} />}
      title="Your region"
      desc={desc}
      right={
        <span className="relative">
          <label htmlFor="region" className="sr-only">
            Choose your region
          </label>
          <select
            id="region"
            disabled={busy}
            value={r?.source === "user" && r.country ? r.country : ""}
            onChange={async (e) => {
              const v = e.target.value || null;
              haptic();
              setBusy(true);
              try {
                const out = await api<Region>("/api/me/region", { method: "PUT", json: { country: v } });
                await loadMe();
                toast(v ? `Region set to ${out.name || v}` : "Region set to automatic");
              } catch (err) {
                toast(errText(err, "Couldn’t change your region right now."));
              }
              setBusy(false);
            }}
            className="max-w-[150px] appearance-none truncate rounded-full border border-ct-border bg-ct-surface-alt py-1.5 pl-3 pr-7 text-[13px] font-semibold text-ct-text outline-none"
          >
            <option value="">{auto}</option>
            {list.map(([c, n]) => (
              <option key={c} value={c}>
                {n}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ct-text-3" />
        </span>
      }
    />
  );
}

// ------------------------------------------------------------------ shared states

function LinkNeeded() {
  return (
    <Empty
      icon={<Link2 size={20} />}
      text={LINK_COPY}
      action={
        <Button size="sm" icon={<MessageCircle size={15} />} onClick={() => (haptic(), closeApp())}>
          Back to the chat
        </Button>
      }
    />
  );
}

function Failed({ err, onRetry }: { err: unknown; onRetry(): void }) {
  return (
    <Empty
      icon={<AlertCircle size={20} />}
      text={errText(err)}
      action={
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
}

// ------------------------------------------------------------------ history

export function HistoryScreen({ visible }: { visible: boolean }) {
  const { push } = useApp();
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let stop = false;
    setErr(null);
    api<{ items: HistoryItem[] }>("/api/me/history").then(
      (d) => !stop && setItems(d.items || []),
      (e) => !stop && setErr(e),
    );
    return () => {
      stop = true;
    };
  }, [visible, n]);
  return (
    <>
      <TopBar title="Scan history" />
      <div className="mx-auto max-w-[540px] px-4 pb-12">
        <Card className="overflow-hidden">
          {err ? (
            err instanceof ApiError && err.code === "link_required" ? <LinkNeeded /> : <Failed err={err} onRetry={() => setN((x) => x + 1)} />
          ) : !items ? (
            <div className="space-y-4 p-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skel className="h-12 w-12 rounded-[12px]" />
                  <div className="flex-1 space-y-2">
                    <Skel className="h-3.5 w-3/4" />
                    <Skel className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : !items.length ? (
            <Empty icon={<Search size={20} />} title="No scans yet" text="Scan a product and it’ll show up here." />
          ) : (
            <motion.ul variants={listVariants} initial="hidden" animate="show" className="divide-y divide-ct-border">
              {items.map((it) => (
                <motion.li key={it.barcode} variants={itemVariants}>
                  <button
                    type="button"
                    onClick={() => push({ k: "product", barcode: it.barcode, lookup: true })}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-ct-surface-alt"
                  >
                    <Thumb src={it.imageUrl} size={48} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold text-ct-text">{it.name}</span>
                      <span className="block truncate text-[12.5px] text-ct-text-3">
                        {[it.brand, typeof it.rating === "number" ? `${it.rating.toFixed(1)} ★` : null].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {it.verdict && <Pill tone="soft">{it.verdict}</Pill>}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </Card>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ cash-back

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => fmtN(Math.round(v)));
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.1, ease });
    return () => c.stop();
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

const SOURCES: [string, string][] = [
  ["scans", "Scanning products"],
  ["contributions", "Contributions"],
  ["referrals", "Inviting friends"],
  ["bonuses", "Bonuses"],
];

export function CashbackScreen({ visible }: { visible: boolean }) {
  const { push } = useApp();
  const [d, setD] = useState<Cashback | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let stop = false;
    setErr(null);
    api<Cashback>("/api/me/cashback").then(
      (x) => !stop && setD(x),
      (e) => !stop && setErr(e),
    );
    return () => {
      stop = true;
    };
  }, [visible, n]);

  const p = d?.points || {};
  const c = d?.cash || {};
  const per = Number(d?.pointsPerUsd) || 1000;
  const months = d?.monthly || [];
  const max = Math.max(1, ...months.map((m) => Number(m.points) || 0));
  const total = months.reduce((a, m) => a + (Number(m.points) || 0), 0);
  const src = d?.bySource || {};
  const smax = Math.max(0, ...SOURCES.map(([k]) => Number(src[k]) || 0));

  return (
    <>
      <TopBar title="Your cash-back" />
      <div className="mx-auto max-w-[540px] space-y-4 px-4 pb-12">
        {err ? (
          <Card>{err instanceof ApiError && err.code === "link_required" ? <LinkNeeded /> : <Failed err={err} onRetry={() => setN((x) => x + 1)} />}</Card>
        ) : !d ? (
          <>
            <Skel className="h-[190px] rounded-[18px]" />
            <Skel className="h-[180px] rounded-[18px]" />
          </>
        ) : (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={itemVariants} className="ct-grad relative overflow-hidden rounded-[22px] p-5 text-white">
              <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/75">Points balance</div>
              <div className="mt-1 text-[40px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
                <CountUp value={Number(p.balance) || 0} />
              </div>
              <div className="mt-1.5 text-[14px] text-white/85">≈ {fmtUsd(p.balanceUsd, p.balance)} in cash-back</div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  [fmtN(p.lifetimeEarned), "points earned all-time"],
                  [fmtUsd(c.redeemedUsd), "redeemed to cash"],
                  [fmtUsd(c.withdrawnUsd), "withdrawn"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-[14px] bg-white/12 px-3 py-2.5">
                    <div className="text-[16px] font-bold tabular-nums">{v}</div>
                    <div className="text-[11.5px] leading-tight text-white/75">{l}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-white/80">
                <Coins size={13} />
                {fmtN(per)} points = $1 of cash-back.
              </p>
            </motion.div>

            {Number(c.balanceUsd) > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="flex items-center gap-3 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ct-primary-soft text-ct-primary">
                    <Coins size={18} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold text-ct-text">Cash ready to withdraw</span>
                    <span className="block text-[13px] text-ct-text-3">Withdraw it in the CheckTag app</span>
                  </span>
                  <span className="text-[16px] font-bold text-ct-text">{fmtUsd(c.balanceUsd)}</span>
                </Card>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Card className="p-4">
                <SectionTitle title="Last 12 months" sub={`${plural(total, "point", "points")} earned`} />
                <div className="flex h-[140px] items-end gap-1.5" role="img" aria-label="Points earned per month, last 12 months">
                  {months.map((m, i) => {
                    const v = Number(m.points) || 0;
                    return (
                      <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${monthLong(m.month)}: ${plural(v, "point", "points")}`}>
                        <div className="relative flex w-full flex-1 items-end justify-center">
                          <motion.div
                            className={cx("w-full max-w-[22px] rounded-t-[6px] rounded-b-[3px]", v ? "ct-grad" : "bg-ct-border")}
                            initial={{ height: 0 }}
                            animate={{ height: v ? `${Math.max(4, Math.round((v / max) * 100))}%` : 3 }}
                            transition={{ duration: 0.7, ease, delay: i * 0.035 }}
                          />
                        </div>
                        <span className="text-[10.5px] text-ct-text-3">{monthAbbr(m.month)}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-4">
                <SectionTitle title="Where your points come from" />
                {smax ? (
                  <div className="space-y-3">
                    {SOURCES.map(([k, label]) => {
                      const v = Number(src[k]) || 0;
                      return (
                        <div key={k} className="flex items-center gap-3 text-[13.5px]">
                          <span className="w-[42%] text-ct-text">{label}</span>
                          <div className="flex-1">
                            <Bar frac={v / smax} color="var(--ct-primary)" height={8} />
                          </div>
                          <span className="w-12 text-right font-semibold text-ct-text-2 tabular-nums">{fmtN(v)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[14px] text-ct-text-2">Scan a product to start earning.</p>
                )}
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Overline>Top products</Overline>
              <Card className="overflow-hidden">
                {d.topProducts?.length ? (
                  <ul className="divide-y divide-ct-border">
                    {d.topProducts.map((t) => (
                      <li key={t.barcode}>
                        <button
                          type="button"
                          onClick={() => push({ k: "product", barcode: t.barcode, lookup: true })}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-ct-surface-alt"
                        >
                          <Thumb src={t.imageUrl} size={46} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px] font-semibold text-ct-text">{t.name}</span>
                            <span className="block text-[12.5px] text-ct-text-3">{plural(t.scans, "scan", "scans")}</span>
                          </span>
                          <span className="text-right">
                            <span className="block text-[14px] font-bold text-ct-text tabular-nums">{fmtN(t.points)} pts</span>
                            <span className="block text-[12px] text-ct-text-3">{fmtUsd(t.usdValue, t.points)}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty icon={<Search size={20} />} text="Earn points on a product and it’ll show up here." />
                )}
              </Card>
              {!!d.topProducts?.length && (
                <p className="mt-2.5 flex items-center gap-1.5 px-1 text-[12px] text-ct-text-3">
                  <Clock size={13} />
                  Per-product earnings are tracked from October 2026.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
}

