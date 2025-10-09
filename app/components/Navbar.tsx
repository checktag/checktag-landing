import React from 'react';
import Image from 'next/image';
import checktagLogo from '/public/checktag-logo.svg';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-[120px] py-[30px] bg-white">
      <Link href='/' className="flex items-center space-x-2">
        <Image src={checktagLogo} alt="CheckTag Logo" width={139} height={28} />
      </Link>
      <ul className="flex space-x-6 text-[#444955] text-[12px] font-normal">
        <li><a href="#how-it-works" className="hover:text-[#0037A6]">How it works</a></li>
        <li><a href="#testimonials" className="hover:text-[#0037A6]">Testimonials</a></li>
        <li><a href="#pricing" className="hover:text-[#0037A6]">Pricing</a></li>
        <li><a href="#faqs" className="hover:text-[#0037A6]">FAQs</a></li>
      </ul>
      <div className="flex space-x-4">
        <button className="px-4 py-2 h-[44px] border border-[#0037A6] text-[#0037A6] hover:bg-blue-50 rounded-[40px]">Book a demo</button>
        <button className="px-4 py-2 h-[44px] bg-[#0037A6] text-white rounded-[40px] hover:bg-blue-900">Get CheckTag</button>
      </div>
    </nav>
  );
};

export default Navbar;