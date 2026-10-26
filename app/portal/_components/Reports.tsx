"use client";
import { useEffect, useState } from "react";
import { brandApi } from "@/lib/brandApi";
import { safeHttpUrl } from "@/lib/utils";
import { Button, Card, EmptyState } from "../../admin/_components/ui";
import { day, Loading, Pill, SectionHead, tone, usePortal } from "./shared";
import { RefreshCw } from "lucide-react";

// Problems shoppers reported about the brand's products (fakes, expired,
// damaged or tampered packs…), with their photos. Read-only: CheckTag's
// moderators handle the reports; who sent them is never shown.

interface ShopperReport {
  id: string;
  barcode: string | null;
  productName: string | null;
  reason: string;
  details: string | null;
  images: string[] | null;
  status: string;
  createdAt: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Not reviewed yet", cls: tone.warn },
  APPROVED: { label: "Reviewed by CheckTag", cls: tone.good },
  REJECTED: { label: "Dismissed by CheckTag", cls: tone.muted },
};

/** "COUNTERFEIT_REPORTED" / "REPORT" → readable. */
function reasonLabel(r: string) {
  if (!r || r.toUpperCase() === "REPORT") return "Problem report";
  const t = r.replace(/[_-]+/g, " ").trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const PAGE = 25;

export default function Reports() {
  const { notify } = usePortal();
  const [items, setItems] = useState<ShopperReport[] | null>(null);
  const [next, setNext] = useState<number | null>(null);
  const [more, setMore] = useState(false);

  async function load(offset = 0) {
    if (offset === 0) setItems(null);
    else setMore(true);
    try {
      const r = await brandApi<{ items: ShopperReport[]; nextOffset: number | null }>(`/brand/reports?limit=${PAGE}&offset=${offset}`);
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
  }, []);

  return (
    <div>
      <SectionHead
        title="Shopper reports"
        actions={
          <Button variant="outline" size="sm" onClick={() => load(0)}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      >
        Problems shoppers reported about your products in the CheckTag app, such as a suspected fake or an expired pack. CheckTag&apos;s moderators review them; you see what was reported, never who sent it.
      </SectionHead>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label="No reports about your products." />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => {
            const images = (r.images || []).map(safeHttpUrl).filter((u): u is string => !!u);
            const s = STATUS[r.status.toUpperCase()] || { label: r.status, cls: tone.muted };
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <Pill cls={tone.bad}>{reasonLabel(r.reason)}</Pill>
                  <Pill cls={s.cls}>{s.label}</Pill>
                  <span>{day(r.createdAt)}</span>
                </div>
                <p className="mt-2 font-medium text-slate-100">{r.productName || r.barcode || "Product"}</p>
                {r.barcode && <p className="font-mono text-xs text-slate-500">{r.barcode}</p>}
                {r.details && <p className="mt-2 whitespace-pre-line text-sm text-slate-300 [overflow-wrap:anywhere]">{r.details}</p>}
                {images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {images.map((src, i) => (
                      <a key={i} href={src} target="_blank" rel="noreferrer" title="Open the photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Photo ${i + 1} from the report`} className="h-20 w-20 rounded-lg border border-white/10 object-cover transition hover:opacity-80" />
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
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
