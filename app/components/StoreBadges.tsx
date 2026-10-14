import React from "react";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/stores";

const APPLE_PATH =
  "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z";
const PLAY_PATH =
  "M3.6 1.8c-.36.2-.6.6-.6 1.08v18.24c0 .48.24.88.6 1.08l10.2-10.2L3.6 1.8zm11.62 8.78L5.9.97l11.67 6.74-2.35 2.87zm0 2.84l2.35 2.87L5.9 23.03l9.32-9.61zM19.1 8.6l2.63 1.52c.75.43.75 1.33 0 1.76L19.1 13.4l-2.62-1.4 2.62-3.4z";

const Badge = ({ href, label, store, path }: { href: string; label: string; store: string; path: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${label} ${store}`}
    className="group flex items-center gap-3 min-w-[200px] pl-4 pr-6 py-3 bg-white/[0.06] border border-white/15 rounded-2xl hover:bg-white/10 hover:border-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22AED1] transition-all duration-300"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d={path} />
    </svg>
    <span className="text-left">
      <span className="block text-white/50 text-[10px] font-medium uppercase tracking-wider leading-tight">{label}</span>
      <span className="block text-white font-semibold text-[17px] leading-tight">{store}</span>
    </span>
  </a>
);

/** "Download on the App Store" + "Get it on Google Play", side by side. */
const StoreBadges = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
    <Badge href={APP_STORE_URL} label="Download on the" store="App Store" path={APPLE_PATH} />
    <Badge href={PLAY_STORE_URL} label="Get it on" store="Google Play" path={PLAY_PATH} />
  </div>
);

export default StoreBadges;
