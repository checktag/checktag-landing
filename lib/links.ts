// Public checktag.io links, safe to use anywhere (server pages, the mini app).
// Server-only data fetching lives in ./catalog.

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://checktag.io").replace(/\/+$/, "");
export const TELEGRAM_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT || "ChecktagAppBot";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "product";

export const productPath = (p: { barcode: string; name: string }) => `/product/${p.barcode}/${slugify(p.name)}`;

/** One canonical URL per pair: the smaller barcode first. */
export const comparePath = (a: string, b: string) => {
  const [x, y] = [a, b].sort();
  return `/compare/${x}-vs-${y}`;
};
