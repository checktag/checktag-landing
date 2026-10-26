import type { Metadata } from "next";

// The brand portal's pages are client-side and private: keep them out of search.
export const metadata: Metadata = {
  title: "Brand portal | CheckTag",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
