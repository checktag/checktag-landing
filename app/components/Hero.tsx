"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const Hero = () => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationStep(1), 1500), // Show genuine product notification
      setTimeout(() => setAnimationStep(2), 3500), // Show alert notification
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="flex flex-col items-center text-center bg-white pt-8 md:pt-16 px-4">
      <h1 className="text-[40px] md:text-[80px] font-bold text-[#444955] mb-4 w-full md:w-[905px] leading-[100%] tracking-[-5%]">
        Stop counterfeits at the source. Verify in seconds
      </h1>
      <p className="text-base md:text-lg text-[#8F9299] font-normal leading-[150%] tracking-[-5%] w-full md:w-[641px] mb-8">
        CheckTag gives each product a unique, secure code. Brands protect their
        lines; customers scan to confirm authenticity—instantly.
      </p>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 h-auto md:h-[44px] items-center mb-8 md:mb-16 w-full md:w-auto">
        <button className="w-full md:w-auto p-4 bg-[#0037A6] text-white rounded-[40px] hover:bg-blue-800">
          Join the waitlist
        </button>
      </div>

      {/* Animated Hero Section */}
      <div className="w-full md:w-[995px] h-[400px] md:h-[500px] relative mt-10 md:mt-24">
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
            className="object-cover rounded-t-[20px] md:rounded-t-[40px]"
            sizes="(max-width: 768px) 100vw, 995px"
          />
        </motion.div>

        {/* Small Phone - Left */}
        <motion.div
          className="absolute right-[0%] bottom-[9%] md:bottom-[30%] w-[100%] h-[100%] z-20"
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
          className="absolute right-[0%] bottom-[9%] md:bottom-[30%] w-[100%] h-[100%] z-10"
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

        {/* Genuine Product Notification */}
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
                alt="Genuine Product"
                width={180}
                height={60}
                className="w-[100px] md:w-[180px] h-auto"
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
                className="w-[120px] md:w-[200px] h-auto"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Hero;
