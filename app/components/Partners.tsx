import React from "react";
import Image from "next/image";
import Link from "next/link";

// Brands whose products are in the CheckTag catalogue, so shoppers can check
// them. Not partners or customers: none of them endorse CheckTag, and the note
// below says so. Only list a brand with products in the public catalogue. Logos
// are the ones already in /public/partners; every other brand is a plain
// wordmark (never download third-party logos).
const logos: Record<string, { src: string; w: number; h: number }> = {
  Nestlé: { src: "/partners/nestle.svg", w: 50, h: 14 },
  "Coca-Cola": { src: "/partners/cocacola.svg", w: 128, h: 40 },
  Peak: { src: "/partners/peak.svg", w: 50, h: 40 },
  Arla: { src: "/partners/arla.svg", w: 60, h: 41 },
  Pepsi: { src: "/partners/pepsi.svg", w: 106, h: 40 },
};

const brands = [
  "Nestlé",
  "Indomie",
  "Coca-Cola",
  "Nivea",
  "Dangote",
  "Peak",
  "Golden Penny",
  "Fanta",
  "Cowbell",
  "Vaseline",
  "Arla",
  "Knorr",
  "Mentos",
  "Dabur",
  "Pepsi",
  "Sensodyne",
  "Rexona",
  "Lipton",
  "Parle",
  "McVitie's",
  "Chivita",
  "Tampax",
  "Gillette",
  "Right Guard",
  "Budweiser",
  "Malta Guinness",
  "Pears",
  "Veet",
  "Cway",
  "Viju",
  "Smirnoff",
  "Sasi",
  "Emborg",
];

// Logos are drawn this tall; widths keep each logo's own proportions.
const LOGO_H = 22;

function Chip({ name }: { name: string }) {
  const logo = logos[name];
  return (
    <div className="mr-3 flex h-10 flex-shrink-0 items-center justify-center rounded-lg bg-white px-4 shadow-sm md:h-11">
      {logo ? (
        <Image
          src={logo.src}
          alt={name}
          width={Math.round((LOGO_H * logo.w) / logo.h)}
          height={LOGO_H}
          className="max-h-[22px] w-auto object-contain"
          loading="lazy"
        />
      ) : (
        <span className="whitespace-nowrap text-[13px] font-bold tracking-[-0.01em] text-[#0A1628] md:text-sm">{name}</span>
      )}
    </div>
  );
}

const Partners = () => {
  return (
    <section className="relative flex flex-col items-center overflow-hidden border-y border-white/5 bg-[#020817] px-4 py-12 text-white md:px-[80px] md:py-16">
      {/* Subtle radial glow */}
      <div className="radial-glow-blue pointer-events-none absolute inset-0" />

      <div className="relative z-10 mb-8 space-y-2 px-4 text-center">
        <h2 className="mx-auto max-w-[640px] text-[20px] font-bold leading-[130%] tracking-[-0.02em] text-white md:text-[26px]">
          Check products from brands you know
        </h2>
        <p className="mx-auto max-w-[520px] text-[14px] leading-[160%] text-white/45 md:text-[15px]">
          Products from these brands are in the CheckTag catalogue. Scan one to see what&apos;s inside, how it rates and what other shoppers say.
        </p>
      </div>

      {/* Brand chips, scrolling */}
      <div className="relative z-10 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <ul className="sr-only">
          {brands.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="animate-scroll flex w-max motion-reduce:animate-none" style={{ animationDuration: "80s" }} aria-hidden="true">
          {[...brands, ...brands].map((name, i) => (
            <Chip key={i} name={name} />
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-8 flex flex-col items-center gap-3 text-center">
        <Link href="/products" className="text-sm font-semibold text-[#22AED1] transition-colors hover:text-white">
          190+ products with a public page. Browse them →
        </Link>
        <p className="max-w-[520px] text-[11px] leading-[160%] text-white/30">
          Brand names and logos belong to their owners. Showing them doesn&apos;t mean they endorse CheckTag.
        </p>
      </div>
    </section>
  );
};

export default Partners;
