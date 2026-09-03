"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const Hero = () => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationStep(1), 1500),
      setTimeout(() => setAnimationStep(2), 3500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative flex flex-col items-center text-center bg-transparent pt-28 md:pt-40 px-4 pb-12 md:pb-16 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-[#0037A6]/20 blur-[120px]" />
        <div className="orb-2 absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#22AED1]/15 blur-[100px]" />
        <div className="orb-3 absolute bottom-[20%] left-[40%] w-[300px] h-[300px] rounded-full bg-[#7ACEE3]/10 blur-[80px]" />
      </div>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-30"
        >
          <source src="/checktagScan.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/30 via-[#020817]/60 to-[#020817]" />
      </div>

      <motion.h1
        className="relative z-10 text-[36px] md:text-[72px] lg:text-[80px] font-bold text-white mb-6 w-full md:w-[950px] leading-[110%] tracking-[-0.03em]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Scan to know{" "}
        <span className="gradient-text">what you consume.</span>
      </motion.h1>

      <motion.p
        className="relative z-10 text-base md:text-lg text-white/50 font-normal leading-[160%] w-full md:w-[600px] mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Your health is worth the scan. Instantly see exactly what&apos;s inside any
        product, understand what it means for you, and earn rewards every time you scan.
      </motion.p>

      {/* Animated Hero Phones */}
      <div className="relative z-10 w-full md:w-[995px] h-[350px] md:h-[500px] mt-8 md:mt-12">
        {/* Background Rectangle */}
        <motion.div
          className="absolute top-[18%] left-0 w-full h-[45%] z-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
        >
          <Image
            src="/hero/rectangle.svg"
            alt="Background"
            fill
            className="object-cover rounded-t-[20px] md:rounded-t-[40px] opacity-40"
            sizes="(max-width: 768px) 100vw, 995px"
          />
        </motion.div>

        {/* Small Phone - Left */}
        <motion.div
          className="absolute right-[0%] bottom-0 md:bottom-[4%] w-[100%] h-[100%] z-20"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <Image
            src="/hero/sm-phone.svg"
            alt="Small Phone"
            fill
            className="object-contain"
          />
        </motion.div>

        {/* Big Phone - Right */}
        <motion.div
          className="absolute right-[0%] bottom-0 md:bottom-[4%] w-[100%] h-[100%] z-10"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Image
            src="/hero/big-phone.svg"
            alt="Big Phone"
            fill
            className="object-contain"
          />
        </motion.div>

        {/* Scan-complete Notification */}
        <AnimatePresence>
          {animationStep >= 1 && (
            <motion.div
              className="absolute left-[1%] md:left-[8%] top-[30%] md:top-[20%] z-30"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -10, 0],
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                },
              }}
            >
              <Image
                src="/hero/gen-product.svg"
                alt="Scan complete"
                width={180}
                height={60}
                className="w-[100px] md:w-[180px] h-auto drop-shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert/Report Notification */}
        <AnimatePresence>
          {animationStep >= 2 && (
            <motion.div
              className="absolute right-[1%] md:right-[8%] top-[40%] md:top-[25%] z-30"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: [0, 10, 0],
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                x: { duration: 0.5 },
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                },
              }}
            >
              <Image
                src="/hero/report.svg"
                alt="Report Alert"
                width={200}
                height={80}
                className="w-[120px] md:w-[200px] h-auto drop-shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020817] to-transparent z-20" />
    </section>
  );
};

export default Hero;
