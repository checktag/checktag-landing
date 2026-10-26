import type { Metadata } from "next";
import { headers } from "next/headers";
import ClientVerify from "../_components/ClientVerify";
import { CheckFailed, CODE_RE, NotRecognised, OpenOnPhone, Shell, VerdictView, type VerifyResponse } from "../_components/Verdict";

// checktag.io/v/<code>: where a CheckTag QR code on a pack leads. Every visit is
// a scan (it counts towards clone detection), so the page is never cached,
// never indexed, and link-preview bots get a page that doesn't check the code.
//
// With SITE_FETCH_KEY set (server-only, same value as the API's), the check
// runs here and passes the shopper's country from Vercel's x-vercel-ip-country.
// Without it, the browser does the check itself (see ClientVerify).

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check a CheckTag code",
  description: "See whether the pack this code came from is genuine.",
  robots: { index: false, follow: false },
};

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.checktag.io";
const SITE_KEY = process.env.SITE_FETCH_KEY;
// Link-preview fetchers and crawlers (not in-app browsers, which people use to open the link).
const BOTS = /bot\b|bot\/|crawler|spider|slurp|facebookexternalhit|facebot|whatsapp\/|uripreview|embedly|vkshare|quora link preview/i;

async function verify(code: string, country: string | null): Promise<VerifyResponse | { busy: boolean }> {
  try {
    const r = await fetch(`${API}/api/verify`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", "x-site-key": SITE_KEY!, ...(country && { "x-client-country": country }) },
      body: JSON.stringify({ code }),
    });
    if (!r.ok) return { busy: r.status === 429 };
    return (await r.json()) as VerifyResponse;
  } catch {
    return { busy: false };
  }
}

export default async function CodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  let code = raw;
  try {
    code = decodeURIComponent(raw);
  } catch {
    // a malformed %-escape: CODE_RE rejects it below
  }
  code = code.trim().toLowerCase();
  const h = await headers();

  if (!CODE_RE.test(code)) {
    return (
      <Shell>
        <NotRecognised />
      </Shell>
    );
  }
  if (BOTS.test(h.get("user-agent") || "")) {
    return (
      <Shell>
        <OpenOnPhone />
      </Shell>
    );
  }
  if (!SITE_KEY) {
    return (
      <Shell>
        <ClientVerify code={code} />
      </Shell>
    );
  }

  const country = (h.get("x-vercel-ip-country") || "").toUpperCase();
  const v = await verify(code, /^[A-Z]{2}$/.test(country) ? country : null);
  return <Shell>{"result" in v ? <VerdictView v={v} code={code} /> : <CheckFailed busy={v.busy} />}</Shell>;
}
