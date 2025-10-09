import React from "react";
import Image from "next/image";

const Testimonials = () => {
  return (
    <section
      className="py-[80px] bg-white flex justify-center items-center overflow-hidden"
      id="testimonials"
    >
      <div className="container mx-auto flex flex-col items-center px-4">
        <div className="text-center w-[680px] mb-12">
          <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">
            Reviews & Testimonials
          </span>
          <h2 className="text-[32px] text-center leading-[100%] tracking-[-5%] font-bold text-[#444955] mt-5 mb-4">
            Brands using CheckTag reduce counterfeit complaints by up to 62%
            within 90 days.
          </h2>
          <p className="text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%]">
            Quality work requires attention to detail. Innovation drives
            progress in unexpected ways. Great design balances form and
            function. Learning never stops in a changing world.
          </p>
        </div>

        <div className="relative w-full max-w-[1200px] h-[800px] my-16">
          {/* Center Card - Dark Navy */}
          <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[530px] h-[360px] bg-[#000B1D] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-50 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] items-center flex">
            <div className="space-y-[19px] p-[48px]">
              <p className="text-[20px] leading-[150%]">
                We plugged CheckTag into our existing line printers and were
                generating unique codes per unit in two weeks. Re-scan analytics
                flagged a reseller cluster we hadn’t seen, and legal acted with
                confidence. Marketing also loves the consumer page
                editor—updates go live without engineering tickets.
              </p>
              <div className="flex items-center">
                <Image
                  src="/icon.svg"
                  alt="Daniel Koch"
                  width={48}
                  height={48}
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

          {/* Top Left Card - Dark Navy */}
          <div className="absolute top-[1%] left-[1%] w-[530px] h-[360px] bg-[#0E4654] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] transform rotate-12 z-10 hover:z-[60] hover:rotate-0 hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out items-center flex">
            <div className="space-y-[19px] p-[48px]">
              <p className="text-[20px] leading-[150%] mb-6">
                CheckTag gave us unit-level visibility by batch and plant
                without changing our packaging suppliers. The dashboard
                highlighted counterfeit hotspots by market, so we tightened
                distributor routes and reduced complaint volume within a
                quarter. The recalls now reach only customers who scanned
                affected lots, which cuts support time and write-offs.
              </p>
              <div className="flex items-center">
                <Image
                  src="/icon.svg"
                  alt="Rita Adeyemi"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-3">
                  <p className="font-semibold">Rita Adeyemi</p>
                  <p className="text-sm opacity-80">QA Lead, NutriHarvest</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Right Card - Orange */}
          {/* Top Right Card */}
          <div className="absolute top-[1%] right-[1%] transform -rotate-12 w-[530px] h-[360px] bg-[#FF8633] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-40 hover:z-[60] hover:rotate-0 hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out flex items-center">
            <div className="space-y-[19px] p-[48px]">
              <p className="text-[20px] leading-[150%] mb-6">
                The edge verification is fast and the APIs are clean, which
                helped us automate pharmacy field audits. Geo/device signals
                surfaced a cloning pattern near one distributor, and we shut it
                down with evidence. For regulators, batch anchoring produced a
                tidy audit trail without slowing production.
              </p>
              <div className="flex items-center">
                <Image
                  src="/icon.svg"
                  alt="Miguel Santos"
                  width={48}
                  height={48}
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

          {/* Bottom Left Card - Light Blue */}
          <div className="absolute bottom-[3%] left-[1%] w-[530px] h-[360px] bg-[#E8F6FA] text-[#444955] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] transform -rotate-6 z-30 hover:z-[60] hover:rotate-0 hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out flex items-center">
            <div className="space-y-[19px] p-[48px]">
              <p className="text-[20px] leading-[150%] mb-6">
                By tying scan events to marketplace orders, CheckTag sped up
                takedowns of counterfeit listings. The consumer report flow
                funnels photos and receipts straight into a case timeline our
                team can act on. We’re also seeing fewer return-fraud attempts
                because stores can check unit status on the spot.
              </p>
              <div className="flex items-center">
                <Image
                  src="/icon.svg"
                  alt="Ethan Park"
                  width={48}
                  height={48}
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

          {/* Bottom Right Card - Dark Navy */}
          <div className="absolute bottom-[1%] right-[1%] w-[530px] h-[360px] bg-[#001642] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] transform rotate-9 z-40 hover:z-[60] hover:rotate-0 hover:scale-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-500 ease-in-out flex items-center">
            <div className="space-y-[19px] p-[48px]">
              <p className="text-[20px] leading-[150%] mb-6">
                Re-use detection exposed cross-border label swapping during a
                promotion, and geofenced rules reduced it almost immediately. We
                can now differentiate unit, carton, and pallet scans, so ops
                knows exactly where leakage occurs. The recall tooling and SLAs
                held up during peak season.
              </p>
              <div className="flex items-center">
                <Image
                  src="/icon.svg"
                  alt="Aisha Al-Hassan"
                  width={48}
                  height={48}
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
    </section>
  );
};

export default Testimonials;
