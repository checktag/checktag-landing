"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/adminApi";
import { safeHttpUrl } from "@/lib/utils";
import { Spinner } from "./ui";

// Before an "add a product" or "improve details" submission is approved: the
// product as it is now next to what approving would write, field by field.
// The server computes it with the same cleaning approval uses.

type Value = string | string[] | Record<string, string> | null | undefined;

interface Preview {
  isNew: boolean;
  changes: { field: string; label: string; before?: Value; after?: Value }[];
  unchanged: string[];
  newPhotos: string[];
  currentPhotos: string[];
}

function Show({ v, muted }: { v: Value; muted?: boolean }) {
  const cls = muted ? "text-slate-500" : "text-slate-100";
  if (v === undefined || v === null || (Array.isArray(v) && !v.length)) return <span className="italic text-slate-600">empty</span>;
  if (Array.isArray(v)) {
    return (
      <ul className={`list-disc space-y-0.5 pl-4 ${cls}`}>
        {v.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    );
  }
  if (typeof v === "object") {
    return (
      <dl className={`space-y-0.5 ${cls}`}>
        {Object.entries(v).map(([k, x]) => (
          <div key={k} className="flex gap-2">
            <dt className="capitalize text-slate-500">{k.replace(/_/g, " ")}</dt>
            <dd>{String(x)}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return <span className={`whitespace-pre-line [overflow-wrap:anywhere] ${cls}`}>{v}</span>;
}

function Photos({ title, urls }: { title: string; urls: string[] }) {
  const safe = urls.map(safeHttpUrl).filter(Boolean) as string[];
  return (
    <div>
      <p className="mb-1.5 text-xs text-slate-500">{title}</p>
      {safe.length ? (
        <div className="flex flex-wrap gap-2">
          {safe.map((src) => (
            <a key={src} href={src} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-20 rounded-lg border border-white/10 bg-white object-contain" />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-slate-600">none</p>
      )}
    </div>
  );
}

export function ChangePreview({ reportId }: { reportId: string }) {
  const [p, setP] = useState<Preview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api<Preview>(`/admin/reports/${encodeURIComponent(reportId)}/preview`).then(
      (d) => alive && setP(d),
      (e) => alive && setErr(e.message),
    );
    return () => {
      alive = false;
    };
  }, [reportId]);

  if (err) return <p className="mt-4 text-sm text-rose-300">Couldn&apos;t load the comparison: {err}</p>;
  if (!p) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <Spinner className="h-4 w-4" /> Loading what changes…
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-brand-ink/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {p.isNew ? "New to CheckTag — everything below will be added" : "What approving changes"}
      </p>
      {p.changes.length === 0 ? (
        <p className="text-sm text-slate-400">No field changes{p.newPhotos.length ? " — only new photos." : "."}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="w-40 pb-2 font-medium" />
                {!p.isNew && <th className="pb-2 pr-4 font-medium">Now</th>}
                <th className="pb-2 font-medium">{p.isNew ? "Will be" : "After approval"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 align-top">
              {p.changes.map((c) => (
                <tr key={c.field}>
                  <th scope="row" className="py-2 pr-3 text-left font-normal text-slate-400">
                    {c.label}
                  </th>
                  {!p.isNew && (
                    <td className="py-2 pr-4">
                      <Show v={c.before} muted />
                    </td>
                  )}
                  <td className="py-2">
                    <div className="rounded-md bg-brand-accent/10 px-2 py-1">
                      <Show v={c.after} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {p.unchanged.length > 0 && <p className="mt-3 text-xs text-slate-500">Same as now: {p.unchanged.join(", ")}.</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {!p.isNew && <Photos title="Photos now" urls={p.currentPhotos} />}
        <Photos title={p.isNew ? "Photos" : "New photos (become the main picture)"} urls={p.newPhotos} />
      </div>
    </div>
  );
}
