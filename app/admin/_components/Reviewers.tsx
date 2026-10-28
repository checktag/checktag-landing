"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { safeHttpUrl } from "@/lib/utils";
import { Button, Card, EmptyState, Filters, Select, Spinner } from "./ui";
import { Scale, Check, X, Pause, Play, ImageIcon } from "lucide-react";

// Community reviewers: submissions and flagged reviews are decided by several
// independent reviewers agreeing (2 of 3, 3 of 4 or 4 of 5). Here: items they
// couldn't agree on, reviewer applications and quality, and the rules and pay.
// API: backend/docs/REVIEWERS_API.md.

type Section = "decide" | "reviewers" | "settings";
type Subtype = "ADD" | "UPDATE" | "REPORT" | "REVIEW";
type RuleName = "2/3" | "3/4" | "4/5";

interface Vote { reviewer: string; vote: "approve" | "reject"; reason: string | null; at: string | null; agreed: boolean | null; paidPoints: number }
interface Task {
  id: string;
  kind: "submission" | "review";
  type: Subtype;
  subjectId: string;
  rule: string;
  status: string;
  outcome: string | null;
  decidedBy: string | null;
  createdAt: string;
  votes: Vote[];
  item: {
    question: string;
    product: { barcode: string; name: string | null; brand: string | null; imageUrl: string | null } | null;
    changes: { label: string; before: string | null; after: string | null }[];
    photos: string[];
    details: string | null;
    review: { rating: number; body: string | null; reports: { reason: string; note: string | null }[] } | null;
  } | null;
}
interface Requirement { id: string; label: string; met: boolean }
interface Stats { reviewed: number; decided: number; awaiting: number; today: number; points: number; accuracy: number | null }
interface Reviewer {
  userId: string; name: string | null; email: string | null; joined: string | null;
  status: "pending" | "approved" | "rejected" | "paused"; statusReason: string | null;
  note: string | null; languages: string[]; appliedAt: string; requirements: Requirement[]; stats: Stats;
}
interface Settings { rules: Record<Subtype, { rule: RuleName; k: number; n: number; points: number }>; weeklyBudget: number; budgetUsed: number }

const TYPE_LABEL: Record<Subtype, string> = { ADD: "New product", UPDATE: "Improve details", REPORT: "Product report", REVIEW: "Community review" };
const REASON_LABEL: Record<string, string> = {
  wrong_product: "Photos don't show this product", mismatch: "Details don't match the photos", unreadable: "Too blurry or unreadable",
  not_enough: "Not enough to go on", guidelines: "Breaks the guidelines", spam: "Spam or abuse", duplicate: "Duplicate", other: "Something else",
};
const input = "w-full rounded-xl border border-white/10 bg-brand-raised px-3 py-2 text-sm outline-none focus:border-brand-accent/50";
const label = "mb-1 block text-xs font-medium text-slate-400";
const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);
const fmt = (n: number) => n.toLocaleString();

export default function Reviewers({ notify, canSetPay }: { notify: (m: string, k: "success" | "error") => void; canSetPay: boolean }) {
  const [section, setSection] = useState<Section>("decide");
  const options: { value: Section; label: string }[] = [
    { value: "decide", label: "Needs a decision" },
    { value: "reviewers", label: "Reviewers" },
    ...(canSetPay ? [{ value: "settings" as Section, label: "Rules & pay" }] : []),
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Scale className="h-5 w-5 text-brand-accent" /> Reviewers</h2>
          <p className="text-sm text-slate-400">Submissions and flagged reviews are decided when enough independent reviewers agree. Items they can&rsquo;t agree on come here.</p>
        </div>
        <Filters>
          <Select<Section> label="Show" value={section} onChange={setSection} options={options} />
        </Filters>
      </div>
      {section === "decide" && <Decide notify={notify} />}
      {section === "reviewers" && <People notify={notify} />}
      {section === "settings" && canSetPay && <Rules notify={notify} />}
    </div>
  );
}

// ------------------------------------------------------------------ escalated

function Decide({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [status, setStatus] = useState<"escalated" | "open" | "decided" | "closed">("escalated");
  const [items, setItems] = useState<Task[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(s = status) {
    setItems(null);
    try {
      setItems((await api<{ items: Task[] }>(`/admin/review-tasks?status=${s}`)).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function decide(t: Task, outcome: "approve" | "reject") {
    setBusy(t.id + outcome);
    try {
      await api(`/admin/review-tasks/${t.id}/decide`, { method: "POST", body: JSON.stringify({ outcome }) });
      notify(outcome === "approve" ? "Approved. Reviewers' votes are settled." : "Rejected. Reviewers' votes are settled.", "success");
      setItems((x) => (x ? x.filter((i) => i.id !== t.id) : x));
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const open = status === "escalated" || status === "open";
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "escalated", label: "No agreement" },
            { value: "open", label: "Waiting for reviewers" },
            { value: "decided", label: "Decided by reviewers" },
            { value: "closed", label: "Decided by an admin" },
          ]}
        />
      </div>
      {items === null ? (
        <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
      ) : items.length === 0 ? (
        <EmptyState label={status === "escalated" ? "Nothing needs a decision. Reviewers agreed on everything so far." : "Nothing here."} />
      ) : (
        items.map((t) => {
          const approve = t.votes.filter((v) => v.vote === "approve").length;
          const reject = t.votes.length - approve;
          const photos = (t.item?.photos || []).map(safeHttpUrl).filter((u): u is string => !!u);
          return (
            <Card key={t.id} className="min-w-0 space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[16rem] flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-slate-300">{TYPE_LABEL[t.type]}</span>
                    <span className="text-slate-500">Rule {t.rule.replace("/", " of ")}</span>
                    <span className="text-slate-500">{new Date(t.createdAt).toLocaleString()}</span>
                    {t.outcome && <span className="text-slate-400">→ {t.outcome}{t.decidedBy ? ` (${t.decidedBy})` : ""}</span>}
                  </div>
                  <p className="font-semibold">{t.item?.product?.name || t.item?.product?.barcode || t.subjectId}</p>
                  {t.item?.product?.brand && <p className="text-sm text-slate-400">{t.item.product.brand}</p>}
                  {t.item?.question && <p className="text-sm text-slate-300">{t.item.question}</p>}
                </div>
                {open && (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="success" size="sm" loading={busy === t.id + "approve"} onClick={() => decide(t, "approve")}>
                      <Check className="h-4 w-4" /> {t.kind === "review" ? "Keep" : "Approve"}
                    </Button>
                    <Button variant="danger" size="sm" loading={busy === t.id + "reject"} onClick={() => decide(t, "reject")}>
                      <X className="h-4 w-4" /> {t.kind === "review" ? "Remove" : "Reject"}
                    </Button>
                  </div>
                )}
              </div>

              {t.item?.changes && t.item.changes.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {t.item.changes.map((c) => (
                        <tr key={c.label} className="border-b border-white/5 last:border-0 align-top">
                          <td className="w-40 px-3 py-2 text-xs text-slate-400">{c.label}</td>
                          <td className="px-3 py-2 text-slate-500 line-through [overflow-wrap:anywhere]">{c.before ?? "—"}</td>
                          <td className="px-3 py-2 text-slate-200 [overflow-wrap:anywhere] whitespace-pre-line">{c.after ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {t.item?.details && <p className="text-sm text-slate-300 [overflow-wrap:anywhere]">&ldquo;{t.item.details}&rdquo;</p>}
              {t.item?.review && (
                <div className="rounded-xl border border-white/10 p-3 text-sm">
                  <p className="text-amber-300">{"★".repeat(t.item.review.rating)}<span className="text-white/20">{"★".repeat(5 - t.item.review.rating)}</span></p>
                  {t.item.review.body && <p className="mt-1 text-slate-200 [overflow-wrap:anywhere]">{t.item.review.body}</p>}
                  {t.item.review.reports.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">Reported: {t.item.review.reports.map((r) => r.reason + (r.note ? ` (“${r.note}”)` : "")).join(", ")}</p>
                  )}
                </div>
              )}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photos.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer" className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="Submitted photo" className="h-20 w-20 rounded-lg border border-white/10 object-cover" />
                      <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/40 opacity-0 transition group-hover:opacity-100"><ImageIcon className="h-4 w-4" /></span>
                    </a>
                  ))}
                </div>
              )}

              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="mb-2 text-xs font-medium text-slate-400">
                  Votes: {approve} {t.kind === "review" ? "keep" : "approve"} · {reject} {t.kind === "review" ? "remove" : "reject"}
                </p>
                {t.votes.length === 0 ? (
                  <p className="text-xs text-slate-500">No votes yet.</p>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {t.votes.map((v, i) => (
                      <li key={i} className="flex flex-wrap gap-x-2 text-slate-300">
                        <span className={v.vote === "approve" ? "text-emerald-300" : "text-rose-300"}>{v.vote === "approve" ? (t.kind === "review" ? "Keep" : "Approve") : (t.kind === "review" ? "Remove" : "Reject")}</span>
                        <span>{v.reviewer}</span>
                        {v.reason && <span className="text-slate-500">· {REASON_LABEL[v.reason] ?? v.reason}</span>}
                        {v.agreed !== null && <span className="text-slate-500">· {v.agreed ? "agreed" : "disagreed"}, {v.paidPoints} pts</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

// ------------------------------------------------------------------ people

function People({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [status, setStatus] = useState<"pending" | "approved" | "paused" | "rejected" | "all">("pending");
  const [items, setItems] = useState<Reviewer[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(s = status) {
    setItems(null);
    try {
      setItems((await api<{ items: Reviewer[] }>(`/admin/reviewers?status=${s === "all" ? "" : s}`)).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function act(r: Reviewer, action: "approve" | "reject" | "pause" | "resume") {
    let reason: string | null = null;
    if (action === "pause" || action === "reject") {
      reason = window.prompt(action === "pause" ? "Why are you pausing them? (they'll see this)" : "Reason (optional, they'll see this)") ;
      if (reason === null) return;
    }
    setBusy(r.userId + action);
    try {
      await api(`/admin/reviewers/${r.userId}/${action}`, { method: "POST", body: JSON.stringify({ reason: reason || undefined }) });
      notify({ approve: "Reviewer approved.", reject: "Application declined.", pause: "Reviewer paused.", resume: "Reviewer resumed." }[action], "success");
      await load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">Reviewers are paid per review from the weekly budget. Anyone whose reviews keep disagreeing with final decisions is paused automatically.</p>
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "pending", label: "Applications" },
            { value: "approved", label: "Active" },
            { value: "paused", label: "Paused" },
            { value: "rejected", label: "Declined" },
            { value: "all", label: "All" },
          ]}
        />
      </div>
      {items === null ? (
        <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
      ) : items.length === 0 ? (
        <EmptyState label={status === "pending" ? "No applications waiting." : "Nothing here."} />
      ) : (
        items.map((r) => (
          <Card key={r.userId} className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="min-w-[16rem] flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{r.name ? `@${r.name}` : r.userId.slice(0, 8)}</span>
                {r.email && <span className="text-xs text-slate-500">{r.email}</span>}
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">{r.status}</span>
              </div>
              {r.statusReason && <p className="text-xs text-amber-300">{r.statusReason === "accuracy" ? "Paused automatically: low agreement with final decisions" : r.statusReason}</p>}
              {r.note && <p className="text-sm text-slate-300 [overflow-wrap:anywhere]">&ldquo;{r.note}&rdquo;</p>}
              {r.languages.length > 0 && <p className="text-xs text-slate-500">Languages: {r.languages.join(", ")}</p>}
              <p className="text-xs text-slate-500">
                {r.requirements.map((q) => `${q.met ? "✓" : "✗"} ${q.label}`).join(" · ")}
              </p>
              <p className="text-xs text-slate-400 tabular-nums">
                {fmt(r.stats.reviewed)} reviews · {fmt(r.stats.decided)} decided · agreement {pct(r.stats.accuracy)} · {fmt(r.stats.points)} pts earned · {r.stats.today} today
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {r.status === "pending" && (
                <>
                  <Button variant="success" size="sm" loading={busy === r.userId + "approve"} onClick={() => act(r, "approve")}><Check className="h-4 w-4" /> Approve</Button>
                  <Button variant="danger" size="sm" loading={busy === r.userId + "reject"} onClick={() => act(r, "reject")}><X className="h-4 w-4" /> Decline</Button>
                </>
              )}
              {r.status === "approved" && (
                <Button variant="outline" size="sm" loading={busy === r.userId + "pause"} onClick={() => act(r, "pause")}><Pause className="h-4 w-4" /> Pause</Button>
              )}
              {(r.status === "paused" || r.status === "rejected") && (
                <Button variant="outline" size="sm" loading={busy === r.userId + "resume"} onClick={() => act(r, "resume")}><Play className="h-4 w-4" /> {r.status === "paused" ? "Resume" : "Approve"}</Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ------------------------------------------------------------------ settings

const TYPES: Subtype[] = ["ADD", "UPDATE", "REPORT", "REVIEW"];

function Rules({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [s, setS] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<{ rules: Record<Subtype, { rule: RuleName; points: string }>; budget: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const x = await api<Settings>("/admin/review-settings");
      setS(x);
      setDraft({
        rules: Object.fromEntries(TYPES.map((t) => [t, { rule: x.rules[t].rule, points: String(x.rules[t].points) }])) as any,
        budget: String(x.weeklyBudget),
      });
    } catch (e: any) {
      notify(e.message, "error");
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      const x = await api<Settings>("/admin/review-settings", {
        method: "PUT",
        body: JSON.stringify({
          rules: Object.fromEntries(TYPES.map((t) => [t, { rule: draft.rules[t].rule, points: Number(draft.rules[t].points) }])),
          weeklyBudget: Number(draft.budget),
        }),
      });
      setS(x);
      notify("Saved. New rules apply to items that arrive from now on.", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!s || !draft) return <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>;
  const left = Math.max(0, s.weeklyBudget - s.budgetUsed);
  return (
    <Card className="space-y-5 p-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="text-xs text-slate-400">
            <tr>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium">Decided when</th>
              <th className="pb-2 font-medium">Points per review</th>
            </tr>
          </thead>
          <tbody>
            {TYPES.map((t) => (
              <tr key={t} className="border-t border-white/5">
                <td className="py-2 pr-3">{TYPE_LABEL[t]}</td>
                <td className="py-2 pr-3">
                  <select
                    className={input}
                    value={draft.rules[t].rule}
                    onChange={(e) => setDraft((d) => d && { ...d, rules: { ...d.rules, [t]: { ...d.rules[t], rule: e.target.value as RuleName } } })}
                  >
                    <option value="2/3">2 of 3 reviewers agree</option>
                    <option value="3/4">3 of 4 reviewers agree</option>
                    <option value="4/5">4 of 5 reviewers agree</option>
                  </select>
                </td>
                <td className="py-2">
                  <input
                    className={input}
                    inputMode="numeric"
                    value={draft.rules[t].points}
                    onChange={(e) => setDraft((d) => d && { ...d, rules: { ...d.rules, [t]: { ...d.rules[t], points: e.target.value.replace(/\D/g, "") } } })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Weekly reviewer budget (points, all reviewers)</label>
          <input className={input} inputMode="numeric" value={draft.budget} onChange={(e) => setDraft((d) => d && { ...d, budget: e.target.value.replace(/\D/g, "") })} />
          <p className="mt-1 text-xs text-slate-500">0 pays XP only. Resets every Monday (UTC).</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3 text-sm tabular-nums">
          <p className="text-xs text-slate-400">This week</p>
          <p>{fmt(s.budgetUsed)} of {fmt(s.weeklyBudget)} points paid · {fmt(left)} left</p>
          <p className="mt-1 text-xs text-slate-500">Every counted review is paid, whether or not it agreed. Reviews keep earning XP when the budget runs out.</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={save} loading={saving}>Save</Button>
      </div>
    </Card>
  );
}
