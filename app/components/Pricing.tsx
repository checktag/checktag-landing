"use client";

import React from "react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    description: "Best for small teams or pilots getting live in <2 weeks",
    price: "To Be Announced",
    includes: "Includes",
    features: [
      "Up to 100k unit codes / month",
      "Dashboard for product, batch/lot & plant setup",
      "Instant verification API (<800ms typical)",
      "Anti-reuse basics (duplicate scan detection)",
      "Consumer app pages (no-code editor)",
      "Reports intake (photo uploads, notifications)",
      "Basic analytics (scan counts, top locations)",
      "2 seats (role-based), 1 plant",
      "Email support (next-business-day)",
    ],
    overages: "Overages: $5 per additional 1k codes",
    cta: "Start a pilot",
    highlight: false,
    bg: "glass-card",
    border: "border-white/5",
    ctaStyle:
      "border border-white/20 text-white hover:bg-white/10",
  },
  {
    name: "Growth",
    description: "Best for brands rolling out across multiple SKUs and regions",
    price: "To Be Announced",
    includes: "Everything in Starter, plus",
    features: [
      "Up to 1M unit codes / month (tiered discounts)",
      "Advanced anti-clone (geo/time anomaly scoring)",
      "Recall tools (batch/lot targeting; in-app alerts)",
      "Carton ↔ unit linking (hierarchical serialization)",
      "10 seats, up to 5 plants, approval workflows",
      "Custom fields on scan page",
      "Analytics Pro (cohort trends, hotspot map, CSV)",
      "Webhooks & SDKs (connect ERP/WMS/CRM)",
      "SLA support (business hours, 4h first response)",
    ],
    overages: "Overages: lower $/1k after cap",
    cta: "Contact sales",
    highlight: true,
    bg: "bg-gradient-to-b from-[#22AED1]/15 to-[#22AED1]/5",
    border: "border-[#22AED1]/30",
    ctaStyle:
      "bg-[#22AED1] text-white hover:bg-[#1A9AB8] shadow-lg shadow-[#22AED1]/20",
  },
  {
    name: "Enterprise",
    description: "Best for regulated, multi-country operations with strict SLAs",
    price: "To Be Announced",
    includes: "Everything in Growth, plus",
    features: [
      "Unlimited codes (committed annual volume)",
      "Multi-tenant & multi-brand workspaces",
      "SSO / SAML, SCIM user provisioning",
      "Compliance pack (audit logs, IP allowlists)",
      "Batch anchoring (optional blockchain)",
      "Fine-grained policies (geo-fencing, device rules)",
      "Premium support (24×7, dedicated manager)",
      "On-site/virtual onboarding & packaging guidance",
    ],
    cta: "Contact sales",
    highlight: false,
    bg: "glass-card",
    border: "border-white/5",
    ctaStyle:
      "border border-white/20 text-white hover:bg-white/10",
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
            Scale from pilot to{" "}
            <span className="gradient-text">global rollout</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-[550px] mx-auto leading-[160%]">
            Choose a plan that matches your stage. Scanning for consumers
            remains free forever.
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
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/30 text-sm leading-[150%]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
              </div>

              <div className="flex-1 mb-8">
                <p className="text-white/50 text-sm font-semibold mb-4">
                  {plan.includes}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2.5">
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
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span className="text-white/50 text-[13px] leading-[150%]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                {plan.overages && (
                  <p className="text-white/30 text-xs mt-4 italic">{plan.overages}</p>
                )}
              </div>

              <button
                disabled
                className={`w-full py-3.5 rounded-full font-medium text-sm transition-all duration-300 opacity-65 cursor-not-allowed ${plan.ctaStyle.replace('hover:bg-white/10', '').replace('hover:bg-[#1A9AB8]', '')}`}
              >
                Coming soon
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
