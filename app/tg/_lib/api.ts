// CheckTag /api client for the mini app. Every request carries Telegram's
// signed initData, which the server verifies with the bot token.

import { getTG, LINK_COPY } from "./telegram";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.checktag.io").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public msg = "",
  ) {
    super(code || String(status));
  }
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  json?: unknown;
  form?: FormData;
  timeout?: number;
  anon?: boolean;
  signal?: AbortSignal;
}

function messageOf(j: Record<string, unknown>) {
  if (typeof j.message === "string" && j.message) return j.message;
  if (typeof j.error === "string" && /\s/.test(j.error)) return j.error;
  return "";
}

export async function api<T>(path: string, o: Options = {}): Promise<T> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort("timeout"), o.timeout ?? 20000);
  const onOuterAbort = () => ctl.abort("cancelled");
  o.signal?.addEventListener("abort", onOuterAbort);
  const headers: Record<string, string> = { Accept: "application/json" };
  const initData = getTG()?.initData;
  if (!o.anon && initData) headers["X-Telegram-Init-Data"] = initData;
  let body: BodyInit | undefined;
  if (o.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(o.json);
  } else if (o.form) body = o.form;

  let res: Response;
  try {
    res = await fetch(API_BASE + path, { method: o.method || "GET", headers, body, cache: "no-store", signal: ctl.signal });
  } catch {
    const reason = ctl.signal.reason;
    throw new ApiError(0, reason === "cancelled" ? "cancelled" : reason === "timeout" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
    o.signal?.removeEventListener("abort", onOuterAbort);
  }
  const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.ok) return j as T;
  throw new ApiError(res.status, typeof j.error === "string" ? j.error : "", messageOf(j));
}

/** A sentence a person can act on, for any failure. */
export function errText(e: unknown, fallback = "Something went wrong. Please try again.") {
  const err = e instanceof ApiError ? e : null;
  if (err?.code === "timeout") return "This is taking longer than usual. Please try again.";
  if (err?.code === "network") return "You seem to be offline. Check your connection and try again.";
  if (err?.code === "link_required") return LINK_COPY;
  return err?.msg || fallback;
}

export const enc = encodeURIComponent;
