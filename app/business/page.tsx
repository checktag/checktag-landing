import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApplyForm from "./ApplyForm";
import { BadgeCheck, BarChart3, FileText, Flag, MessageSquareText, QrCode, ShieldAlert, Siren } from "lucide-react";

export const metadata: Metadata = {
  title: "CheckTag for brands: verified products, scan analytics and pack codes",
  description:
    "Claim your products on CheckTag, keep their details right, see where they're scanned, reply to reviews, give every pack a code shoppers can check, and reach them with recalls. Free during the pilot.",
  alternates: { canonical: "/business" },
};

// What a brand gets in the portal today. Keep this list to things that exist.
const features = [
  {
    icon: BadgeCheck,
    title: "A verified brand badge",
    text: "We check your company before you get access. Your products then show a Verified brand badge to everyone who scans them.",
  },
  {
    icon: FileText,
    title: "Your products, your details",
    text: "Claim your barcodes, then correct names, photos, descriptions and ingredients yourself. Changes go live straight away, marked “Provided by” your brand, and you can undo them.",
  },
  {
    icon: BarChart3,
    title: "Scans by country",
    text: "How often each product is scanned, in which countries, and what shoppers were shown. Country only: we never show you who scanned.",
  },
  {
    icon: MessageSquareText,
    title: "Reviews and replies",
    text: "Read what shoppers say about your products and reply publicly, as your brand.",
  },
  {
    icon: Flag,
    title: "Shopper reports",
    text: "See problems shoppers report with your products, such as a suspected fake or an expired pack, with the photos they took.",
  },
  {
    icon: QrCode,
    title: "A code for every pack",
    text: "Make serialised QR codes, each signed with your brand's own key, and print them on your labels. Shoppers scan one to check that pack is genuine.",
  },
  {
    icon: ShieldAlert,
    title: "Clone alerts",
    text: "If one code is scanned in two countries, or by more people than a single pack would be, you get an alert and shoppers are warned.",
  },
  {
    icon: Siren,
    title: "Recalls that reach people",
    text: "Write a recall or safety notice. Once we've checked it, everyone who scanned the product in the last year is notified, and every scan shows it.",
  },
];

const steps = [
  { title: "Apply", text: "Tell us about your company and the brands you sell. It takes two minutes." },
  { title: "We verify you", text: "We check your company and contact details, usually within two working days, then invite you to the portal." },
  { title: "Claim your products", text: "Search the catalogue or type your barcodes, with your GS1 prefix as evidence. We approve each claim." },
  { title: "Go", text: "Fix your product details, make codes for your packs, watch scans and reply to reviews." },
];

const faqs = [
  {
    q: "What does it cost?",
    a: "Nothing during the pilot. Prices for later haven't been set.",
  },
  {
    q: "Do shoppers need the app to check a code?",
    a: "No. A CheckTag code is a link, so any phone camera opens it and shows whether the pack checks out. The CheckTag app does the same.",
  },
  {
    q: "How do you detect copied codes?",
    a: "Each code belongs to one pack. We look at the country each scan comes from (never a precise location), how many different people scan it, and how often. A code that turns up in two countries is very likely copied.",
  },
  {
    q: "Who can see our data?",
    a: "Only people from your company that you invite. Each person signs in with a password and an authenticator app, and you choose whether they can make changes or only view.",
  },
  {
    q: "What isn't there yet?",
    a: "An API and webhooks, single sign-on, and linking cartons to the units inside them. Tell us in your application if you need them.",
  },
];

export default function BusinessPage() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#020817] noise-bg text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-32 md:px-[120px] md:pt-40">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-1 absolute left-[10%] top-[10%] h-[340px] w-[340px] rounded-full bg-[#0037A6]/20 blur-[110px]" />
          <div className="orb-2 absolute right-[8%] top-[25%] h-[280px] w-[280px] rounded-full bg-[#22AED1]/15 blur-[90px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 dot-pattern" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#22AED1]">For brands · Free pilot</span>
          </div>
          <h1 className="mb-5 text-[32px] font-bold leading-[115%] tracking-[-0.03em] md:text-[52px]" style={{ textWrap: "balance" }}>
            When shoppers check your products, <span className="gradient-text">make sure they see the real thing.</span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-[170%] text-white/55 md:text-lg">
            The CheckTag brand portal lets you keep your products&apos; details right, see where they&apos;re scanned, give every pack a code shoppers can check, and
            reach people when something&apos;s wrong.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#apply" className="rounded-full bg-[#22AED1] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1A9AB8] hover:shadow-lg hover:shadow-[#22AED1]/20">
              Apply for early access
            </a>
            <a href="/portal/login" className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/5">
              Sign in to the portal
            </a>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="relative px-4 py-16 md:px-[120px]">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-center text-[24px] font-bold tracking-[-0.03em] md:text-[36px]">What you get today</h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-[15px] leading-[170%] text-white/45">Everything here works now, for every brand in the pilot.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="glass-card rounded-3xl p-6">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-[#22AED1]/25 bg-[#22AED1]/10">
                  <f.icon className="h-5 w-5 text-[#22AED1]" />
                </div>
                <h3 className="mb-2 font-bold">{f.title}</h3>
                <p className="text-[14px] leading-[165%] text-white/50">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-4 py-16 md:px-[120px]">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-[24px] font-bold tracking-[-0.03em] md:text-[36px]">How it works</h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <span className="mb-4 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#103C8F] to-[#14A6C9] text-sm font-bold">{i + 1}</span>
                <h3 className="mb-1.5 font-bold">{s.title}</h3>
                <p className="text-[14px] leading-[165%] text-white/50">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Questions + application */}
      <section className="relative px-4 py-16 md:px-[120px]">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 className="mb-6 text-[24px] font-bold tracking-[-0.03em] md:text-[32px]">Good to know</h2>
            <dl className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-1.5 text-[14px] leading-[170%] text-white/50">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div id="apply" className="scroll-mt-28">
            <div className="rounded-3xl border border-[#22AED1]/20 bg-gradient-to-b from-[#22AED1]/10 to-[#22AED1]/[0.02] p-6 md:p-8">
              <h2 className="text-[22px] font-bold tracking-[-0.02em] md:text-[28px]">Apply for early access</h2>
              <p className="mb-6 mt-2 text-[14px] leading-[165%] text-white/55">
                Free during the pilot. We read every application and reply by email.
              </p>
              <ApplyForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
