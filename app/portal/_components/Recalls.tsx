"use client";
import { useEffect, useState } from "react";
import { brandApi, type BrandProductRow, type Recall, type RecallKind, type RecallStatus } from "@/lib/brandApi";
import { cn } from "@/lib/utils";
import { Button, Card, EmptyState } from "../../admin/_components/ui";
import { day, field, fieldLabel, Loading, num, Pill, ReadOnlyNote, SectionHead, tone, usePortal } from "./shared";
import { CheckCircle2, Pencil, Plus, RefreshCw, Save, Send, X } from "lucide-react";

// Recalls and safety notices. The brand writes a draft and submits it; CheckTag
// checks it and publishes it. Publishing notifies everyone who scanned the
// product in the last year, and every scan shows it until it's resolved.

export const KINDS: { key: RecallKind; label: string; hint: string }[] = [
  { key: "recall", label: "Recall", hint: "People should stop using the product and return it." },
  { key: "safety_notice", label: "Safety notice", hint: "Important safety information, without taking the product back." },
  { key: "counterfeit_warning", label: "Counterfeit warning", hint: "Fakes of this product are on sale." },
];
export const kindLabel = (k: RecallKind) => KINDS.find((x) => x.key === k)?.label ?? k;

export const RECALL_STATUS: Record<RecallStatus, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: tone.muted },
  STAGED: { label: "Waiting for CheckTag", cls: tone.warn },
  PUBLISHED: { label: "Published", cls: tone.bad },
  RESOLVED: { label: "Resolved", cls: tone.good },
};

export default function Recalls() {
  const { notify, canEdit } = usePortal();
  const [items, setItems] = useState<Recall[] | null>(null);
  const [names, setNames] = useState<Record<string, string | null>>({});
  const [editing, setEditing] = useState<Recall | "new" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setItems(null);
    try {
      const r = await brandApi<{ items: Recall[]; names: Record<string, string | null> }>("/brand/recalls");
      setItems(r.items);
      setNames(r.names);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(r: Recall, what: "submit" | "resolve") {
    const ok =
      what === "submit"
        ? confirm("Send this to CheckTag for review? Once CheckTag publishes it, everyone who scanned these products in the last year is notified, and every scan shows it. You can't edit it while it's waiting.")
        : confirm("Mark this as resolved? Scans stop showing it. People who were notified aren't told again.");
    if (!ok) return;
    setBusy(r.id);
    try {
      const out = await brandApi<{ recall: Recall }>(`/brand/recalls/${encodeURIComponent(r.id)}/${what}`, { method: "POST" });
      setItems((l) => (l || []).map((x) => (x.id === r.id ? out.recall : x)));
      notify(what === "submit" ? "Sent to CheckTag for review." : "Marked as resolved.", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <SectionHead
        title="Recalls and notices"
        actions={
          <>
            {canEdit && !editing && (
              <Button size="sm" onClick={() => setEditing("new")}>
                <Plus className="h-4 w-4" /> New draft
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </>
        }
      >
        Write a recall, safety notice or counterfeit warning and send it to CheckTag. When we publish it, everyone who scanned the product in the last year is notified, and every later scan shows it.
      </SectionHead>

      {!canEdit && <ReadOnlyNote />}

      {editing && (
        <RecallForm
          recall={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(r, n) => {
            setNames((m) => ({ ...m, ...n }));
            setItems((l) => (l?.some((x) => x.id === r.id) ? l.map((x) => (x.id === r.id ? r : x)) : [r, ...(l || [])]));
            setEditing(null);
          }}
        />
      )}

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        !editing && (
          <Card>
            <EmptyState label="No recalls or notices. We hope it stays that way." />
          </Card>
        )
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <Pill cls={RECALL_STATUS[r.status].cls}>{RECALL_STATUS[r.status].label}</Pill>
                <Pill cls={tone.muted}>{kindLabel(r.kind)}</Pill>
                <span>
                  {r.status === "PUBLISHED" || r.status === "RESOLVED"
                    ? `Published ${day(r.publishedAt)}${r.resolvedAt ? ` · resolved ${day(r.resolvedAt)}` : ""}`
                    : r.status === "STAGED"
                      ? `Sent ${day(r.submittedAt)}`
                      : `Created ${day(r.createdAt)}`}
                </span>
              </div>
              <p className="mt-2 font-semibold text-slate-100">{r.title}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-300 [overflow-wrap:anywhere]">{r.body}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span>Products: {r.barcodes.map((b) => names[b] || b).join(", ")}</span>
                <span>{r.lots.length ? `Lots: ${r.lots.join(", ")}` : "All lots"}</span>
                {r.notifiedCount != null && r.status !== "DRAFT" && r.status !== "STAGED" && <span>Notified {num(r.notifiedCount)} {r.notifiedCount === 1 ? "person" : "people"}</span>}
              </div>
              {r.status === "DRAFT" && r.reviewNote && (
                <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3 text-sm text-amber-100">
                  <span className="mb-1 block text-xs text-amber-300">CheckTag sent this back</span>
                  {r.reviewNote}
                </p>
              )}
              {canEdit && (r.status === "DRAFT" || r.status === "PUBLISHED") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status === "DRAFT" && (
                    <>
                      <Button size="sm" loading={busy === r.id} onClick={() => act(r, "submit")}>
                        <Send className="h-4 w-4" /> Submit for review
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => setEditing(r)}>
                        <Pencil className="h-4 w-4" /> Edit draft
                      </Button>
                    </>
                  )}
                  {r.status === "PUBLISHED" && (
                    <Button size="sm" variant="outline" loading={busy === r.id} onClick={() => act(r, "resolve")}>
                      <CheckCircle2 className="h-4 w-4" /> Mark as resolved
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RecallForm({ recall, onClose, onSaved }: { recall: Recall | null; onClose: () => void; onSaved: (r: Recall, names: Record<string, string | null>) => void }) {
  const { notify } = usePortal();
  const [products, setProducts] = useState<BrandProductRow[] | null>(null);
  const [kind, setKind] = useState<RecallKind>(recall?.kind || "recall");
  const [title, setTitle] = useState(recall?.title || "");
  const [body, setBody] = useState(recall?.body || "");
  const [barcodes, setBarcodes] = useState<string[]>(recall?.barcodes || []);
  const [lots, setLots] = useState((recall?.lots || []).join(", "));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    brandApi<{ items: BrandProductRow[] }>("/brand/products").then((r) => setProducts(r.items), (e) => notify(e.message, "error"));
  }, [notify]);

  const t = title.trim();
  const b = body.trim();
  const ready = t.length >= 5 && t.length <= 80 && b.length >= 20 && b.length <= 600 && barcodes.length > 0;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { kind, title: t, body: b, barcodes, lots: lots.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean) };
      const r = recall
        ? await brandApi<{ recall: Recall }>(`/brand/recalls/${encodeURIComponent(recall.id)}`, { method: "PUT", body: JSON.stringify(payload) })
        : await brandApi<{ recall: Recall }>("/brand/recalls", { method: "POST", body: JSON.stringify(payload) });
      notify("Draft saved. Submit it when it's ready.", "success");
      onSaved(r.recall, Object.fromEntries((products || []).map((p) => [p.barcode, p.name])));
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-6 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{recall ? "Edit draft" : "New draft"}</h3>
          <p className="text-sm text-slate-400">Saving keeps it as a draft. Nothing is sent until you submit it and CheckTag publishes it.</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={save} className="space-y-4">
        <div>
          <span className={fieldLabel}>Type</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {KINDS.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setKind(k.key)}
                aria-pressed={kind === k.key}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition",
                  kind === k.key ? "border-rose-400/40 bg-rose-500/10" : "border-white/10 hover:border-white/20",
                )}
              >
                <span className={cn("block text-sm font-semibold", kind === k.key ? "text-rose-200" : "text-slate-200")}>{k.label}</span>
                <span className="block text-xs text-slate-400">{k.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className={fieldLabel}>Title ({title.length}/80)</span>
          <input className={field} maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recall: Brand X Biscuits 100g, lot L2407" />
        </label>
        <label className="block">
          <span className={fieldLabel}>What&apos;s wrong, and what should people do? ({body.length}/600)</span>
          <textarea className={`${field} min-h-28`} maxLength={600} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Lot L2407 may contain undeclared peanuts. Don't eat it. Return it to the shop for a full refund, or call 0800 …" />
          {b.length > 0 && b.length < 20 && <span className="mt-1 block text-xs text-amber-300">At least 20 characters.</span>}
        </label>
        <div>
          <span className={fieldLabel}>Products</span>
          {products === null ? (
            <p className="text-sm text-slate-500">Loading your products…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-slate-400">You need a verified product first.</p>
          ) : (
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-white/10 p-2">
              {products.map((p) => (
                <li key={p.barcode}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={barcodes.includes(p.barcode)}
                      onChange={(e) => setBarcodes((l) => (e.target.checked ? [...l, p.barcode] : l.filter((x) => x !== p.barcode)))}
                      className="accent-[#22AED1]"
                    />
                    <span className="min-w-0 flex-1 truncate text-slate-200">{p.name || "Unnamed product"}</span>
                    <span className="shrink-0 font-mono text-xs text-slate-500">{p.barcode}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="block">
          <span className={fieldLabel}>Lots affected (optional)</span>
          <input className={field} value={lots} onChange={(e) => setLots(e.target.value)} placeholder="e.g. L2407, L2408. Leave empty if every pack is affected." />
          <span className="mt-1 block text-xs text-slate-500">
            Packs with CheckTag codes from other lots won&apos;t show it. A plain barcode scan can&apos;t tell lots apart, so it shows the notice with the lots listed.
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={busy} disabled={!ready}>
            <Save className="h-4 w-4" /> Save draft
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
