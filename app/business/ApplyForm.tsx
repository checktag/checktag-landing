"use client";

import { useState } from "react";

// The brand portal application (POST /api/brands/apply). No account needed;
// CheckTag reviews it and emails the applicant either way.

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.checktag.io";

const input =
  "w-full rounded-xl border border-white/10 bg-[#020817]/70 px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#22AED1]/60 focus:ring-2 focus:ring-[#22AED1]/15";
const labelCls = "mb-1.5 block text-xs font-medium text-white/60";

type Fields = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  country: string;
  brands: string;
  gs1Prefixes: string;
  message: string;
};

const empty: Fields = { companyName: "", contactName: "", contactEmail: "", contactPhone: "", website: "", country: "", brands: "", gs1Prefixes: "", message: "" };

export default function ApplyForm() {
  const [f, setF] = useState<Fields>(empty);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
      const res = await fetch(`${API}/api/brands/apply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            (res.status === 429 ? "Too many applications from this network today. Email hello@checktag.io instead." : "We couldn't send your application. Try again, or email hello@checktag.io."),
        );
      }
      setSentTo(f.contactEmail.trim());
      setF(empty);
    } catch (err: any) {
      setError(err?.message === "Failed to fetch" ? "We couldn't reach CheckTag. Check your connection and try again." : err?.message);
    } finally {
      setSending(false);
    }
  }

  if (sentTo) {
    return (
      <div role="status" className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-5">
        <p className="font-semibold text-emerald-200">Application sent. Thank you.</p>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          We&apos;ve emailed a confirmation to <span className="text-white">{sentTo}</span>. We check every brand before giving access, usually within two working
          days, and we&apos;ll reply to that address.
        </p>
        <button onClick={() => setSentTo(null)} className="mt-4 text-sm text-white/50 underline-offset-2 hover:text-white hover:underline">
          Send another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className={labelCls}>Company name *</span>
        <input required minLength={2} maxLength={120} value={f.companyName} onChange={set("companyName")} autoComplete="organization" className={input} />
      </label>
      <label className="block">
        <span className={labelCls}>Your name *</span>
        <input required minLength={2} maxLength={120} value={f.contactName} onChange={set("contactName")} autoComplete="name" className={input} />
      </label>
      <label className="block">
        <span className={labelCls}>Work email *</span>
        <input required type="email" maxLength={200} value={f.contactEmail} onChange={set("contactEmail")} autoComplete="email" placeholder="you@yourcompany.com" className={input} />
      </label>
      <label className="block">
        <span className={labelCls}>Phone</span>
        <input type="tel" maxLength={40} value={f.contactPhone} onChange={set("contactPhone")} autoComplete="tel" className={input} />
      </label>
      <label className="block">
        <span className={labelCls}>Company website</span>
        <input maxLength={200} value={f.website} onChange={set("website")} autoComplete="url" placeholder="yourcompany.com" className={input} />
      </label>
      <label className="block">
        <span className={labelCls}>Country</span>
        <input maxLength={60} value={f.country} onChange={set("country")} autoComplete="country-name" placeholder="Where the brand is based" className={input} />
      </label>
      <label className="block sm:col-span-2">
        <span className={labelCls}>Brands you sell under</span>
        <input maxLength={500} value={f.brands} onChange={set("brands")} placeholder="e.g. Sunny Biscuits, Sunny Kids" className={input} />
      </label>
      <label className="block sm:col-span-2">
        <span className={labelCls}>GS1 company prefixes, or a few of your barcodes</span>
        <input maxLength={500} value={f.gs1Prefixes} onChange={set("gs1Prefixes")} placeholder="e.g. 6151234, or 6151234000017" className={`${input} font-mono`} />
        <span className="mt-1 block text-xs text-white/35">Helps us confirm the products are yours.</span>
      </label>
      <label className="block sm:col-span-2">
        <span className={labelCls}>Anything else we should know</span>
        <textarea maxLength={2000} rows={4} value={f.message} onChange={set("message")} placeholder="What you'd like to use CheckTag for, how many products, any problem with fakes…" className={input} />
      </label>
      {error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200 sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-[#22AED1] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1A9AB8] hover:shadow-lg hover:shadow-[#22AED1]/20 disabled:cursor-wait disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send application"}
        </button>
        <p className="text-xs leading-relaxed text-white/35">
          We use these details only to review your application and contact you. See our{" "}
          <a href="/privacy" className="text-white/55 underline-offset-2 hover:text-white hover:underline">
            privacy policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
