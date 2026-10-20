"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Badge, Button, Card, EmptyState, Spinner } from "./ui";
import {
  RefreshCw,
  Layers,
  Download,
  Copy,
  Wallet,
  AlertTriangle,
} from "lucide-react";

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  destination: string;
  status: string;
  txHash: string | null;
  createdAt: string;
}

interface BatchResult {
  batchId: string;
  count: number;
  totalAmount: number;
  multisig: string;
  safeBatch: any;
}

export default function Payouts({
  notify,
}: {
  notify: (m: string, k: "success" | "error") => void;
}) {
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [multisig, setMultisig] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchResult | null>(null);
  const [txHash, setTxHash] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await api<{
        withdrawals: Withdrawal[];
        totalAmount: number;
        multisig: string;
      }>("/admin/ctag/pending");
      setRows(data.withdrawals || []);
      setTotal(data.totalAmount || 0);
      setMultisig(data.multisig || "");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createBatch() {
    setBusy("batch");
    try {
      const data = await api<BatchResult>("/admin/ctag/batch", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setBatch(data);
      notify(`Batched ${data.count} withdrawals`, "success");
      load();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  function downloadBatch() {
    if (!batch) return;
    const blob = new Blob([JSON.stringify(batch.safeBatch, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ctag-batch-${batch.batchId.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function markSubmitted() {
    if (!batch) return;
    setBusy("submit");
    try {
      await api(`/admin/ctag/batch/${batch.batchId}/submitted`, {
        method: "POST",
        body: JSON.stringify({ txHash: txHash.trim() }),
      });
      notify("Marked submitted", "success");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function markConfirmed() {
    if (!batch) return;
    setBusy("confirm");
    try {
      await api(`/admin/ctag/batch/${batch.batchId}/confirmed`, {
        method: "POST",
      });
      notify("Batch confirmed", "success");
      setBatch(null);
      setTxHash("");
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function fail(id: string) {
    setBusy(id);
    try {
      await api(`/admin/ctag/withdrawal/${id}/fail`, { method: "POST" });
      setRows((r) => r.filter((x) => x.id !== id));
      notify("Withdrawal failed & CTAG refunded", "success");
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
          <h2 className="text-lg font-semibold">CTAG on-chain payouts</h2>
          <p className="text-sm text-slate-400">
            Batch pending withdrawals → execute with the multisig → record the tx.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Summary + batch action */}
      <Card className="mb-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Pending
              </p>
              <p className="text-2xl font-bold">{rows.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total CTAG
              </p>
              <p className="text-2xl font-bold text-brand-accent">
                {total.toLocaleString()}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Multisig
              </p>
              <p className="flex items-center gap-1.5 font-mono text-sm text-slate-300">
                <Wallet className="h-3.5 w-3.5 text-slate-500" />
                {multisig
                  ? `${multisig.slice(0, 8)}…${multisig.slice(-6)}`
                  : "not set"}
              </p>
            </div>
          </div>
          <Button
            loading={busy === "batch"}
            disabled={rows.length === 0}
            onClick={createBatch}
          >
            <Layers className="h-4 w-4" /> Create batch
          </Button>
        </div>
      </Card>

      {/* Active batch panel */}
      {batch && (
        <Card className="mb-5 border-brand-accent/20 bg-brand-accent/[0.04] p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-brand-cyan-soft">
                Batch ready · {batch.count} transfers · {batch.totalAmount} CTAG
              </p>
              <p className="font-mono text-xs text-slate-400">
                {batch.batchId}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadBatch}>
                <Download className="h-4 w-4" /> Safe JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(batch.safeBatch),
                  );
                  notify("Copied batch JSON", "success");
                }}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </div>
          <ol className="mb-4 list-inside list-decimal space-y-1 text-sm text-slate-300">
            <li>Download the Safe JSON and import it in the Safe Transaction Builder.</li>
            <li>Multisig signers review & execute the batch on BSC.</li>
            <li>Paste the transaction hash below and mark it submitted, then confirmed.</li>
          </ol>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x… transaction hash"
              className="min-w-[16rem] flex-1 rounded-xl border border-white/10 bg-brand-raised px-3 py-2.5 font-mono text-sm outline-none focus:border-brand-accent/50"
            />
            <Button
              size="sm"
              variant="outline"
              loading={busy === "submit"}
              disabled={!/^0x[a-fA-F0-9]{64}$/.test(txHash.trim())}
              onClick={markSubmitted}
            >
              Mark submitted
            </Button>
            <Button
              size="sm"
              variant="success"
              loading={busy === "confirm"}
              onClick={markConfirmed}
            >
              Mark confirmed
            </Button>
          </div>
        </Card>
      )}

      {/* Pending list */}
      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-brand-accent" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState label="No pending on-chain withdrawals." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Destination</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Requested</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 font-semibold text-brand-sky">
                      {w.amount.toLocaleString()} CTAG
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-300">
                      {w.destination.slice(0, 10)}…{w.destination.slice(-8)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {w.userId.slice(0, 8)}…
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <Badge value={w.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={busy === w.id}
                        onClick={() => fail(w.id)}
                        className="text-rose-300 hover:bg-rose-500/10"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" /> Fail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
