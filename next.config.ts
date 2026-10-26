import type { NextConfig } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.checktag.io";

// Security headers.
//  • Every page: no MIME sniffing, a strict referrer policy, HTTPS only, and only
//    our own pages may use the camera (the Telegram mini app's barcode scanner).
//  • Everything except the Telegram mini app (/tg, which Telegram Web shows in a
//    frame) refuses to be framed by other sites.
//  • /admin and the brand portal (/portal): a strict content security policy —
//    only our own code, only talks to the CheckTag API, never framed, never cached.
const base = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()" },
];

const adminCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${API}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const locked = [
  { key: "Content-Security-Policy", value: adminCsp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: base },
      { source: "/((?!tg(?:/|$)).*)", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      ...["/admin", "/admin/:path*", "/portal", "/portal/:path*"].map((source) => ({ source, headers: locked })),
    ];
  },
};

export default nextConfig;
