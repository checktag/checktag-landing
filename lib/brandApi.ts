// Brand portal API client (checktag.io/portal). Mirrors lib/adminApi.ts but is a
// separate session: brand people sign in with a password and an authenticator
// code, the token lives in sessionStorage (it ends when the tab closes) and the
// server expires it after 12 hours. Contract: backend docs/BRAND_PORTAL_API.md.

import { API_BASE } from "./adminApi";

export { API_BASE };

const TOKEN_KEY = "ct_brand_token";

export function getBrandToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}
export function setBrandToken(t: string) {
  sessionStorage.setItem(TOKEN_KEY, t);
}
export function clearBrandToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

/** The session was rejected (expired, signed out elsewhere, brand paused): back to sign-in. */
function signedOut(): never {
  clearBrandToken();
  if (typeof window !== "undefined") window.location.href = "/portal/login";
  throw new Error("Your session ended. Please sign in again.");
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export interface BrandSignIn {
  token: string;
  user: { id: string; email: string; role: string; roleLabel: string };
  brand: { id: string; name: string };
  backupCodes?: string[];
}

/** Step 1: email + password. Returns whether to set up or enter an authenticator code. */
export function brandLogin(email: string, password: string) {
  return post<{ step: "setup" | "verify"; challenge: string }>("/auth/brand/login", { email, password });
}

/** First sign-in only: the secret to add to an authenticator app. */
export function brandSetupTwoStep(challenge: string) {
  return post<{ secret: string; otpauthUrl: string }>("/auth/brand/2fa/setup", { challenge });
}

/** Step 2: an authenticator code (or a backup code). Backup codes come back once, on setup. */
export function brandVerifyTwoStep(challenge: string, code: string) {
  return post<BrandSignIn>("/auth/brand/2fa/verify", { challenge, code });
}

/** Who a set-password link is for. Throws (410) if it's expired or used. */
export function checkBrandInvite(token: string) {
  return post<{ email: string; role: string | null; summary: string | null; brand: string | null; kind: "invite" | "reset" }>("/auth/brand/invite/check", { token });
}

/** Sets the password from an invite / reset link. */
export function acceptBrandInvite(token: string, password: string) {
  return post<{ email: string }>("/auth/brand/invite/accept", { token, password });
}

/** Ends every portal session for this person, on every device. */
export async function brandSignOutEverywhere() {
  const token = getBrandToken();
  if (token) {
    await fetch(`${API_BASE}/auth/brand/logout-all`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }
  clearBrandToken();
}

/** Authenticated JSON request against a /brand endpoint. */
export async function brandApi<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getBrandToken();
  if (!token) signedOut();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) signedOut();
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

/** Uploads a product photo or logo; returns its https URL. */
export async function brandUpload(file: File): Promise<string> {
  const token = getBrandToken();
  if (!token) signedOut();
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_BASE}/upload?folder=brand`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  if (res.status === 401) signedOut();
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) throw new Error(data?.error || `Upload failed (${res.status})`);
  return data.url as string;
}

/** Downloads an authenticated file (e.g. a batch's CSV) and saves it. */
export async function brandDownload(path: string, fallbackName: string) {
  const token = getBrandToken();
  if (!token) signedOut();
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) signedOut();
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Download failed (${res.status})`);
  }
  const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "")?.[1] || fallbackName;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(await res.blob());
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ------------------------------------------------------------------ shapes

export type BrandRole = "ORG_OWNER" | "ORG_ADMIN" | "ANALYST";

export interface BrandMe {
  user: { id: string; role: BrandRole; roleLabel: string };
  brand: { id: string; name: string; status: string; website: string | null; country: string | null; logoUrl: string | null; plan: string; verifiedAt: string | null };
  canEdit: boolean;
  isOwner: boolean;
}

export interface BrandProductRow {
  barcode: string;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  category: string | null;
  brandProvided: string[];
  scans: number;
  scans30d: number;
  reviewCount: number;
  rating: number | null;
  reports: number;
}

export type BatchState = "RESERVED" | "PRINTED" | "ACTIVATED" | "VOIDED";

export interface Batch {
  id: string;
  barcode: string;
  productName: string | null;
  lot: string | null;
  label: string | null;
  mfg: string | null;
  exp: string | null;
  qty: number;
  state: BatchState;
  maxScanners: number;
  createdAt: string;
  printedAt: string | null;
  activatedAt: string | null;
  scanned: number;
  alerts: number;
}

export interface Code {
  sequence: number;
  serial: string;
  url: string;
  status: string;
  firstScanAt: string | null;
}

export type RecallKind = "recall" | "safety_notice" | "counterfeit_warning";
export type RecallStatus = "DRAFT" | "STAGED" | "PUBLISHED" | "RESOLVED";

export interface Recall {
  id: string;
  tenantId: string;
  kind: RecallKind;
  title: string | null;
  body: string | null;
  barcodes: string[];
  lots: string[];
  status: RecallStatus;
  reviewNote: string | null;
  createdAt: string;
  submittedAt: string | null;
  publishedAt: string | null;
  resolvedAt: string | null;
  notifiedCount: number | null;
}
