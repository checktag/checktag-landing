import React from 'react';
import Image from 'next/image';

const Testimonials = () => {
  return (
    <section className="py-16 bg-white flex justify-center items-center" id="testimonials">
      <div className="container mx-auto flex flex-col items-center px-4">
        <div className="text-center w-[680px] mb-12">
          <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">Reviews & Testimonials</span>
          <h2 className="text-[32px] text-center leading-[100%] tracking-[-5%] font-bold text-[#444955] mt-5 mb-4">
            Brands using CheckTag reduce counterfeit complaints by up to 62% within 90 days.
          </h2>
          <p className="text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%]">
            Quality work requires attention to detail. Innovation drives progress in unexpected ways. Great design balances form and function. Learning never stops in a changing world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial Card 1 */}
          <div className="bg-[#0E4654] text-white p-6 rounded-lg shadow-lg">
            <p className="text-[16px] leading-[150%] mb-4">
              CheckTag gave us unit-level visibility by batch and plant without changing our packaging suppliers. The dashboard highlighted counterfeit hotspots by market, so we tightened distributor routes and reduced complaint volume within a quarter. Targeted recalls now reach only customers who scanned affected lots, which cuts support time and write-offs
            </p>
            <div className="flex items-center mt-4">
              <Image src="/icon.svg" alt="Rita Adeyemi" width={48} height={48} className="rounded-full" />
              <div className="ml-3">
                <p className="font-bold">Rita Adeyemi</p>
                <p className="text-sm">QA Lead, NorthHarvest</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 2 */}
          <div className="bg-[#FF6F00] text-white p-6 rounded-lg shadow-lg">
            <p className="text-[16px] leading-[150%] mb-4">
              The edge verification is fast and the APIs are clean, which helped us automate pharmacy field audits. Geo/device signals surfaced a cloning pattern near one distributor, and we shut it down with evidence. For regulators, batch anchoring produced a tidy audit trail without slowing production.
            </p>
            <div className="flex items-center mt-4">
              <Image src="/icon.svg" alt="Miguel" width={48} height={48} className="rounded-full" />
              <div className="ml-3">
                <p className="font-bold">Miguel Santos</p>
                <p className="text-sm">Director of Compliance, VitaPharm</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 3 */}
          <div className="bg-[#000000] text-white p-6 rounded-lg shadow-lg">
            <p className="text-[16px] leading-[150%] mb-4">
              We plugged CheckTag into our existing line printers and were generating unique codes per unit in two weeks. Re-scan analytics flagged a reseller cluster we hadn’t seen, and legal acted with confidence. Marketing also loves the consumer page editor—updates go live without engineering tickets.
            </p>
            <div className="flex items-center mt-4">
              <Image src="/icon.svg" alt="Daniel Koch" width={48} height={48} className="rounded-full" />
              <div className="ml-3">
                <p className="font-bold">Daniel Koch</p>
                <p className="text-sm">Head of Packaging Ops, PureDerm Cosmetics</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 4 */}
          <div className="bg-[#E8F6FA] text-black p-6 rounded-lg shadow-lg">
            <p className="text-[16px] leading-[150%] mb-4">
              By tying scan events to marketplace orders, CheckTag sped up takedowns of counterfeit listings. The consumer report flow funnels photos and receipts straight into a case timeline our team can act on. We’re also seeing fewer return-fraud attempts because stores can check unit status on the spot.
            </p>
            <div className="flex items-center mt-4">
              <Image src="/icon.svg" alt="Ethan Park" width={48} height={48} className="rounded-full" />
              <div className="ml-3">
                <p className="font-bold">Ethan Park</p>
                <p className="text-sm">eCommerce Lead, NovaCare Wellness</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 5 */}
          <div className="bg-[#001642] text-white p-6 rounded-lg shadow-lg">
            <p className="text-[16px] leading-[150%] mb-4">
              Re-use detection exposed cross-border label swapping during a promotion, and geofenced rules reduced it almost immediately. We can now differentiate unit, carton, and pallet scans, so ops knows exactly where leakage occurs. The recall tooling and SLAs held up during peak season.
            </p>
            <div className="flex items-center mt-4">
              <Image src="/icon.svg" alt="Aisha Al-Hassan" width={48} height={48} className="rounded-full" />
              <div className="ml-3">
                <p className="font-bold">Aisha Al-Hassan</p>
                <p className="text-sm">COO, DreamSpring Beverages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;