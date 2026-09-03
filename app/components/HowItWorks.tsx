"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import notificationImage from "/public/notification.svg";
import googlePlayImage from "/public/googleplay.svg";

const HowItWorks = () => {
  return (
    <section
      className="relative py-20 md:py-32 bg-[#020817] overflow-hidden"
      id="how-it-works"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#0037A6]/8 blur-[150px]" />
        <div className="orb-3 absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-[#22AED1]/6 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-[80px] relative z-10">
        {/* For Manufacturers Section */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-16 mb-16 md:mb-32 items-center">
          <motion.div
            className="px-4 md:px-0"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 mb-6">
              <span className="text-[#22AED1] text-xs font-semibold tracking-wide uppercase">
                For Manufacturers
              </span>
            </div>
            <h2 className="text-[24px] md:text-[40px] leading-[120%] tracking-[-0.03em] font-bold text-white mb-5">
              Built for manufacturers{" "}
              <span className="text-white/40">and QA teams</span>
            </h2>
            <p className="text-white/40 text-[15px] leading-[170%] mb-8 max-w-[480px]">
              Give every product a digital identity, straight from your production
              line — unit-level serialization, real-time scan analytics, and
              product-integrity protection.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                {
                  strong: "Unit-level serialization:",
                  text: "Every item has a unique identity.",
                },
                {
                  strong: "Instant verification:",
                  text: "<800ms API checks at global edge.",
                },
                {
                  strong: "Cloning & reuse detection:",
                  text: "Flag suspicious re-scans by time/geo/device.",
                },
                {
                  strong: "Recall & batch tools:",
                  text: "Push precise safety notices by batch/lot.",
                },
                {
                  strong: "Analytics:",
                  text: "Heatmaps of scan locations and counterfeit hotspots.",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#22AED1]/10 border border-[#22AED1]/30 flex items-center justify-center flex-shrink-0">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22AED1"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-white/60 text-[14px] leading-[160%]">
                    <strong className="text-white/80">{item.strong}</strong>{" "}
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@checktag.io?subject=Join the CheckTag Waitlist"
              className="inline-block px-8 py-3.5 bg-[#22AED1] hover:bg-[#1A9AB8] text-white rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-[#22AED1]/20 transition-all duration-300"
            >
              Join the waitlist
            </a>
          </motion.div>
          <motion.div
            className="flex justify-center items-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-full max-w-[500px] p-6 glass-card rounded-3xl border border-white/5">
              <Image
                src={notificationImage}
                alt="Notification Dashboard"
                className="w-full h-auto rounded-2xl"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>

        {/* For Customers Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-16 mt-8 md:mt-16">
          <motion.div
            className="flex justify-center items-center order-last md:order-first"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-full relative h-[450px] md:h-[700px] flex items-center justify-center">
              {/* Hand holding phone */}
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="relative w-full h-full md:w-[540px] mt-[-10px] md:mt-[-40px]">
                  <Image
                    src="/howitworks/hand.svg"
                    alt="Hand Holding Phone"
                    fill
                    className="object-contain "
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Blur CheckTag */}
              <motion.div
                className="absolute left-[3%] md:left-[8%] bottom-[28%] md:bottom-[22%] w-[140px] md:w-[233px] h-[140px] md:h-[211px] z-10"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/howitworks/blur-checktag.svg"
                  alt="Blur CheckTag"
                  fill
                  className="object-contain"
                  loading="lazy"
                />
              </motion.div>

              {/* Small CheckTag */}
              <motion.div
                className="absolute left-[60%] bottom-[30%] md:bottom-[20%] w-[60px] md:w-[131px] h-[60px] md:h-[123px] z-20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/howitworks/sm-checktag.svg"
                  alt="Small CheckTag"
                  fill
                  className="object-contain"
                  loading="lazy"
                />
              </motion.div>

              {/* Big CheckTag */}
              <motion.div
                className="absolute right-[5%] md:right-[13%] bottom-[47%] md:bottom-[57%] w-[100px] md:w-[168px] h-[90px] md:h-[152px] z-15"
                animate={{
                  x: [0, -5, 0],
                  y: [0, -5, 0],
                  scale: [1, 0.97, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              >
                <Image
                  src="/howitworks/big-checktag.svg"
                  alt="Big CheckTag"
                  fill
                  className="object-contain"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="px-4"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 mb-6">
              <span className="text-[#22AED1] text-xs font-semibold tracking-wide uppercase">
                For Customers
              </span>
            </div>
            <h2 className="text-[24px] md:text-[40px] leading-[120%] tracking-[-0.03em] font-bold text-white mb-5">
              Scan and Earn —{" "}
              <span className="gradient-text-warm">get rewarded</span> every time
            </h2>
            <p className="text-white/40 text-[15px] leading-[170%] mb-8 max-w-[480px]">
              Every scan and contribution earns you reward points—plus streaks,
              campaigns, and bonuses. Know what you consume while your cash-back
              rewards grow.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Look for the CheckTag on the product",
                "Scan with our app to instantly see what's inside the product",
                "Earn points with every valid scan — plus streaks, campaign boosts, and bonuses",
                "Report problems in seconds—photos help the brand act",
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#FF8633]/10 border border-[#FF8633]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FF8633] text-[10px] font-bold">{i + 1}</span>
                  </div>
                  <span className="text-white/60 text-[14px] leading-[160%]">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex space-x-4">
              <a
                href="https://play.google.com/store/apps/details?id=apk.checktag.io"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-medium text-sm hover:bg-white/10 transition-all duration-300 flex items-center space-x-2"
              >
                <Image src={googlePlayImage} alt="Google Play" width={80} height={20} loading="lazy" className="brightness-0 invert" />
              </a>
              <a
                href="#download"
                className="flex items-center px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition-all duration-300"
              >
                <Image
                  src="/appstore.svg"
                  alt="App Store"
                  width={16}
                  height={20}
                  className="mr-2 brightness-0 invert"
                  loading="lazy"
                />
                <div className="text-left">
                  <p className="text-[8px] leading-[50%] text-white/50">
                    Download on the
                  </p>
                  <p className="text-sm leading-[120%] font-semibold">
                    App Store
                  </p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>

        {/* AI Feature Section */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-16 mt-16 md:mt-32 items-center">
          <motion.div
            className="px-4 md:px-0"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-[#FF8633]/20 bg-[#FF8633]/5 mb-6">
              <span className="text-[#FF8633] text-xs font-semibold tracking-wide uppercase">
                Know what&apos;s inside • New
              </span>
            </div>
            <h2 className="text-[24px] md:text-[40px] leading-[120%] tracking-[-0.03em] font-bold text-white mb-5">
              Know exactly{" "}
              <span className="text-white/40">what&apos;s inside</span>
            </h2>
            <p className="text-white/40 text-[15px] leading-[170%] mb-8 max-w-[480px]">
              Smarter than a scan—our AI breaks down what&apos;s inside every
              product and what it means for you. Plus, chat with our AI assistant
              about any product.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                {
                  strong: "Ingredient Health Analysis:",
                  text: "AI breaks down every ingredient, explaining health impacts and risk levels",
                },
                {
                  strong: "AI Product Assistant:",
                  text: "Chat with our bot to compare prices, find alternatives, and get personalized recommendations",
                },
                {
                  strong: "Safety & authenticity flags:",
                  text: "Quick flags for suspicious codes, recalls, and expired items so you can steer clear",
                },
                {
                  strong: "Batch & expiry details:",
                  text: "See batch, lot, and expiry info at a glance, with recall alerts when they matter",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#FF8633]/10 border border-[#FF8633]/30 flex items-center justify-center flex-shrink-0">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FF8633"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-white/60 text-[14px] leading-[160%]">
                    <strong className="text-white/80">{item.strong}</strong>{" "}
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex space-x-4">
              <a
                href="#download"
                className="px-8 py-3.5 shimmer-btn text-white rounded-full font-medium text-sm hover:shadow-lg hover:shadow-[#0037A6]/30 transition-all duration-300"
              >
                Try it now
              </a>
            </div>
          </motion.div>
          <motion.div
            className="flex justify-center items-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#FF8633]/20 via-[#22AED1]/10 to-[#0037A6]/20 rounded-3xl blur-xl" />
              <div className="relative glass-card rounded-3xl border border-white/5 p-6">
                <Image
                  src="/robot.svg"
                  alt="AI Robot"
                  width={450}
                  height={450}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
