"use client";
import { cn } from "@/lib/utils";
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
