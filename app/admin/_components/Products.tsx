"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { Button, Card, EmptyState, Spinner } from "./ui";
import { BadgeCheck, RefreshCw } from "lucide-react";

interface Variant {
  id: string;
  familyId: string | null;
  sku: string | null;
  attrs: Record<string, any> | null;
  vetted: boolean;
}

export default function Products({
  notify,
}: {
  notify: (m: string, k: "success" | "error") => void;
}) {
  const [rows, setRows] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ products: Variant[] }>(
        "/admin/products/unvetted",
      );
      setRows(data.products || []);
    } catch (e: any) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function vet(id: string) {
    setBusy(id);
    try {
      await api("/admin/products/vet", {
        method: "POST",
        body: JSON.stringify({ variantId: id, vetted: true }),
      });
      setRows((r) => r.filter((x) => x.id !== id));
      notify("Product vetted — now shows as Genuine", "success");
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
          <h2 className="text-lg font-semibold">Products awaiting vetting</h2>
          <p className="text-sm text-slate-400">
            Only vetted products are surfaced to users as “Genuine”.
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
          <EmptyState label="Nothing awaiting vetting." />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((v) => {
            const attrs = v.attrs || {};
            const img = Array.isArray(attrs.images) ? attrs.images[0] : null;
            return (
              <Card key={v.id} className="flex items-center gap-4 p-4">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg border border-white/10 object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-lg">
                    📦
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {attrs.description || v.sku || v.id}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {attrs.category || "Uncategorised"} · {v.sku}
                  </p>
                </div>
                <Button
                  size="sm"
                  loading={busy === v.id}
                  onClick={() => vet(v.id)}
                >
                  <BadgeCheck className="h-4 w-4" /> Vet
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
