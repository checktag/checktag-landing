"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { acceptInvite, checkInvite } from "@/lib/adminApi";
import { Button } from "../_components/ui";
import { Check, Lock, ShieldCheck } from "lucide-react";
import checktagLogo from "/public/brand/checktag-wordmark-white.png";

// Opened from an invite (or set-new-password) email: the person sets their own
// password, then signs in and sets up their authenticator. The token arrives in
// the #fragment, so it never reaches a server log; it's removed from the
// address bar once read.

const field =
  "flex items-center gap-2 rounded-xl border border-white/10 bg-[#020817]/70 px-3 transition-colors focus-within:border-[#22AED1]/60 focus-within:ring-2 focus-within:ring-[#22AED1]/15";
const input = "w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/30";
const brandButton =
  "w-full bg-gradient-to-r from-[#103C8F] to-[#14A6C9] text-white shadow-none hover:brightness-110 hover:bg-transparent";

type Info = Awaited<ReturnType<typeof checkInvite>>;

export default function AdminInvite() {
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<Info | null>(null);
  const [dead, setDead] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const t = window.location.hash.slice(1);
    if (t) window.history.replaceState(null, "", window.location.pathname);
    if (!t) {
      setDead("This page needs the link from your invite email.");
      return;
    }
    setToken(t);
    checkInvite(t).then(setInfo, (e) => setDead(e.message));
  }, []);

  const local = (info?.email || "").split("@")[0].toLowerCase();
  const rules = [
    { ok: password.length >= 12, label: "At least 12 characters" },
    { ok: !!password && !(local.length >= 4 && password.toLowerCase().includes(local)), label: "Not your email address" },
    { ok: !!password && password === confirmPw, label: "Both passwords match" },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rules.some((r) => !r.ok)) return setError("Check the password rules below.");
    setError(null);
    setLoading(true);
    try {
      const r = await acceptInvite(token, password);
      setPassword("");
      setConfirmPw("");
      setDone(r.email);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const invite = info?.kind !== "reset";

  return (
    <div className="noise-bg relative min-h-screen w-full overflow-hidden bg-[#020817] text-white">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#103C8F]/30 blur-[140px]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-3">
              <Image src={checktagLogo} alt="CheckTag" priority className="h-6 w-auto" />
              <span className="rounded-full border border-[#22AED1]/30 bg-[#22AED1]/10 px-2.5 py-0.5 text-xs font-semibold text-[#22AED1]">Admin</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ textWrap: "balance" }}>
              {done ? "Password set" : invite ? "Join the admin dashboard" : "Set a new password"}
            </h1>
            {info && !done && (
              <p className="mt-1 text-sm text-white/55">
                {invite && info.role ? (
                  <>
                    You&apos;re joining as <span className="font-semibold text-white/85">{info.role}</span>
                    {info.summary ? ` — ${info.summary.charAt(0).toLowerCase()}${info.summary.slice(1)}` : "."}
                  </>
                ) : (
                  "Choose a new password for your admin account."
                )}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A1628]/80 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {dead ? (
              <div className="space-y-4 text-sm text-white/75">
                <p>{dead}</p>
                <p className="text-white/55">Ask an Owner on the CheckTag team to send you a new link.</p>
              </div>
            ) : done ? (
              <div className="space-y-4 text-sm text-white/75">
                <p>
                  {invite
                    ? "Next, sign in. The first time, you'll scan a QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password …) — have your phone ready."
                    : "Sign in with your new password and your authenticator code."}
                </p>
                <a
                  href={`/admin/login?email=${encodeURIComponent(done)}`}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${brandButton}`}
                >
                  Sign in
                </a>
              </div>
            ) : !info ? (
              <p className="text-sm text-white/55">Checking your link…</p>
            ) : (
              <form onSubmit={submit}>
                <input type="email" readOnly value={info.email} autoComplete="username" className="sr-only" tabIndex={-1} aria-hidden />
                <p className="mb-4 text-sm text-white/55">
                  Account: <span className="text-white/85">{info.email}</span>
                </p>
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-xs font-medium text-white/55">New password</span>
                  <div className={field}>
                    <Lock className="h-4 w-4 text-white/40" />
                    <input type="password" required autoFocus autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
                  </div>
                </label>
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-xs font-medium text-white/55">Type it again</span>
                  <div className={field}>
                    <Lock className="h-4 w-4 text-white/40" />
                    <input type="password" required autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={input} />
                  </div>
                </label>
                <ul className="mb-5 space-y-1.5 text-xs">
                  {rules.map((r) => (
                    <li key={r.label} className={r.ok ? "flex items-center gap-2 text-emerald-300" : "flex items-center gap-2 text-white/45"}>
                      <Check className={r.ok ? "h-3.5 w-3.5" : "h-3.5 w-3.5 opacity-30"} /> {r.label}
                    </li>
                  ))}
                </ul>
                {error && (
                  <div role="alert" className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                  </div>
                )}
                <Button type="submit" loading={loading} className={brandButton}>
                  Set password
                </Button>
              </form>
            )}
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-white/35">
            <ShieldCheck className="h-4 w-4 text-[#22AED1]" /> Password and authenticator code required to sign in
          </p>
        </div>
      </div>
    </div>
  );
}
