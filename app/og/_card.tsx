import { ImageResponse } from "next/og";
import type { Product } from "@/lib/catalog";

// Link-preview cards (1200×630) for product and comparison pages: what people
// see when a CheckTag link is shared on WhatsApp, Telegram, X…

export const SIZE = { width: 1200, height: 630 };
const BG = "#020817";
const CYAN = "#22AED1";
const TONE: Record<string, string> = { good: "#6EE7B7", warn: "#FCD34D", bad: "#FDA4AF" };

/** Satori only draws PNG/JPEG, so fetch the photo and inline it, or skip it. */
export async function photo(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const r = await fetch(url, { next: { revalidate: 86400 } });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !/image\/(png|jpe?g)/.test(type)) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    return buf.length < 4_000_000 ? `data:${type};base64,${buf.toString("base64")}` : null;
  } catch {
    return null;
  }
}

/** Geist (the site's face) in the weights the cards use; default font if Google Fonts is unreachable. */
async function fonts() {
  const load = async (weight: number) => {
    // Without a browser User-Agent, Google Fonts serves TTF, which Satori can read.
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}`, { next: { revalidate: 604800 } })).text();
    const url = /src: url\((.+?)\)/.exec(css)?.[1];
    if (!url) throw new Error("no font url");
    return { name: "Geist", data: await (await fetch(url, { next: { revalidate: 604800 } })).arrayBuffer(), weight: weight as 400 | 700 | 800, style: "normal" as const };
  };
  try {
    return await Promise.all([load(400), load(700), load(800)]);
  } catch {
    return undefined;
  }
}

function Tile({ src, size }: { src: string | null; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 32, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size - 40} height={size - 40} style={{ objectFit: "contain" }} />
      ) : (
        <div style={{ fontSize: size / 4, color: "#0C2E72", fontWeight: 700 }}>CT</div>
      )}
    </div>
  );
}

function Rating({ p, big }: { p: Product; big?: boolean }) {
  const color = TONE[p.verdictTone || ""] || "#CBD5E1";
  if (typeof p.rating !== "number") return <div style={{ display: "flex", fontSize: 28, color: "#94A3B8" }}>Not rated yet</div>;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: big ? "12px 26px" : "8px 20px", borderRadius: 999, border: `2px solid ${color}55`, background: `${color}1A`, color }}>
      <span style={{ fontSize: big ? 52 : 38, fontWeight: 800 }}>{p.rating.toFixed(1)}</span>
      <span style={{ fontSize: big ? 28 : 22, opacity: 0.75 }}>/5</span>
      {p.verdict && <span style={{ fontSize: big ? 30 : 24, fontWeight: 700 }}>{` · ${p.verdict}`}</span>}
    </div>
  );
}

function Frame({ children, footer }: { children: React.ReactNode; footer: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `radial-gradient(circle at 85% 0%, #0C2E72 0%, ${BG} 55%)`,
        color: "#fff",
        padding: "56px 64px",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <div style={{ flex: 1, display: "flex" }}>{children}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, color: "#94A3B8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, background: CYAN }} />
          <span style={{ color: "#fff", fontWeight: 700 }}>CheckTag</span>
          <span>{footer}</span>
        </div>
        <span>Scan before you buy</span>
      </div>
    </div>
  );
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trim()}…` : s);

export async function productCard(p: Product) {
  const [src, font] = await Promise.all([photo(p.imageUrl), fonts()]);
  return new ImageResponse(
    (
      <Frame footer="checktag.io">
        <div style={{ display: "flex", alignItems: "center", gap: 56, width: "100%" }}>
          <Tile src={src} size={380} />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18 }}>
            {p.brand && <div style={{ display: "flex", fontSize: 30, color: CYAN, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>{clip(p.brand, 30)}</div>}
            <div style={{ display: "flex", fontSize: p.name.length > 40 ? 52 : 64, fontWeight: 800, lineHeight: 1.08 }}>{clip(p.name, 70)}</div>
            <div style={{ display: "flex", marginTop: 12 }}>
              <Rating p={p} big />
            </div>
            {!!p.reviewCount && <div style={{ display: "flex", fontSize: 26, color: "#CBD5E1" }}>{`★ ${(p.communityRating ?? 0).toFixed(1)} from ${p.reviewCount} shopper${p.reviewCount === 1 ? "" : "s"}`}</div>}
          </div>
        </div>
      </Frame>
    ),
    { ...SIZE, fonts: font, headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}

export async function compareCard(a: Product, b: Product) {
  const [sa, sb, font] = await Promise.all([photo(a.imageUrl), photo(b.imageUrl), fonts()]);
  const side = (p: Product, src: string | null) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: 440 }}>
      <Tile src={src} size={230} />
      <div style={{ display: "flex", textAlign: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, lineHeight: 1.15, height: 76 }}>{clip(p.name, 44)}</div>
      <Rating p={p} />
    </div>
  );
  return new ImageResponse(
    (
      <Frame footer="Side-by-side on checktag.io">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          {side(a, sa)}
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: CYAN }}>VS</div>
          {side(b, sb)}
        </div>
      </Frame>
    ),
    { ...SIZE, fonts: font, headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
