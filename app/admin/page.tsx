"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken, verifyAdmin } from "@/lib/adminApi";
import { Spinner, Toast } from "./_components/ui";
import Submissions from "./_components/Submissions";
import Products from "./_components/Products";
import Payouts from "./_components/Payouts";
import Kyc from "./_components/Kyc";
import Reviews from "./_components/Reviews";
import {
  ShieldCheck,
  Inbox,
  PackageCheck,
  Coins,
  UserCheck,
  Gavel,
  LogOut,
} from "lucide-react";

type Tab = "submissions" | "products" | "payouts" | "reviews" | "kyc";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "submissions", label: "Submissions", icon: Inbox },
  { key: "products", label: "Products", icon: PackageCheck },
  { key: "reviews", label: "Reviews", icon: Gavel },
  { key: "payouts", label: "CTAG Payouts", icon: Coins },
  { key: "kyc", label: "Identity", icon: UserCheck },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("submissions");
  const [toast, setToast] = useState<{
    message: string;
    kind: "success" | "error";
  } | null>(null);

  function notify(message: string, kind: "success" | "error") {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    (async () => {
      if (!getToken()) {
        router.replace("/admin/login");
        return;
      }
      const ok = await verifyAdmin();
      if (!ok) {
        clearToken();
        router.replace("/admin/login");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <Spinner className="h-7 w-7 text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ambient */}
      <div className="pointer-events-none fixed -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[130px]" />

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600">
              <ShieldCheck className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">
                CheckTag <span className="text-cyan-400">Admin</span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">Control center</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs */}
        <nav className="mb-8 flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
                  (active
                    ? "bg-cyan-400 text-slate-950 shadow-[0_4px_20px_-6px_rgba(34,174,209,0.6)]"
                    : "text-slate-400 hover:text-slate-200")
                }
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "submissions" && <Submissions notify={notify} />}
        {tab === "products" && <Products notify={notify} />}
        {tab === "reviews" && <Reviews notify={notify} />}
        {tab === "payouts" && <Payouts notify={notify} />}
        {tab === "kyc" && <Kyc notify={notify} />}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
