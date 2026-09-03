import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ColorSwatch } from "./ColorSwatch";

export const metadata: Metadata = {
    title: "Brand Kit – CheckTag®",
    description:
        "The CheckTag brand: logo, colors, typography, and usage guidelines. Download official logos, color tokens, and the full brand kit.",
};

// Canonical brand palette = the mobile app's UI theme. Navy + Cyan.
const brand = [
    { name: "Deep Navy", hex: "#0C2E72", sub: "Primary-strong" },
    { name: "Navy", hex: "#103C8F", sub: "Primary" },
    { name: "Cyan", hex: "#14A6C9", sub: "Accent" },
    { name: "Navy Soft", hex: "#E9EFFB", sub: "Tinted surface" },
    { name: "Cyan Soft", hex: "#E2F5FB", sub: "Tinted surface" },
];
// Product surfaces — the app is a light experience.
const surfacesLight = [
    { name: "Canvas", hex: "#F6F8FC", sub: "App background" },
    { name: "Surface", hex: "#FFFFFF", sub: "Cards" },
    { name: "Surface Alt", hex: "#F1F4F9", sub: "Fills / inputs" },
    { name: "Border", hex: "#E2E8F0", sub: "Hairlines" },
    { name: "Ink", hex: "#091222", sub: "Primary text" },
    { name: "Slate", hex: "#41506A", sub: "Secondary text" },
];
// Marketing surfaces — the website is dark.
const surfacesDark = [
    { name: "Ink", hex: "#020817", sub: "Web background" },
    { name: "Deep", hex: "#0A1628", sub: "Raised surface" },
    { name: "Slate", hex: "#0D2847", sub: "Panels" },
];
const semantic = [
    { name: "Success", hex: "#0E9F6E" },
    { name: "Warning", hex: "#E08A00" },
    { name: "Danger", hex: "#DA4453" },
];

const gradients = [
    { name: "Brand", css: "linear-gradient(135deg, #103C8F 0%, #14A6C9 100%)" },
];

function DownloadPill({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300"
        >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22AED1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {label}
        </a>
    );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[#22AED1] text-sm font-semibold tracking-widest uppercase mb-3">
            {children}
        </p>
    );
}

export default function BrandPage() {
    return (
        <div className="w-full min-h-screen overflow-x-hidden bg-[#020817] noise-bg text-white">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-16 px-4 md:px-[120px] text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="orb-1 absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#0037A6]/20 blur-[100px]" />
                    <div className="orb-2 absolute top-[20%] right-[10%] w-[250px] h-[250px] rounded-full bg-[#22AED1]/15 blur-[80px]" />
                </div>
                <div className="absolute inset-0 dot-pattern pointer-events-none" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <Eyebrow>Brand</Eyebrow>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                        The CheckTag <span className="gradient-text">Brand Kit</span>
                    </h1>
                    <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-8">
                        Everything you need to represent CheckTag correctly — logo, colors,
                        type, and usage. &ldquo;Know what&rsquo;s really inside.&rdquo;
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <a
                            href="/brand/checktag-brand-kit.zip"
                            download
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full shimmer-btn text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#0037A6]/30 transition-all duration-300"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download brand kit
                        </a>
                        <a
                            href="#colors"
                            className="inline-flex items-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all duration-300"
                        >
                            Jump to colors
                        </a>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 pb-24 relative z-10 space-y-24">
                {/* LOGO */}
                <section id="logo">
                    <Eyebrow>Logo</Eyebrow>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Logo &amp; mark</h2>
                    <p className="text-white/50 text-base max-w-2xl mb-8">
                        The wordmark is our primary lockup. Use the icon on its own only where
                        the full wordmark won&rsquo;t fit (app icons, avatars, favicons).
                    </p>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Wordmark — white on dark */}
                        <div className="rounded-2xl border border-white/10 bg-[#0A1628] p-10 flex flex-col items-center justify-center min-h-[180px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/brand/checktag-wordmark-white.png" alt="CheckTag wordmark, white on dark" className="h-8 w-auto" />
                            <span className="text-white/30 text-xs mt-6">Wordmark · white on dark</span>
                        </div>
                        {/* Wordmark — colour on light */}
                        <div className="rounded-2xl border border-white/10 bg-white p-10 flex flex-col items-center justify-center min-h-[180px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/brand/checktag-wordmark-color.png" alt="CheckTag wordmark, colour on light" className="h-8 w-auto" />
                            <span className="text-black/30 text-xs mt-6">Wordmark · colour on light</span>
                        </div>
                        {/* Mark — gradient */}
                        <div className="rounded-2xl border border-white/10 bg-white p-10 flex flex-col items-center justify-center min-h-[180px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/brand/checktag-mark-gradient.svg" alt="CheckTag mark" className="h-20 w-auto" />
                            <span className="text-black/30 text-xs mt-6">Icon / mark</span>
                        </div>
                        {/* App icon */}
                        <div className="rounded-2xl border border-white/10 bg-[#0A1628] p-10 flex flex-col items-center justify-center min-h-[180px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/brand/checktag-app-icon.png" alt="CheckTag app icon" className="h-24 w-24 rounded-[22px] shadow-lg" />
                            <span className="text-white/30 text-xs mt-6">App launcher icon</span>
                        </div>
                    </div>

                    {/* Clear space */}
                    <div className="rounded-2xl border border-white/10 bg-[#0A1628] p-10 mt-5 flex flex-col items-center justify-center">
                        <div className="relative p-7 border border-dashed border-[#14A6C9]/40 rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/brand/checktag-wordmark-white.png" alt="CheckTag clear space" className="h-7 w-auto" />
                        </div>
                        <span className="text-white/30 text-xs mt-6">Keep clear space around the logo ≥ the height of the mark.</span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                        <DownloadPill href="/brand/checktag-wordmark.svg" label="Wordmark colour (SVG)" />
                        <DownloadPill href="/brand/checktag-wordmark-white.png" label="Wordmark white (PNG)" />
                        <DownloadPill href="/brand/checktag-wordmark-black.png" label="Wordmark black (PNG)" />
                        <DownloadPill href="/brand/checktag-mark.png" label="Mark (PNG)" />
                        <DownloadPill href="/brand/checktag-mark-gradient.svg" label="Mark gradient (SVG)" />
                        <DownloadPill href="/brand/checktag-mark-gradient.png" label="Mark gradient (PNG)" />
                        <DownloadPill href="/brand/checktag-app-icon.png" label="App icon (PNG)" />
                    </div>
                </section>

                {/* MISUSE */}
                <section id="usage">
                    <Eyebrow>Usage</Eyebrow>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Do &amp; don&rsquo;t</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div className="rounded-2xl border border-[#10B981]/25 bg-[#10B981]/5 p-6">
                            <p className="text-[#10B981] font-semibold mb-3">Do</p>
                            <ul className="space-y-2 text-white/60 text-sm list-disc list-inside">
                                <li>Give the logo generous clear space.</li>
                                <li>Use the wordmark on Ink (#020817) or white.</li>
                                <li>Use the provided SVGs so it stays crisp.</li>
                                <li>Keep the cyan accent for emphasis only.</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-[#FF8633]/25 bg-[#FF8633]/5 p-6">
                            <p className="text-[#FF8633] font-semibold mb-3">Don&rsquo;t</p>
                            <ul className="space-y-2 text-white/60 text-sm list-disc list-inside">
                                <li>Recolor, add gradients, or add drop shadows.</li>
                                <li>Stretch, rotate, or squash the logo.</li>
                                <li>Place it on a busy or low-contrast background.</li>
                                <li>Rebuild the wordmark in another typeface.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* COLORS */}
                <section id="colors">
                    <Eyebrow>Color</Eyebrow>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Palette</h2>
                    <p className="text-white/50 text-base max-w-2xl mb-8">
                        <span className="text-white">Navy + Cyan</span> is the brand. The canonical
                        palette is the mobile app&rsquo;s UI theme — a light experience; the
                        marketing site is a dark treatment of the same brand. Tap any swatch to copy
                        its hex.
                    </p>

                    <div className="space-y-8">
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Brand</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {brand.map((c) => <ColorSwatch key={c.hex} {...c} />)}
                            </div>
                        </div>
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Surfaces · product (light app)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                {surfacesLight.map((c) => <ColorSwatch key={c.hex} {...c} />)}
                            </div>
                        </div>
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Surfaces · marketing (dark web)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {surfacesDark.map((c) => <ColorSwatch key={c.hex} {...c} />)}
                            </div>
                        </div>
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Semantic</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {semantic.map((c) => <ColorSwatch key={c.hex} {...c} />)}
                            </div>
                        </div>

                        {/* Gradient */}
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Signature gradient</p>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {gradients.map((g) => (
                                    <div key={g.name} className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                                        <div className="h-16 w-full" style={{ backgroundImage: g.css }} />
                                        <p className="text-white text-sm font-semibold p-3">{g.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-8">
                        <DownloadPill href="/brand/checktag-colors.css" label="Colors (CSS)" />
                        <DownloadPill href="/brand/checktag-colors.json" label="Colors (JSON)" />
                    </div>
                </section>

                {/* TYPOGRAPHY */}
                <section id="type">
                    <Eyebrow>Typography</Eyebrow>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Type</h2>
                    <p className="text-white/50 text-base max-w-2xl mb-8">
                        <span className="text-white font-semibold">Geist</span> is our typeface
                        across product and web; <span className="text-white font-semibold">Geist Mono</span> for
                        code, product codes, and numeric detail. Both are free under the Open Font License.
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-[#0A1628] p-8 space-y-6">
                        <div>
                            <p className="text-white/30 text-xs mb-1">Display · 700</p>
                            <p className="text-white text-4xl md:text-5xl font-bold tracking-tight">Know what&rsquo;s really inside</p>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div>
                            <p className="text-white/30 text-xs mb-1">Heading · 600</p>
                            <p className="text-white text-2xl font-semibold">Scan. Know. Earn.</p>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div>
                            <p className="text-white/30 text-xs mb-1">Body · 400</p>
                            <p className="text-white/70 text-base max-w-xl">
                                CheckTag turns your phone into a product-intelligence scanner —
                                instantly see what&rsquo;s inside any product, understand what it
                                means for you with AI, and earn rewards as you go.
                            </p>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div>
                            <p className="text-white/30 text-xs mb-1">Geist Mono · 500</p>
                            <p className="text-[#22AED1] font-mono text-sm">SN-6156000261201 · 1,240 pts · 12 Aug 2026</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                        <a
                            href="https://vercel.com/font"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            Get Geist ↗
                        </a>
                    </div>
                </section>

                {/* VOICE */}
                <section id="voice">
                    <Eyebrow>Voice</Eyebrow>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Tone &amp; tagline</h2>
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0037A6]/15 to-[#22AED1]/10 p-8 mb-6">
                        <p className="text-white text-2xl md:text-3xl font-bold">
                            &ldquo;Know what&rsquo;s really <span className="gradient-text">inside</span>.&rdquo;
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {[
                            { t: "Trustworthy", d: "Confident and clear. We deal in facts, not hype." },
                            { t: "Empowering", d: "We put product knowledge — and rewards — in people's hands." },
                            { t: "Sharp", d: "Modern, concise, a little bit tech-forward. Never noisy." },
                        ].map((v) => (
                            <div key={v.t} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <p className="text-white font-semibold mb-2">{v.t}</p>
                                <p className="text-white/50 text-sm">{v.d}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* DOWNLOAD ALL */}
                <section id="download-all" className="text-center rounded-3xl border border-white/10 bg-[#0A1628] p-10 md:p-14">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get the full kit</h2>
                    <p className="text-white/50 text-base max-w-lg mx-auto mb-8">
                        Logos, icons, color tokens (CSS + JSON), and usage notes — in one download.
                    </p>
                    <a
                        href="/brand/checktag-brand-kit.zip"
                        download
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full shimmer-btn text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#0037A6]/30 transition-all duration-300"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download brand kit (.zip)
                    </a>
                    <p className="text-white/25 text-xs mt-5">
                        Questions about brand use? <a href="mailto:support@checktag.io" className="text-[#22AED1] hover:underline">support@checktag.io</a>
                    </p>
                </section>
            </div>

            <Footer />
        </div>
    );
}
