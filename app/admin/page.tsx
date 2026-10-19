"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// Brand kit: white wordmark on dark, gradient mark.
import checktagWordmark from "/public/brand/checktag-wordmark-white.png";
import checktagMark from "/public/brand/checktag-mark-gradient.svg";
import { getToken, clearToken, verifyAdmin } from "@/lib/adminApi";
import { Spinner, Toast } from "./_components/ui";
import Submissions from "./_components/Submissions";
import Products from "./_components/Products";
import Payouts from "./_components/Payouts";
import Kyc from "./_components/Kyc";
import Reviews from "./_components/Reviews";
import Community from "./_components/Community";
import Activity from "./_components/Activity";
import Notifications from "./_components/Notifications";
import News from "./_components/News";
import {
  Inbox,
  PackageCheck,
  Coins,
  UserCheck,
  Gavel,
  MessagesSquare,
  LogOut,
  History,
  BellRing,
  Newspaper,
} from "lucide-react";

type Tab =
  | "submissions"
  | "products"
  | "community"
  | "payouts"
  | "reviews"
  | "kyc"
  | "notifications"
  | "news"
  | "activity";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "submissions", label: "Submissions", icon: Inbox },
  { key: "products", label: "Products", icon: PackageCheck },
  { key: "community", label: "Community", icon: MessagesSquare },
  // Payout (AML) review — not product reviews; those live under Community.
  { key: "reviews", label: "Payout review", icon: Gavel },
  { key: "payouts", label: "CTAG Payouts", icon: Coins },
  { key: "kyc", label: "Identity", icon: UserCheck },
  { key: "notifications", label: "Notifications", icon: BellRing },
  { key: "news", label: "News", icon: Newspaper },
  { key: "activity", label: "Activity", icon: History },
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
    <div className="min-h-screen bg-[#020817] text-slate-100">
      {/* ambient (brand navy / cyan) */}
      <div className="pointer-events-none fixed -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-[#14A6C9]/10 blur-[130px]" />
      <div className="pointer-events-none fixed -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#103C8F]/20 blur-[140px]" />

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020817]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image src={checktagMark} alt="" width={32} height={32} className="rounded-lg" />
            <Image src={checktagWordmark} alt="CheckTag" priority className="h-5 w-auto" />
            <span className="rounded-full border border-[#22AED1]/30 bg-[#22AED1]/10 px-2.5 py-0.5 text-xs font-semibold text-[#22AED1]">Admin</span>
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
        <nav className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
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
        {tab === "community" && <Community notify={notify} />}
        {tab === "reviews" && <Reviews notify={notify} />}
        {tab === "payouts" && <Payouts notify={notify} />}
        {tab === "kyc" && <Kyc notify={notify} />}
        {tab === "notifications" && <Notifications notify={notify} />}
        {tab === "news" && <News notify={notify} />}
        {tab === "activity" && <Activity notify={notify} />}
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
