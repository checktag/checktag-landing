"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { Button, Card, EmptyState, Filters, PAGE_SIZE, Pager, SearchBox, Spinner, Toggle, useDebounced } from "./ui";
import { useProducts } from "./useProducts";
import {
  Ban,
  Check,
  Flag,
  RefreshCw,
  RotateCcw,
  ShieldOff,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

// Community product reviews (user-generated content, App Store 1.2).
// Everything a user wrote — review text, author name, report notes — is
// UNTRUSTED: it is only ever rendered as React text children, never as HTML.

type Status = "pending" | "hidden" | "removed" | "published";

interface ReviewReport {
  reason: string;
  note: string | null;
  at: string;
}

interface CommunityReview {
  id: string;
  unitId: string;
  userId: string;
  author: string | null;
  authorBannedAt: string | null;
  rating: number;
  body: string | null;
  status: Status;
  moderationNote: string | null;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  reports: ReviewReport[] | null;
}

const STATUSES: { key: Status; label: string; hint: string }[] = [
  {
    key: "pending",
    label: "Pending",
    hint: "Held by the automatic filter before publishing. Approve to publish, or remove.",
  },
  {
    key: "hidden",
    label: "Hidden",
    hint: "Taken down automatically after user reports or AI moderation. Approve to restore, or remove.",
  },
  {
    key: "removed",
    label: "Removed",
    hint: "Removed by a moderator, by a ban, or deleted by the author.",
  },
  {
    key: "published",
    label: "Published",
    hint: "Live on product pages, most-reported first.",
  },
];


const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  offensive: "Offensive",
  harassment: "Harassment",
  misleading: "Misleading",
  other: "Other",
};

const FILTER_LABELS: Record<string, string> = {
  profanity: "profanity",
  link: "a link",
  contact_details: "contact details",
  spam: "repeated characters (spam)",
};

/** Turns the backend's moderation note into a sentence a moderator can scan. */
function describeNote(note: string | null): string | null {
  if (!note) return null;
  if (note === "author_deleted") return "Deleted by its author.";
  if (note === "edited_after_moderation")
    return "Edited by the author after it was moderated — needs a fresh look.";
  if (note === "admin: author banned") return "Removed when its author was banned.";
  let m = note.match(/^filter:\s*(.+)$/);
  if (m) return `Held by the automatic filter: contains ${FILTER_LABELS[m[1]] || m[1]}.`;
  m = note.match(/^ai:\s*(.+)$/);
  if (m) return `Hidden by AI moderation: ${m[1]}`;
  m = note.match(/^reports:\s*(\d+)$/);
  if (m) return `Hidden automatically after ${m[1]} user reports.`;
  m = note.match(/^admin:\s*(approve|remove)(?:\s*—\s*([\s\S]+))?$/);
  if (m) {
    const verb = m[1] === "approve" ? "Approved" : "Removed";
    return m[2] ? `${verb} by a moderator — “${m[2]}”` : `${verb} by a moderator.`;
  }
  return note;
}

/** Report timestamps come back without a zone; the DB stores UTC. */
function parseTime(at: string): Date {
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(at) ? at : `${at}Z`);
}

function formatTime(at: string) {
  const d = parseTime(at);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${r} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i <= r ? "fill-amber-300 text-amber-300" : "text-slate-600",
          )}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}

function Pill({
  children,
  tone = "slate",
  title,
}: {
  children: React.ReactNode;
  tone?: "slate" | "amber" | "rose" | "emerald" | "cyan";
  title?: string;
}) {
  const tones: Record<string, string> = {
    slate: "border-white/10 bg-white/[0.04] text-slate-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    cyan: "border-brand-accent/20 bg-brand-accent/10 text-brand-cyan-soft",
  };
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export default function Community({
  notify,
}: {
  notify: (m: string, k: "success" | "error") => void;
}) {
  const [status, setStatus] = useState<Status>("pending");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [reported, setReported] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Partial<Record<Status, number>>>({});
  const [busy, setBusy] = useState<string | null>(null);
  // Inline confirmations: which card is composing a removal / confirming a ban.
  const [removing, setRemoving] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [banning, setBanning] = useState<string | null>(null);

  const products = useProducts(rows.map((r) => r.unitId));

  // Queue sizes for the two action queues, shown on the filter.
  const loadCounts = useCallback(async () => {
    const entries = await Promise.all(
      (["pending", "hidden"] as const).map(async (s) => {
        try {
          const d = await api<{ items: CommunityReview[]; total?: number }>(
            `/admin/reviews?status=${s}&limit=1`,
          );
          return [s, d.total ?? d.items?.length ?? 0] as const;
        } catch {
          return [s, undefined] as const;
        }
      }),
    );
    setCounts(Object.fromEntries(entries));
  }, []);

  const load = useCallback(
    async (s: Status, opts: { quiet?: boolean } = {}) => {
      if (!opts.quiet) setLoading(true);
      try {
        const qs = new URLSearchParams({ status: s, limit: String(PAGE_SIZE), offset: String(offset) });
        if (q) qs.set("q", q);
        if (reported) qs.set("reported", "1");
        const data = await api<{ items: CommunityReview[]; total?: number }>(`/admin/reviews?${qs}`);
        setRows(data.items || []);
        setTotal(data.total ?? data.items?.length ?? 0);
      } catch (e: any) {
        notify(e.message, "error");
      } finally {
        setLoading(false);
      }
      loadCounts();
    },
    // `notify` is recreated by the parent on every render and is only called
    // here, so it's deliberately left out to keep `load` stable.
    [loadCounts, offset, q, reported],
  );

  // A different queue or filter starts again at page one.
  useEffect(() => setOffset(0), [status, q, reported]);

  useEffect(() => {
    setRemoving(null);
    setBanning(null);
    load(status);
  }, [status, load]);

  async function moderate(r: CommunityReview, action: "approve" | "remove") {
    setBusy(r.id + action);
    try {
      const trimmed = note.trim();
      await api(`/admin/reviews/${encodeURIComponent(r.id)}/${action}`, {
        method: "POST",
        body: JSON.stringify(action === "remove" && trimmed ? { note: trimmed } : {}),
      });
      const next: Status = action === "approve" ? "published" : "removed";
      if (next !== status) setRows((rs) => rs.filter((x) => x.id !== r.id));
      else load(status, { quiet: true });
      setRemoving(null);
      setNote("");
      loadCounts();
      notify(
        action === "approve"
          ? r.status === "pending"
            ? "Review approved and published"
            : "Review restored"
          : "Review removed — the author has been notified",
        "success",
      );
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function setBan(r: CommunityReview, banned: boolean) {
    setBusy(r.id + (banned ? "ban" : "unban"));
    try {
      await api(`/admin/users/${encodeURIComponent(r.userId)}/review-ban`, {
        method: "POST",
        body: JSON.stringify({ banned }),
      });
      setBanning(null);
      notify(
        banned
          ? `${displayName(r)} can no longer post reviews; their live reviews were removed`
          : `${displayName(r)} can post reviews again`,
        "success",
      );
      // A ban also takes the author's published reviews down — refresh.
      await load(status, { quiet: true });
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const current = STATUSES.find((s) => s.key === status)!;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Community reviews</h2>
          <p className="text-sm text-slate-400">
            Moderate product reviews posted by users. Most-reported first.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(status)}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Status filter */}
      <div
        role="tablist"
        aria-label="Review status"
        className="mb-2 inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
      >
        {STATUSES.map((s) => {
          const active = s.key === status;
          const n = counts[s.key];
          return (
            <button
              key={s.key}
              role="tab"
              aria-selected={active}
              onClick={() => setStatus(s.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {s.label}
              {typeof n === "number" && n > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                    active
                      ? "bg-brand-accent/20 text-brand-cyan-soft"
                      : "bg-white/10 text-slate-300",
                  )}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mb-4 text-xs text-slate-500">{current.hint}</p>

      <Filters>
        <SearchBox value={search} onChange={setSearch} placeholder="Review text, author or barcode" />
        <Toggle label="Reported only" on={reported} onChange={setReported} />
      </Filters>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-brand-accent" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            label={
              status === "pending" || status === "hidden"
                ? `No ${current.label.toLowerCase()} reviews. All caught up.`
                : `No ${current.label.toLowerCase()} reviews.`
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {rows.map((r) => {
            const product = products[r.unitId];
            const banned = !!r.authorBannedAt;
            const authorDeleted = r.moderationNote === "author_deleted";
            const reasons = summarizeReasons(r.reports || []);
            const noteText = describeNote(r.moderationNote);
            const canApprove = r.status !== "published" && !authorDeleted;
            const canRemove = r.status !== "removed";

            return (
              <Card key={r.id} className="min-w-0 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 basis-64">
                    {/* Rating + meta */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Stars rating={r.rating} />
                      {r.reportCount > 0 && (
                        <Pill tone="rose">
                          <Flag className="h-3 w-3" />
                          {r.reportCount} {r.reportCount === 1 ? "report" : "reports"}
                        </Pill>
                      )}
                      <span className="text-xs text-slate-500">
                        {formatTime(r.createdAt)}
                        {parseTime(r.updatedAt).getTime() -
                          parseTime(r.createdAt).getTime() >
                          60_000 && ` · updated ${formatTime(r.updatedAt)}`}
                      </span>
                    </div>

                    {/* Product */}
                    <p className="text-sm text-slate-400">
                      <span className="font-medium text-slate-200">
                        {product?.name || (product === null ? "Unknown product" : "…")}
                      </span>
                      {product?.brand && <span> · {product.brand}</span>}
                      <span className="text-slate-500"> · {r.unitId}</span>
                    </p>

                    {/* Review text — plain text only */}
                    {r.body ? (
                      <p className="mt-3 whitespace-pre-wrap [overflow-wrap:anywhere] rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[15px] leading-relaxed text-slate-100">
                        {r.body}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm italic text-slate-500">
                        Rating only — no written review.
                      </p>
                    )}

                    {/* Author */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <UserRound className="h-4 w-4 text-slate-500" />
                      <span className="min-w-0 font-medium text-slate-200 [overflow-wrap:anywhere]">
                        {displayName(r)}
                      </span>
                      <span
                        className="font-mono text-[11px] text-slate-500"
                        title={r.userId}
                      >
                        {r.userId.slice(0, 8)}
                      </span>
                      {banned ? (
                        <Pill tone="rose" title="Can't post reviews">
                          <Ban className="h-3 w-3" />
                          Banned {formatDate(r.authorBannedAt!)}
                        </Pill>
                      ) : (
                        <Pill tone="emerald">Can post</Pill>
                      )}
                    </div>

                    {/* Reports */}
                    {reasons.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {reasons.map(([reason, n]) => (
                            <Pill key={reason} tone="amber">
                              {REASON_LABELS[reason] || reason}
                              {n > 1 && <span className="tabular-nums">×{n}</span>}
                            </Pill>
                          ))}
                        </div>
                        {(r.reports || []).some((x) => x.note) && (
                          <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            {(r.reports || [])
                              .filter((x) => x.note)
                              .map((x, i) => (
                                <li key={i} className="[overflow-wrap:anywhere]">
                                  <span className="text-slate-500">
                                    {REASON_LABELS[x.reason] || x.reason} ·{" "}
                                    {formatTime(x.at)}:
                                  </span>{" "}
                                  {x.note}
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Moderation note */}
                    {noteText && (
                      <p className="mt-3 text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">
                          Moderation:
                        </span>{" "}
                        {noteText}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                    {canApprove && (
                      <Button
                        variant="success"
                        size="sm"
                        loading={busy === r.id + "approve"}
                        disabled={!!busy}
                        onClick={() => moderate(r, "approve")}
                      >
                        {r.status === "pending" ? (
                          <>
                            <Check className="h-4 w-4" /> Approve
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4" /> Restore
                          </>
                        )}
                      </Button>
                    )}
                    {canRemove && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={!!busy}
                        onClick={() => {
                          setBanning(null);
                          setNote("");
                          setRemoving(removing === r.id ? null : r.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    )}
                    {banned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={busy === r.id + "unban"}
                        disabled={!!busy}
                        onClick={() => setBan(r, false)}
                      >
                        <ShieldOff className="h-4 w-4" /> Unban author
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!!busy}
                        onClick={() => {
                          setRemoving(null);
                          setBanning(banning === r.id ? null : r.id);
                        }}
                      >
                        <Ban className="h-4 w-4" /> Ban author
                      </Button>
                    )}
                  </div>
                </div>

                {/* Remove: optional internal note */}
                {removing === r.id && (
                  <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-4">
                    <label
                      htmlFor={`note-${r.id}`}
                      className="mb-1.5 block text-sm font-medium text-rose-100"
                    >
                      Remove this review
                    </label>
                    <p className="mb-2 text-xs text-slate-400">
                      The author is told it didn&rsquo;t meet the community
                      guidelines. The note below is internal and is not shown
                      to them.
                    </p>
                    <textarea
                      id={`note-${r.id}`}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={200}
                      rows={2}
                      placeholder="Optional note, e.g. off-topic, spam link"
                      className="w-full resize-y rounded-lg border border-white/10 bg-brand-ink/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-rose-300/40 focus:outline-none"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] tabular-nums text-slate-500">
                        {note.length}/200
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoving(null)}
                        >
                          <X className="h-4 w-4" /> Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={busy === r.id + "remove"}
                          onClick={() => moderate(r, "remove")}
                        >
                          <Trash2 className="h-4 w-4" /> Remove review
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ban: confirm */}
                {banning === r.id && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-4">
                    <p className="text-sm text-rose-100">
                      Ban <span className="font-semibold">{displayName(r)}</span>{" "}
                      from posting reviews? All of their published reviews will
                      be removed. You can unban them later.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBanning(null)}
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={busy === r.id + "ban"}
                        onClick={() => setBan(r, true)}
                      >
                        <Ban className="h-4 w-4" /> Ban author
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <Pager offset={offset} pageSize={PAGE_SIZE} total={total} onChange={setOffset} />
    </div>
  );
}

function displayName(r: CommunityReview) {
  return r.author ? `@${r.author}` : "Unknown user";
}

function formatDate(at: string) {
  const d = parseTime(at);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

/** [[reason, count], …] most frequent first. */
function summarizeReasons(reports: ReviewReport[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const r of reports) counts.set(r.reason, (counts.get(r.reason) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}
