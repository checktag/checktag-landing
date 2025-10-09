import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#001642] text-white py-8 md:py-[60px] px-4 md:px-[120px] flex flex-col space-y-8 md:space-y-[80px] items-center">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8 text-[10px] leading-[100%] tracking-[0%] w-full">
        <div className="flex flex-col space-y-4">
          <h4 className="text-[#7ACEE3] font-bold">PRODUCT</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/#how-it-works">How it works</Link>
            </li>
            <li>
              <Link href="/#pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/security">Security</Link>
            </li>
            <li>
              <Link href="/#faqs">FAQs</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col space-y-4">
          <h4 className="text-[#7ACEE3] font-bold">FOR COMPANIES</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/starter">Starter</Link>
            </li>
            <li>
              <Link href="/growth">Growth</Link>
            </li>
            <li>
              <Link href="/enterprise">Enterprise</Link>
            </li>
            <li>
              <Link href="/case-studies">Case studies</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col space-y-4">
          <h4 className="text-[#7ACEE3] font-bold">SUPPORT</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/help-center">Help Center</Link>
            </li>
            <li>
              <Link href="/contact-support">Contact support</Link>
            </li>
            <li>
              <Link href="/child">Child</Link>
            </li>
            <li>
              <Link href="/child">Child</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col space-y-4">
          <h4 className="text-[#7ACEE3] font-bold">LEGAL</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms-and-conditions">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/cookies">Cookies</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col space-y-3 items-start">
          <h4 className="text-white font-bold text-[14px] whitespace-nowrap">
            Wanna be in the loop about going ons?
          </h4>
          <form className="flex items-center bg-[#002164] rounded-[40px] max-w-[388px] px-4 py-2.5">
            <input
              type="email"
              placeholder="Email Address"
              className="flex-grow bg-transparent text-white placeholder-white focus:outline-none px-4"
            />
            <button
              type="submit"
              className="bg-[#001642] text-white px-4 py-4 rounded-full hover:bg-[#002164]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div>
        <Image
          src="/checktag-logo-big.svg"
          alt="Big Checktag logo"
          width={1200}
          height={234}
          loading="lazy"
        />
      </div>
    </footer>
  );
};

export default Footer;
