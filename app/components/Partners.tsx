"use client";

import React from "react";
import Image from "next/image";

const Partners = () => {
  const partners = [
    { name: "Milo", src: "/partners/milo.svg", width: 50, height: 50 },
    { name: "NB", src: "/partners/nb.svg", width: 50, height: 50 },
    { name: "Nestle", src: "/partners/nestle.svg", width: 50, height: 50 },
    { name: "Arla", src: "/partners/arla.svg", width: 50, height: 50 },
    { name: "Peak", src: "/partners/peak.svg", width: 60, height: 50 },
    { name: "CocaCola", src: "/partners/cocacola.svg", width: 102, height: 32 },
    { name: "Pepsi", src: "/partners/pepsi.svg", width: 106, height: 40 },
  ];

  return (
    <section className="bg-[#001642] text-white py-16 px-[40px] space-y-8 flex flex-col items-center">
      <div className="space-y-4 text-center">
        <h2 className="text-[24px] leading-[100%] tracking-[-5%] font-normal">
          Trusted by manufacturers in food & beverage, pharma, cosmetics & more!
        </h2>
        <p className="text-[#6687CA] text-[16px]">
          Over 10M scans • &lt;500ms verification • Global code coverage
        </p>
      </div>
      <div className="flex gap-8 overflow-hidden animate-scroll">
        {Array(3)
          .fill(partners)
          .flat()
          .map((partner, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 flex items-center justify-center w-[175px] h-[60px]"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
              />
            </div>
          ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll {
          display: flex;
          animation: scroll 180s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Partners;
