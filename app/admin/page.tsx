"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// Brand kit: white wordmark on dark, gradient mark.
import checktagWordmark from "/public/brand/checktag-wordmark-white.png";
import checktagMark from "/public/brand/checktag-mark-gradient.svg";
import { getToken, clearToken, verifyAdmin, type AdminArea, type AdminMe } from "@/lib/adminApi";
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
import Team from "./_components/Team";
import Support from "./_components/Support";
import Brands from "./_components/Brands";
import Growth from "./_components/Growth";
import Reviewers from "./_components/Reviewers";
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
  Users,
  LifeBuoy,
  Building2,
  Rocket,
  Scale,
} from "lucide-react";

type Tab =
  | "submissions"
  | "reviewers"
  | "products"
  | "community"
  | "payouts"
  | "reviews"
  | "kyc"
  | "notifications"
  | "news"
  | "activity"
  | "support"
  | "brands"
  | "growth"
  | "team";

// Each tab belongs to one area of the dashboard; an admin sees the tabs their
// role includes (the server enforces the same split).
const TABS: { key: Tab; label: string; icon: React.ElementType; area: AdminArea }[] = [
  { key: "submissions", label: "Submissions", icon: Inbox, area: "submissions" },
  { key: "reviewers", label: "Reviewers", icon: Scale, area: "submissions" },
  { key: "products", label: "Products", icon: PackageCheck, area: "products" },
  { key: "community", label: "Community", icon: MessagesSquare, area: "community" },
  // Payout (AML) review — not product reviews; those live under Community.
  { key: "reviews", label: "Payout review", icon: Gavel, area: "payouts" },
  { key: "payouts", label: "CTAG Payouts", icon: Coins, area: "ctag" },
  { key: "kyc", label: "Identity", icon: UserCheck, area: "identity" },
  { key: "notifications", label: "Notifications", icon: BellRing, area: "announcements" },
  { key: "news", label: "News", icon: Newspaper, area: "news" },
  { key: "activity", label: "Activity", icon: History, area: "activity" },
  { key: "support", label: "Support", icon: LifeBuoy, area: "support" },
  { key: "brands", label: "Brands", icon: Building2, area: "brands" },
  { key: "growth", label: "Growth", icon: Rocket, area: "growth" },
  { key: "team", label: "Team", icon: Users, area: "team" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<AdminMe | null>(null);
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
      const who = await verifyAdmin();
      if (!who) {
        clearToken();
        router.replace("/admin/login");
        return;
      }
      const first = TABS.find((t) => who.areas.includes(t.area));
      if (first) setTab(first.key);
      setMe(who);
    })();
  }, [router]);

  const tabs = me ? TABS.filter((t) => me.areas.includes(t.area)) : [];

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  if (!me) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-ink">
        <Spinner className="h-7 w-7 text-brand-accent" />
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
          <div className="flex items-center gap-3">
          <span className="hidden text-right text-xs leading-tight text-slate-400 sm:block">
            {me.email}
            <br />
            <span className="text-slate-500">{me.roleLabel}</span>
          </span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs */}
        {/* One scrolling row on small screens; on wide ones, two even rows when there are many tabs. */}
        <nav
          style={{ "--tab-cols": tabs.length > 8 ? Math.ceil(tabs.length / 2) : tabs.length } as React.CSSProperties}
          className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 lg:grid lg:overflow-visible lg:[grid-template-columns:repeat(var(--tab-cols),minmax(0,1fr))]"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
                  (active
                    ? "bg-gradient-to-r from-brand-navy to-brand-cyan text-white shadow-[0_8px_24px_-10px_rgba(20,166,201,0.6)]"
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
        {tab === "support" && <Support notify={notify} />}
        {tab === "brands" && <Brands notify={notify} />}
        {tab === "growth" && <Growth notify={notify} />}
        {tab === "reviewers" && <Reviewers notify={notify} canSetPay={!!me?.areas.includes("growth")} />}
        {tab === "team" && <Team notify={notify} />}
        {tabs.length === 0 && (
          <p className="py-20 text-center text-sm text-slate-400">Your admin role doesn&apos;t include any part of the dashboard yet. Ask an Owner.</p>
        )}
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
