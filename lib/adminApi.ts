// Minimal admin API client. Talks to the CheckTag backend with the admin's
// Bearer token (from /auth/login), stored in localStorage.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.checktag.io";

const TOKEN_KEY = "ct_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: { id: string; email: string; role: string } }> {
  // /auth/org/login issues a JWT carrying role→permissions (admin:* for
  // SUPER_ADMIN), which is what the /admin endpoints' requireAuth verifies.
  // (/auth/login returns a session token that requireAuth would reject.)
  const res = await fetch(`${API_BASE}/auth/org/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Login failed");
  return data;
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

/** Verify the current token belongs to an admin (admin endpoints 403 otherwise). */
export async function verifyAdmin(): Promise<boolean> {
  try {
    await api("/admin/reports?status=PENDING");
    return true;
  } catch {
    return false;
  }
}
