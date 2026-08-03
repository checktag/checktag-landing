"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative bg-[#020817] border-t border-white/5 text-white pt-16 md:pt-20 pb-8 px-4 md:px-[120px] overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#22AED1]/30 to-transparent" />

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="flex flex-col space-y-4">
            <h4 className="text-[#22AED1] font-bold text-xs uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3 text-white/30 text-sm">
              <li>
                <Link href="/#how-it-works" className="hover:text-white/60 transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white/60 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white/60 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-white/60 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <a
                  href="/CTAG-Whitepaper.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/60 transition-colors"
                >
                  Whitepaper
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col space-y-4">
            <h4 className="text-[#22AED1] font-bold text-xs uppercase tracking-wider">
              Solutions
            </h4>
            <ul className="space-y-3 text-white/30 text-sm">
              <li>
                <Link href="/#pricing" className="hover:text-white/60 transition-colors">
                  Starter Plan
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white/60 transition-colors">
                  Growth Plan
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white/60 transition-colors">
                  Enterprise Plan
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col space-y-4">
            <h4 className="text-[#22AED1] font-bold text-xs uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-3 text-white/30 text-sm">
              <li>
                <Link href="/#faqs" className="hover:text-white/60 transition-colors">
                  FAQs & Help
                </Link>
              </li>
              <li>
                <a href="mailto:support@checktag.io" className="hover:text-white/60 transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <Link href="/#download" className="hover:text-white/60 transition-colors">
                  Download App
                </Link>
              </li>
              <li>
                <Link href="/brand" className="hover:text-white/60 transition-colors">
                  Brand Kit
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col space-y-4">
            <h4 className="text-[#22AED1] font-bold text-xs uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3 text-white/30 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white/60 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white/60 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy#cookies" className="hover:text-white/60 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/delete-account" className="hover:text-white/60 transition-colors">
                  Delete Account
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col space-y-4 col-span-2 md:col-span-1">
            <h4 className="text-white font-bold text-sm">
              Stay in the loop
            </h4>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-[#22AED1] bg-[#22AED1]/10 border border-[#22AED1]/20 rounded-full px-4 py-3 text-xs font-semibold max-w-[380px]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Subscribed! Check your inbox.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center bg-white/5 border border-white/10 rounded-full max-w-[380px] px-4 py-1.5 focus-within:border-[#22AED1]/30 transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="flex-grow bg-transparent text-white placeholder-white/30 focus:outline-none px-2 py-2 text-sm w-full"
                />
                <button
                  type="submit"
                  className="bg-[#22AED1]/10 text-[#22AED1] px-4 py-2 rounded-full hover:bg-[#22AED1]/20 text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="text-white/20 text-xs">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Image
              src="/checktag-logo.svg"
              alt="CheckTag Logo"
              width={100}
              height={20}
              loading="lazy"
              className="brightness-0 invert opacity-40"
            />
          </div>
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} CheckTag. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            {/* Social icons */}
            {[
              { label: "Twitter", path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
              { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
              { label: "Instagram", path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" },
            ].map((social, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/15 transition-all duration-300"
                aria-label={social.label}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" fillOpacity="0.3">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Huge watermark logo positioned statically at the very bottom, below everything, with natural flow */}
      <div className="w-full flex justify-center mt-16 md:mt-24 opacity-[0.12] pointer-events-none select-none relative z-10">
        <Image
          src="/checktag-logo-big.svg"
          alt="CheckTag Logo Big"
          width={1200}
          height={240}
          className="w-full max-w-[1000px] h-auto brightness-0 invert"
        />
      </div>
    </footer>
  );
};

export default Footer;
