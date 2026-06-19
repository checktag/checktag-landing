"use client";

import React from "react";
import Image from "next/image";

const Partners = () => {
  const partners = [
    { name: "Milo", src: "/partners/milo.svg", width: 50, height: 50 },
    { name: "NB", src: "/partners/nb.svg", width: 50, height: 50 },
    { name: "Nestle", src: "/partners/nestle.svg", width: 50, height: 50 },
    { name: "Arla", src: "/partners/arla.svg", width: 50, height: 50 },
    { name: "Peak", src: "/partners/peak.svg", width: 60, height: 50 },
    { name: "CocaCola", src: "/partners/cocacola.svg", width: 102, height: 32 },
    { name: "Pepsi", src: "/partners/pepsi.svg", width: 106, height: 40 },
  ];

  const stats = [
    { value: "10M+", label: "Products Verified" },
    { value: "<800ms", label: "Verification Speed" },
    { value: "99.9%", label: "Accuracy Rate" },
    { value: "62%", label: "Fewer Counterfeits" },
  ];

  return (
    <section className="relative bg-[#020817] border-y border-white/5 text-white py-12 md:py-16 px-4 md:px-[80px] flex flex-col items-center overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 radial-glow-blue pointer-events-none" />
      
      <div className="space-y-2 text-center px-4 relative z-10 mb-8">
        <h2 className="text-[16px] md:text-[18px] leading-[140%] tracking-[-0.02em] font-medium text-white/40 max-w-[600px] mx-auto">
          Trusted by manufacturers in food & beverage, pharma, cosmetics & more
        </h2>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-12 py-6 border-y border-white/5 w-full max-w-[900px] mx-auto mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="text-center px-4">
            <div className="text-sm md:text-base font-bold text-white tracking-tight">{stat.value}</div>
            <div className="text-[9px] md:text-[10px] text-white/40 mt-1 uppercase tracking-wider font-semibold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Manufacturer logos carousel */}
      <div className="overflow-hidden w-full relative z-10 mt-4">
        <div className="flex gap-4 animate-scroll w-max">
          {Array(6)
            .fill(partners)
            .flat()
            .map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-white rounded-lg flex items-center justify-center w-[75px] md:w-[95px] h-[24px] md:h-[30px] hover:bg-slate-50 transition-all duration-300 shadow-sm"
              >
                <div className="relative w-[70%] h-[55%] flex items-center justify-center">
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    fill
                    className="opacity-95 hover:opacity-100 transition-opacity duration-300 object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
