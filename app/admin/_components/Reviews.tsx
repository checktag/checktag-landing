"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Badge, Button, Card, EmptyState, Spinner } from "./ui";
import { RefreshCw, Check, X, ShieldAlert } from "lucide-react";

interface Review {
  id: string;
  userId: string;
  email: string | null;
  payoutName: string | null;
  bank: string | null;
  last4: string | null;
  kycStatus: string | null;
  amountCents: number;
  currency: string;
  status: string;
  flags: string[] | null;
  riskScore: number;
  sanctionsClear: boolean;
  createdAt: string;
}

function riskColor(r: number) {
  if (r >= 70) return "text-rose-300";
  if (r >= 40) return "text-amber-300";
  return "text-emerald-300";
}

export default function Reviews({
  notify,
}: {
  notify: (m: string, k: "success" | "error") => void;
}) {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ reviews: Review[] }>(
        "/admin/payout-reviews?status=PENDING",
      );
      setRows(data.reviews || []);
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
      await api(`/admin/payout-reviews/${id}/${action}`, { method: "POST" });
      setRows((r) => r.filter((x) => x.id !== id));
      notify(action === "approve" ? "Approved & paid" : "Rejected & refunded", "success");
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
          <h2 className="text-lg font-semibold">Withdrawals under review</h2>
          <p className="text-sm text-slate-400">
            Held by AML monitoring. Approve to pay, or reject to refund the user.
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
          <EmptyState label="No withdrawals awaiting review." />
        </Card>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-cyan-300">
                      ${(r.amountCents / 100).toFixed(2)}
                    </span>
                    <Badge value={r.kycStatus === "verified" ? "VERIFIED" : "UNVERIFIED"} />
                    <span className={"text-xs font-semibold " + riskColor(r.riskScore)}>
                      risk {r.riskScore}
                    </span>
                    {!r.sanctionsClear && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-300">
                        <ShieldAlert className="h-3.5 w-3.5" /> sanctions
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {r.payoutName || "—"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.bank || "Bank"} ••••{r.last4 || "----"} · {r.email || r.userId.slice(0, 8)}
                  </p>
                  {r.flags && r.flags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.flags.map((f) => (
                        <span
                          key={f}
                          className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-200"
                        >
                          {f.replace(/_/g, " ")}
                        </span>
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
                    <Check className="h-4 w-4" /> Approve & pay
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
