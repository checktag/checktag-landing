"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, setToken, verifyAdmin, clearToken } from "@/lib/adminApi";
import { Button } from "../_components/ui";
import { ShieldCheck, Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await login(email.trim(), password);
      setToken(token);
      const ok = await verifyAdmin();
      if (!ok) {
        clearToken();
        throw new Error("This account doesn't have admin access.");
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_8px_30px_-6px_rgba(34,174,209,0.6)]">
              <ShieldCheck className="h-7 w-7 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              CheckTag <span className="text-cyan-400">Admin</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Sign in to manage submissions, products & payouts
            </p>
          </div>

          <form
            onSubmit={submit}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-2xl"
          >
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">
                Email
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 focus-within:border-cyan-400/50">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@checktag.io"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                />
              </div>
            </label>

            <label className="mb-5 block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">
                Password
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 focus-within:border-cyan-400/50">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                />
              </div>
            </label>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            Protected area · CheckTag internal
          </p>
        </div>
      </div>
    </div>
  );
}
