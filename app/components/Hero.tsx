import React from 'react';

const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center bg-white py-16">
      <h1 className="text-[80px] font-bold text-[#444955] mb-4 w-[905px] h-[160px] leading-[100%] tracking-[-40%]">
        Stop counterfeits at the source. Verify in seconds
      </h1>
      <p className="text-lg text-[#8F9299] font-normal leading-[150%] tracking-[-5%] w-[641px]  mb-8">
        CheckTag gives each product a unique, secure code. Brands protect their lines; customers scan to confirm authenticity—instantly.
      </p>
      <div className="flex space-x-4 h-[44px] items-center mb-16">
        <button className="p-4 border rounded-[40px] border-[#0037A6] text-[#0037A6] hover:bg-blue-100">
          Book a demo with our team
        </button>
        <button className="p-4 bg-[#0037A6] text-white rounded-[40px] hover:bg-blue-800">
          Get CheckTag for your products
        </button>
      </div>
      <div className="w-[995px] h-[402px] bg-[#A7DFED] rounded-[40px]"></div>
    </section>
  );
};

export default Hero;