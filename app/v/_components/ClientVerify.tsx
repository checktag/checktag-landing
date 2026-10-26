"use client";
import { useEffect, useState } from "react";
import { CheckFailed, VerdictView, type VerifyResponse } from "./Verdict";

// Without the site key the website can't vouch for the shopper's country, so
// the browser asks the API itself: the API then sees the shopper's own network
// (for the country and the rate limit) instead of the website's server.

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.checktag.io";

export default function ClientVerify({ code }: { code: string }) {
  const [state, setState] = useState<{ v: VerifyResponse } | { failed: true; busy: boolean } | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`${API}/api/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, via: "web" }) })
      .then(async (r) => {
        if (!live) return;
        if (!r.ok) return setState({ failed: true, busy: r.status === 429 });
        setState({ v: (await r.json()) as VerifyResponse });
      })
      .catch(() => live && setState({ failed: true, busy: false }));
    return () => {
      live = false;
    };
  }, [code]);

  if (!state) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6" aria-busy="true">
        <p className="text-lg font-semibold">Checking this code…</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[#22AED1]" />
        </div>
      </section>
    );
  }
  return "v" in state ? <VerdictView v={state.v} code={code} /> : <CheckFailed busy={state.busy} />;
}
