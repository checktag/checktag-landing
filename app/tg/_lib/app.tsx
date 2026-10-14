"use client";

// App-wide state for the mini app: a screen stack (wired to Telegram's back
// button), one bottom sheet at a time, toasts, the account, theme and the
// community-guidelines acceptance.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, errText } from "./api";
import { regionHint } from "./region";
import { getTG, haptic } from "./telegram";
import type { Guidelines, Me } from "./types";

export type View = "overview" | "reviews" | "label" | "cashback";

export type Route =
  | { k: "scan" }
  | { k: "product"; barcode: string; view?: View; lookup?: boolean }
  | { k: "label"; barcode: string; name: string }
  | { k: "settings" }
  | { k: "history" }
  | { k: "cashback" };

export type Entry = Route & { id: number };

export interface SheetSpec {
  title: string;
  body: ReactNode;
}

type ThemePref = "auto" | "light" | "dark";

interface AppCtx {
  stack: Entry[];
  push(r: Route): void;
  pop(): void;
  popTo(k: Route["k"]): void;
  sheet: SheetSpec | null;
  openSheet(s: SheetSpec): void;
  closeSheet(): void;
  toast(msg: string): void;
  toastMsg: { id: number; text: string } | null;
  me: Me | null;
  signedIn: boolean;
  loadMe(): Promise<Me | null>;
  hint: string;
  theme: ThemePref;
  setTheme(t: ThemePref): void;
  blocked: Set<string>;
  block(id: string): void;
  unblock(id: string): void;
  guidelines(): Promise<Guidelines>;
  glAccepted(version: string): boolean;
  glRemember(version: string | null): void;
  accountEpoch: number;
}

const Ctx = createContext<AppCtx | null>(null);

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
};

const GL_FALLBACK: Guidelines = {
  version: "",
  title: "CheckTag community guidelines",
  points: [
    "Review products honestly, based on your own experience.",
    "No hate speech, harassment, threats, or sexual content.",
    "No spam, advertising, links, or personal contact details.",
    "Don't post anyone's personal information.",
    "Reviews can be reported by anyone. Content that breaks these rules is removed, and repeat offenders lose the ability to post.",
  ],
  zeroTolerance: "CheckTag has zero tolerance for objectionable content or abusive users.",
  contact: "support@checktag.io",
};

const ls = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

/** Light or dark for a theme preference, following Telegram when "auto". */
export function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref !== "auto") return pref;
  const tg = getTG();
  if (tg?.initData && tg.colorScheme) return tg.colorScheme;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function AppProvider({ initial, children }: { initial: Route[]; children: ReactNode }) {
  const nextId = useRef(1);
  const [stack, setStack] = useState<Entry[]>(() => initial.map((r) => ({ ...r, id: nextId.current++ })));
  const [sheet, setSheet] = useState<SheetSpec | null>(null);
  const [toastMsg, setToastMsg] = useState<{ id: number; text: string } | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [theme, setThemeState] = useState<ThemePref>(() => (ls.get("ct_theme") as ThemePref) || "auto");
  const [blocked, setBlocked] = useState<Set<string>>(() => new Set());
  const [accountEpoch, setAccountEpoch] = useState(0);
  const hint = useMemo(() => regionHint(), []);
  const glCache = useRef<Guidelines | null>(null);

  const push = useCallback((r: Route) => {
    haptic();
    setStack((s) => [...s, { ...r, id: nextId.current++ }]);
  }, []);
  const pop = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const popTo = useCallback(
    (k: Route["k"]) =>
      setStack((s) => {
        const i = s.map((e) => e.k).lastIndexOf(k);
        return i >= 0 ? s.slice(0, i + 1) : [{ k: "scan", id: nextId.current++ }];
      }),
    [],
  );

  const openSheet = useCallback((s: SheetSpec) => setSheet(s), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((text: string) => {
    setToastMsg({ id: Date.now(), text });
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const signedIn = !!me?.signedIn;
  const signedInRef = useRef(signedIn);
  const loadMe = useCallback(async () => {
    try {
      const d = await api<Me>(`/api/me${hint ? `?hint=${hint}` : ""}`);
      setMe(d);
      if (signedInRef.current !== !!d.signedIn) {
        signedInRef.current = !!d.signedIn;
        setBlocked(new Set());
        setAccountEpoch((n) => n + 1);
      }
      return d;
    } catch (e) {
      console.warn("[tg] /api/me failed:", errText(e));
      return null;
    }
  }, [hint]);

  // ---- theme
  const applyTheme = useCallback((pref: ThemePref) => {
    const t = resolveTheme(pref);
    document.documentElement.dataset.theme = t;
    const bg = t === "light" ? "#f6f8fc" : "#0a0f1e";
    const tg = getTG();
    try {
      tg?.setHeaderColor?.(bg);
      tg?.setBackgroundColor?.(bg);
      tg?.setBottomBarColor?.(t === "light" ? "#ffffff" : "#121829");
    } catch {}
  }, []);
  const setTheme = useCallback(
    (t: ThemePref) => {
      ls.set("ct_theme", t);
      setThemeState(t);
      applyTheme(t);
    },
    [applyTheme],
  );
  useEffect(() => {
    applyTheme(theme);
    const tg = getTG();
    const onTg = () => theme === "auto" && applyTheme("auto");
    tg?.onEvent?.("themeChanged", onTg);
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    mq?.addEventListener?.("change", onTg);
    return () => {
      tg?.offEvent?.("themeChanged", onTg);
      mq?.removeEventListener?.("change", onTg);
    };
  }, [theme, applyTheme]);

  // ---- Telegram back button: closes the sheet first, then pops a screen.
  const backRef = useRef<() => void>(() => {});
  backRef.current = () => {
    haptic();
    if (sheet) setSheet(null);
    else pop();
  };
  useEffect(() => {
    const tg = getTG();
    const bb = tg?.BackButton;
    if (!bb) return;
    const h = () => backRef.current();
    bb.onClick(h);
    return () => bb.offClick(h);
  }, []);
  useEffect(() => {
    const bb = getTG()?.BackButton;
    if (!bb) return;
    if (stack.length > 1 || sheet) bb.show();
    else bb.hide();
  }, [stack.length, sheet]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sheet) setSheet(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  // ---- community guidelines (acceptance remembered per Telegram user)
  const who = () => {
    const id = getTG()?.initDataUnsafe?.user?.id;
    return id ? `tg:${id}` : "tg";
  };
  const glMap = (): Record<string, string> => {
    try {
      return JSON.parse(ls.get("ct_gl") || "{}") || {};
    } catch {
      return {};
    }
  };
  const guidelines = useCallback(async () => {
    if (glCache.current) return glCache.current;
    try {
      glCache.current = await api<Guidelines>("/api/community/guidelines", { anon: true });
      return glCache.current;
    } catch {
      return GL_FALLBACK;
    }
  }, []);
  const glAccepted = useCallback((v: string) => !!v && glMap()[who()] === v, []);
  const glRemember = useCallback((v: string | null) => {
    const m = glMap();
    if (v) m[who()] = v;
    else delete m[who()];
    ls.set("ct_gl", JSON.stringify(m));
  }, []);

  const block = useCallback((id: string) => setBlocked((b) => new Set(b).add(id)), []);
  const unblock = useCallback(
    (id: string) =>
      setBlocked((b) => {
        const n = new Set(b);
        n.delete(id);
        return n;
      }),
    [],
  );

  const value: AppCtx = {
    stack,
    push,
    pop,
    popTo,
    sheet,
    openSheet,
    closeSheet,
    toast,
    toastMsg,
    me,
    signedIn,
    loadMe,
    hint,
    theme,
    setTheme,
    blocked,
    block,
    unblock,
    guidelines,
    glAccepted,
    glRemember,
    accountEpoch,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
