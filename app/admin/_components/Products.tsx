"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { safeHttpUrl } from "@/lib/utils";
import { Badge, Button, Card, EmptyState, Filters, Pager, SearchBox, Select, Spinner, useAdminList, useDebounced } from "./ui";
import CatalogHealth from "./CatalogHealth";
import { BadgeCheck, ExternalLink, Eye, EyeOff, RefreshCw, Trash2, X } from "lucide-react";

// Products: catalogue clean-up, then every product — search, filter, open one
// to see everything stored about it, and vet, hide or delete it.

interface Row {
  barcode: string;
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  rating: number | null;
  hasAnalysis: boolean;
  hidden: boolean;
  vetted: boolean;
}

type Filter = "all" | "unvetted" | "hidden" | "no_analysis" | "no_photo";

export default function Products({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const q = useDebounced(search.trim());
  const list = useAdminList<Row>("/admin/products/browse", { q, filter }, (d) => d.items, notify);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <CatalogHealth notify={notify} />

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All products</h2>
          <p className="text-sm text-slate-400">Open a product to see everything stored about it, vet it, hide it or delete it.</p>
        </div>
        <Button variant="outline" size="sm" onClick={list.reload}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Filters>
        <SearchBox value={search} onChange={setSearch} placeholder="Barcode, name or brand" />
        <Select
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All products" },
            { value: "unvetted", label: "Awaiting vetting" },
            { value: "hidden", label: "Hidden from public pages" },
            { value: "no_analysis", label: "No analysis yet" },
            { value: "no_photo", label: "No photo" },
          ]}
        />
      </Filters>

      {list.loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-cyan-400" />
        </div>
      ) : list.items.length === 0 ? (
        <Card>
          <EmptyState label="No products match." />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.items.map((p) => {
            const img = safeHttpUrl(p.imageUrl);
            return (
              <button key={p.barcode} type="button" onClick={() => setOpen(p.barcode)} className="text-left">
                <Card className="flex items-center gap-4 p-4 transition hover:border-cyan-400/30">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-white/10 bg-white object-contain" />
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-xs text-slate-500">No photo</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {[p.brand, p.category, p.barcode].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                      {typeof p.rating === "number" && <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-300">{p.rating.toFixed(1)}/5</span>}
                      {!p.vetted && <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-300">Not vetted</span>}
                      {p.hidden && <span className="rounded-full bg-white/10 px-2 py-0.5 text-slate-300">Hidden</span>}
                      {!p.hasAnalysis && <span className="rounded-full bg-white/10 px-2 py-0.5 text-slate-400">No analysis</span>}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}
      <Pager offset={list.offset} pageSize={list.pageSize} total={list.total} onChange={list.setOffset} />

      {open && (
        <ProductPanel
          barcode={open}
          notify={notify}
          onClose={() => setOpen(null)}
          onChanged={() => list.reload()}
          onDeleted={() => {
            setOpen(null);
            list.reload();
          }}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ detail

interface Detail {
  barcode: string;
  variantId: string;
  name: string;
  brand: string | null;
  vetted: boolean;
  hidden: boolean;
  hiddenReason: string | null;
  attrs: Record<string, any>;
  scans: { total: number; people: number; last: string | null };
  reviews: Record<string, number>;
  submissions: { id: string; type: string; status: string; createdAt: string }[];
  publicUrl: string;
}

function ProductPanel({
  barcode,
  notify,
  onClose,
  onChanged,
  onDeleted,
}: {
  barcode: string;
  notify: (m: string, k: "success" | "error") => void;
  onClose: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [d, setD] = useState<Detail | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");

  async function load() {
    try {
      setD(await api<Detail>(`/admin/products/${encodeURIComponent(barcode)}/detail`));
    } catch (e: any) {
      notify(e.message, "error");
      onClose();
    }
  }
  useEffect(() => {
    load();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode]);

  async function run(key: string, fn: () => Promise<unknown>, done: string) {
    setBusy(key);
    try {
      await fn();
      notify(done, "success");
      await load();
      onChanged();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!d || confirm !== d.barcode) return;
    setBusy("delete");
    try {
      await api(`/admin/products/${encodeURIComponent(d.barcode)}`, { method: "DELETE", body: JSON.stringify({ confirm }) });
      notify(`${d.name} deleted`, "success");
      onDeleted();
    } catch (e: any) {
      notify(e.message, "error");
      setBusy(null);
    }
  }

  const a = d?.attrs || {};
  const images = (Array.isArray(a.images) ? a.images : []).map(safeHttpUrl).filter(Boolean) as string[];
  const facts: [string, unknown][] = d
    ? [
        ["Category", a.category],
        ["Rating", typeof a.rating === "number" ? `${a.rating}/5` : null],
        ["Analysis", a.aiStatus || (a.aiOverview ? "ready" : "none")],
        ["Net quantity", a.netQuantity],
        ["Serving size", a.servingSize],
        ["Country of origin", a.countryOfOrigin],
        ["Allergens", Array.isArray(a.allergens) ? a.allergens.join(", ") : null],
        ["On the label", Array.isArray(a.certifications) ? a.certifications.join(", ") : null],
        ["Verified from label", Array.isArray(a.verifiedFields) ? a.verifiedFields.join(", ") : null],
        ["Data source", a.source],
      ]
    : [];
  const ingredients: string[] = Array.isArray(a.ingredients) ? a.ingredients : [];
  const nutrition = a.nutrition && typeof a.nutrition === "object" ? Object.entries(a.nutrition as Record<string, unknown>) : [];
  const details = a.details && typeof a.details === "object" ? Object.entries(a.details as Record<string, unknown>) : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Product details">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0A1628] p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-slate-500">{barcode}</p>
            <h3 className="text-xl font-bold">{d?.name ?? "…"}</h3>
            {d?.brand && <p className="text-sm text-slate-400">{d.brand}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!d ? (
          <div className="grid place-items-center py-20">
            <Spinner className="h-6 w-6 text-cyan-400" />
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={d.vetted ? "outline" : "primary"}
                loading={busy === "vet"}
                onClick={() =>
                  run("vet", () => api("/admin/products/vet", { method: "POST", body: JSON.stringify({ barcode: d.barcode, vetted: !d.vetted }) }), d.vetted ? "Marked as not vetted" : "Vetted — shows as Genuine")
                }
              >
                <BadgeCheck className="h-4 w-4" /> {d.vetted ? "Unvet" : "Vet"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                loading={busy === "hide"}
                onClick={() =>
                  run(
                    "hide",
                    () => api("/admin/catalog/visibility", { method: "POST", body: JSON.stringify({ barcode: d.barcode, hidden: !d.hidden }) }),
                    d.hidden ? "Shown on public pages again" : "Hidden from public pages",
                  )
                }
              >
                {d.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {d.hidden ? "Show on public pages" : "Hide from public pages"}
              </Button>
              <a href={d.publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-white/5">
                <ExternalLink className="h-4 w-4" /> Public page
              </a>
            </div>
            {d.hidden && d.hiddenReason && <p className="text-xs text-amber-300">Hidden: {d.hiddenReason}</p>}

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-24 w-24 rounded-lg border border-white/10 bg-white object-contain" />
                  </a>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Scans" value={d.scans.total} sub={d.scans.last ? `last ${new Date(d.scans.last).toLocaleDateString()}` : "never"} />
              <Stat label="People" value={d.scans.people} sub="scanned it" />
              <Stat label="Reviews" value={Object.values(d.reviews).reduce((s, n) => s + n, 0)} sub={Object.entries(d.reviews).map(([k, n]) => `${n} ${k}`).join(" · ") || "none"} />
            </div>

            <Section title="Facts">
              <dl className="divide-y divide-white/5 rounded-xl border border-white/10">
                {facts
                  .filter(([, v]) => v !== null && v !== undefined && v !== "")
                  .map(([k, v]) => (
                    <div key={k} className="flex gap-4 px-3 py-2">
                      <dt className="w-36 shrink-0 text-slate-500">{k}</dt>
                      <dd className="min-w-0 break-words text-slate-200">{String(v)}</dd>
                    </div>
                  ))}
              </dl>
            </Section>

            {a.aiOverview && (
              <Section title="Analysis">
                <p className="leading-relaxed text-slate-300">{String(a.aiOverview)}</p>
                {a.safetyWarning && <p className="mt-2 rounded-lg bg-rose-500/10 p-3 text-rose-200">{String(a.safetyWarning)}</p>}
              </Section>
            )}
            {a.description && (
              <Section title="Description">
                <p className="leading-relaxed text-slate-300">{String(a.description)}</p>
              </Section>
            )}
            {ingredients.length > 0 && (
              <Section title={`Ingredients (${ingredients.length})`}>
                <ul className="list-disc space-y-1 pl-5 text-slate-300">
                  {ingredients.map((x, i) => (
                    <li key={i}>{String(x)}</li>
                  ))}
                </ul>
              </Section>
            )}
            {nutrition.length > 0 && (
              <Section title="Nutrition">
                <KeyValues rows={nutrition} />
              </Section>
            )}
            {details.length > 0 && (
              <Section title="Other label details">
                <KeyValues rows={details} />
              </Section>
            )}
            {d.submissions.length > 0 && (
              <Section title="Submissions">
                <ul className="space-y-1.5">
                  {d.submissions.map((s) => (
                    <li key={s.id} className="flex items-center gap-2 text-slate-400">
                      <Badge value={s.type} /> <Badge value={s.status} /> {new Date(s.createdAt).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section title="Delete this product">
              <div className="rounded-xl border border-rose-400/25 bg-rose-500/5 p-4">
                <p className="text-slate-300">
                  Removes the product, its photos list, analysis and reviews. Scans and points people earned stay in their history. Scanning the barcode again
                  rebuilds it from the barcode databases. This can&apos;t be undone — to keep it but take it off the website, hide it instead.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value.trim())}
                    placeholder={`Type ${d.barcode} to confirm`}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 font-mono text-sm outline-none focus:border-rose-400/50"
                  />
                  <Button variant="danger" size="sm" disabled={confirm !== d.barcode} loading={busy === "delete"} onClick={remove}>
                    <Trash2 className="h-4 w-4" /> Delete product
                  </Button>
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      {children}
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-0.5 truncate text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

function KeyValues({ rows }: { rows: [string, unknown][] }) {
  return (
    <dl className="divide-y divide-white/5 rounded-xl border border-white/10">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-4 px-3 py-2">
          <dt className="w-36 shrink-0 capitalize text-slate-500">{k.replace(/_/g, " ")}</dt>
          <dd className="min-w-0 break-words text-slate-200">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}
