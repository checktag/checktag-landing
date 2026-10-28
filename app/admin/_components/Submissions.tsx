"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { safeHttpUrl } from "@/lib/utils";
import { Badge, Button, Card, EmptyState, Filters, Pager, SearchBox, Select, Spinner, useAdminList, useDebounced } from "./ui";
import { useProducts } from "./useProducts";
import { isLabelScan, LabelScanReview, LabelScanTag } from "./LabelScanReview";
import { ChangePreview } from "./ChangePreview";
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
  submitterLevel?: number | null;
  submitterTitle?: string | null;
  /** Level 6+: the "Faster checks" perk puts them first in the queue. */
  trusted?: boolean;
  /** Community reviewers' votes so far (see the Reviewers tab). */
  consensus?: { rule: string; status: string; approve: number; reject: number } | null;
}

export default function Submissions({
  notify,
}: {
  notify: (m: string, k: "success" | "error") => void;
}) {
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [type, setType] = useState<"ALL" | "ADD" | "UPDATE" | "REPORT">("ALL");
  const [sort, setSort] = useState<"trusted" | "newest" | "oldest">("trusted");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const list = useAdminList<Report>("/admin/reports", { status, type, sort, q }, (d) => d.reports, notify);
  const rows = list.items;
  const loading = list.loading;
  const load = list.reload;
  const [busy, setBusy] = useState<string | null>(null);
  // Label scans carry only the fields — look up the product they're for.
  const products = useProducts(
    rows.filter((r) => isLabelScan(r.payload)).map((r) => r.barcode),
  );

  async function act(id: string, action: "approve" | "reject") {
    // Reviewers normally decide these by agreement; deciding here skips them.
    const c = rows.find((x) => x.id === id)?.consensus;
    if (c?.status === "open" && !window.confirm(
      `Reviewers haven't decided this yet (${c.approve} approve, ${c.reject} reject so far). ${action === "approve" ? "Approve" : "Reject"} it now and skip them?`,
    )) return;
    setBusy(id + action);
    try {
      await api(`/admin/reports/${id}/${action}`, { method: "POST" });
      if (status === "PENDING") {
        list.setItems((r) => r.filter((x) => x.id !== id));
        list.setTotal((t) => Math.max(0, t - 1));
      } else {
        list.reload();
      }
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
          <h2 className="text-lg font-semibold">Submissions</h2>
          <p className="text-sm text-slate-400">
            Reviewers decide these by agreement (see Reviewers). You can still approve or reject directly.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Filters>
        <SearchBox value={search} onChange={setSearch} placeholder="Barcode, product name or details" />
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "ALL", label: "All" },
          ]}
        />
        <Select
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: "ALL", label: "All" },
            { value: "ADD", label: "New product" },
            { value: "UPDATE", label: "Improve details" },
            { value: "REPORT", label: "Report" },
          ]}
        />
        <Select
          label="Sort"
          value={sort}
          onChange={setSort}
          options={[
            { value: "trusted", label: "Trusted first" },
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
          ]}
        />
      </Filters>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-brand-accent" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState label={status === "PENDING" && !q && type === "ALL" ? "No pending submissions. All caught up." : "Nothing matches these filters."} />
        </Card>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {rows.map((r) => {
            const labelScan = isLabelScan(r.payload);
            const product = r.barcode ? products[r.barcode] : undefined;
            const images = (r.images || [])
              .map(safeHttpUrl)
              .filter((u): u is string => !!u);
            return (
              <Card key={r.id} className="min-w-0 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-[16rem] flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge value={r.reason} />
                      {labelScan && r.payload && (
                        <LabelScanTag payload={r.payload} />
                      )}
                      {r.trusted && (
                        <span
                          className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300"
                          title="Level 6 or higher: their submissions are checked first"
                        >
                          Trusted contributor
                        </span>
                      )}
                      {typeof r.rewardPoints === "number" &&
                        r.rewardPoints > 0 && (
                          <span className="text-xs font-semibold text-brand-sky">
                            +{r.rewardPoints} pts on approval
                          </span>
                        )}
                      <span className="text-xs text-slate-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-semibold">
                      {r.payload?.name ||
                        product?.name ||
                        r.barcode ||
                        r.unitId ||
                        "Product"}
                    </p>
                    {(r.payload?.brand || product?.brand) && (
                      <p className="text-sm text-slate-400">
                        {r.payload?.brand || product?.brand}
                      </p>
                    )}
                    {r.details && !labelScan && (
                      <p className="mt-1 text-sm text-slate-300 [overflow-wrap:anywhere]">{r.details}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {r.barcode && <span>Barcode: {r.barcode}</span>}
                      {r.payload?.category && (
                        <span>Category: {r.payload.category}</span>
                      )}
                      {r.consensus && (
                        <span className={r.consensus.status === "escalated" ? "text-amber-300" : undefined}>
                          Reviewers ({r.consensus.rule.replace("/", " of ")}): {r.consensus.approve} approve · {r.consensus.reject} reject
                          {r.consensus.status === "escalated" ? " · no agreement, needs you" : r.consensus.status === "open" ? " · in progress" : ""}
                        </span>
                      )}
                      {r.userId && (
                        <span>
                          By: {r.userId.slice(0, 8)}…
                          {r.submitterLevel ? ` · Level ${r.submitterLevel}${r.submitterTitle ? ` ${r.submitterTitle}` : ""}` : ""}
                        </span>
                      )}
                    </div>
                    {!labelScan && r.reason.toUpperCase() === "REPORT" && images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {images.map((src, i) => (
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

                  {r.status !== "PENDING" ? (
                    <Badge value={r.status} />
                  ) : (
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
                  )}
                </div>
                {labelScan && r.payload && (
                  <LabelScanReview payload={r.payload} product={product} />
                )}
                {!labelScan && ["ADD", "UPDATE"].includes(r.reason.toUpperCase()) && <ChangePreview reportId={r.id} />}
              </Card>
            );
          })}
        </div>
      )}
      <Pager offset={list.offset} pageSize={list.pageSize} total={list.total} onChange={list.setOffset} />
    </div>
  );
}
