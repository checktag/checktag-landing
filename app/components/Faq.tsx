"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Faq = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Is the CheckTag app free for consumers?",
      answer:
        "Yes. Scanning and seeing product info is free, and you don't need an account. You can optionally sign up to track scan history, earn cash-back rewards, and access smart features like the product assistant chatbot.",
    },
    {
      question: "What do I see after scanning?",
      answer:
        "Detailed product information—ingredients, nutritional data, batch/expiry info, and brand details—plus an AI health analysis of every ingredient. You'll also see a quick safety flag (like Suspicious or Expired) so you can shop with confidence.",
    },
    {
      question: "How does the AI Product Assistant work?",
      answer:
        "After scanning a product, tap the chat icon to open a conversation with our AI assistant. Ask anything—from ingredient health impacts to alternative product suggestions based on price, ingredients, and your dietary needs.",
    },
    {
      question: "Can I scan offline?",
      answer:
        "Yes. The app reads the code offline and pulls up the product details once you're back online. AI features require an active internet connection.",
    },
    {
      question: "How do I get CheckTag for Android?",
      answer:
        "CheckTag is available on the Google Play Store. Scroll to the Download section and tap 'Get it on Google Play', or search for 'CheckTag' in the Play Store, then install it like any other app. An iOS version is coming soon.",
    },
    {
      question: "What if the code won't scan?",
      answer:
        "Try cleaning the barcode surface and ensuring good lighting. If it still doesn't work, you can manually enter the code or take a photo for our AI to analyze the packaging.",
    },
  ];

  return (
    <section
      className="relative py-20 md:py-32 bg-[#020817] overflow-hidden"
      id="faqs"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-2 absolute top-[50%] left-[50%] w-[500px] h-[500px] rounded-full bg-[#0037A6]/5 blur-[200px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-[800px]">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#22AED1]/20 bg-[#22AED1]/5 mb-6">
            <span className="text-[#22AED1] text-xs font-semibold tracking-wide uppercase">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-[28px] md:text-[48px] font-bold text-white leading-[120%] tracking-[-0.03em] mb-4">
            No guesswork,{" "}
            <span className="text-white/40">just answers</span>
          </h2>
          <p className="text-white/40 text-base max-w-[500px] mx-auto leading-[160%]">
            Quick answers about scanning, AI features, downloading, and
            everything CheckTag.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                openFaqIndex === index
                  ? "border-[#22AED1]/20"
                  : "border-white/5 hover:border-white/10"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="flex items-center justify-between w-full px-6 py-5 text-left"
              >
                <h3 className="text-[15px] md:text-base font-semibold text-white/80 pr-4">
                  {faq.question}
                </h3>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    openFaqIndex === index
                      ? "bg-[#22AED1]/10 border border-[#22AED1]/30 rotate-180"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={openFaqIndex === index ? "#22AED1" : "#ffffff60"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>
              <AnimatePresence>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-white/40 text-sm leading-[170%]">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-[20px] md:text-[24px] font-bold text-white mb-3">
            Still have questions?
          </h3>
          <p className="text-white/30 text-sm mb-6 max-w-[400px] mx-auto">
            Our team is here to help. Reach out and we'll get back to you
            within 24 hours.
          </p>
          <a
            href="mailto:support@checktag.co"
            className="inline-flex items-center space-x-2 px-8 py-3.5 border border-white/15 text-white rounded-full font-medium text-sm hover:bg-white/5 transition-all duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>Send an email</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Faq;
