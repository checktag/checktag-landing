"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import notificationImage from "/public/notification.svg";
import handHoldingPhoneImage from "/public/handholdingphone.svg";
import googlePlayImage from "/public/googleplay.svg";

const HowItWorks = () => {
  return (
    <section
      className="py-8 md:py-16 bg-white flex justify-center items-center"
      id="how-it-works"
    >
      <div className="container px-4 md:mx-[120px]">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-24 mb-8 md:mb-16">
          {/* For Manufacturers Section */}
          <div className="px-4 md:px-0">
            <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">
              For Manufacturers
            </span>
            <h2 className="text-[24px] md:text-[32px] leading-[120%] md:leading-[100%] tracking-[-5%] font-bold text-[#444955] mt-5 mb-4">
              Built for manufacturers and QA teams
            </h2>
            <p className="w-full md:w-[502px] text-[14px] md:text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%] mb-6">
              Quality work requires attention to detail. Innovation drives
              progress in unexpected ways. Great design balances form and
              function. Learning never stops in a changing world.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-3 text-[16px] leading-[150%] tracking-[-5%]">
              <li>
                <strong>Unit-level serialization:</strong> Every item has a
                unique identity.
              </li>
              <li>
                <strong>Instant verification:</strong> &lt;500ms API checks at
                global edge.
              </li>
              <li>
                <strong>Cloning & reuse detection:</strong> Flag suspicious
                re-scans by time/geo/device.
              </li>
              <li>
                <strong>Recall & batch tools:</strong> Push precise safety
                notices by batch/lot.
              </li>
              <li>
                <strong>Analytics:</strong> Heatmaps of scan locations and
                counterfeit hotspots.
              </li>
            </ul>
            <div className="flex flex-row space-x-4 h-auto md:h-[44px] items-center w-full md:w-auto">
              <button className="flex-1 md:flex-none md:w-auto p-4 rounded-[40px] bg-[#0037A6] text-white hover:bg-blue-800">
                Join the waitlist
              </button>
            </div>
            {/* Image for mobile */}
            <div className="mt-8 md:hidden">
              <Image
                src={notificationImage}
                alt="Notification"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
          <div className="flex justify-center items-center max-md:hidden">
            <div className="w-full">
              <Image
                src={notificationImage}
                alt="Notification"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-24 mt-8 md:mt-32">
          {/* For Customers Section */}
          <div className="flex justify-center items-center md:block order-last md:order-first">
            <div className="w-full relative h-[350px] md:h-[600px]">
              {/* Hand holding phone - base layer */}
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="w-[70%] md:w-[380px] mt-[-10px] md:mt-[-40px]">
                  <Image
                    src="/howitworks/hand.svg"
                    alt="Hand Holding Phone"
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Blur CheckTag - bottom left */}
              <motion.div
                className="absolute left-[3%] md:left-[8%] bottom-[28%] md:bottom-[22%] w-[140px] md:w-[233px] h-[140px] md:h-[211px] z-10"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/howitworks/blur-checktag.svg"
                  alt="Blur CheckTag"
                  fill
                  className="object-contain"
                  loading="lazy"
                />
              </motion.div>

              {/* Small CheckTag - bottom left, expanding and reducing */}
              <motion.div
                className="absolute left-[60%] md:left-[60%] bottom-[30%] md:bottom-[20%] w-[60px] md:w-[131px] h-[60px] md:h-[123px] z-20"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/howitworks/sm-checktag.svg"
                  alt="Small CheckTag"
                  fill
                  className="object-contain"
                  loading="lazy"
                />
              </motion.div>

              {/* Big CheckTag - bottom right */}
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
          </div>
          <div className="px-4">
            <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">
              For Customers
            </span>
            <h2 className="text-[24px] md:text-[32px] leading-[120%] md:leading-[100%] tracking-[-5%] font-bold text-[#444955] mt-5 mb-4">
              Authenticity pays — collect TAG with every scan
            </h2>
            <p className="w-full md:w-[502px] text-[14px] md:text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%] mb-6">
              Earn TAG every time you verify a product—help stop counterfeits
              while your balance grows and brands get safer data.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-3 text-[16px] leading-[150%] tracking-[-5%]">
              <li>Look for the CheckTag on the product</li>
              <li>
                Scan with our app to see if the product is Verified, Suspicious,
                or Expired.
              </li>
              <li>
                Earn TAG with every valid scan — plus streaks, brand campaign
                boosts, and referral bonuses
              </li>
              <li>Report problems in seconds—photos help the brand act</li>
            </ul>
            <div className="flex space-x-4">
              <button
                className="px-6 py-3 bg-[#0037A6] text-white rounded-4xl hover:bg-blue-800"
                title="Google Play"
              >
                <Image src={googlePlayImage} alt="Google Play" loading="lazy" />
              </button>
              <button
                className="flex items-center px-6 py-3 bg-[#0037A6] text-white rounded-4xl hover:bg-blue-800"
                title="App Store"
              >
                <Image
                  src="/appstore.svg"
                  alt="App Store"
                  width={20}
                  height={26}
                  className="mr-2"
                  loading="lazy"
                />
                <div className="text-left">
                  <p className="text-[8px] leading-[50%] tracking-[-10%]">
                    Download on the
                  </p>
                  <p className="text-md leading-[120%] tracking-[-10%] font-bold">
                    App Store
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* AI Feature Section */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-24 mt-8 md:mt-32">
          <div className="px-4 md:px-0">
            <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">
              For Customers
            </span>
            <h2 className="text-[24px] md:text-[32px] leading-[120%] md:leading-[100%] tracking-[-5%] font-bold text-[#444955] mt-5 mb-4">
              AI feature for deep checks and extra verification layers
            </h2>
            <p className="w-full md:w-[502px] text-[14px] md:text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%] mb-6">
              Smarter than a scan—our AI cross-checks every result with forensic
              and provenance signals for trust you can prove.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-3 text-[16px] leading-[150%] tracking-[-5%]">
              <li>
                <strong>Computer-vision forensics:</strong> spotx cloned codes,
                reprints, micro-tamper marks, and packaging inconsistencies
              </li>
              <li>
                <strong>Provenance & policy checks:</strong> validates
                batch/lot, geofenced distribution, recall lists, and on-chain
                attestations where supported
              </li>
              <li>
                <strong>Risk-based step-ups:</strong> triggers extra
                verification (multi-angle rescan, NFC tap, or OTP check) only
                when something looks off
              </li>
            </ul>
            <div className="flex flex-row space-x-4 h-auto md:h-[44px] items-center w-full md:w-auto">
              <button
                className="flex items-center px-6 py-3 bg-[#0037A6] text-white rounded-4xl hover:bg-blue-800"
                title="Google Play"
              >
                <Image src={googlePlayImage} alt="Google Play" loading="lazy" />
              </button>
              <button
                className="flex items-center px-6 py-3 bg-[#0037A6] text-white rounded-4xl hover:bg-blue-800"
                title="App Store"
              >
                <Image
                  src="/appstore.svg"
                  alt="App Store"
                  width={20}
                  height={26}
                  className="mr-2"
                  loading="lazy"
                />
                <div className="text-left">
                  <p className="text-[8px] leading-[50%] tracking-[-10%]">
                    Download on the
                  </p>
                  <p className="text-md leading-[120%] tracking-[-10%] font-bold">
                    App Store
                  </p>
                </div>
              </button>
            </div>
            {/* Image for mobile */}
            <div className="mt-8 md:hidden">
              <Image
                src="/robot.svg"
                alt="AI Robot"
                width={600}
                height={600}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
          <div className="flex justify-center items-center max-md:hidden">
            <div className="w-full">
              <Image
                src="/robot.svg"
                alt="AI Robot"
                width={600}
                height={600}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
