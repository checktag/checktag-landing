"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Badge, Button, Card, EmptyState, Filters, Pager, SearchBox, Spinner, useAdminList, useDebounced } from "./ui";
import { RefreshCw, ShieldCheck, ShieldX } from "lucide-react";

interface KycUser {
  id: string;
  email: string | null;
  legalName: string | null;
  kycStatus: string;
  kycVerifiedName: string | null;
  kycRef: string | null;
  kycVerifiedAt: string | null;
}

const FILTERS = ["verified", "rejected", "unverified"] as const;

export default function Kyc({
  notify,
}: {
  notify: (m: string, k: "success" | "error") => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number] | "">("");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const list = useAdminList<KycUser>("/admin/kyc", { status: filter || undefined, q }, (d) => d.users, notify);
  const rows = list.items;
  const loading = list.loading;
  const load = list.reload;

  async function override(id: string, status: "verified" | "rejected") {
    setBusy(id + status);
    try {
      await api(`/admin/kyc/${id}/override`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      notify(`Marked ${status}`, "success");
      load();
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
          <h2 className="text-lg font-semibold">Identity verification</h2>
          <p className="text-sm text-slate-400">
            NIN name-verification results. Override edge cases manually.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Filters>
        <SearchBox value={search} onChange={setSearch} placeholder="Email or name" />
      </Filters>
      <div className="mb-5 flex gap-1.5">
        {["", ...FILTERS].map((f) => (
          <button
            key={f || "review"}
            onClick={() => setFilter(f as any)}
            className={
              "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition " +
              (filter === f
                ? "bg-gradient-to-r from-brand-navy to-brand-cyan text-white"
                : "bg-white/5 text-slate-400 hover:text-slate-200")
            }
          >
            {f || "verified + rejected"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-brand-accent" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState label="No users in this state." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Account name</th>
                  <th className="px-5 py-3 font-medium">NIN name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Ref</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 font-medium">
                      {u.legalName || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {u.kycVerifiedName || "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {u.email || "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      {u.kycRef || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge value={u.kycStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {u.kycStatus !== "verified" && (
                          <Button
                            variant="success"
                            size="sm"
                            loading={busy === u.id + "verified"}
                            onClick={() => override(u.id, "verified")}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Verify
                          </Button>
                        )}
                        {u.kycStatus !== "rejected" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={busy === u.id + "rejected"}
                            onClick={() => override(u.id, "rejected")}
                            className="text-rose-300 hover:bg-rose-500/10"
                          >
                            <ShieldX className="h-3.5 w-3.5" /> Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Pager offset={list.offset} pageSize={list.pageSize} total={list.total} onChange={list.setOffset} />
    </div>
  );
}
