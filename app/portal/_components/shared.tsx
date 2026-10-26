"use client";
import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import type { BrandMe } from "@/lib/brandApi";
import { Spinner } from "@/app/admin/_components/ui";

// Pieces every portal section shares. The visual kit (Button, Card, Badge…) is
// the admin dashboard's (app/admin/_components/ui.tsx), so both look the same.

export type Notify = (message: string, kind: "success" | "error") => void;

interface Portal {
  me: BrandMe;
  notify: Notify;
  /** Owners and Admins change things; Viewers only read. */
  canEdit: boolean;
  /** Opens another section (and optionally one item in it), e.g. from an Overview card. */
  go: (tab: string, sub?: string) => void;
}

const Ctx = createContext<Portal | null>(null);
export const PortalProvider = Ctx.Provider;

export function usePortal(): Portal {
  const p = useContext(Ctx);
  if (!p) throw new Error("usePortal outside the portal");
  return p;
}

export const control =
  "rounded-xl border border-white/10 bg-brand-raised px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-brand-accent/50 disabled:opacity-60";
export const field = cn(control, "w-full py-2.5");
export const fieldLabel = "mb-1.5 block text-xs font-medium text-slate-400";

/** Section title, a sentence about it, and actions on the right. */
export function SectionHead({ title, children, actions }: { title: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 max-w-2xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        {children && <p className="mt-0.5 text-sm text-slate-400">{children}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", cls)}>{children}</span>;
}

export const tone = {
  good: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  bad: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  info: "border-brand-cyan/20 bg-brand-cyan/10 text-brand-sky",
  muted: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

/** "You can see this, but only Owners and Admins can change it." */
export function ReadOnlyNote() {
  return <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-slate-400">You&apos;re a Viewer: you can see everything here, but only Owners and Admins can make changes.</p>;
}

let regionNames: Intl.DisplayNames | null = null;
/** "NG" → "Nigeria". Anything that isn't a country code is shown as it is. */
export function countryName(code: string | null | undefined): string {
  if (!code) return "Unknown";
  if (!/^[A-Z]{2}$/i.test(code)) return code;
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

export const num = (n: number | null | undefined) => (n ?? 0).toLocaleString("en-GB");
export const day = (s: string | null | undefined) => (s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
/** A calendar date stored as midnight UTC (e.g. a batch's expiry): shown as that date everywhere. */
export const dateOnly = (s: string | null | undefined) => (s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");
export const when = (s: string | null | undefined) => (s ? new Date(s).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—");

/** A product photo, or a quiet placeholder. */
export function Thumb({ src, size = 40, className }: { src?: string | null; size?: number; className?: string }) {
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white", className)} style={{ width: size, height: size }}>
      {src ? (
        // Photos come from many hosts, so a plain <img>.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size} height={size} loading="lazy" className="h-full w-full object-contain p-0.5" />
      ) : (
        <div className="h-full w-full bg-brand-raised" />
      )}
    </div>
  );
}

export function Loading() {
  return (
    <div className="grid place-items-center py-20">
      <Spinner className="h-6 w-6 text-brand-accent" />
    </div>
  );
}
