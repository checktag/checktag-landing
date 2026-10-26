"use client";

import React from "react";
import { motion } from "framer-motion";

// Brands are all on a free pilot for now. List only what the brand portal does
// today; anything planned is marked "coming later". No prices until they're set.
const plans: {
  name: string;
  description: string;
  price: string;
  priceNote?: string;
  includes: string;
  features: { text: string; later?: boolean }[];
  cta: string;
  highlight: boolean;
  bg: string;
  border: string;
  ctaStyle: string;
}[] = [
  {
    name: "Pilot",
    description: "For brands joining during early access.",
    price: "Free",
    priceNote: "during early access",
    includes: "Included today",
    features: [
      { text: "Verified brand badge on your products" },
      { text: "Claim products and keep their details right" },
      { text: "Scan analytics by country, results and top products" },
      { text: "Reviews, with public replies from your brand" },
      { text: "Shopper reports, with their photos" },
      { text: "Serialised, signed QR codes (up to 50,000 per batch)" },
      { text: "Clone alerts when a code looks copied" },
      { text: "Recalls and safety notices to everyone who scanned" },
      { text: "Team roles, with two-step sign-in for everyone" },
    ],
    cta: "Apply for early access",
    highlight: true,
    bg: "bg-gradient-to-b from-[#22AED1]/15 to-[#22AED1]/5",
    border: "border-[#22AED1]/30",
    ctaStyle: "bg-[#22AED1] text-white hover:bg-[#1A9AB8] shadow-lg shadow-[#22AED1]/20",
  },
  {
    name: "Growth",
    description: "For brands rolling out codes across many products and regions",
    price: "To be announced",
    includes: "Everything in the pilot, plus",
    features: [
      { text: "Deeper analytics: trends over time and CSV export", later: true },
      { text: "Carton ↔ unit linking", later: true },
      { text: "API and webhooks to connect your ERP or WMS", later: true },
    ],
    cta: "Apply for early access",
    highlight: false,
    bg: "glass-card",
    border: "border-white/5",
    ctaStyle: "border border-white/20 text-white hover:bg-white/10",
  },
  {
    name: "Enterprise",
    description: "For regulated, multi-country operations",
    price: "To be announced",
    includes: "Everything in Growth, plus",
    features: [
      { text: "Several brands under one company account", later: true },
      { text: "Single sign-on (SSO / SAML) and SCIM provisioning", later: true },
      { text: "Help with onboarding and packaging", later: true },
    ],
    cta: "Apply for early access",
    highlight: false,
    bg: "glass-card",
    border: "border-white/5",
    ctaStyle: "border border-white/20 text-white hover:bg-white/10",
  },
];

const Pricing = () => {
  return (
    <section
      className="relative py-20 md:py-32 bg-[#020817] overflow-hidden"
      id="pricing"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#0037A6]/8 blur-[200px]" />
        <div className="orb-2 absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#22AED1]/6 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-[80px] relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 mb-6">
            <span className="text-[#22AED1] text-xs font-semibold tracking-wide uppercase">
              Pricing
            </span>
          </div>
          <h2 className="text-[28px] md:text-[48px] font-bold text-white leading-[120%] tracking-[-0.03em] mb-4">
            Start with a{" "}
            <span className="gradient-text">free pilot</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-[550px] mx-auto leading-[160%]">
            The brand portal is in early access, and free for every brand in the
            pilot. Checking products stays free for shoppers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative p-8 rounded-3xl ${plan.bg} border ${plan.border} flex flex-col transition-all duration-500 hover:border-white/15 ${
                plan.highlight ? "md:scale-105 md:-mt-4 md:-mb-4" : ""
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#22AED1] text-white text-[10px] font-bold uppercase tracking-wider">
                  Open now
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/30 text-sm leading-[150%]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`font-bold text-white ${plan.price.length > 8 ? "text-2xl" : "text-4xl"}`}>{plan.price}</span>
                {plan.priceNote && <span className="ml-2 text-sm text-white/50">{plan.priceNote}</span>}
              </div>

              <div className="flex-1 mb-8">
                <p className="text-white/50 text-sm font-semibold mb-4">
                  {plan.includes}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2.5">
                      {feature.later ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={plan.highlight ? "#22AED1" : "#ffffff40"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 flex-shrink-0"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                      <span className={`text-[13px] leading-[150%] ${feature.later ? "text-white/35" : "text-white/60"}`}>
                        {feature.text}
                        {feature.later && (
                          <span className="ml-2 whitespace-nowrap rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                            Coming later
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="/business#apply"
                className={`w-full py-3.5 rounded-full font-medium text-sm text-center transition-all duration-300 ${plan.ctaStyle}`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
