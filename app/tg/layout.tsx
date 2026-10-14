import type { Metadata, Viewport } from "next";
import "./tg.css";

export const metadata: Metadata = {
  title: "CheckTag",
  description: "Scan any product to see what’s inside, read shopper reviews and earn cash-back.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Before first paint: mark the page as the mini app and pick light or dark
// (saved choice, else Telegram's theme from the launch URL, else the system),
// so there's no flash of the website's dark background.
const THEME_BOOT = `(function(){try{var d=document.documentElement;d.classList.add("tg");var p=localStorage.getItem("ct_theme")||"auto",t=p;if(p==="auto"){var dark=null,m=/tgWebAppThemeParams=([^&]+)/.exec(location.hash||"");if(m){try{var bg=(JSON.parse(decodeURIComponent(m[1])).bg_color||"").replace("#","");if(/^[0-9a-f]{6}$/i.test(bg)){var r=parseInt(bg.slice(0,2),16),g=parseInt(bg.slice(2,4),16),b=parseInt(bg.slice(4,6),16);dark=0.299*r+0.587*g+0.114*b<128}}catch(e){}}if(dark===null)dark=!(window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches);t=dark?"dark":"light"}d.dataset.theme=t}catch(e){}})();`;

export default function TelegramLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      {/* Telegram asks for its script to load before the page runs, so the
          launch data is ready on first render. */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="https://telegram.org/js/telegram-web-app.js" />
      {children}
    </>
  );
}
