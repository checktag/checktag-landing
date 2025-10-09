"use client";

import React, { useState } from "react";
import Image from "next/image";
import checktagLogo from "/public/checktag-logo.svg";
import Link from "next/link";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-[120px] py-4 md:py-[30px]">
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <Image
            src={checktagLogo}
            alt="CheckTag Logo"
            width={139}
            height={28}
            loading="lazy"
          />
        </Link>

        {/* Hamburger button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-[#444955] mb-1"></div>
          <div className="w-6 h-0.5 bg-[#444955] mb-1"></div>
          <div className="w-6 h-0.5 bg-[#444955]"></div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center flex-1 mx-8">
          <ul className="flex space-x-8 text-[#444955] text-[12px] font-normal items-center">
            <li>
              <a href="#how-it-works" className="hover:text-[#0037A6]">
                How it works
              </a>
            </li>
            <li>
              <a href="#testimonials" className="hover:text-[#0037A6]">
                Testimonials
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-[#0037A6]">
                Pricing
              </a>
            </li>
            <li>
              <a href="#faqs" className="hover:text-[#0037A6]">
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          <button className="px-4 py-2 h-[44px] border border-[#0037A6] text-[#0037A6] hover:bg-blue-50 rounded-[40px] whitespace-nowrap">
            Book a demo
          </button>
          <button className="px-4 py-2 h-[44px] bg-[#0037A6] text-white rounded-[40px] hover:bg-blue-900 whitespace-nowrap">
            Get CheckTag
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } md:hidden absolute top-full left-0 right-0 bg-white z-50 shadow-lg`}
      >
        <div className="flex flex-col w-full px-4 py-6 space-y-6">
          <ul className="flex flex-col space-y-4 text-[#444955] text-[14px] font-normal">
            <li>
              <a href="#how-it-works" className="block hover:text-[#0037A6]">
                How it works
              </a>
            </li>
            <li>
              <a href="#testimonials" className="block hover:text-[#0037A6]">
                Testimonials
              </a>
            </li>
            <li>
              <a href="#pricing" className="block hover:text-[#0037A6]">
                Pricing
              </a>
            </li>
            <li>
              <a href="#faqs" className="block hover:text-[#0037A6]">
                FAQs
              </a>
            </li>
          </ul>
          <div className="flex flex-col space-y-3">
            <button className="w-full px-4 py-2 h-[44px] border border-[#0037A6] text-[#0037A6] hover:bg-blue-50 rounded-[40px]">
              Book a demo
            </button>
            <button className="w-full px-4 py-2 h-[44px] bg-[#0037A6] text-white rounded-[40px] hover:bg-blue-900">
              Get CheckTag
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
