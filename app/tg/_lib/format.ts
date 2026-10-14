// Small formatting helpers shared across the mini app.

const NF = new Intl.NumberFormat("en-US");

export const fmtN = (n: unknown) => NF.format(Number(n) || 0);

export function fmtUsd(v: unknown, points?: number) {
  const n = Number(v) || 0;
  if (n < 0.01 && (points || 0) > 0) return "under $0.01";
  return `$${n.toFixed(2)}`;
}

export const plural = (n: unknown, one: string, many: string) =>
  `${fmtN(n)} ${Number(n) === 1 ? one : many}`;

export function flagOf(cc?: string) {
  const c = String(cc || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return "";
  return String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65, 0x1f1e6 + c.charCodeAt(1) - 65);
}

let DN: Intl.DisplayNames | null = null;
export function countryName(cc: string, name?: string | null) {
  if (name) return name;
  try {
    DN = DN || new Intl.DisplayNames(["en"], { type: "region" });
    return DN.of(cc.toUpperCase()) || cc;
  } catch {
    return cc;
  }
}

const SKIP = new Set(["EU", "EZ", "UN", "QO", "XA", "XB", "ZZ"]);
let COUNTRIES: [string, string][] | null = null;
/** Every ISO country the device can name, sorted by name. */
export function countryList(): [string, string][] {
  if (COUNTRIES) return COUNTRIES;
  const out: [string, string][] = [];
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const a of A)
      for (const b of A) {
        const c = a + b;
        if (SKIP.has(c)) continue;
        const n = dn.of(c);
        if (n && n !== c && n !== "Unknown Region") out.push([c, n]);
      }
    out.sort((x, y) => x[1].localeCompare(y[1]));
  } catch {}
  COUNTRIES = out;
  return out;
}

export function initialOf(name?: string | null) {
  const a = Array.from(String(name || "").trim());
  return a.length ? a[0].toUpperCase() : "?";
}

export function ago(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const d = Math.max(0, (Date.now() - t) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  if (d < 604800) {
    const n = Math.floor(d / 86400);
    return n === 1 ? "yesterday" : `${n} days ago`;
  }
  if (d < 2592000) {
    const n = Math.floor(d / 604800);
    return n === 1 ? "1 week ago" : `${n} weeks ago`;
  }
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** "total_fat" / "totalFat" → "Total fat". */
export const nkey = (k: string) =>
  String(k)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/ (\w)/g, (m) => m.toLowerCase());

export function monthAbbr(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y || 2000, (m || 1) - 1, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}

export function monthLong(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y || 2000, (m || 1) - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const safeUrl = (u?: string | null) => {
  const s = String(u || "").trim();
  return /^https?:\/\//i.test(s) ? s : "";
};

/** Tier label for a 1–5 rating (same tiers as the mobile app). */
export function ratingTier(r: number) {
  if (r >= 4.5) return "Excellent";
  if (r >= 4.0) return "Very good";
  if (r >= 3.0) return "Good";
  if (r >= 2.0) return "Fair";
  return "Poor";
}
