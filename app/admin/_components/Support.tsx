"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Button, Card, EmptyState, Filters, Select, Spinner } from "./ui";
import { Bug, LifeBuoy, Mail, MessageCircleQuestion, Smartphone } from "lucide-react";

// Messages from the app's Help screen ("Message us", "Report a bug"). A reply is
// emailed to the sender and closes the ticket; you can also close without one.

interface Ticket {
  id: string;
  kind: "bug" | "question";
  message: string;
  email: string | null;
  appVersion: string | null;
  platform: string | null;
  device: string | null;
  status: "open" | "resolved";
  reply: string | null;
  createdAt: string;
  resolvedAt: string | null;
  userId: string | null;
  username: string | null;
}

type Status = "open" | "resolved" | "all";
const when = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function Support({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [status, setStatus] = useState<Status>("open");
  const [items, setItems] = useState<Ticket[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load(s: Status = status) {
    setItems(null);
    try {
      setItems((await api<{ items: Ticket[] }>(`/admin/support?status=${s}`)).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function resolve(t: Ticket, withReply: boolean) {
    const reply = withReply ? (drafts[t.id] || "").trim() : "";
    if (withReply && !reply) return notify("Write a reply first.", "error");
    setBusy(t.id);
    try {
      const r = await api<{ emailed: boolean }>(`/admin/support/${t.id}/resolve`, { method: "POST", body: JSON.stringify(reply ? { reply } : {}) });
      notify(r.emailed ? `Reply sent to ${t.email}.` : "Closed.", "success");
      setDrafts((d) => ({ ...d, [t.id]: "" }));
      await load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><LifeBuoy className="h-5 w-5 text-brand-accent" /> Support</h2>
          <p className="text-sm text-slate-400">Bug reports and questions from the app&apos;s Help screen. Replies go to the sender by email.</p>
        </div>
        <Filters>
          <Select<Status>
            label="Show"
            value={status}
            onChange={setStatus}
            options={[
              { value: "open", label: "Open" },
              { value: "resolved", label: "Closed" },
              { value: "all", label: "All" },
            ]}
          />
        </Filters>
      </div>

      {items === null ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : items.length === 0 ? (
        <EmptyState label={status === "open" ? "No open messages. Nice." : "Nothing here yet."} />
      ) : (
        items.map((t) => {
          const Icon = t.kind === "bug" ? Bug : MessageCircleQuestion;
          return (
            <Card key={t.id} className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${t.kind === "bug" ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : "border-sky-400/30 bg-sky-400/10 text-sky-300"}`}>
                  <Icon className="h-3.5 w-3.5" /> {t.kind === "bug" ? "Bug report" : "Question"}
                </span>
                <span>{when(t.createdAt)}</span>
                {t.status === "resolved" && <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-300">Closed {t.resolvedAt ? when(t.resolvedAt) : ""}</span>}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{t.message}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {t.email || "no email"}{t.username ? ` · @${t.username}` : t.userId ? "" : " · guest"}</span>
                {(t.appVersion || t.device || t.platform) && (
                  <span className="inline-flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> {[t.appVersion && `App ${t.appVersion}`, t.device || t.platform].filter(Boolean).join(" · ")}</span>
                )}
              </div>
              {t.status === "resolved" ? (
                t.reply && <p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300"><span className="mb-1 block text-xs text-slate-500">Our reply</span>{t.reply}</p>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={drafts[t.id] || ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                    rows={3}
                    placeholder={t.email ? `Reply to ${t.email}…` : "No email on this message: close it instead."}
                    disabled={!t.email}
                    className="w-full rounded-xl border border-white/10 bg-brand-raised px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-brand-accent/50 disabled:opacity-50"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => resolve(t, true)} loading={busy === t.id} disabled={!t.email || !(drafts[t.id] || "").trim()}>Send reply &amp; close</Button>
                    <Button size="sm" variant="ghost" onClick={() => resolve(t, false)} disabled={busy === t.id}>Close without reply</Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
