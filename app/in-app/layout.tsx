import type { Metadata } from "next";
import "./in-app.css";

// Pages the mobile app opens in its own web view (Settings → Privacy policy,
// Terms of use). No site menu or footer, and the app's own light/dark palette.

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Before first paint: the app passes ?theme=light|dark to match itself;
// otherwise follow the phone. Avoids a flash of the website's dark base.
const THEME_BOOT = `(function(){try{var d=document.documentElement;d.classList.add("inapp");var t=new URLSearchParams(location.search).get("theme");if(t!=="light"&&t!=="dark")t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.dataset.theme=t}catch(e){}})();`;

export default function InAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      {children}
    </>
  );
}
