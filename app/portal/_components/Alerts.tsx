"use client";
import { useEffect, useState } from "react";
import { brandApi } from "@/lib/brandApi";
import { Button, Card, EmptyState, Filters, Select } from "../../admin/_components/ui";
import { countryName, day, Loading, num, Pill, ReadOnlyNote, SectionHead, tone, usePortal, when } from "./shared";
import { Eye, EyeOff, RefreshCw, ShieldAlert } from "lucide-react";

// Clone alerts: a CheckTag code that looks copied. Detection is country-level
// only (CheckTag never records a precise location): a code seen in two or more
// countries, by more people than its batch allows, or scanned far more often
// than one pack would be; and fake codes made to look like the brand's.

interface Alert {
  id: string;
  unitId: string;
  batchId: string | null;
  barcode: string | null;
  productName: string | null;
  reason: "countries" | "scanners" | "volume" | "forged" | string;
  details: { countries?: string[]; scanners?: number; scans?: number; firstAt?: string; lastAt?: string; serial?: string; lot?: string | null } | null;
  status: "open" | "dismissed";
  createdAt: string;
  updatedAt: string;
}

type Status = "open" | "dismissed" | "all";

/** The alert's reason, in plain words. */
function explain(a: Alert): { title: string; more: string } {
  const d = a.details || {};
  const countries = d.countries || [];
  switch (a.reason) {
    case "countries":
      return {
        title: `Seen in ${countries.length} countries: ${countries.join(", ")}`,
        more: `One pack is normally only in one country. This code was scanned in ${countries.map(countryName).join(", ")}, so it may have been copied onto other packs.`,
      };
    case "scanners":
      return {
        title: "Scanned by more people than one pack normally is",
        more: `${num(d.scanners)} different signed-in people scanned this code, more than its batch allows.`,
      };
    case "volume":
      return {
        title: `Scanned ${num(d.scans)} times`,
        more: "That's far more often than one pack is normally scanned. The code may have been copied.",
      };
    case "forged":
      return {
        title: "A fake code using your brand's key was scanned",
        more: "Someone scanned a code that looks like one of yours but wasn't made by you. Shoppers who scan it are told it may be counterfeit.",
      };
    default:
      return { title: a.reason, more: "" };
  }
}

export default function Alerts() {
  const { notify, canEdit, go } = usePortal();
  const [status, setStatus] = useState<Status>("open");
  const [items, setItems] = useState<Alert[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(s: Status = status) {
    setItems(null);
    try {
      setItems((await brandApi<{ items: Alert[] }>(`/brand/alerts?status=${s}`)).items);
    } catch (e: any) {
      notify(e.message, "error");
      setItems([]);
    }
  }
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function act(a: Alert, what: "dismiss" | "reopen") {
    setBusy(a.id);
    try {
      await brandApi(`/brand/alerts/${encodeURIComponent(a.id)}/${what}`, { method: "POST" });
      notify(what === "dismiss" ? "Alert dismissed." : "Alert reopened.", "success");
      if (status === "all") setItems((l) => (l || []).map((x) => (x.id === a.id ? { ...x, status: what === "dismiss" ? "dismissed" : "open" } : x)));
      else setItems((l) => (l || []).filter((x) => x.id !== a.id));
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <SectionHead
        title="Clone alerts"
        actions={
          <Button variant="outline" size="sm" onClick={() => load()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      >
        Codes that look copied. Shoppers who scan one are told to check the pack and report it. CheckTag only uses the country of each scan, never a precise location.
      </SectionHead>

      {!canEdit && <ReadOnlyNote />}

      <Filters>
        <Select<Status>
          label="Show"
          value={status}
          onChange={setStatus}
          options={[
            { value: "open", label: "Open" },
            { value: "dismissed", label: "Dismissed" },
            { value: "all", label: "All" },
          ]}
        />
      </Filters>

      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState label={status === "open" ? "No open alerts. None of your codes look copied." : "Nothing here."} />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const e = explain(a);
            const d = a.details || {};
            const forged = a.reason === "forged";
            return (
              <Card key={a.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <Pill cls={forged ? tone.bad : tone.warn}>
                        <ShieldAlert className="mr-1 h-3.5 w-3.5" /> {forged ? "Fake code" : "Possible copy"}
                      </Pill>
                      {a.status === "dismissed" && <Pill cls={tone.muted}>Dismissed</Pill>}
                      <span>Last scan {when(d.lastAt || a.updatedAt)}</span>
                    </div>
                    <p className="mt-2 font-semibold text-slate-100">{e.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{e.more}</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                      <span>{a.productName || a.barcode || (forged ? "Product unknown (the code is fake)" : "Product")}</span>
                      {d.serial && <span className="font-mono">Serial {d.serial}</span>}
                      {d.lot && <span>Lot {d.lot}</span>}
                      {d.scans != null && <span>{num(d.scans)} scans</span>}
                      {d.firstAt && <span>First scan {day(d.firstAt)}</span>}
                      {!!d.countries?.length && a.reason !== "countries" && <span>Countries: {d.countries.join(", ")}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {a.batchId && (
                      <Button variant="outline" size="sm" onClick={() => go("codes", a.batchId!)}>
                        Open the batch
                      </Button>
                    )}
                    {canEdit &&
                      (a.status === "open" ? (
                        <Button variant="ghost" size="sm" loading={busy === a.id} onClick={() => act(a, "dismiss")} title="You've checked it and it's fine">
                          <EyeOff className="h-4 w-4" /> Dismiss
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" loading={busy === a.id} onClick={() => act(a, "reopen")}>
                          <Eye className="h-4 w-4" /> Reopen
                        </Button>
                      ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
