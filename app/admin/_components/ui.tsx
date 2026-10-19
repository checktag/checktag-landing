"use client";
import { cn } from "@/lib/utils";
import { api } from "@/lib/adminApi";
import { Loader2 } from "lucide-react";
import React from "react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin", className)} />;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md";
  loading?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_4px_20px_-4px_rgba(34,174,209,0.5)]",
    success: "bg-emerald-500 text-white hover:bg-emerald-400",
    danger: "bg-rose-500/90 text-white hover:bg-rose-500",
    outline:
      "border border-white/15 text-slate-200 hover:bg-white/5 hover:border-white/25",
    ghost: "text-slate-300 hover:bg-white/5",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm",
        variants[variant],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  PENDING: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  BATCHED: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  SUBMITTED: "bg-indigo-400/10 text-indigo-300 border-indigo-400/20",
  CONFIRMED: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  APPROVED: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  REJECTED: "bg-rose-400/10 text-rose-300 border-rose-400/20",
  FAILED: "bg-rose-400/10 text-rose-300 border-rose-400/20",
  ADD: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  UPDATE: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  REPORT: "bg-slate-400/10 text-slate-300 border-slate-400/20",
};

export function Badge({ value }: { value: string }) {
  const v = (value || "").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        badgeStyles[v] || "bg-slate-400/10 text-slate-300 border-slate-400/20",
      )}
    >
      {v}
    </span>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-white/5 grid place-items-center text-2xl">
        ✓
      </div>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

export function Toast({
  message,
  kind,
  onClose,
}: {
  message: string;
  kind: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl",
        kind === "success"
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          : "border-rose-400/30 bg-rose-500/10 text-rose-200",
      )}
      onClick={onClose}
      role="status"
    >
      {message}
    </div>
  );
}

// ------------------------------------------------------------------ lists
// Paged, filterable admin lists. Every admin list endpoint takes ?limit and
// ?offset and answers with its rows plus `total`.

export const PAGE_SIZE = 25;

/** [value], but only after it stops changing for [ms] — for search boxes. */
export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type Params = Record<string, string | number | boolean | undefined | null>;

/**
 * Loads one page of [path] with [params]. Changing a filter goes back to page
 * one (in the same render, so it fetches once).
 */
export function useAdminList<T>(
  path: string,
  params: Params,
  pick: (data: any) => T[],
  notify: (m: string, k: "success" | "error") => void,
  pageSize = PAGE_SIZE,
) {
  const key = JSON.stringify(params);
  const [page, setPage] = React.useState({ key, offset: 0 });
  const offset = page.key === key ? page.offset : 0;
  const [items, setItems] = React.useState<T[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const pickRef = React.useRef(pick);
  pickRef.current = pick;
  const notifyRef = React.useRef(notify);
  notifyRef.current = notify;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(JSON.parse(key) as Params)) {
        if (v !== undefined && v !== null && v !== "" && v !== false) qs.set(k, String(v));
      }
      qs.set("limit", String(pageSize));
      qs.set("offset", String(offset));
      const data = await api<any>(`${path}?${qs}`);
      const rows = pickRef.current(data) || [];
      setItems(rows);
      setTotal(Number(data?.total ?? rows.length));
    } catch (e: any) {
      notifyRef.current(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [path, key, offset, pageSize]);

  React.useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    setItems,
    total,
    setTotal,
    loading,
    offset,
    pageSize,
    setOffset: (o: number) => setPage({ key, offset: Math.max(0, o) }),
    reload: load,
  };
}

/** "1–25 of 132" with Previous / Next. Hidden when everything fits on one page. */
export function Pager({ offset, pageSize, total, onChange }: { offset: number; pageSize: number; total: number; onChange: (offset: number) => void }) {
  if (total <= pageSize && offset === 0) return total ? <p className="mt-4 text-xs text-slate-500">{total} in total</p> : null;
  const from = total ? offset + 1 : 0;
  const to = Math.min(offset + pageSize, total);
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
      <span className="tabular-nums">
        {from}–{to} of {total}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => onChange(offset - pageSize)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={to >= total} onClick={() => onChange(offset + pageSize)}>
          Next
        </Button>
      </div>
    </div>
  );
}

const control =
  "rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400/50";

/** A row of filters above a list. */
export function Filters({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>;
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={cn(control, "min-w-0 flex-1 sm:max-w-xs")}
    />
  );
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={control}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A filter that's on or off, shown as a pill. */
export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        on ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200" : "border-white/10 text-slate-400 hover:text-slate-200",
      )}
    >
      {label}
    </button>
  );
}
