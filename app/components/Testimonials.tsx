import React from "react";
import Image from "next/image";

const Testimonials = () => {
  return (
    <section
      className="py-8 md:py-[80px] bg-white flex justify-center items-center overflow-hidden"
      id="testimonials"
    >
      <div className="container mx-auto flex flex-col items-center px-4">
        <div className="text-center w-full md:w-[680px] mb-8 md:mb-12">
          <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">
            Reviews & Testimonials
          </span>
          <h2 className="text-[24px] md:text-[32px] text-center leading-[120%] md:leading-[100%] tracking-[-5%] font-bold text-[#444955] mt-5 mb-4">
            Brands using CheckTag reduce counterfeit complaints by up to 62%
            within 90 days.
          </h2>
          <p className="text-[14px] md:text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%]">
            Quality work requires attention to detail. Innovation drives
            progress in unexpected ways. Great design balances form and
            function. Learning never stops in a changing world.
          </p>
        </div>

        <div className="w-full max-w-[1200px] my-8 md:my-16">
          {/* Mobile: Vertical scroll container, Desktop: Positioned layout */}
          <div className="md:relative md:h-[800px]">
            {/* Center Card - Dark Navy */}
            <div className="w-full md:absolute md:top-[50%] md:left-[50%] md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-[530px] bg-[#000B1D] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-50 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] mb-6 md:mb-0">
              <div className="p-6 md:p-[48px] space-y-[19px]">
                <p className="text-[16px] md:text-[20px] leading-[150%]">
                  We plugged CheckTag into our existing line printers and were
                  generating unique codes per unit in two weeks. Re-scan
                  analytics flagged a reseller cluster we hadn't seen, and legal
                  acted with confidence. Marketing also loves the consumer page
                  editor—updates go live without engineering tickets.
                </p>
                <div className="flex items-center">
                  <Image
                    src="/daniel.jpg"
                    alt="Daniel Koch"
                    width={30}
                    height={40}
                    loading="lazy"
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Daniel Koch</p>
                    <p className="text-sm opacity-80">
                      Head of Packaging Ops, PureDerm Cosmetics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Card - Dark Navy */}
            <div className="w-full md:absolute md:top-[1%] md:left-[1%] md:w-[530px] md:h-[360px] bg-[#0E4654] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] md:transform md:rotate-12 z-10 md:hover:z-[60] md:hover:rotate-0 md:hover:scale-105 md:hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out mb-6 md:mb-0">
              <div className="p-6 md:p-[48px] space-y-[19px]">
                <p className="text-[16px] md:text-[20px] leading-[150%]">
                  CheckTag gave us unit-level visibility by batch and plant
                  without changing our packaging suppliers. The dashboard
                  highlighted counterfeit hotspots by market, so we tightened
                  distributor routes and reduced complaint volume within a
                  quarter. The recalls now reach only customers who scanned
                  affected lots, which cuts support time and write-offs.
                </p>
                <div className="flex items-center">
                  <Image
                    src="/ritaAde.jpg"
                    alt="Rita Adeyemi"
                    width={30}
                    height={40}
                    loading="lazy"
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Rita Adeyemi</p>
                    <p className="text-sm opacity-80">QA Lead, NutriHarvest</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Card - Orange */}
            <div className="w-full md:absolute md:top-[1%] md:right-[1%] md:w-[530px] md:h-[360px] bg-[#FF8633] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] md:transform md:-rotate-12 z-40 md:hover:z-[60] md:hover:rotate-0 md:hover:scale-105 md:hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out mb-6 md:mb-0">
              <div className="p-6 md:p-[48px] space-y-[19px]">
                <p className="text-[16px] md:text-[20px] leading-[150%]">
                  The edge verification is fast and the APIs are clean, which
                  helped us automate pharmacy field audits. Geo/device signals
                  surfaced a cloning pattern near one distributor, and we shut
                  it down with evidence. For regulators, batch anchoring
                  produced a tidy audit trail without slowing production.
                </p>
                <div className="flex items-center">
                  <Image
                    src="/miguel.jpg"
                    alt="Miguel Santos"
                    width={30}
                    height={40}
                    loading="lazy"
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Miguel Santos</p>
                    <p className="text-sm opacity-80">
                      Director of Compliance, VitaPharm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fourth Card - Light Blue */}
            <div className="w-full md:absolute md:bottom-[3%] md:left-[1%] md:w-[530px] md:h-[360px] bg-[#E8F6FA] text-[#444955] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:transform md:-rotate-6 z-30 md:hover:z-[60] md:hover:rotate-0 md:hover:scale-105 md:hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out mb-6 md:mb-0">
              <div className="p-6 md:p-[48px] space-y-[19px]">
                <p className="text-[16px] md:text-[20px] leading-[150%]">
                  By tying scan events to marketplace orders, CheckTag sped up
                  takedowns of counterfeit listings. The consumer report flow
                  funnels photos and receipts straight into a case timeline our
                  team can act on. We're also seeing fewer return-fraud attempts
                  because stores can check unit status on the spot.
                </p>
                <div className="flex items-center">
                  <Image
                    src="/ethan.jpg"
                    alt="Ethan Park"
                    width={30}
                    height={40}
                    loading="lazy"
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Ethan Park</p>
                    <p className="text-sm opacity-80">
                      eCommerce Lead, NovaCare Wellness
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fifth Card - Dark Navy */}
            <div className="w-full md:absolute md:bottom-[1%] md:right-[1%] md:w-[530px] md:h-[360px] bg-[#001642] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] md:transform md:rotate-9 z-40 md:hover:z-[60] md:hover:rotate-0 md:hover:scale-105 md:hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out">
              <div className="p-6 md:p-[48px] space-y-[19px]">
                <p className="text-[16px] md:text-[20px] leading-[150%]">
                  Re-use detection exposed cross-border label swapping during a
                  promotion, and geofenced rules reduced it almost immediately.
                  We can now differentiate unit, carton, and pallet scans, so
                  ops knows exactly where leakage occurs. The recall tooling and
                  SLAs held up during peak season.
                </p>
                <div className="flex items-center">
                  <Image
                    src="/aisha.jpg"
                    alt="Aisha Al-Hassan"
                    width={30}
                    height={40}
                    loading="lazy"
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Aisha Al-Hassan</p>
                    <p className="text-sm opacity-80">
                      COO, DesertSpring Beverages
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Waitlist Button */}
        <div className="w-full flex justify-center mt-8 md:mt-12">
          <button className="px-8 py-4 bg-[#0037A6] text-white text-[16px] font-semibold rounded-[40px] hover:bg-blue-800 transition-colors duration-300 shadow-md hover:shadow-lg">
            Join the waitlist
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
