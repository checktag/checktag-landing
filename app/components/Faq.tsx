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
        <div className="text-center flex flex-col items-center space-y-4 w-full md:w-[680px] px-4 md:px-0">
          <div className="text-[12px] font-normal leading-[100%] tracking-[-1%] bg-[#D3EFF6] text-[#22AED1] rounded-[40px] inline-block px-[12px] py-[6px]">
            Frequently Asked Questions
          </div>
          <h2 className="text-[24px] md:text-[32px] text-[#444955] leading-[120%] md:leading-[100%] tracking-[-5%] font-bold">
            No guesswork, just answers
          </h2>
          <p className="text-[14px] md:text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%]">
            Short, useful answers that move you forward: scan tips, reporting,
            and alerts for customers; pricing tiers, rollouts, and analytics for
            companies. Use this section to remove blockers and accelerate
            adoption.
          </p>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <button className="w-full md:w-auto h-[42px] md:h-auto px-4 py-[9px] bg-[#CCD7ED] text-[#0037A6] text-[14px] leading-[100%] tracking-[-1%] rounded-[40px] hover:bg-[#0037A6] hover:text-white">
              Customers
            </button>
            <button className="w-full md:w-auto px-4 py-[9px] bg-transparent border border-[#0037A6] text-[#0037A6] rounded-[40px] hover:bg-[#0037A6] hover:text-white">
              Brands
            </button>
          </div>
        </div>

        <div className="space-y-4 w-full md:w-[996px] px-4 md:px-0">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-[#E8F6FA] px-4 md:px-[51px] py-6 md:py-[31px] justify-center rounded-3xl flex flex-col transition-all duration-300 ease-in-out ${
                openFaq[index]
                  ? "max-h-[500px]"
                  : "max-h-[100px] md:max-h-[80px]"
              }`}
            >
              <div className="flex items-center justify-between space-x-4">
                <h3 className="text-base md:text-lg font-bold pr-4">
                  {faq.question}
                </h3>
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex-shrink-0"
                  title={openFaq[index] ? "Close FAQ" : "Open FAQ"}
                >
                  <Image
                    src={openFaq[index] ? minusIcon : plusIcon}
                    alt={openFaq[index] ? "Close FAQ" : "Open FAQ"}
                    width={36}
                    height={36}
                    className="md:w-[46px] md:h-[46px]"
                    loading="lazy"
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
