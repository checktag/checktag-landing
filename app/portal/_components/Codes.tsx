"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { brandApi, brandDownload, type Batch, type BatchState, type BrandProductRow, type Code } from "@/lib/brandApi";
import { cn } from "@/lib/utils";
import { Button, Card, EmptyState } from "../../admin/_components/ui";
import { dateOnly, day, field, fieldLabel, Loading, num, Pill, ReadOnlyNote, SectionHead, tone, usePortal, when } from "./shared";
import { ArrowLeft, Ban, CheckCircle2, Download, Plus, Printer, RefreshCw, ShieldAlert, X } from "lucide-react";

// Serialised CheckTag codes: one signed QR code per pack, made in batches.
// A batch is made (RESERVED), its codes are printed (downloading the CSV marks
// them PRINTED), then released for sale (ACTIVATED): only then do they check out
// as genuine. Cancelling (VOIDED) makes every code in it show as invalid.

export const BATCH_STATE: Record<BatchState, { label: string; cls: string }> = {
  RESERVED: { label: "Made, not printed", cls: tone.muted },
  PRINTED: { label: "Printed, not released", cls: tone.info },
  ACTIVATED: { label: "Released for sale", cls: tone.good },
  VOIDED: { label: "Cancelled", cls: tone.bad },
};

const MAX_QTY = 50_000;

export default function Codes({ initial }: { initial: string | null }) {
  const { notify, go, canEdit } = usePortal();
  const [items, setItems] = useState<Batch[] | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setItems(null);
    try {
      setItems((await brandApi<{ items: Batch[] }>("/brand/batches")).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    if (!initial) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  if (initial) return <BatchDetail id={initial} onBack={() => go("codes")} />;

  return (
    <div>
      <SectionHead
        title="Codes"
        actions={
          <>
            {canEdit && !creating && (
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> New batch
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </>
        }
      >
        A CheckTag code is a QR code unique to one pack. Shoppers scan it to check the pack is genuine, and you get an alert when a code looks copied.
      </SectionHead>

      {!canEdit && <ReadOnlyNote />}

      {creating && <NewBatch onCancel={() => setCreating(false)} onMade={(b) => go("codes", b.id)} />}

      <Steps />

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label="No batches yet." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 lg:flex lg:gap-4">
            <span className="flex-1">Batch</span>
            <span className="w-44">State</span>
            <span className="w-24 text-right">Codes</span>
            <span className="w-28 text-right">Scanned</span>
            <span className="w-20 text-right">Alerts</span>
          </div>
          <ul>
            {items.map((b) => (
              <li key={b.id} className="border-b border-white/5 last:border-0">
                <button onClick={() => go("codes", b.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-left text-sm transition hover:bg-white/[0.03] lg:flex-nowrap">
                  <span className="min-w-0 flex-1 basis-full lg:basis-auto">
                    <span className="block truncate font-medium text-slate-100">{b.productName || b.barcode}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {[b.label, b.lot && `Lot ${b.lot}`, `Made ${day(b.createdAt)}`].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="lg:w-44">
                    <Pill cls={BATCH_STATE[b.state].cls}>{BATCH_STATE[b.state].label}</Pill>
                  </span>
                  <span className="text-xs text-slate-400 lg:w-24 lg:text-right lg:text-sm lg:text-slate-200">
                    <span className="tabular-nums">{num(b.qty)}</span>
                    <span className="lg:hidden"> codes</span>
                  </span>
                  <span className="text-xs text-slate-400 lg:w-28 lg:text-right lg:text-sm lg:text-slate-200">
                    <span className="tabular-nums">{num(b.scanned)}</span>
                    <span className="lg:hidden"> scanned</span>
                  </span>
                  <span className="text-xs lg:w-20 lg:text-right lg:text-sm">
                    {b.alerts > 0 ? <Pill cls={tone.warn}>{num(b.alerts)} open</Pill> : <span className="text-slate-500">None</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Steps() {
  const steps = [
    ["Make a batch", "One code per pack, for one of your products."],
    ["Print the codes", "Download the file for your printer, or print labels here."],
    ["Release for sale", "When the packs ship. Until then, scans say “not released”."],
  ];
  return (
    <ol className="mb-6 grid gap-3 sm:grid-cols-3">
      {steps.map(([title, text], i) => (
        <li key={title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-cyan/15 text-xs font-bold text-brand-sky">{i + 1}</span>
          <span>
            <span className="block text-sm font-semibold text-slate-200">{title}</span>
            <span className="block text-xs text-slate-400">{text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function NewBatch({ onCancel, onMade }: { onCancel: () => void; onMade: (b: Batch) => void }) {
  const { notify } = usePortal();
  const [products, setProducts] = useState<BrandProductRow[] | null>(null);
  const [barcode, setBarcode] = useState("");
  const [qty, setQty] = useState("1000");
  const [lot, setLot] = useState("");
  const [label, setLabel] = useState("");
  const [mfg, setMfg] = useState("");
  const [exp, setExp] = useState("");
  const [maxScanners, setMaxScanners] = useState("3");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    brandApi<{ items: BrandProductRow[] }>("/brand/products").then(
      (r) => {
        setProducts(r.items);
        if (r.items[0]) setBarcode(r.items[0].barcode);
      },
      (e) => notify(e.message, "error"),
    );
  }, [notify]);

  const n = Math.floor(Number(qty));
  const qtyOk = Number.isFinite(n) && n >= 1 && n <= MAX_QTY;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await brandApi<{ batch: Batch }>("/brand/batches", {
        method: "POST",
        body: JSON.stringify({
          barcode,
          qty: n,
          ...(lot.trim() && { lot: lot.trim() }),
          ...(label.trim() && { label: label.trim() }),
          ...(mfg && { mfg }),
          ...(exp && { exp }),
          maxScanners: Math.floor(Number(maxScanners)) || 3,
        }),
      });
      notify(`${num(r.batch.qty)} codes made.`, "success");
      onMade(r.batch);
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
          <h3 className="font-semibold">New batch</h3>
          <p className="text-sm text-slate-400">Making codes changes nothing for shoppers until you release the batch.</p>
        </div>
        <button onClick={onCancel} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200">
          <X className="h-4 w-4" />
        </button>
      </div>
      {products === null ? (
        <Loading />
      ) : products.length === 0 ? (
        <p className="text-sm text-slate-400">You need a verified product first. Claim your products, and once CheckTag approves them you can make codes.</p>
      ) : (
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={fieldLabel}>Product</span>
            <select value={barcode} onChange={(e) => setBarcode(e.target.value)} className={cn(field, "ct-select")} required>
              {products.map((p) => (
                <option key={p.barcode} value={p.barcode}>
                  {p.name || "Unnamed product"} · {p.barcode}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={fieldLabel}>How many codes (one per pack, up to {num(MAX_QTY)})</span>
            <input type="number" min={1} max={MAX_QTY} step={1} required value={qty} onChange={(e) => setQty(e.target.value)} className={cn(field, "tabular-nums")} />
          </label>
          <label className="block">
            <span className={fieldLabel}>Lot / batch number (optional)</span>
            <input value={lot} onChange={(e) => setLot(e.target.value)} maxLength={60} placeholder="As printed on the pack, e.g. L2407A" className={field} />
          </label>
          <label className="block">
            <span className={fieldLabel}>Name for this batch (optional, only you see it)</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} placeholder="e.g. July run, Lagos plant" className={field} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={fieldLabel}>Made on (optional)</span>
              <input type="date" value={mfg} onChange={(e) => setMfg(e.target.value)} className={cn(field, "[color-scheme:dark]")} />
            </label>
            <label className="block">
              <span className={fieldLabel}>Expires on (optional)</span>
              <input type="date" value={exp} min={mfg || undefined} onChange={(e) => setExp(e.target.value)} className={cn(field, "[color-scheme:dark]")} />
            </label>
          </div>
          <label className="block md:col-span-2">
            <span className={fieldLabel}>Most people per code</span>
            <input type="number" min={1} max={1000} step={1} value={maxScanners} onChange={(e) => setMaxScanners(e.target.value)} className={cn(field, "max-w-[8rem] tabular-nums")} />
            <span className="mt-1 block text-xs text-slate-500">
              One pack is usually scanned by a few people at most. If more different signed-in people than this scan the same code, you get a clone alert. A code
              scanned in two countries raises an alert too. After the expiry date, scans say the batch has expired.
            </span>
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" loading={busy} disabled={!barcode || !qtyOk}>
              <Plus className="h-4 w-4" /> Make {qtyOk ? num(n) : ""} codes
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

const CODE_PAGE = 20;

function BatchDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { notify, canEdit, go } = usePortal();
  const [b, setB] = useState<Batch | null>(null);
  const [failed, setFailed] = useState(false);
  const [codes, setCodes] = useState<Code[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  async function loadBatch() {
    try {
      setB((await brandApi<{ batch: Batch }>(`/brand/batches/${encodeURIComponent(id)}`)).batch);
    } catch (e: any) {
      notify(e.message, "error");
      setFailed(true);
    }
  }
  async function loadCodes(o = offset) {
    setCodes(null);
    try {
      setCodes((await brandApi<{ items: Code[] }>(`/brand/batches/${encodeURIComponent(id)}/codes?limit=${CODE_PAGE}&offset=${o}`)).items);
    } catch (e: any) {
      notify(e.message, "error");
      setCodes([]);
    }
  }
  useEffect(() => {
    loadBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    loadCodes(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, offset]);

  if (failed) {
    return (
      <div>
        <Back onBack={onBack} />
        <Card>
          <EmptyState label="Batch not found." />
        </Card>
      </div>
    );
  }
  if (!b) return <Loading />;

  const name = b.label || (b.lot ? `Lot ${b.lot}` : `Batch of ${num(b.qty)}`);
  const voided = b.state === "VOIDED";

  async function download() {
    setBusy("csv");
    try {
      await brandDownload(`/brand/batches/${encodeURIComponent(id)}/codes.csv`, "checktag-codes.csv");
      notify("Downloaded. These codes are now marked as printed.", "success");
      await loadBatch();
      await loadCodes();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function act(what: "activate" | "void") {
    const ok =
      what === "activate"
        ? confirm(`Release all ${num(b!.qty)} codes in "${name}" for sale? From now on, scanning one shows it as genuine. Do this once the packs are labelled and leaving your warehouse.`)
        : confirm(`Cancel "${name}"? All ${num(b!.qty)} codes will show as invalid when scanned, including any already on packs in shops. This can't be undone.`);
    if (!ok) return;
    setBusy(what);
    try {
      setB((await brandApi<{ batch: Batch }>(`/brand/batches/${encodeURIComponent(id)}/${what}`, { method: "POST" })).batch);
      notify(what === "activate" ? "Released. These codes now check out as genuine." : "Batch cancelled. Its codes now show as invalid.", "success");
      loadCodes();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <Back onBack={onBack} />
      <SectionHead title={name} actions={<Pill cls={BATCH_STATE[b.state].cls}>{BATCH_STATE[b.state].label}</Pill>}>
        {b.productName || "Product"} · <span className="font-mono">{b.barcode}</span>
      </SectionHead>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Fact label="Codes" value={num(b.qty)} />
        <Fact label="Scanned at least once" value={num(b.scanned)} />
        <Fact label="Open clone alerts" value={num(b.alerts)} warn={b.alerts > 0} />
        <Fact label="Most people per code" value={num(b.maxScanners)} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
        <Meta label="Lot" value={b.lot || "—"} />
        <Meta label="Made on" value={dateOnly(b.mfg)} />
        <Meta label="Expires on" value={dateOnly(b.exp)} />
        <Meta label="Created" value={when(b.createdAt)} />
        <Meta label="Printed" value={b.printedAt ? when(b.printedAt) : "Not yet"} />
        <Meta label="Released" value={b.activatedAt ? when(b.activatedAt) : "Not yet"} />
      </dl>

      {b.alerts > 0 && (
        <button onClick={() => go("alerts")} className="mt-4 flex w-full items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-left text-sm text-amber-200 transition hover:bg-amber-400/10">
          <ShieldAlert className="h-4 w-4 shrink-0" /> {num(b.alerts)} code{b.alerts === 1 ? " in this batch looks" : "s in this batch look"} copied. See clone alerts.
        </button>
      )}

      {canEdit && !voided && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-semibold">Print the codes</h3>
            <p className="mt-1 text-sm text-slate-400">
              Download a CSV (number, serial, link) for your label printer, or print sheets of QR labels from your browser. Downloading the CSV marks the codes as printed; it doesn&apos;t release them.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" loading={busy === "csv"} onClick={download}>
                <Download className="h-4 w-4" /> Download CSV for the printer
              </Button>
              <Link href={`/portal/print?batch=${encodeURIComponent(id)}`} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/5">
                <Printer className="h-4 w-4" /> Print labels
              </Link>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold">{b.state === "ACTIVATED" ? "Released for sale" : "Release for sale"}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {b.state === "ACTIVATED"
                ? "These codes check out as genuine when scanned. If labels were misprinted or stolen, cancel the batch."
                : "Until you release them, scanning these codes says they aren't released for sale yet. Release them once the packs are labelled and shipping."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {b.state !== "ACTIVATED" && (
                <Button variant="success" size="sm" loading={busy === "activate"} disabled={!!busy} onClick={() => act("activate")}>
                  <CheckCircle2 className="h-4 w-4" /> Release for sale
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-rose-300 hover:bg-rose-500/10" loading={busy === "void"} disabled={!!busy} onClick={() => act("void")}>
                <Ban className="h-4 w-4" /> Cancel batch
              </Button>
            </div>
          </Card>
        </div>
      )}
      {voided && <p className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">This batch was cancelled. Its codes show as invalid when scanned.</p>}

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
          <h3 className="font-semibold">Codes in this batch</h3>
          <span className="text-xs text-slate-500 tabular-nums">
            {num(offset + 1)}–{num(Math.min(offset + CODE_PAGE, b.qty))} of {num(b.qty)}
          </span>
        </div>
        {codes === null ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">No.</th>
                  <th className="px-5 py-2 font-medium">Serial</th>
                  <th className="px-5 py-2 font-medium">First scanned</th>
                  <th className="px-5 py-2 font-medium">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {codes.map((c) => (
                  <tr key={c.serial}>
                    <td className="px-5 py-2 tabular-nums text-slate-400">{c.sequence}</td>
                    <td className="px-5 py-2 font-mono text-xs text-slate-200">{c.serial}</td>
                    <td className="px-5 py-2 text-slate-400">{c.firstScanAt ? when(c.firstScanAt) : "Not yet"}</td>
                    <td className="px-5 py-2">
                      <button onClick={() => navigator.clipboard?.writeText(c.url).then(() => notify("Link copied", "success"))} className="font-mono text-xs text-brand-sky hover:underline" title={c.url}>
                        Copy link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {b.qty > CODE_PAGE && (
          <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-3">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - CODE_PAGE))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={offset + CODE_PAGE >= b.qty} onClick={() => setOffset(offset + CODE_PAGE)}>
              Next
            </Button>
          </div>
        )}
      </Card>
      <p className="mt-3 text-xs text-slate-500">
        Opening a code&apos;s link counts as a scan, the same as a shopper&apos;s.
      </p>
    </div>
  );
}

function Fact({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={"mt-1 text-xl font-semibold tabular-nums " + (warn ? "text-amber-300" : "text-slate-50")}>{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}

function Back({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-200">
      <ArrowLeft className="h-4 w-4" /> All batches
    </button>
  );
}
