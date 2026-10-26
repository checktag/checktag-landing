"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { brandApi, getBrandToken, type Batch, type BrandMe, type Code } from "@/lib/brandApi";
import { Button, Spinner } from "../../admin/_components/ui";
import { ArrowLeft, Printer } from "lucide-react";

// Printable sheets of QR labels for one batch, a page of codes at a time. On
// screen: a toolbar and white "paper"; printed: just the labels, A4, with no
// label split across two sheets. Printing from here doesn't change the codes'
// state; release the batch in the portal when the packs ship.

const PER_PAGE = 200;

interface Label extends Code {
  qr: string;
}

export default function PrintLabels() {
  const [batchId, setBatchId] = useState("");
  const [page, setPage] = useState(1);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [labels, setLabels] = useState<Label[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const id = qs.get("batch") || "";
    if (!getBrandToken()) {
      window.location.href = "/portal/login";
      return;
    }
    if (!id) return setError("No batch chosen. Open a batch in the portal and choose Print labels.");
    setBatchId(id);
    setPage(Math.max(1, Number(qs.get("page")) || 1));
    Promise.all([brandApi<BrandMe>("/brand/me"), brandApi<{ batch: Batch }>(`/brand/batches/${encodeURIComponent(id)}`)]).then(
      ([me, r]) => {
        if (!me.canEdit) return setError("Only Owners and Admins can print labels.");
        if (r.batch.state === "VOIDED") return setError("This batch was cancelled, so its codes can't be printed.");
        setBatch(r.batch);
      },
      (e) => setError(e.message),
    );
  }, []);

  useEffect(() => {
    if (!batch) return;
    let live = true;
    setLabels(null);
    (async () => {
      try {
        const r = await brandApi<{ items: Code[] }>(`/brand/batches/${encodeURIComponent(batch.id)}/codes?limit=${PER_PAGE}&offset=${(page - 1) * PER_PAGE}`);
        const out = await Promise.all(
          r.items.map(async (c) => ({ ...c, qr: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await QRCode.toString(c.url, { type: "svg", margin: 2, errorCorrectionLevel: "M" }))}` })),
        );
        if (live) setLabels(out);
      } catch (e: any) {
        if (live) setError(e.message);
      }
    })();
    return () => {
      live = false;
    };
  }, [batch, page]);

  const pages = batch ? Math.max(1, Math.ceil(batch.qty / PER_PAGE)) : 1;
  const goPage = (p: number) => {
    setPage(p);
    window.history.replaceState(null, "", `?batch=${encodeURIComponent(batchId)}&page=${p}`);
  };
  const from = (page - 1) * PER_PAGE + 1;
  const to = batch ? Math.min(page * PER_PAGE, batch.qty) : 0;

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 print:bg-white">
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          html, body { background: #fff !important; }
          .label { break-inside: avoid; }
        }
      `}</style>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#020817]/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <a href={batchId ? `/portal#codes/${encodeURIComponent(batchId)}` : "/portal#codes"} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
            <ArrowLeft className="h-4 w-4" /> Back to the batch
          </a>
          {batch && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-400 tabular-nums">
                Codes {from.toLocaleString("en-GB")}–{to.toLocaleString("en-GB")} of {batch.qty.toLocaleString("en-GB")}
              </span>
              {pages > 1 && (
                <>
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goPage(page - 1)}>
                    Previous {PER_PAGE}
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => goPage(page + 1)}>
                    Next {PER_PAGE}
                  </Button>
                </>
              )}
              <Button size="sm" disabled={!labels} onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print these {labels ? labels.length : ""} labels
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:p-0">
        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>
        ) : !batch || !labels ? (
          <div className="grid place-items-center py-24">
            <Spinner className="h-6 w-6 text-brand-accent" />
          </div>
        ) : (
          <>
            <div className="mb-4 print:hidden">
              <h1 className="text-lg font-semibold">{batch.productName || batch.barcode}</h1>
              <p className="text-sm text-slate-400">
                {[batch.label, batch.lot && `Lot ${batch.lot}`].filter(Boolean).join(" · ") || "Batch"} · Each label is about 36 × 46 mm. Print at 100% (no &ldquo;fit to page&rdquo;) and check one label scans before printing them all.
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 text-black print:rounded-none print:p-0">
              <div className="grid grid-cols-[repeat(auto-fill,36mm)] justify-center gap-[3mm]">
                {labels.map((l) => (
                  <div key={l.serial} className="label flex h-[46mm] w-[36mm] flex-col items-center justify-center rounded-[1.5mm] border border-dashed border-black/25 p-[2mm] print:border-black/15">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.qr} alt={`QR code ${l.sequence}`} className="h-[28mm] w-[28mm]" />
                    <p className="mt-[1.5mm] text-center text-[6.5pt] font-semibold leading-tight">Scan to check it&apos;s genuine</p>
                    <p className="mt-[0.5mm] text-center font-mono text-[5.5pt] leading-tight text-black/60">
                      {l.sequence} · {l.serial}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
