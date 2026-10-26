"use client";
import { useEffect, useState } from "react";
import { brandApi, type BrandProductRow } from "@/lib/brandApi";
import { cn } from "@/lib/utils";
import { Button, Card, EmptyState, useDebounced } from "../../admin/_components/ui";
import { control, day, field, fieldLabel, Loading, Pill, SectionHead, Thumb, tone, usePortal } from "./shared";
import { Plus, RefreshCw, Search, Send, X } from "lucide-react";

// Claiming products: find them in the catalogue (or type barcodes that aren't on
// CheckTag yet), say how they're yours, and CheckTag checks the claim. Approved
// products appear under Products.

interface Found {
  barcode: string;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  claimed: boolean;
}

interface Pick {
  barcode: string;
  name: string | null;
  /** Not in the catalogue yet: the claim creates it with this name. */
  isNew: boolean;
  imageUrl?: string | null;
}

interface Claim {
  id: string;
  items: { barcode: string; name?: string }[];
  evidence: string;
  status: "pending" | "approved" | "partial" | "rejected";
  reviewNote: string | null;
  approved: string[] | null;
  createdAt: string;
}

/** GS1 check digit (EAN-8, UPC-A, EAN-13, GTIN-14). */
export function isValidGtin(code: string) {
  if (!/^(\d{8}|\d{12,14})$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const check = digits.pop()!;
  const sum = digits.reverse().reduce((s, d, i) => s + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

export default function Claims() {
  const { notify, canEdit } = usePortal();
  const [claims, setClaims] = useState<Claim[] | null>(null);
  // The brand's verified products: names for its claims, and "Already yours" in search.
  const [owned, setOwned] = useState<Map<string, string | null>>(new Map());

  async function load() {
    setClaims(null);
    try {
      const [c, p] = await Promise.all([brandApi<{ items: Claim[] }>("/brand/claims"), brandApi<{ items: BrandProductRow[] }>("/brand/products")]);
      setClaims(c.items);
      setOwned(new Map(p.items.map((x) => [x.barcode, x.name])));
    } catch (e: any) {
      notify(e.message, "error");
      setClaims([]);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <SectionHead
        title="Claim products"
        actions={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      >
        Tell CheckTag which barcodes are yours. We check every claim by hand; the result shows below. Once a product is approved, you can edit it, make codes for it and send recalls.
      </SectionHead>

      {canEdit && <ClaimForm onSent={load} owned={owned} />}

      <h3 className="mb-3 mt-8 font-semibold">Your claims</h3>
      {claims === null ? (
        <Loading />
      ) : claims.length === 0 ? (
        <Card>
          <EmptyState label="No claims yet." />
        </Card>
      ) : (
        <div className="space-y-3">
          {claims.map((c) => (
            <ClaimCard key={c.id} c={c} owned={owned} />
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS: Record<Claim["status"], { label: string; cls: string }> = {
  pending: { label: "Waiting for CheckTag", cls: tone.warn },
  approved: { label: "Approved", cls: tone.good },
  partial: { label: "Partly approved", cls: tone.info },
  rejected: { label: "Not approved", cls: tone.bad },
};

function ClaimCard({ c, owned }: { c: Claim; owned: Map<string, string | null> }) {
  const approved = new Set(c.approved || []);
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <Pill cls={STATUS[c.status].cls}>{STATUS[c.status].label}</Pill>
        <span>Sent {day(c.createdAt)}</span>
        <span>
          · {c.items.length} product{c.items.length === 1 ? "" : "s"}
          {c.status === "partial" && ` (${approved.size} approved)`}
        </span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {c.items.map((i) => (
          <li
            key={i.barcode}
            className={cn(
              "rounded-lg border px-2 py-1 text-xs",
              c.status === "partial" && approved.has(i.barcode) ? "border-emerald-400/25 text-emerald-200" : "border-white/10 text-slate-300",
            )}
          >
            <span className="font-mono">{i.barcode}</span>
            {(i.name || owned.get(i.barcode)) && <span className="text-slate-400"> · {i.name || owned.get(i.barcode)}</span>}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500 [overflow-wrap:anywhere]">Evidence: {c.evidence}</p>
      {c.reviewNote && (
        <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300">
          <span className="mb-1 block text-xs text-slate-500">CheckTag&apos;s note</span>
          {c.reviewNote}
        </p>
      )}
    </Card>
  );
}

function ClaimForm({ onSent, owned }: { onSent: () => void; owned: Map<string, string | null> }) {
  const { notify } = usePortal();
  const [q, setQ] = useState("");
  const query = useDebounced(q.trim());
  const [found, setFound] = useState<Found[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [manualName, setManualName] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [checking, setChecking] = useState(false);
  const [evidence, setEvidence] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setFound(null);
      return;
    }
    let live = true;
    setSearching(true);
    brandApi<{ items: Found[] }>(`/brand/catalog/search?q=${encodeURIComponent(query)}`)
      .then((r) => live && setFound(r.items))
      .catch((e) => live && notify(e.message, "error"))
      .finally(() => live && setSearching(false));
    return () => {
      live = false;
    };
  }, [query, notify]);

  const picked = new Set(picks.map((p) => p.barcode));
  const add = (p: Pick) => setPicks((list) => (list.some((x) => x.barcode === p.barcode) ? list : [...list, p]));

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    const code = manualCode.replace(/\s+/g, "");
    if (!isValidGtin(code)) return notify("That barcode isn't valid. Check the digits (8, 12, 13 or 14, including the last check digit).", "error");
    if (picked.has(code)) return notify("That barcode is already on your list.", "error");
    if (needsName) {
      if (manualName.trim().length < 2) return notify("Add the product's name: it isn't on CheckTag yet.", "error");
      add({ barcode: code, name: manualName.trim(), isNew: true });
      setManualCode("");
      setManualName("");
      setNeedsName(false);
      return;
    }
    // Is it on CheckTag already? Then we know its name; otherwise ask for one.
    setChecking(true);
    try {
      const r = await brandApi<{ items: Found[] }>(`/brand/catalog/search?q=${code}`);
      const hit = r.items.find((i) => i.barcode === code);
      if (owned.has(code)) notify("That product is already yours.", "error");
      else if (hit?.claimed) notify("That product is already verified for a brand. Contact CheckTag support if it's yours.", "error");
      else if (hit) {
        add({ barcode: code, name: hit.name, isNew: false, imageUrl: hit.imageUrl });
        setManualCode("");
      } else setNeedsName(true);
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setChecking(false);
    }
  }

  async function send() {
    setSending(true);
    try {
      await brandApi("/brand/claims", {
        method: "POST",
        body: JSON.stringify({ items: picks.map((p) => ({ barcode: p.barcode, ...(p.isNew && p.name ? { name: p.name } : {}) })), evidence: evidence.trim() }),
      });
      notify(`Claim sent for ${picks.length} product${picks.length === 1 ? "" : "s"}.`, "success");
      setPicks([]);
      setEvidence("");
      setQ("");
      onSent();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="font-semibold">1. Find your products</h3>
        <label className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-brand-raised px-3 focus-within:border-brand-accent/50">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product, brand or barcode"
            aria-label="Search the catalogue"
            className="w-full bg-transparent py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600"
          />
        </label>
        <div className="mt-3 max-h-80 overflow-y-auto">
          {searching && !found ? (
            <p className="py-6 text-center text-sm text-slate-500">Searching…</p>
          ) : found === null ? (
            <p className="py-6 text-center text-sm text-slate-500">Type at least 2 letters or digits.</p>
          ) : found.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nothing on CheckTag matches. Add the barcodes below instead.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {found.map((f) => (
                <li key={f.barcode} className="flex items-center gap-3 py-2 text-sm">
                  <Thumb src={f.imageUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-slate-100">{f.name || "Unnamed product"}</p>
                    <p className="truncate text-xs text-slate-500">
                      <span className="font-mono">{f.barcode}</span>
                      {f.brand && ` · ${f.brand}`}
                    </p>
                  </div>
                  {owned.has(f.barcode) ? (
                    <span className="shrink-0 text-xs text-emerald-300">Already yours</span>
                  ) : f.claimed ? (
                    <span className="shrink-0 text-xs text-slate-500">Already verified for a brand</span>
                  ) : picked.has(f.barcode) ? (
                    <span className="shrink-0 text-xs text-emerald-300">Added</span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => add({ barcode: f.barcode, name: f.name, isNew: false, imageUrl: f.imageUrl })}>
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={addManual} className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm font-medium">Or type a barcode</p>
          <p className="mb-2 text-xs text-slate-500">For products that aren&apos;t on CheckTag yet, add the name as it appears on the pack.</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={manualCode}
              onChange={(e) => (setManualCode(e.target.value), setNeedsName(false))}
              inputMode="numeric"
              placeholder="e.g. 6154000086961"
              aria-label="Barcode"
              className={cn(control, "min-w-0 flex-1 font-mono")}
            />
            {needsName && (
              <input value={manualName} onChange={(e) => setManualName(e.target.value)} autoFocus maxLength={120} placeholder="Product name" aria-label="Product name" className={cn(control, "min-w-0 flex-1 basis-full sm:basis-auto")} />
            )}
            <Button type="submit" variant="outline" loading={checking} disabled={!manualCode.trim()}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {needsName && <p className="mt-2 text-xs text-amber-300">This barcode isn&apos;t on CheckTag yet. Add its name and we&apos;ll create it when the claim is approved.</p>}
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold">2. Check your list and send it</h3>
        {picks.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Products you add appear here.</p>
        ) : (
          <ul className="mt-3 max-h-64 divide-y divide-white/5 overflow-y-auto">
            {picks.map((p) => (
              <li key={p.barcode} className="flex items-center gap-3 py-2 text-sm">
                <Thumb src={p.imageUrl} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-slate-100">{p.name || "Unnamed product"}</p>
                  <p className="text-xs text-slate-500">
                    <span className="font-mono">{p.barcode}</span>
                    {p.isNew && " · new to CheckTag"}
                  </p>
                </div>
                <button onClick={() => setPicks((l) => l.filter((x) => x.barcode !== p.barcode))} aria-label={`Remove ${p.barcode}`} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="mt-4 block">
          <span className={fieldLabel}>How do we know these are yours?</span>
          <textarea
            className={`${field} min-h-24`}
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            maxLength={2000}
            placeholder="Your GS1 company prefix (e.g. 615xxxx), a link to your GS1 certificate, or your NAFDAC registration numbers."
          />
        </label>
        <Button className="mt-4 w-full" loading={sending} disabled={!picks.length || evidence.trim().length < 10} onClick={send}>
          <Send className="h-4 w-4" /> {picks.length ? `Send claim for ${picks.length} product${picks.length === 1 ? "" : "s"}` : "Send claim"}
        </Button>
        {picks.length > 0 && evidence.trim().length < 10 && <p className="mt-2 text-center text-xs text-slate-500">Add a few words of evidence to send it.</p>}
      </Card>
    </div>
  );
}
