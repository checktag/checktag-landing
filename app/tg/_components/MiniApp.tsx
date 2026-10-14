"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AppProvider, useApp, type Entry, type Route, type View } from "../_lib/app";
import { getTG } from "../_lib/telegram";
import { Gate, ScreenFrame, SheetHost, ToastHost } from "./Shell";
import { CashbackScreen, HistoryScreen, SettingsScreen } from "./screens/AccountScreens";
import { LabelScreen } from "./screens/LabelScreen";
import { ProductScreen } from "./screens/ProductScreen";
import { ScanScreen } from "./screens/ScanScreen";

const VIEWS: View[] = ["overview", "reviews", "label", "cashback"];

/**
 * First screens from a deep link: `?barcode=<digits>&view=<view>` (bot
 * buttons) or Telegram's start_param `p_<barcode>` / `p_<barcode>_<view>`.
 */
function initialRoutes(): Route[] {
  let b = "";
  let v = "";
  try {
    const q = new URLSearchParams(location.search);
    b = q.get("barcode") || "";
    v = q.get("view") || "";
  } catch {}
  if (!b) {
    const m = /^p_(\d{8,14})(?:_([a-z]+))?$/.exec(getTG()?.initDataUnsafe?.start_param || "");
    if (m) {
      b = m[1];
      v = m[2] || "";
    }
  }
  if (!/^\d{8,14}$/.test(b.trim())) return v === "cashback" ? [{ k: "scan" }, { k: "cashback" }] : [{ k: "scan" }];
  const view = (VIEWS as string[]).includes(v) ? (v as View) : "overview";
  return [{ k: "scan" }, { k: "product", barcode: b.trim(), lookup: true, view }];
}

/** Telegram always launches mini apps with its data in the URL hash (kept
 *  in sessionStorage by its script across reloads). */
function launchedByTelegram() {
  try {
    return /tgWebAppData=/.test(location.hash) || !!sessionStorage.getItem("__telegram__initParams");
  } catch {
    return /tgWebAppData=/.test(location.hash);
  }
}

export default function MiniApp() {
  const [state, setState] = useState<"boot" | "tg" | "web" | "stuck">("boot");
  const [routes, setRoutes] = useState<Route[]>([{ k: "scan" }]);

  // Wait for Telegram's script, then hand over: full height, no swipe-to-close
  // while scrolling, and the deep link. A Telegram launch waits as long as it
  // takes the script to arrive; a plain browser visit gets the store page.
  useEffect(() => {
    const fromTelegram = launchedByTelegram();
    const deadline = Date.now() + (fromTelegram ? 15000 : 2500);
    const t = setInterval(() => {
      const tg = getTG();
      if (tg?.initData) {
        clearInterval(t);
        try {
          tg.ready();
          tg.expand();
          if (tg.isVersionAtLeast?.("7.7")) tg.disableVerticalSwipes?.();
        } catch {}
        setRoutes(initialRoutes());
        setState("tg");
      } else if ((tg && !fromTelegram) || Date.now() > deadline) {
        clearInterval(t);
        setState(fromTelegram ? "stuck" : "web");
      }
    }, 50);
    return () => clearInterval(t);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {state === "boot" ? (
        <Splash />
      ) : state === "stuck" ? (
        <Stuck />
      ) : state === "web" ? (
        <Gate />
      ) : (
        <AppProvider initial={routes}>
          <Main />
        </AppProvider>
      )}
    </MotionConfig>
  );
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <Image src="/icon-192.png" alt="CheckTag" width={64} height={64} className="rounded-[18px]" priority />
      </motion.div>
    </div>
  );
}

function Stuck() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Image src="/icon-192.png" alt="" width={56} height={56} className="mx-auto mb-4 rounded-[16px]" />
        <h1 className="mb-2 text-[19px] font-bold text-ct-text">CheckTag couldn’t start</h1>
        <p className="mb-5 text-[14.5px] text-ct-text-2">Check your connection and try again.</p>
        <button type="button" onClick={() => location.reload()} className="ct-grad h-11 rounded-[14px] px-6 text-[15px] font-semibold text-white">
          Try again
        </button>
      </div>
    </div>
  );
}

function Main() {
  const { stack, loadMe } = useApp();
  useEffect(() => {
    loadMe();
  }, [loadMe]);
  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        <AnimatePresence initial={false}>
          {stack.map((e, i) => {
            const visible = i === stack.length - 1;
            return (
              <ScreenFrame key={e.id} visible={visible} depth={i}>
                <Screen e={e} visible={visible} />
              </ScreenFrame>
            );
          })}
        </AnimatePresence>
      </div>
      <SheetHost />
      <ToastHost />
    </>
  );
}

function Screen({ e, visible }: { e: Entry; visible: boolean }) {
  switch (e.k) {
    case "scan":
      return <ScanScreen visible={visible} />;
    case "product":
      return <ProductScreen barcode={e.barcode} lookup={e.lookup} view={e.view} visible={visible} />;
    case "label":
      return <LabelScreen barcode={e.barcode} name={e.name} visible={visible} />;
    case "settings":
      return <SettingsScreen visible={visible} />;
    case "history":
      return <HistoryScreen visible={visible} />;
    case "cashback":
      return <CashbackScreen visible={visible} />;
  }
}
