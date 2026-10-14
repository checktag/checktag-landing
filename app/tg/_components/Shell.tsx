"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { ChevronLeft, Coins, History, Settings, X } from "lucide-react";
import Image from "next/image";
import { useEffect, type ReactNode } from "react";
import { useApp } from "../_lib/app";
import { haptic, STORES } from "../_lib/telegram";
import { IconButton, cx, ease, spring } from "./ui";

/** One screen of the stack: its own scroll area, sliding in from the right. */
export function ScreenFrame({ visible, depth, children }: { visible: boolean; depth: number; children: ReactNode }) {
  return (
    <motion.section
      className={cx("ct-scroll absolute inset-0 bg-ct-bg", !visible && "pointer-events-none")}
      style={{ visibility: visible ? "visible" : "hidden" }}
      initial={depth === 0 ? false : { x: "18%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "18%", opacity: 0, transition: { duration: 0.22, ease } }}
      transition={{ duration: 0.34, ease }}
      aria-hidden={!visible}
    >
      {children}
    </motion.section>
  );
}

/** Sticky top bar: the brand on the root screen, a back arrow elsewhere. */
export function TopBar({ title }: { title?: string }) {
  const { stack, pop, push } = useApp();
  const root = !title;
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 bg-ct-bg px-4 pb-3"
      style={{ paddingTop: "calc(12px + env(safe-area-inset-top, 0px))" }}
    >
      {root ? (
        <>
          <Image src="/icon-192.png" alt="" width={34} height={34} className="rounded-[10px]" priority />
          <div className="text-[19px] font-extrabold tracking-[-0.02em] text-ct-text">CheckTag</div>
          <div className="ml-auto flex gap-2">
            <IconButton label="Your cash-back" onClick={() => push({ k: "cashback" })}>
              <Coins size={18} strokeWidth={1.9} />
            </IconButton>
            <IconButton label="Scan history" onClick={() => push({ k: "history" })}>
              <History size={18} strokeWidth={1.9} />
            </IconButton>
            <IconButton label="Settings" onClick={() => push({ k: "settings" })}>
              <Settings size={18} strokeWidth={1.9} />
            </IconButton>
          </div>
        </>
      ) : (
        <>
          {stack.length > 1 && (
            <IconButton label="Back" onClick={() => (haptic(), pop())}>
              <ChevronLeft size={20} strokeWidth={2.2} />
            </IconButton>
          )}
          <h1 className="truncate text-[18px] font-bold tracking-[-0.01em] text-ct-text">{title}</h1>
        </>
      )}
    </header>
  );
}

/** A fixed bar for the screen's main action (e.g. "Scan another product"). */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      exit={{ y: 80 }}
      transition={spring}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ct-border bg-ct-surface px-4 pt-3"
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto max-w-[540px]">{children}</div>
    </motion.div>
  );
}

// ------------------------------------------------------------------ sheet

export function SheetHost() {
  const { sheet, closeSheet } = useApp();
  const drag = useDragControls();
  useEffect(() => {
    document.documentElement.style.overflow = sheet ? "hidden" : "";
  }, [sheet]);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) closeSheet();
  };
  return (
    <AnimatePresence>
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" key="sheet">
          <motion.div
            className="absolute inset-0 bg-[rgba(6,12,28,0.55)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => (haptic(), closeSheet())}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={sheet.title}
            className="relative w-full max-w-[540px] rounded-t-[24px] border border-b-0 border-ct-border bg-ct-surface"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%", transition: { duration: 0.24, ease } }}
            transition={spring}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            <div className="cursor-grab touch-none px-5 pt-2.5" onPointerDown={(e) => drag.start(e)}>
              <div className="mx-auto h-1.5 w-10 rounded-full bg-ct-border-strong" />
              <div className="flex items-center justify-between gap-3 pb-2 pt-3">
                <h3 className="text-[18px] font-bold tracking-[-0.01em] text-ct-text">{sheet.title}</h3>
                <IconButton label="Close" onClick={() => (haptic(), closeSheet())} className="h-8 w-8">
                  <X size={16} />
                </IconButton>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={sheet.title}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2, ease }}
                className="ct-scroll max-h-[78dvh] px-5"
                style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
              >
                {sheet.body}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------ toast

export function ToastHost() {
  const { toastMsg } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4" style={{ bottom: "calc(92px + env(safe-area-inset-bottom, 0px))" }}>
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            key={toastMsg.id}
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={spring}
            className="max-w-[420px] rounded-[14px] bg-ct-text px-4 py-3 text-center text-[13.5px] font-semibold leading-snug text-ct-bg"
          >
            {toastMsg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------ outside Telegram

export function StoreButtons({ className }: { className?: string }) {
  return (
    <div className={cx("grid grid-cols-2 gap-3", className)}>
      <a href={STORES.ios} rel="noopener" className="flex items-center gap-2.5 rounded-[14px] border border-ct-border bg-ct-surface px-3.5 py-3 text-ct-text">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.24 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.03 2.29-1.27 3.14-2.53.99-1.45 1.4-2.85 1.42-2.92-.03-.01-2.72-1.04-2.75-4.13M14.6 4.5c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-medium uppercase tracking-wider text-ct-text-3">Download on the</span>
          <span className="block text-[15px] font-semibold">App Store</span>
        </span>
      </a>
      <a href={STORES.play} rel="noopener" className="flex items-center gap-2.5 rounded-[14px] border border-ct-border bg-ct-surface px-3.5 py-3 text-ct-text">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 3l13 9-13 9V3z" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-medium uppercase tracking-wider text-ct-text-3">Get it on</span>
          <span className="block text-[15px] font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}

export function Gate() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-[420px] text-center"
      >
        <Image src="/icon-192.png" alt="CheckTag" width={72} height={72} className="mx-auto mb-5 rounded-[20px]" priority />
        <h1 className="mb-2.5 text-[24px] font-extrabold tracking-[-0.02em] text-ct-text text-balance">CheckTag lives in our app</h1>
        <p className="mb-6 text-[15px] leading-relaxed text-ct-text-2">
          Scan any product to see what’s inside, read reviews from other shoppers, and earn cash-back on every scan.
        </p>
        <StoreButtons />
        <p className="mt-5 text-[13px] text-ct-text-3">Use Telegram? Open CheckTag from the bot’s menu button.</p>
      </motion.div>
    </div>
  );
}
