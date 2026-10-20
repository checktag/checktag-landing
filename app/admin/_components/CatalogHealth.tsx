"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Button, Card, Spinner } from "./ui";
import { EyeOff, Sparkles } from "lucide-react";

// Keeps checktag.io's public product pages (and search / Telegram sharing)
// accurate. "Check catalogue" previews fixes — products that shared one record
// with unrelated products, names that don't match their own data, wrong
// categories, test data — and nothing changes until you apply. Hidden products
// still scan normally in the apps; they're just kept off public pages.

interface Change {
  barcode: string;
  from: { name: string; brand: string | null; category: string | null; hidden: boolean };
  to: { name: string; brand: string | null; category: string | null; hidden: boolean };
  reasons: string[];
  hideReason?: string;
}
interface Hidden {
  barcode: string;
  name: string;
  reason: string | null;
}

const field =
  "rounded-xl border border-white/10 bg-brand-raised px-3 py-2 text-sm outline-none placeholder:text-slate-600 focus:border-brand-accent/50";

export default function CatalogHealth({ notify }: { notify: (m: string, k: "success" | "error") => void }) {
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Hidden[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [barcode, setBarcode] = useState("");
  const [reason, setReason] = useState("");

  async function loadHidden() {
    try {
      setHidden((await api<{ items: Hidden[] }>("/admin/catalog/hidden")).items);
    } catch (e: any) {
      notify(e.message, "error");
    }
  }
  useEffect(() => {
    loadHidden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function check() {
    setBusy("check");
    try {
      const c = (await api<{ changes: Change[] }>("/admin/catalog/cleanup")).changes;
      setChanges(c);
      setPicked(new Set(c.map((x) => x.barcode)));
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function apply() {
    if (!picked.size || !confirm(`Apply ${picked.size} change${picked.size === 1 ? "" : "s"} to the catalogue? Names update everywhere — the apps, the website and the bots.`)) return;
    setBusy("apply");
    try {
      const r = await api<{ applied: number }>("/admin/catalog/cleanup", { method: "POST", body: JSON.stringify({ barcodes: [...picked] }) });
      notify(`${r.applied} product${r.applied === 1 ? "" : "s"} fixed. Website pages refresh within the hour.`, "success");
      await Promise.all([check(), loadHidden()]);
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function setVisibility(code: string, hide: boolean) {
    setBusy(`vis-${code}`);
    try {
      await api("/admin/catalog/visibility", { method: "POST", body: JSON.stringify({ barcode: code, hidden: hide, reason: reason.trim() || undefined }) });
      notify(hide ? "Hidden from public pages" : "Shown on public pages again", "success");
      if (hide) {
        setBarcode("");
        setReason("");
      }
      loadHidden();
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const toggle = (b: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(b)) n.delete(b);
      else n.add(b);
      return n;
    });

  return (
    <div className="mb-8 space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-brand-sky" />
            <div>
              <h3 className="font-semibold">Catalogue clean-up</h3>
              <p className="text-sm text-slate-400">Finds wrong names, mixed-up records and products that shouldn&apos;t be public. Nothing changes until you apply.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" loading={busy === "check"} onClick={check}>
            Check catalogue
          </Button>
        </div>

        {changes && (
          <div className="mt-4">
            {changes.length === 0 ? (
              <p className="text-sm text-emerald-300">The catalogue looks clean — nothing to fix.</p>
            ) : (
              <>
                <div className="max-h-[420px] overflow-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-900 text-left text-xs text-slate-400">
                      <tr>
                        <th className="w-8 px-3 py-2" />
                        <th className="px-3 py-2">Barcode</th>
                        <th className="px-3 py-2">Now</th>
                        <th className="px-3 py-2">After</th>
                        <th className="px-3 py-2">Why</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {changes.map((c) => (
                        <tr key={c.barcode} className="align-top">
                          <td className="px-3 py-2">
                            <input type="checkbox" className="h-4 w-4 accent-brand-accent" checked={picked.has(c.barcode)} onChange={() => toggle(c.barcode)} aria-label={`Include ${c.barcode}`} />
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-400">{c.barcode}</td>
                          <td className="px-3 py-2 text-slate-400">
                            {c.from.name}
                            {c.from.category && <div className="text-xs text-slate-500">{c.from.category}</div>}
                          </td>
                          <td className="px-3 py-2 text-slate-100">
                            {c.to.name}
                            {c.to.category !== c.from.category && <div className="text-xs text-brand-sky">{c.to.category ?? "no category"}</div>}
                            {c.to.hidden && !c.from.hidden && (
                              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
                                <EyeOff className="h-3 w-3" /> hidden: {c.hideReason}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-400">{c.reasons.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button size="sm" disabled={!picked.size} loading={busy === "apply"} onClick={apply}>
                    Apply {picked.size} change{picked.size === 1 ? "" : "s"}
                  </Button>
                  <span className="text-xs text-slate-500">Untick anything you disagree with.</span>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-start gap-3">
          <EyeOff className="mt-0.5 h-5 w-5 text-amber-300" />
          <div>
            <h3 className="font-semibold">Hidden from public pages</h3>
            <p className="text-sm text-slate-400">Kept off checktag.io, search and Telegram sharing. People can still scan them in the apps.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input className={`${field} w-44 font-mono`} inputMode="numeric" placeholder="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ""))} />
          <input className={`${field} min-w-0 flex-1`} placeholder="Reason (optional)" maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button variant="outline" size="sm" disabled={!/^\d{8,14}$/.test(barcode)} loading={busy === `vis-${barcode}`} onClick={() => setVisibility(barcode, true)}>
            Hide
          </Button>
        </div>
        {!hidden ? (
          <div className="grid place-items-center py-6">
            <Spinner className="h-5 w-5 text-brand-accent" />
          </div>
        ) : hidden.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing hidden.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5 text-sm">
            {hidden.map((h) => (
              <li key={h.barcode} className="flex items-center gap-3 py-2">
                <span className="w-32 shrink-0 font-mono text-xs text-slate-400">{h.barcode}</span>
                <span className="min-w-0 flex-1 truncate">
                  {h.name}
                  {h.reason && <span className="text-slate-500"> — {h.reason}</span>}
                </span>
                <Button variant="ghost" size="sm" loading={busy === `vis-${h.barcode}`} onClick={() => setVisibility(h.barcode, false)}>
                  Show again
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
