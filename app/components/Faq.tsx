"use client";

import React, { useState } from "react";
import Image from "next/image";
import minusIcon from "/public/minus.svg";
import plusIcon from "/public/plus.svg";

const Faq = () => {
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const faqs = [
    {
      question: "Is the CheckTag app free for consumers?",
      answer:
        "Yes. Scanning and seeing product info is free, and you don’t need an account.",
    },
    {
      question: "What do I see after scanning?",
      answer:
        "A clear status—Genuine, Suspicious, or Expired—plus batch/expiry and brand info.",
    },
    {
      question: "Can I scan offline?",
      answer:
        "Yes. The app reads the code offline and confirms authenticity once you’re back online.",
    },
    {
      question: "Do I need to sign in?",
      answer:
        "No for scanning. Sign in only if you want history sync, alerts, or faster reporting.",
    },
    {
      question: "What if the code won’t scan?",
      answer:
        "The app reads the code offline and confirms authenticity once you’re back online.",
    },
  ];

  return (
    <section
      className="py-16 bg-white text-[#0A2540] flex justify-center items-center"
      id="faqs"
    >
      <div className="container mx-auto px-4 flex flex-col items-center space-y-8">
        <div className="text-center flex flex-col items-center space-y-4 w-[680px]">
          <div className="text-[12px] font-normal leading-[100%] tracking-[-1%] bg-[#D3EFF6] text-[#22AED1] rounded-[40px] inline-block px-[12px] py-[6px]">
            Frequently Asked Questions
          </div>
          <h2 className="text-[32px] text-[#444955] leading-[100%] tracking-[-5%] font-bold">
            No guesswork, just answers
          </h2>
          <p className="text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%]">
            Short, useful answers that move you forward: scan tips, reporting,
            and alerts for customers; pricing tiers, rollouts, and analytics for
            companies. Use this section to remove blockers and accelerate
            adoption.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-4 py-[9px] bg-[#CCD7ED] text-[#0037A6] text-[14px] leading-[100%] tracking-[-1%] rounded-[40px] hover:bg-[#0037A6] hover:text-white">
              Customers
            </button>
            <button className="px-4 py-[9px] bg-transparent border border-[#0037A6] text-[#0037A6] rounded-[40px] hover:bg-[#0037A6] hover:text-white">
              Brands
            </button>
          </div>
        </div>

        <div className="space-y-4 w-[996px]">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-[#E8F6FA] px-[51px] py-[31px] justify-center rounded-3xl flex flex-col transition-all duration-300 ease-in-out ${
                openFaq[index] ? "max-h-[500px]" : "max-h-[80px]"
              }`}
            >
              <div className="flex items-center justify-between space-x-4">
                <h3 className="text-lg font-bold text-center">
                  {faq.question}
                </h3>
                <button
                  onClick={() => toggleFaq(index)}
                  title={openFaq[index] ? "Close FAQ" : "Open FAQ"}
                >
                  <Image
                    src={openFaq[index] ? minusIcon : plusIcon}
                    alt={openFaq[index] ? "Close FAQ" : "Open FAQ"}
                    width={46}
                    height={46}
                  />
                </button>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq[index] ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <p className="text-[#8F9299]">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center w-[616px] space-y-4 ">
          <h3 className="text-[32px] leading-[100%] tracking-[-5%%] font-bold">
            Still have questions?
          </h3>
          <p className="text-[#8F9299] text-[16px] leading-[150%] tracking-[-1%]">
            Quality work requires attention to detail. Innovation drives
            progress in unexpected ways. Great design balances form and
            function. Learning never stops in a changing world.
          </p>
          <button className="p-4 w-[160px] bg-[#0037A6] text-white rounded-[40px] hover:bg-[#002164]">
            Send an email
          </button>
        </div>
      </div>
    </section>
  );
};

export default Faq;
