// Thin, typed bridge to Telegram's WebApp object
// (https://core.telegram.org/bots/webapps). Every call is optional: outside
// Telegram, or on older clients, it quietly does nothing.

type Haptic = "light" | "medium" | "heavy" | "rigid" | "soft";
type Notice = "success" | "warning" | "error";

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: { id: number; first_name?: string }; start_param?: string };
  colorScheme?: "light" | "dark";
  version?: string;
  ready(): void;
  expand(): void;
  close(): void;
  openLink?(url: string): void;
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  isVersionAtLeast?(v: string): boolean;
  onEvent?(e: string, cb: () => void): void;
  offEvent?(e: string, cb: () => void): void;
  BackButton?: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback?: {
    impactOccurred(s: Haptic): void;
    notificationOccurred(t: Notice): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export const getTG = (): TelegramWebApp | null =>
  (typeof window !== "undefined" && window.Telegram?.WebApp) || null;

/** Inside Telegram only when it handed us signed initData. */
export const isTelegram = () => !!getTG()?.initData;

export function haptic(s: Haptic = "light") {
  try {
    getTG()?.HapticFeedback?.impactOccurred(s);
  } catch {}
}

export function notify(t: Notice) {
  try {
    getTG()?.HapticFeedback?.notificationOccurred(t);
  } catch {}
}

export function selection() {
  try {
    getTG()?.HapticFeedback?.selectionChanged();
  } catch {}
}

/** External links must open in Telegram's browser, not inside the mini app. */
export function openLink(url: string) {
  const tg = getTG();
  try {
    if (tg?.openLink && tg.initData) return tg.openLink(url);
  } catch {}
  window.open(url, "_blank", "noopener");
}

/** Back to the bot chat (where accounts are linked). */
export function closeApp() {
  try {
    getTG()?.close();
  } catch {}
}

export const STORES = {
  ios: "https://apps.apple.com/app/checktag-scan-earn/id6807120426",
  play: "https://play.google.com/store/apps/details?id=apk.checktag.io",
};

export const SUPPORT = "support@checktag.io";

export const LINK_COPY =
  "In the CheckTag chat, tap “Link my CheckTag account” to earn points on every scan and keep your history.";
