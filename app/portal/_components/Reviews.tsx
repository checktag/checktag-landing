"use client";
import { useEffect, useState } from "react";
import { brandApi, type BrandProductRow } from "@/lib/brandApi";
import { Button, Card, EmptyState, Filters, Select, Toggle } from "../../admin/_components/ui";
import { day, field, Loading, ReadOnlyNote, SectionHead, usePortal } from "./shared";
import { Pencil, RefreshCw, Reply, Trash2 } from "lucide-react";

// Shopper reviews of the brand's products. A reply shows publicly under the
// review as "Response from <brand>"; it can be edited or removed any time.

interface Review {
  id: string;
  barcode: string;
  productName: string | null;
  rating: number;
  body: string | null;
  author: string;
  createdAt: string;
  brandReply: string | null;
  brandReplyAt: string | null;
}

const PAGE = 25;

export default function Reviews() {
  const { notify, canEdit } = usePortal();
  const [products, setProducts] = useState<BrandProductRow[]>([]);
  const [barcode, setBarcode] = useState("");
  const [unanswered, setUnanswered] = useState(false);
  const [items, setItems] = useState<Review[] | null>(null);
  const [next, setNext] = useState<number | null>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    brandApi<{ items: BrandProductRow[] }>("/brand/products").then((r) => setProducts(r.items), () => {});
  }, []);

  async function load(offset = 0) {
    if (offset === 0) setItems(null);
    else setMore(true);
    try {
      const qs = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
      if (barcode) qs.set("barcode", barcode);
      if (unanswered) qs.set("unanswered", "1");
      const r = await brandApi<{ items: Review[]; nextOffset: number | null }>(`/brand/reviews?${qs}`);
      setItems((list) => (offset === 0 ? r.items : [...(list || []), ...r.items]));
      setNext(r.nextOffset);
    } catch (e: any) {
      notify(e.message, "error");
      if (offset === 0) setItems([]);
    } finally {
      setMore(false);
    }
  }
  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode, unanswered]);

  const replace = (r: Review) => setItems((list) => (list || []).map((x) => (x.id === r.id ? r : x)));

  return (
    <div>
      <SectionHead
        title="Reviews"
        actions={
          <Button variant="outline" size="sm" onClick={() => load(0)}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      >
        What shoppers say about your products. Your replies appear publicly under the review, as &ldquo;Response from your brand&rdquo;.
      </SectionHead>

      {!canEdit && <ReadOnlyNote />}

      <Filters>
        <Select
          label="Product"
          value={barcode}
          onChange={setBarcode}
          options={[{ value: "", label: "All products" }, ...products.map((p) => ({ value: p.barcode, label: p.name || p.barcode }))]}
        />
        <Toggle label="Not answered yet" on={unanswered} onChange={setUnanswered} />
      </Filters>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label={unanswered ? "Every review has a reply." : "No reviews yet."} />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <ReviewCard key={r.id} r={r} onChange={replace} />
          ))}
          {next != null && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" loading={more} onClick={() => load(next)}>
                Show more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ r, onChange }: { r: Review; onChange: (r: Review) => void }) {
  const { notify, canEdit, me } = usePortal();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(r.brandReply || "");
  const [busy, setBusy] = useState(false);

  async function save(body: string) {
    if (!body && !confirm("Remove your reply? It disappears from the review straight away.")) return;
    setBusy(true);
    try {
      const out = await brandApi<{ reply: string | null }>(`/brand/reviews/${encodeURIComponent(r.id)}/reply`, { method: "POST", body: JSON.stringify({ body }) });
      onChange({ ...r, brandReply: out.reply, brandReplyAt: out.reply ? new Date().toISOString() : null });
      setDraft(out.reply || "");
      setEditing(false);
      notify(out.reply ? "Reply published." : "Reply removed.", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium text-slate-200">{r.productName || r.barcode}</span>
        <span className="text-xs text-slate-500">{day(r.createdAt)}</span>
      </div>
      <p className="mt-1 text-amber-300" aria-label={`${r.rating} out of 5`}>
        {"★".repeat(r.rating)}
        <span className="text-white/20">{"★".repeat(5 - r.rating)}</span>
      </p>
      {r.body ? <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-100 [overflow-wrap:anywhere]">{r.body}</p> : <p className="mt-1 text-sm text-slate-500">Rating only, no text.</p>}
      <p className="mt-1 text-xs text-slate-500">{r.author}</p>

      {r.brandReply && !editing && (
        <div className="mt-3 rounded-xl border border-brand-accent/20 bg-brand-cyan/[0.06] p-3">
          <p className="text-xs font-semibold text-brand-sky">
            Response from {me.brand.name}
            {r.brandReplyAt && <span className="font-normal text-slate-500"> · {day(r.brandReplyAt)}</span>}
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-200 [overflow-wrap:anywhere]">{r.brandReply}</p>
          {canEdit && (
            <div className="mt-2 flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => (setDraft(r.brandReply || ""), setEditing(true))}>
                <Pencil className="h-4 w-4" /> Edit reply
              </Button>
              <Button size="sm" variant="ghost" className="text-rose-300 hover:bg-rose-500/10" disabled={busy} onClick={() => save("")}>
                <Trash2 className="h-4 w-4" /> Remove reply
              </Button>
            </div>
          )}
        </div>
      )}

      {canEdit && (editing || !r.brandReply) && (
        <div className="mt-3 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Reply publicly, as your brand…"
            aria-label="Your reply"
            className={field}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" loading={busy} disabled={draft.trim().length < 2} onClick={() => save(draft.trim())}>
              <Reply className="h-4 w-4" /> {r.brandReply ? "Update reply" : "Publish reply"}
            </Button>
            {editing && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
            <span className="ml-auto text-xs tabular-nums text-slate-500">{draft.length}/1,000</span>
          </div>
        </div>
      )}
    </Card>
  );
}
