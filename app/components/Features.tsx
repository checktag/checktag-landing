"use client";

import React from "react";
import { motion } from "framer-motion";

const featureCards = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22AED1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Instant Barcode Scanning",
    description: "Scan any product barcode and instantly see what's inside—ingredients, contents, and product details in under 800ms.",
    gradient: "from-[#0037A6]/20 to-[#22AED1]/10",
    borderColor: "border-[#0037A6]/20",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "AI Health Analysis",
    description: "Our AI analyzes every ingredient in detail—telling you exactly how each component affects your health, with risk levels and recommendations.",
    gradient: "from-[#FF8633]/20 to-[#FFB347]/10",
    borderColor: "border-[#FF8633]/20",
    isNew: true,
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22AED1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01" />
        <path d="M12 10h.01" />
        <path d="M16 10h.01" />
      </svg>
    ),
    title: "AI Product Assistant",
    description: "Chat with our AI about any scanned product. Ask about alternatives, health impacts, pricing comparisons, and get personalized recommendations.",
    gradient: "from-[#22AED1]/20 to-[#7ACEE3]/10",
    borderColor: "border-[#22AED1]/20",
    isNew: true,
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
      </svg>
    ),
    title: "Complete Nutrition Data",
    description: "Get detailed nutritional breakdowns including calories, macros, vitamins, allergens, and ingredient sourcing—all from a single scan.",
    gradient: "from-[#A78BFA]/20 to-[#C4B5FD]/10",
    borderColor: "border-[#A78BFA]/20",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Authenticity & Safety Checks",
    description: "Flags suspicious codes and possible counterfeits, so you can steer clear of fake or unsafe products—one more layer of knowing what you're buying.",
    gradient: "from-[#10B981]/20 to-[#34D399]/10",
    borderColor: "border-[#10B981]/20",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
    title: "Earn Cash-Back Rewards",
    description: "Every scan and contribution earns you reward points, with bonuses for discovering new products and inviting friends. Redeem your points for cash-back rewards—get rewarded for knowing what you consume.",
    gradient: "from-[#F59E0B]/20 to-[#FBBF24]/10",
    borderColor: "border-[#F59E0B]/20",
  },
];

const Features = () => {
  return (
    <section
      className="relative py-20 md:py-32 bg-[#020817] overflow-hidden"
      id="features"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-2 absolute top-[30%] left-[5%] w-[500px] h-[500px] rounded-full bg-[#22AED1]/5 blur-[150px]" />
        <div className="orb-1 absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#0037A6]/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-[80px] relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 mb-6">
            <span className="text-[#22AED1] text-xs font-semibold tracking-wide uppercase">
              Powerful Features
            </span>
          </div>
          <h2 className="text-[28px] md:text-[48px] font-bold text-white leading-[120%] tracking-[-0.03em] mb-4">
            Everything you need to{" "}
            <span className="gradient-text">know what you consume</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-[600px] mx-auto leading-[160%]">
            From instant scanning to a full breakdown of ingredients and health impact—see exactly what you&apos;re putting into your body, and get rewarded every time you scan.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feature, index) => (
            <motion.div
              key={index}
              className={`feature-card relative p-8 rounded-2xl glass-card ${feature.borderColor} hover:border-white/15 group`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* New badge */}
              {feature.isNew && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#FF8633]/10 border border-[#FF8633]/30">
                  <span className="text-[#FF8633] text-[10px] font-bold uppercase tracking-wider">New</span>
                </div>
              )}

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-[170%]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
