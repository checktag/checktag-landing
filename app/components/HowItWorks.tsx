import React from "react";
import Image from "next/image";
import notificationImage from "/public/notification.svg";
import handHoldingPhoneImage from "/public/handholdingphone.svg";
import googlePlayImage from "/public/googleplay.svg";

const HowItWorks = () => {
  return (
    <section
      className="py-8 md:py-16 bg-white flex justify-center items-center"
      id="how-it-works"
    >
      <div className="container px-4 md:mx-[120px]">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-24 mb-8 md:mb-16">
          {/* Image for mobile */}
          <div className="md:hidden mb-6">
            <Image
              src={notificationImage}
              alt="Notification"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          {/* For Manufacturers Section */}
          <div className="px-4 md:px-0">
            <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">
              For Manufacturers
            </span>
            <h2 className="text-[24px] md:text-[32px] leading-[120%] md:leading-[100%] tracking-[-5%] font-bold text-[#444955] mt-5 mb-4">
              Built for manufacturers and QA teams
            </h2>
            <p className="w-full md:w-[502px] text-[14px] md:text-[16px] text-[#8F9299] leading-[150%] tracking-[-5%] mb-6">
              Quality work requires attention to detail. Innovation drives
              progress in unexpected ways. Great design balances form and
              function. Learning never stops in a changing world.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-3 text-[16px] leading-[150%] tracking-[-5%]">
              <li>
                <strong>Unit-level serialization:</strong> Every item has a
                unique identity.
              </li>
              <li>
                <strong>Instant verification:</strong> &lt;500ms API checks at
                global edge.
              </li>
              <li>
                <strong>Cloning & reuse detection:</strong> Flag suspicious
                re-scans by time/geo/device.
              </li>
              <li>
                <strong>Recall & batch tools:</strong> Push precise safety
                notices by batch/lot.
              </li>
              <li>
                <strong>Analytics:</strong> Heatmaps of scan locations and
                counterfeit hotspots.
              </li>
            </ul>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 h-auto md:h-[44px] items-center w-full md:w-auto">
              <button className="w-full md:w-auto p-4 rounded-[40px] bg-[#0037A6] text-white hover:bg-blue-800">
                Book a demo
              </button>
              <button className="w-full md:w-auto p-4 bg-white text-[#0037A6] rounded-[40px] border border-[#0037A6] hover:bg-blue-100">
                Talk to an expert
              </button>
            </div>
          </div>
          <div className="flex justify-center items-center max-md:hidden">
            <div className="w-full">
              <Image
                src={notificationImage}
                alt="Notification"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-end">
          {/* For Customers Section */}
          <div className="flex justify-center items-center">
            <div className="w-full max-md:mb-8">
              <Image
                src={handHoldingPhoneImage}
                alt="Hand Holding Phone"
                loading="lazy"
              />
            </div>
          </div>
          <div className="pb-[90px] px-4">
            <span className="text-[12px] leading-[100%] tracking-[-1%] font-semibold text-[#22AED1] py-[6px] px-[12px] mb-5 rounded-[40px] bg-[#D3EFF6]">
              For Customers
            </span>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-4">
              Scan to be sure
            </h2>
            <p className="text-gray-600 mb-4">
              Look for the CheckTag on the product
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li>
                <strong>Scan with our app:</strong> See Verified, Suspicious, or
                Expired.
              </li>
              <li>
                <strong>Report problems:</strong> Photos help the brand act.
              </li>
            </ul>
            <div className="flex space-x-4">
              <button
                className="px-6 py-3 bg-[#0037A6] text-white rounded-4xl hover:bg-blue-800"
                title="Google Play"
              >
                <Image src={googlePlayImage} alt="Google Play" loading="lazy" />
              </button>
              <button
                className="flex items-center px-6 py-3 bg-[#0037A6] text-white rounded-4xl hover:bg-blue-800"
                title="App Store"
              >
                <Image
                  src="/appstore.svg"
                  alt="App Store"
                  width={20}
                  height={26}
                  className="mr-2"
                  loading="lazy"
                />
                <div className="text-left">
                  <p className="text-[8px] leading-[50%] tracking-[-10%]">
                    Download on the
                  </p>
                  <p className="text-md leading-[120%] tracking-[-10%] font-bold">
                    App Store
                  </p>
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
