import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center bg-white py-8 md:py-16 px-4">
      <h1 className="text-[40px] md:text-[80px] font-bold text-[#444955] mb-4 w-full md:w-[905px] leading-[100%] tracking-[-5%]">
        Stop counterfeits at the source. Verify in seconds
      </h1>
      <p className="text-base md:text-lg text-[#8F9299] font-normal leading-[150%] tracking-[-5%] w-full md:w-[641px] mb-8">
        CheckTag gives each product a unique, secure code. Brands protect their
        lines; customers scan to confirm authenticity—instantly.
      </p>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 h-auto md:h-[44px] items-center mb-8 md:mb-16 w-full md:w-auto">
        <button className="w-full md:w-auto p-4 bg-[#0037A6] text-white rounded-[40px] hover:bg-blue-800">
          Join the waitlist
        </button>
      </div>
      <div className="w-full md:w-[995px] h-[200px] md:h-[402px] relative rounded-[20px] md:rounded-[40px] overflow-hidden">
        <Image
          src="/hero-img.svg"
          alt="CheckTag Hero Image"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 995px"
        />
      </div>
    </section>
  );
};

export default Hero;
