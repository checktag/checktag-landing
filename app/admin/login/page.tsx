"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { login, setupTwoStep, setToken, verifyTwoStep } from "@/lib/adminApi";
import { Button } from "../_components/ui";
import { ShieldCheck, Lock, Mail, Smartphone, KeyRound, Copy, Download } from "lucide-react";

// Admin sign-in: email + password, then a 6-digit code from an authenticator
// app. The first sign-in sets the authenticator up and shows one-time backup codes.
type Step = "credentials" | "setup" | "verify" | "backup";

const field =
  "flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 focus-within:border-cyan-400/50";
const input = "w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600";

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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_8px_30px_-6px_rgba(34,174,209,0.6)]">
              <ShieldCheck className="h-7 w-7 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              CheckTag <span className="text-cyan-400">Admin</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {step === "credentials" && "Sign in to manage submissions, products & payouts"}
              {step === "setup" && "Set up two-step sign-in"}
              {step === "verify" && "Enter the code from your authenticator app"}
              {step === "backup" && "Save your backup codes"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-2xl">
            {step === "credentials" && (
              <form onSubmit={submitCredentials}>
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-400">Email</span>
                  <div className={field}>
                    <Mail className="h-4 w-4 text-slate-500" />
                    <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@checktag.io" className={input} />
                  </div>
                </label>
                <label className="mb-5 block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-400">Password</span>
                  <div className={field}>
                    <Lock className="h-4 w-4 text-slate-500" />
                    <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={input} />
                  </div>
                </label>
                {error && <ErrorNote>{error}</ErrorNote>}
                <Button type="submit" loading={loading} className="w-full">
                  Continue
                </Button>
              </form>
            )}

            {(step === "setup" || step === "verify") && (
              <form onSubmit={submitCode}>
                {step === "setup" && (
                  <div className="mb-5 space-y-4 text-sm text-slate-300">
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
                    <p className="text-xs text-slate-400">
                      Can&apos;t scan? Enter this key instead:{" "}
                      <span className="select-all break-all font-mono text-cyan-300">{secret.replace(/(.{4})/g, "$1 ").trim()}</span>
                    </p>
                  </div>
                )}
                <label className="mb-5 block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-400">
                    {step === "setup" ? "Enter the 6-digit code it shows" : "6-digit code, or a backup code"}
                  </span>
                  <div className={field}>
                    <Smartphone className="h-4 w-4 text-slate-500" />
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
                <Button type="submit" loading={loading} className="w-full">
                  {step === "setup" ? "Turn on two-step sign-in" : "Sign in"}
                </Button>
                <button type="button" onClick={restart} className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-300">
                  Use a different account
                </button>
              </form>
            )}

            {step === "backup" && (
              <div className="space-y-4 text-sm text-slate-300">
                <p>
                  If you lose your phone, each of these codes signs you in once. Store them somewhere safe, such as a
                  password manager. <strong className="text-slate-100">They won&apos;t be shown again.</strong>
                </p>
                <ul className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-4 font-mono text-cyan-200">
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
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="accent-cyan-400" />
                  I&apos;ve saved my backup codes
                </label>
                <Button type="button" disabled={!saved} className="w-full" onClick={() => router.push("/admin")}>
                  <KeyRound className="h-4 w-4" /> Go to the dashboard
                </Button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">Protected area · CheckTag internal</p>
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
