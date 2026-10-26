"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import checktagWordmark from "/public/brand/checktag-wordmark-white.png";
import checktagMark from "/public/brand/checktag-mark-gradient.svg";
import { brandApi, clearBrandToken, getBrandToken, type BrandMe } from "@/lib/brandApi";
import { Spinner, Toast } from "../admin/_components/ui";
import { PortalProvider } from "./_components/shared";
import Overview from "./_components/Overview";
import Products from "./_components/Products";
import Claims from "./_components/Claims";
import Reviews from "./_components/Reviews";
import Reports from "./_components/Reports";
import Codes from "./_components/Codes";
import Alerts from "./_components/Alerts";
import Recalls from "./_components/Recalls";
import Team from "./_components/Team";
import Settings from "./_components/Settings";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  MessageSquareText,
  Flag,
  QrCode,
  ShieldAlert,
  Siren,
  Users,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

type Tab = "overview" | "products" | "claims" | "reviews" | "reports" | "codes" | "alerts" | "recalls" | "team" | "settings";

const TABS: { key: Tab; label: string; icon: React.ElementType; ownerOnly?: boolean }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "claims", label: "Claim products", icon: PackagePlus },
  { key: "reviews", label: "Reviews", icon: MessageSquareText },
  { key: "reports", label: "Reports", icon: Flag },
  { key: "codes", label: "Codes", icon: QrCode },
  { key: "alerts", label: "Clone alerts", icon: ShieldAlert },
  { key: "recalls", label: "Recalls", icon: Siren },
  { key: "team", label: "Team", icon: Users, ownerOnly: true },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

/** "#codes/<batch id>" → ["codes", "<batch id>"]. */
function readHash(): [Tab | null, string | null] {
  const [t, sub] = window.location.hash.slice(1).split("/");
  return [TABS.some((x) => x.key === t) ? (t as Tab) : null, sub ? decodeURIComponent(sub) : null];
}

export default function BrandPortal() {
  const router = useRouter();
  const [me, setMe] = useState<BrandMe | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [sub, setSub] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: "success" | "error" } | null>(null);

  const notify = useCallback((message: string, kind: "success" | "error") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!getBrandToken()) {
      router.replace("/portal/login");
      return;
    }
    // A 401 sends brandApi to the sign-in page by itself.
    brandApi<BrandMe>("/brand/me").then(setMe, () => {
      clearBrandToken();
      router.replace("/portal/login");
    });
    const sync = () => {
      const [t, s] = readHash();
      if (t) setTab(t);
      setSub(s);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [router]);

  const go = useCallback((t: string, s?: string) => {
    setTab(t as Tab);
    setSub(s ?? null);
    window.history.replaceState(null, "", `#${t}${s ? `/${encodeURIComponent(s)}` : ""}`);
    window.scrollTo({ top: 0 });
  }, []);

  function signOut() {
    clearBrandToken();
    router.replace("/portal/login");
  }

  if (!me) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-ink">
        <Spinner className="h-7 w-7 text-brand-accent" />
      </div>
    );
  }

  const tabs = TABS.filter((t) => !t.ownerOnly || me.isOwner);
  const current = tabs.some((t) => t.key === tab) ? tab : "overview";

  return (
    <PortalProvider value={{ me, notify, canEdit: me.canEdit, go }}>
      <div className="min-h-screen overflow-x-hidden bg-[#020817] text-slate-100">
        {/* ambient (brand navy / cyan) */}
        <div className="pointer-events-none fixed -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-[#14A6C9]/10 blur-[130px]" />
        <div className="pointer-events-none fixed -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#103C8F]/20 blur-[140px]" />

        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020817]/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Image src={checktagMark} alt="" width={32} height={32} className="shrink-0 rounded-lg" />
              <Image src={checktagWordmark} alt="CheckTag" priority className="hidden h-5 w-auto sm:block" />
              <span className="shrink-0 rounded-full border border-[#22AED1]/30 bg-[#22AED1]/10 px-2.5 py-0.5 text-xs font-semibold text-[#22AED1]">Brand portal</span>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="min-w-0 text-right text-xs leading-tight">
                <span className="block truncate font-semibold text-slate-200">{me.brand.name}</span>
                <span className="text-slate-500">{me.user.roleLabel}</span>
              </span>
              <button
                onClick={signOut}
                aria-label="Sign out"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {/* One scrolling row on small screens; two even rows on wide ones. */}
          <nav
            style={{ "--tab-cols": Math.ceil(tabs.length / 2) } as React.CSSProperties}
            className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 lg:grid lg:overflow-visible lg:[grid-template-columns:repeat(var(--tab-cols),minmax(0,1fr))]"
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = current === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => go(t.key)}
                  aria-current={active ? "page" : undefined}
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

          {current === "overview" && <Overview />}
          {current === "products" && <Products initial={sub} />}
          {current === "claims" && <Claims />}
          {current === "reviews" && <Reviews />}
          {current === "reports" && <Reports />}
          {current === "codes" && <Codes initial={sub} />}
          {current === "alerts" && <Alerts />}
          {current === "recalls" && <Recalls />}
          {current === "team" && <Team />}
          {current === "settings" && <Settings />}
        </div>

        {toast && <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />}
      </div>
    </PortalProvider>
  );
}
