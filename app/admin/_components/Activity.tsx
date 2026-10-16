"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, signOutEverywhere } from "@/lib/adminApi";
import { Button, Card, EmptyState, Spinner } from "./ui";
import { LogOut, RefreshCw } from "lucide-react";

interface Entry {
  id: string;
  action: string;
  target: string | null;
  details: { body?: Record<string, unknown> } | null;
  ip: string | null;
  createdAt: string;
  adminEmail: string | null;
}

// Plain-language names for what admins did; anything unknown shows as recorded.
const NAMES: [RegExp, string][] = [
  [/^admin\.login$/, "Signed in"],
  [/^admin\.login\.backup_code$/, "Signed in with a backup code"],
  [/^admin\.2fa\.enabled$/, "Turned on two-step sign-in"],
  [/^admin\.logout_all$/, "Signed out on every device"],
  [/reports\/:id\/approve$/, "Approved a submission"],
  [/reports\/:id\/reject$/, "Rejected a submission"],
  [/payout-reviews\/:id\/approve$/, "Approved a held payout"],
  [/payout-reviews\/:id\/reject$/, "Rejected a held payout"],
  [/kyc\/:userId\/override$/, "Changed an identity check"],
  [/products\/vet$/, "Vetted a product"],
  [/ctag\/batch$/, "Built a CTAG payout batch"],
  [/ctag\/batch\/:id\/submitted$/, "Marked a CTAG batch submitted"],
  [/ctag\/batch\/:id\/confirmed$/, "Marked a CTAG batch confirmed"],
  [/ctag\/withdrawal\/:id\/fail$/, "Failed a CTAG withdrawal (refunded)"],
];
const describe = (a: string) => NAMES.find(([re]) => re.test(a))?.[1] ?? a;

export default function Activity({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const router = useRouter();
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ entries: Entry[] }>("/admin/audit?limit=300");
      setRows(data.entries || []);
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function everywhere() {
    if (!confirm("Sign out of the admin dashboard on every device, including this one?")) return;
    await signOutEverywhere();
    router.replace("/admin/login");
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Activity</h2>
          <p className="text-sm text-slate-400">Every admin sign-in and change: who, what and when.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="danger" size="sm" onClick={everywhere}>
            <LogOut className="h-4 w-4" /> Sign out everywhere
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-cyan-400" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState label="No admin activity yet." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Admin</th>
                  <th className="px-5 py-3 font-medium">What</th>
                  <th className="px-5 py-3 font-medium">Record</th>
                  <th className="px-5 py-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 align-top last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-400">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-3 text-slate-300">{r.adminEmail ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-100">{describe(r.action)}</div>
                      {r.details?.body && Object.keys(r.details.body).length > 0 && (
                        <div className="mt-1 max-w-md truncate font-mono text-xs text-slate-500" title={JSON.stringify(r.details.body)}>
                          {JSON.stringify(r.details.body)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.target ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{r.ip ?? "—"}</td>
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
