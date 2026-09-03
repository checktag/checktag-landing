"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "I scan every new skincare product before I use it. CheckTag breaks down the ingredients in plain English and flags what to watch for—then I earn rewards just for checking. It's become a habit.",
    name: "Daniel Koch",
    role: "Skincare shopper",
    image: "/daniel.jpg",
    bg: "bg-gradient-to-br from-[#0A1628] to-[#0D2847]",
    border: "border-[#22AED1]/10",
  },
  {
    text: "I love seeing exactly what's in the snacks and products I buy for my kids. The AI insights are so clear, and the points I earn add up. Knowing what we consume finally feels easy.",
    name: "Rita Adeyemi",
    role: "Mum of two",
    image: "/ritaAde.jpg",
    bg: "bg-gradient-to-br from-[#0E4654]/80 to-[#0A2E37]",
    border: "border-[#22AED1]/15",
  },
  {
    text: "Before CheckTag I never read labels. Now one scan tells me everything—the ingredients and what they mean for me. Fast, clear, and I get rewarded for it.",
    name: "Miguel Santos",
    role: "Fitness enthusiast",
    image: "/miguel.jpg",
    bg: "bg-gradient-to-br from-[#FF8633]/10 to-[#1A0D00]",
    border: "border-[#FF8633]/15",
  },
  {
    text: "I scan groceries as I shop to see what's actually inside. When something's missing from the database, I add it and earn points. It's genuinely useful and a little addictive.",
    name: "Ethan Park",
    role: "Home cook",
    image: "/ethan.jpg",
    bg: "bg-gradient-to-br from-[#22AED1]/5 to-[#0A1628]",
    border: "border-white/5",
  },
  {
    text: "The ingredient insights are the clearest I've found, and I love earning rewards for scanning products I'd buy anyway. I recommend CheckTag to everyone I know.",
    name: "Aisha Al-Hassan",
    role: "Wellness blogger",
    image: "/aisha.jpg",
    bg: "bg-gradient-to-br from-[#001642] to-[#0A1628]",
    border: "border-[#0037A6]/15",
  },
];

const Testimonials = () => {
  return (
    <section
      className="relative py-20 md:py-32 bg-[#020817] overflow-hidden"
      id="testimonials"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-2 absolute top-[40%] left-[50%] w-[600px] h-[600px] rounded-full bg-[#22AED1]/5 blur-[200px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 mb-6">
            <span className="text-[#22AED1] text-xs font-semibold tracking-wide uppercase">
              Reviews & Testimonials
            </span>
          </div>
          <h2 className="text-[28px] md:text-[48px] font-bold text-white leading-[120%] tracking-[-0.03em] mb-4">
            People love knowing{" "}
            <span className="gradient-text-warm">what&apos;s really inside</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-[600px] mx-auto leading-[160%]">
            See what everyday shoppers say about scanning smarter, learning
            what&apos;s in their products, and earning as they go.
          </p>
        </motion.div>

        <div className="w-full max-w-[1200px] mx-auto">
          {/* Desktop: Stacked card layout, Mobile: Vertical scroll */}
          <div className="md:relative md:h-[800px]">
            {testimonials.map((t, index) => {
              // Desktop positioning
              const positions = [
                "md:absolute md:top-[50%] md:left-[50%] md:-translate-x-1/2 md:-translate-y-1/2 md:w-[530px] z-50",
                "md:absolute md:top-[2%] md:left-[2%] md:w-[500px] md:h-[340px] md:rotate-6 z-10 md:hover:z-[60] md:hover:rotate-0",
                "md:absolute md:top-[2%] md:right-[2%] md:w-[500px] md:h-[340px] md:-rotate-6 z-40 md:hover:z-[60] md:hover:rotate-0",
                "md:absolute md:bottom-[4%] md:left-[2%] md:w-[500px] md:h-[340px] md:-rotate-3 z-30 md:hover:z-[60] md:hover:rotate-0",
                "md:absolute md:bottom-[2%] md:right-[2%] md:w-[500px] md:h-[340px] md:rotate-4 z-40 md:hover:z-[60] md:hover:rotate-0",
              ];

              return (
                <motion.div
                  key={index}
                  className={`w-full ${positions[index]} ${t.bg} text-white rounded-2xl border ${t.border} shadow-xl md:hover:scale-105 md:hover:shadow-2xl transition-all duration-500 ease-in-out mb-6 md:mb-0`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="p-6 md:p-10 space-y-5">
                    {/* Quote icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-20">
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" />
                      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor" />
                    </svg>
                    <p className="text-[15px] md:text-[17px] leading-[170%] text-white/80">
                      {t.text}
                    </p>
                    <div className="flex items-center pt-2">
                      <Image
                        src={t.image}
                        alt={t.name}
                        width={40}
                        height={40}
                        loading="lazy"
                        className="rounded-full w-10 h-10 object-cover border-2 border-white/10"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-white/40">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
