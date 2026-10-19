"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { login, setupTwoStep, setToken, verifyTwoStep } from "@/lib/adminApi";
import { Button } from "../_components/ui";
import { Lock, Mail, Smartphone, KeyRound, Copy, Download, ShieldCheck } from "lucide-react";
// The brand kit's white wordmark is the one for dark backgrounds.
import checktagLogo from "/public/brand/checktag-wordmark-white.png";
import checktagMark from "/public/brand/checktag-mark-gradient.svg";

// Admin sign-in: email + password, then a 6-digit code from an authenticator
// app. The first sign-in sets the authenticator up and shows one-time backup codes.
type Step = "credentials" | "setup" | "verify" | "backup";

// Brand palette (see /brand): ink #020817, raised #0A1628, navy #103C8F →
// cyan #14A6C9 gradient, web accent #22AED1.
const field =
  "flex items-center gap-2 rounded-xl border border-white/10 bg-[#020817]/70 px-3 transition-colors focus-within:border-[#22AED1]/60 focus-within:ring-2 focus-within:ring-[#22AED1]/15";
const input = "w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/30";
const brandButton =
  "w-full bg-gradient-to-r from-[#103C8F] to-[#14A6C9] text-white shadow-none hover:brightness-110 hover:bg-transparent";

export default function AdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState("");
  const [secret, setSecret] = useState("");
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === "credentials") setPassword("");
  }, [step]);

  async function run(fn: () => Promise<void>) {
    setError(null);
    setLoading(true);
    try {
      await fn();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const submitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const r = await login(email.trim(), password);
      setChallenge(r.challenge);
      setPassword("");
      if (r.step === "setup") {
        const s = await setupTwoStep(r.challenge);
        setSecret(s.secret);
        setQr(await QRCode.toDataURL(s.otpauthUrl, { margin: 1, width: 220, color: { dark: "#0f172a", light: "#ffffff" } }));
        setStep("setup");
      } else {
        setStep("verify");
      }
    });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const r = await verifyTwoStep(challenge, code.trim());
      setToken(r.token);
      setCode("");
      if (r.backupCodes?.length) {
        setBackupCodes(r.backupCodes);
        setStep("backup");
      } else {
        router.push("/admin");
      }
    });
  };

  const restart = () => {
    setStep("credentials");
    setChallenge("");
    setCode("");
    setSecret("");
    setQr("");
    setError(null);
  };

  const backupText = `CheckTag admin backup codes for ${email.trim()}\nEach code works once.\n\n${backupCodes.join("\n")}\n`;

  const subtitle =
    step === "credentials"
      ? "Sign in to the CheckTag console"
      : step === "setup"
        ? "Set up two-step sign-in"
        : step === "verify"
          ? "Enter the code from your authenticator app"
          : "Save your backup codes";

  return (
    <div className="noise-bg relative min-h-screen w-full overflow-hidden bg-[#020817] text-white">
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Brand panel (wide screens) */}
        <aside className="relative hidden overflow-hidden border-r border-white/5 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="dot-pattern pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -left-40 top-1/3 h-[34rem] w-[34rem] rounded-full bg-[#103C8F]/35 blur-[140px]" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-[22rem] w-[22rem] rounded-full bg-[#14A6C9]/15 blur-[120px]" />
          <Image src={checktagLogo} alt="CheckTag" priority className="relative h-6 w-auto self-start" />
          <div className="relative">
            <Image src={checktagMark} alt="" width={88} height={88} className="mb-8 rounded-[22px]" />
            <h1 className="max-w-sm text-4xl font-bold leading-tight tracking-tight" style={{ textWrap: "balance" }}>
              Admin console
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/60">
              Review submissions, keep the catalogue accurate, send safety alerts and approve payouts.
            </p>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck className="h-4 w-4 text-[#22AED1]" />
            Password and authenticator code required
          </div>
        </aside>

        {/* Sign-in */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <Image src={checktagLogo} alt="CheckTag" priority className="h-6 w-auto" />
                <span className="rounded-full border border-[#22AED1]/30 bg-[#22AED1]/10 px-2.5 py-0.5 text-xs font-semibold text-[#22AED1]">Admin</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{step === "backup" ? "One last thing" : "Welcome back"}</h2>
              <p className="mt-1 text-sm text-white/55">{subtitle}</p>
            </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A1628]/80 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {step === "credentials" && (
              <form onSubmit={submitCredentials}>
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-xs font-medium text-white/55">Email</span>
                  <div className={field}>
                    <Mail className="h-4 w-4 text-white/40" />
                    <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@checktag.io" className={input} />
                  </div>
                </label>
                <label className="mb-5 block">
                  <span className="mb-1.5 block text-xs font-medium text-white/55">Password</span>
                  <div className={field}>
                    <Lock className="h-4 w-4 text-white/40" />
                    <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={input} />
                  </div>
                </label>
                {error && <ErrorNote>{error}</ErrorNote>}
                <Button type="submit" loading={loading} className={brandButton}>
                  Continue
                </Button>
              </form>
            )}

            {(step === "setup" || step === "verify") && (
              <form onSubmit={submitCode}>
                {step === "setup" && (
                  <div className="mb-5 space-y-4 text-sm text-white/75">
                    <p>
                      Admin accounts need a second step. Open an authenticator app (Google Authenticator, Microsoft
                      Authenticator, 1Password…), add an account, and scan this code.
                    </p>
                    {qr && (
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qr} alt="QR code for your authenticator app" width={220} height={220} className="rounded-xl" />
                      </div>
                    )}
                    <p className="text-xs text-white/55">
                      Can&apos;t scan? Enter this key instead:{" "}
                      <span className="select-all break-all font-mono text-[#22AED1]">{secret.replace(/(.{4})/g, "$1 ").trim()}</span>
                    </p>
                  </div>
                )}
                <label className="mb-5 block">
                  <span className="mb-1.5 block text-xs font-medium text-white/55">
                    {step === "setup" ? "Enter the 6-digit code it shows" : "6-digit code, or a backup code"}
                  </span>
                  <div className={field}>
                    <Smartphone className="h-4 w-4 text-white/40" />
                    <input
                      required
                      autoFocus
                      inputMode={step === "setup" ? "numeric" : "text"}
                      autoComplete="one-time-code"
                      maxLength={9}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123 456"
                      className={`${input} font-mono tracking-widest`}
                    />
                  </div>
                </label>
                {error && <ErrorNote>{error}</ErrorNote>}
                <Button type="submit" loading={loading} className={brandButton}>
                  {step === "setup" ? "Turn on two-step sign-in" : "Sign in"}
                </Button>
                <button type="button" onClick={restart} className="mt-4 w-full text-center text-xs text-white/45 hover:text-white/80">
                  Use a different account
                </button>
              </form>
            )}

            {step === "backup" && (
              <div className="space-y-4 text-sm text-white/75">
                <p>
                  If you lose your phone, each of these codes signs you in once. Store them somewhere safe, such as a
                  password manager. <strong className="text-white">They won&apos;t be shown again.</strong>
                </p>
                <ul className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#020817]/70 p-4 font-mono text-[#7fd6ec]">
                  {backupCodes.map((c) => (
                    <li key={c} className="tabular-nums">
                      {c}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigator.clipboard?.writeText(backupText)}>
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(new Blob([backupText], { type: "text/plain" }));
                      a.download = "checktag-admin-backup-codes.txt";
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }}
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-xs text-white/55">
                  <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="accent-[#22AED1]" />
                  I&apos;ve saved my backup codes
                </label>
                <Button type="button" disabled={!saved} className={brandButton} onClick={() => router.push("/admin")}>
                  <KeyRound className="h-4 w-4" /> Go to the dashboard
                </Button>
              </div>
            )}
          </div>

            <p className="mt-6 text-center text-xs text-white/35 lg:text-left">
              Protected area · CheckTag internal ·{" "}
              <a href="/" className="text-white/50 hover:text-white/80">
                checktag.io
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
      {children}
    </div>
  );
}
