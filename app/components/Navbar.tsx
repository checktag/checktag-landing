"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import checktagLogo from "/public/checktag-logo.svg";
import Link from "next/link";
import closeIcon from "/public/close.svg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[999] transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500 ${
        scrolled
          ? "bg-[#020817]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-[120px] py-4 md:py-[20px]">
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <Image
            src={checktagLogo}
            alt="CheckTag Logo"
            width={139}
            height={28}
            loading="lazy"
            className="brightness-0 invert"
          />
        </Link>

        {/* Hamburger/Close button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <Image
              src={closeIcon}
              alt="Close Menu"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          ) : (
            <>
              <div className="w-6 h-0.5 bg-white mb-1"></div>
              <div className="w-6 h-0.5 bg-white mb-1"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </>
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center flex-1 mx-8">
          <ul className="flex space-x-8 text-white/70 text-[13px] font-medium items-center">
            <li>
              <a
                href="#features"
                className="hover:text-[#22AED1] transition-colors duration-300"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="hover:text-[#22AED1] transition-colors duration-300"
              >
                How it works
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className="hover:text-[#22AED1] transition-colors duration-300"
              >
                Testimonials
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="hover:text-[#22AED1] transition-colors duration-300"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#download"
                className="hover:text-[#22AED1] transition-colors duration-300"
              >
                Download
              </a>
            </li>
            <li>
              <a
                href="#faqs"
                className="hover:text-[#22AED1] transition-colors duration-300"
              >
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          <a
            href="#download"
            className="px-6 py-2.5 h-[44px] flex items-center justify-center shimmer-btn text-white rounded-full font-medium text-sm hover:shadow-lg hover:shadow-[#0037A6]/30 transition-shadow duration-300 whitespace-nowrap"
          >
            Download App
          </a>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } md:hidden absolute top-full left-0 right-0 bg-[#020817]/95 backdrop-blur-xl z-50 border-b border-white/5`}
      >
        <div className="flex flex-col w-full px-4 py-6 space-y-6">
          <ul className="flex flex-col space-y-4 text-white/70 text-[14px] font-medium">
            <li>
              <a
                href="#features"
                className="block hover:text-[#22AED1] transition-colors"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="block hover:text-[#22AED1] transition-colors"
              >
                How it works
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className="block hover:text-[#22AED1] transition-colors"
              >
                Testimonials
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="block hover:text-[#22AED1] transition-colors"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#download"
                className="block hover:text-[#22AED1] transition-colors"
              >
                Download
              </a>
            </li>
            <li>
              <a
                href="#faqs"
                className="block hover:text-[#22AED1] transition-colors"
              >
                FAQs
              </a>
            </li>
          </ul>
          <a
            href="#download"
            className="w-full text-center px-4 py-3 shimmer-btn text-white rounded-full font-medium"
          >
            Download App
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
