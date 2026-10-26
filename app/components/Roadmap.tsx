"use client";

import React from "react";
import { motion } from "framer-motion";

type Status = "LIVE" | "PILOT" | "NEXT" | "PLANNED" | "HORIZON";

const statusStyles: Record<Status, string> = {
  LIVE: "border-[#22AED1]/40 bg-[#22AED1]/10 text-[#22AED1]",
  PILOT: "border-[#22AED1]/40 bg-[#22AED1]/10 text-[#22AED1]",
  NEXT: "border-[#22AED1]/25 bg-[#22AED1]/5 text-[#22AED1]/80",
  PLANNED: "border-white/15 bg-white/5 text-white/45",
  HORIZON: "border-white/10 bg-white/[0.03] text-white/30",
};

const phases: {
  n: string;
  status: Status;
  title: string;
  tagline: string;
  points: string[];
}[] = [
  {
    n: "01",
    status: "LIVE",
    title: "Scan & Know",
    tagline: "Consumer intelligence, in seconds.",
    points: [
      "Instant product intelligence — see what's inside admin-vetted products",
      "AI ingredient breakdown, nutrition analysis and safety scoring",
      "Health insights, risk flags and allergy awareness on every scan",
      "Scan history, product provenance and counterfeit reporting",
      "Scan points — earn for every scan and quality contribution",
    ],
  },
  {
    n: "02",
    status: "NEXT",
    title: "Scan-to-Earn",
    tagline: "Turn scanning into rewards.",
    points: [
      "Redeem your scan points for cash-back rewards",
      "Flexible payouts — cash back, gift cards and more",
      "Streaks and milestones that boost your rewards",
      "Referral rewards and community bonuses",
      "Reward multipliers that favour quality contributions over volume",
    ],
  },
  {
    n: "03",
    status: "PILOT",
    title: "The Brand Layer",
    tagline: "Every product gets a digital identity.",
    points: [
      "Brand portal, now in a free pilot: verified brands keep their product details right",
      "Serialised, signed QR codes for every pack, with clone alerts",
      "Recall notices pushed to everyone who scanned the product",
      "Scan analytics by country, review replies and shopper reports",
      "Later: supply-chain provenance from factory to shelf, and verified brand campaigns",
    ],
  },
  {
    n: "04",
    status: "PLANNED",
    title: "Health Intelligence",
    tagline: "Personalised, and private by default.",
    points: [
      "A personal health profile — allergies, conditions, preferences",
      "Drug interaction checks and medication authenticity verification",
      "Personalised nutrition and safety scoring, tuned to you",
      "Sponsored health campaigns with pharmacies and providers",
      "Clinical-grade features rolled out only alongside regulated partners",
    ],
  },
  {
    n: "05",
    status: "HORIZON",
    title: "The Trust Layer",
    tagline: "Open infrastructure for the consumer economy.",
    points: [
      "Privacy-first rewards you control, redeemed however you choose",
      "Community programs and contributor recognition",
      "Privacy-preserving research data for institutions and public health",
      "Partner rails for pharma, retail, agriculture, government and NGOs",
      "One trusted product-intelligence layer across the ecosystem",
    ],
  },
];

const Roadmap = () => {
  return (
    <section
      className="relative py-20 md:py-32 bg-[#020817] overflow-hidden"
      id="roadmap"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[12%] left-[8%] w-[500px] h-[500px] rounded-full bg-[#0037A6]/8 blur-[150px]" />
        <div className="orb-2 absolute bottom-[14%] right-[6%] w-[420px] h-[420px] rounded-full bg-[#22AED1]/6 blur-[130px]" />
      </div>
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      <div className="container mx-auto px-4 md:px-[80px] relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 mb-6">
            <span className="text-[#22AED1] text-xs font-semibold tracking-wide uppercase">
              Roadmap
            </span>
          </div>
          <h2 className="text-[24px] md:text-[40px] leading-[120%] tracking-[-0.03em] font-bold text-white mb-5">
            From a single scan{" "}
            <span className="text-white/40">to a global trust layer</span>
          </h2>
          <p className="text-white/40 text-[15px] leading-[170%]">
            We start where trust is decided — the moment you pick a product up. Each
            phase widens the circle: from what&apos;s in your hand, to what brands can
            prove, to an open economy where verified knowledge has value.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Spine */}
          <div className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-[#22AED1]/50 via-[#22AED1]/15 to-transparent" />

          <div className="space-y-10 md:space-y-16">
            {phases.map((p, i) => {
              const flip = i % 2 === 1;
              return (
                <motion.div
                  key={p.n}
                  className="relative"
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                >
                  <div
                    className={`flex items-start gap-6 md:gap-0 ${
                      flip ? "md:flex-row-reverse" : "md:flex-row"
                    }`}
                  >
                    {/* Node */}
                    <div className="relative z-10 flex-none md:absolute md:left-1/2 md:-translate-x-1/2 md:top-6">
                      {(p.status === "LIVE" || p.status === "PILOT") && (
                        <div className="absolute inset-0 rounded-full bg-[#22AED1]/30 blur-md" />
                      )}
                      <div
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wide ${
                          p.status === "LIVE" || p.status === "PILOT"
                            ? "bg-gradient-to-br from-[#0037A6] to-[#22AED1] text-white border border-white/20"
                            : p.status === "NEXT"
                            ? "bg-[#0037A6]/30 text-[#22AED1] border border-[#22AED1]/40"
                            : "bg-white/[0.04] text-white/35 border border-white/10"
                        }`}
                      >
                        {p.n}
                      </div>
                    </div>

                    {/* Card */}
                    <div
                      className={`flex-1 md:w-[calc(50%-40px)] md:flex-none ${
                        flip ? "md:mr-auto md:pr-10" : "md:ml-auto md:pl-10"
                      }`}
                    >
                      <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7 transition-all duration-300 hover:border-[#22AED1]/30 hover:bg-white/[0.05]">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider ${statusStyles[p.status]}`}
                          >
                            {p.status}
                          </span>
                          <span className="text-white/25 text-[11px] font-medium tracking-wider uppercase">
                            Phase {p.n}
                          </span>
                        </div>

                        <h3 className="text-white font-bold text-[19px] md:text-[22px] tracking-[-0.02em] mb-1.5">
                          {p.title}
                        </h3>
                        <p className="text-[#22AED1]/70 text-[13px] mb-5">
                          {p.tagline}
                        </p>

                        <ul className="space-y-2.5">
                          {p.points.map((pt) => (
                            <li key={pt} className="flex gap-2.5">
                              <svg
                                className="flex-none mt-[7px]"
                                width="5"
                                height="5"
                                viewBox="0 0 5 5"
                                aria-hidden="true"
                              >
                                <circle
                                  cx="2.5"
                                  cy="2.5"
                                  r="2.5"
                                  fill={
                                    p.status === "LIVE" || p.status === "PILOT" || p.status === "NEXT"
                                      ? "#22AED1"
                                      : "rgba(255,255,255,0.25)"
                                  }
                                />
                              </svg>
                              <span className="text-white/45 text-[14px] leading-[165%]">
                                {pt}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footnote */}
        <motion.p
          className="text-center text-white/25 text-[13px] mt-14 max-w-xl mx-auto leading-[170%]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Phases roll out step by step and can overlap. Health and financial features are
          released only where we can do so responsibly — and, where required, with
          licensed partners.
        </motion.p>
      </div>
    </section>
  );
};

export default Roadmap;
