"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/stores";

const DownloadApp = () => {
  return (
    <section
      className="relative py-20 md:py-32 bg-[#020817] overflow-hidden"
      id="download"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[20%] left-[30%] w-[600px] h-[600px] rounded-full bg-[#0037A6]/10 blur-[200px]" />
        <div className="orb-2 absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#22AED1]/8 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-[80px] relative z-10">
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Gradient border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-[#0037A6] via-[#22AED1] to-[#FF8633] rounded-3xl" />

          <div className="relative bg-[#0A1628] rounded-3xl p-8 md:p-16">
            <div className="dot-pattern absolute inset-0 rounded-3xl opacity-50" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              {/* Left content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 mb-6">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22AED1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="text-[#22AED1] text-xs font-semibold tracking-wide uppercase">
                    Download Now
                  </span>
                </div>

                <h2 className="text-[28px] md:text-[44px] font-bold text-white leading-[120%] tracking-[-0.03em] mb-5">
                  Get CheckTag on{" "}
                  <span className="gradient-text">your device</span>
                </h2>

                <p className="text-white/40 text-base leading-[170%] mb-8 max-w-[480px] mx-auto md:mx-0">
                  Scan to know what you consume—see exactly what&apos;s inside, get AI
                  insights on what it means for you, and earn rewards with every
                  scan, all from your phone. Your health is worth the scan.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  {/* Android — Google Play */}
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#3DDC84]/10 border border-[#3DDC84]/20 flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#3DDC84">
                        <path d="M17.523 15.3414c-.5615 0-1.0236-.4621-1.0236-1.0236s.4621-1.0236 1.0236-1.0236 1.0236.4621 1.0236 1.0236-.4621 1.0236-1.0236 1.0236m-11.046 0c-.5615 0-1.0236-.4621-1.0236-1.0236s.4621-1.0236 1.0236-1.0236 1.0236.4621 1.0236 1.0236-.4621 1.0236-1.0236 1.0236m11.4045-6.02l2.0049-3.4717c.1124-.1947.0449-.4437-.15-.5561-.1946-.1124-.4436-.0449-.556.15l-2.031 3.5169C15.4952 7.1411 13.809 6.5 12 6.5s-3.4952.6411-5.1449 1.4585L4.824 4.4426c-.1124-.1949-.3614-.2624-.556-.15-.1949.1124-.2624.3614-.15.5561l2.0049 3.4717C2.4696 10.6698.0 14.3356.0 18.5h24c0-4.1644-2.4696-7.8302-6.1185-10.2186"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                        Get it on
                      </p>
                      <p className="text-white font-bold text-lg leading-tight">
                        Google Play
                      </p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22AED1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                  </a>

                  {/* iOS App Store */}
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                        Download on the
                      </p>
                      <p className="text-white font-bold text-lg leading-tight">
                        App Store
                      </p>
                    </div>
                  </a>
                </div>

                {/* File info */}
                <div className="flex items-center gap-6 mt-6 text-white/20 text-xs">
                  <span>Free to download</span>
                  <span>•</span>
                  <span>iOS 17+</span>
                  <span>•</span>
                  <span>Android 9.0+</span>
                </div>
              </div>

              {/* Right side - Phone mockup effect */}
              <div className="flex-shrink-0 hidden md:block">
                <div className="relative">
                  <div className="absolute -inset-8 bg-gradient-to-r from-[#0037A6]/30 via-[#22AED1]/20 to-[#FF8633]/20 rounded-full blur-3xl" />
                  <div className="relative w-[280px] h-[400px] rounded-[40px] bg-gradient-to-b from-[#0D2847] to-[#0A1628] border border-white/10 p-3 shadow-2xl">
                    <div className="w-full h-full rounded-[32px] bg-gradient-to-b from-[#0037A6]/20 to-transparent flex flex-col items-center justify-center space-y-6">
                      {/* CheckTag icon */}
                      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Image
                          src="/checktag-logo.svg"
                          alt="CheckTag"
                          width={50}
                          height={50}
                          className="brightness-0 invert"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-lg">CheckTag</p>
                        <p className="text-white/30 text-xs mt-1">Scan. Know. Earn.</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="#FFB347"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                        <span className="text-white/30 text-xs ml-2">5.0</span>
                      </div>
                      <motion.div
                        className="px-8 py-3 shimmer-btn rounded-full"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span className="text-white font-semibold text-sm">Install</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DownloadApp;
