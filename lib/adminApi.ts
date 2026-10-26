// Minimal admin API client. Talks to the CheckTag backend with the admin's
// Bearer token. Sign-in is two-step (password, then an authenticator code), and
// the session lives in sessionStorage: it ends when the tab closes, and expires
// on the server after 8 hours.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.checktag.io";

const TOKEN_KEY = "ct_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  localStorage.removeItem(TOKEN_KEY); // drop tokens left by the old sign-in
  return sessionStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  sessionStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

/** Step 1: email + password. Returns whether to set up or enter an authenticator code. */
export function login(email: string, password: string) {
  return post<{ step: "setup" | "verify"; challenge: string }>("/auth/admin/login", { email, password });
}

/** First sign-in only: the secret to add to an authenticator app. */
export function setupTwoStep(challenge: string) {
  return post<{ secret: string; otpauthUrl: string }>("/auth/admin/2fa/setup", { challenge });
}

/** Step 2: an authenticator code (or a backup code). Backup codes come back once, on setup. */
export function verifyTwoStep(challenge: string, code: string) {
  return post<{ token: string; user: { id: string; email: string; role: string }; backupCodes?: string[] }>(
    "/auth/admin/2fa/verify",
    { challenge, code },
  );
}

/** Ends every admin session for this account, on every device. */
export async function signOutEverywhere() {
  const token = getToken();
  if (token) await post("/auth/admin/logout-all", {}, token).catch(() => {});
  clearToken();
}

/** Authenticated request against an /admin endpoint. */
export async function api<T = any>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expired. Please sign in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Prefer the human-readable `message`; fall back to the error code.
    throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

/**
 * Unauthenticated GET against a public endpoint (e.g. /api/products/:barcode),
 * used to enrich admin views with product names. Never sends the admin token
 * and never signs the admin out; returns null on any failure.
 */
export async function publicGet<T = any>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type AdminArea =
  | "submissions"
  | "products"
  | "community"
  | "payouts"
  | "ctag"
  | "identity"
  | "announcements"
  | "news"
  | "activity"
  | "support"
  | "brands"
  | "team";

export interface AdminMe {
  id: string;
  email: string | null;
  role: string;
  roleLabel: string;
  /** The parts of the dashboard this admin's role can use. */
  areas: AdminArea[];
}

/** The signed-in admin and what their role can use, or null if the session isn't an admin one. */
export async function verifyAdmin(): Promise<AdminMe | null> {
  try {
    return await api<AdminMe>("/admin/me");
  } catch {
    return null;
  }
}

/** Who a set-password link is for (invite or reset). Throws if it's expired or used. */
export function checkInvite(token: string) {
  return post<{ email: string; role: string | null; summary: string | null; kind: "invite" | "reset" }>("/auth/admin/invite/check", { token });
}

/** Sets the password from an invite / reset link. */
export function acceptInvite(token: string, password: string) {
  return post<{ email: string }>("/auth/admin/invite/accept", { token, password });
}
