import React from 'react';
import Image from 'next/image';
import notificationImage from '/public/notification.svg';
import handHoldingPhoneImage from '/public/handholdingphone.svg';
import googlePlayImage from '/public/googleplay.svg';

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-[120px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-16">
          {/* For Manufacturers Section */}
          <div>
            <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">For Manufacturers</span>
            <h2 className="text-[32px] leading-[100%] tracking-[-5%] font-bold text-[#444955] mt-5 mb-4">
              Built for manufacturers and QA teams
            </h2>
            <p className="w-[502px] text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%] mb-6">
              Quality work requires attention to detail. Innovation drives progress in unexpected ways. Great design balances form and function. Learning never stops in a changing world.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-3 text-[16px] leading-[150%] tracking-[-5%]">
              <li><strong>Unit-level serialization:</strong> Every item has a unique identity.</li>
              <li><strong>Instant verification:</strong> &lt;500ms API checks at global edge.</li>
              <li><strong>Cloning & reuse detection:</strong> Flag suspicious re-scans by time/geo/device.</li>
              <li><strong>Recall & batch tools:</strong> Push precise safety notices by batch/lot.</li>
              <li><strong>Analytics:</strong> Heatmaps of scan locations and counterfeit hotspots.</li>
            </ul>
            <div className="flex space-x-4 h-[44px] items-center">
              <button className="p-4 rounded-[40px]  bg-[#0037A6] text-white hover:bg-blue-800">
                Book a demo
              </button>
              <button className="p-4 bg-white text-[#0037A6] rounded-[40px] border border-[#0037A6] hover:bg-blue-100">
                Talk to an expert
              </button>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-full">
              <Image src={notificationImage} alt="Notification" loading='lazy'/>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-end">
          {/* For Customers Section */}
          <div className="flex justify-center items-center">
            <div className="w-full">
              <Image src={handHoldingPhoneImage} alt="Hand Holding Phone" loading='lazy'/>
            </div>
          </div>
          <div className='pb-[90px]'>
            <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">For Customers</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-4">Scan to be sure</h2>
            <p className="text-gray-600 mb-4">
              Look for the CheckTag on the product
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li><strong>Scan with our app:</strong> See Verified, Suspicious, or Expired.</li>
              <li><strong>Report problems:</strong> Photos help the brand act.</li>
            </ul>
            <div className="flex space-x-4">
              <button className="px-6 py-3 bg-[#0037A6] text-white rounded-4xl hover:bg-blue-800" title="Google Play">
                <Image src={googlePlayImage} alt="Google Play" />
              </button>
              <button className="flex items-center px-6 py-3 bg-[#0037A6] text-white rounded-4xl hover:bg-blue-800" title="App Store">
                <Image src="/appstore.svg" alt="App Store" width={20} height={26} className="mr-2" />
                <div className="text-left">
                  <p className="text-xs">Download on the</p>
                  <p className="text-md font-bold">App Store</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;