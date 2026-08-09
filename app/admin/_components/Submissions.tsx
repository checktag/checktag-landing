"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Badge, Button, Card, EmptyState, Spinner } from "./ui";
import { Check, X, RefreshCw, ImageIcon } from "lucide-react";

interface Report {
  id: string;
  userId: string | null;
  barcode: string | null;
  unitId: string | null;
  reason: string;
  details: string | null;
  images: string[] | null;
  payload: Record<string, any> | null;
  rewardPoints: number | null;
  status: string;
  createdAt: string;
}

export default function Submissions({
  notify,
}: {
  notify: (m: string, k: "success" | "error") => void;
}) {
  const [rows, setRows] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ reports: Report[] }>(
        "/admin/reports?status=PENDING",
      );
      setRows(data.reports || []);
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id + action);
    try {
      await api(`/admin/reports/${id}/${action}`, { method: "POST" });
      setRows((r) => r.filter((x) => x.id !== id));
      notify(
        action === "approve" ? "Approved & rewarded" : "Submission rejected",
        "success",
      );
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pending submissions</h2>
          <p className="text-sm text-slate-400">
            Approve to apply the change & pay the reward, or reject.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-cyan-400" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState label="No pending submissions. All caught up." />
        </Card>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge value={r.reason} />
                    {typeof r.rewardPoints === "number" &&
                      r.rewardPoints > 0 && (
                        <span className="text-xs font-semibold text-cyan-300">
                          +{r.rewardPoints} pts on approval
                        </span>
                      )}
                    <span className="text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-semibold">
                    {r.payload?.name || r.barcode || r.unitId || "Product"}
                  </p>
                  {r.payload?.brand && (
                    <p className="text-sm text-slate-400">{r.payload.brand}</p>
                  )}
                  {r.details && (
                    <p className="mt-1 text-sm text-slate-300">{r.details}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {r.barcode && <span>Barcode: {r.barcode}</span>}
                    {r.payload?.category && (
                      <span>Category: {r.payload.category}</span>
                    )}
                    {r.userId && <span>By: {r.userId.slice(0, 8)}…</span>}
                  </div>
                  {r.images && r.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.images.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <a
                          key={i}
                          href={src}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative"
                        >
                          <img
                            src={src}
                            alt="evidence"
                            className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                          />
                          <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/40 opacity-0 transition group-hover:opacity-100">
                            <ImageIcon className="h-4 w-4" />
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    loading={busy === r.id + "approve"}
                    onClick={() => act(r.id, "approve")}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={busy === r.id + "reject"}
                    onClick={() => act(r.id, "reject")}
                  >
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
