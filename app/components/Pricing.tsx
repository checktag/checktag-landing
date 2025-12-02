import React from "react";

const Pricing = () => {
  return (
    <section
      className="py-12 md:py-24 min-h-screen bg-[#001642] text-white flex justify-center items-center px-4"
      id="pricing"
    >
      <div className="container mx-auto flex flex-col items-center space-y-8 md:space-y-4">
        <div className="text-[12px] font-normal leading-[100%] tracking-[-1%] bg-[#CCD7ED] text-[#0037A6] rounded-[40px] flex justify-center items-center px-[12px] py-[6px] w-[63px]">
          Pricing
        </div>
        <h2 className="text-center text-[24px] md:text-[32px] text-[#E8F6FA] leading-[120%] md:leading-[100%] tracking-[-5%] font-bold px-4">
          Pricing for brands — scale from pilot to global rollout.
        </h2>
        <p className="text-center text-[14px] md:text-[16px] text-[#6687CA] leading-[150%] tracking-[-5%] mb-6 px-4">
          Choose a plan that matches your stage. Scanning for consumers remains
          free.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center items-center w-full md:w-auto px-4 md:px-0">
          {/* Starter Plan */}
          <div className="bg-[#002164] p-8 rounded-[32px] flex flex-col justify-center items-center text-[#E5EBF6] space-y-[24px]">
            <div className="flex flex-col space-y-2 items-start">
              <h3 className="text-xl font-bold leading-[100%] tracking-[-5%]">
                Starter
              </h3>
              <p className="text-[14px] leading-[150%] tracking-[-5%] text-[#99AFDB]">
                Best for small teams or pilots getting live in &lt;2 weeks
              </p>
            </div>
            <div className="flex flex-col space-y-6 items-start">
              <p className="text-4xl font-bold">
                {/* $399<span className="text-[14px] text-[#99AFDB]">/mo</span> */}
                <p className="text-4xl font-bold">Custom</p>
              </p>
              <div className="flex flex-col space-y-2">
                <p className="text-[14px] leading-[150%] tracking-[-5%] font-semibold ">
                  Includes
                </p>
                <ul className="list-disc list-inside w-[320px] text-[#99AFDB] text-[14px] leading-[150%] tracking-[-5%] ">
                  <li>
                    Up to 100k unit codes / month (unit, carton, or pallet)
                  </li>
                  <li>Dashboard for product, batch/lot & plant setup</li>
                  <li>Instant verification API (&lt;500ms typical)</li>
                  <li>
                    Anti-reuse basics (duplicate scan detection by time/device)
                  </li>
                  <li>Consumer app pages (no-code editor for product info)</li>
                  <li>Reports intake (photo uploads, email notifications)</li>
                  <li>
                    Basic analytics (scan counts, top locations, device mix)
                  </li>
                  <li>2 seats (role-based), 1 plant</li>
                  <li>Email support (next-business-day)</li>
                </ul>
                <p className="text-[14px] leading-[150%] tracking-[-5%] font-semibold ">
                  Overages: $5 per additional 1k codes
                </p>
              </div>
              <button className="w-[320px] flex justify-center py-3 px-4 bg-transparent text-white rounded-[40px] border border-white hover:bg-white hover:text-[#002164]">
                Start a pilot
              </button>
            </div>
          </div>

          {/* Growth Plan */}
          <div className="bg-[#22AED1] p-8 rounded-[32px] flex flex-col justify-center items-center text-white space-y-[24px]">
            <div className="flex flex-col space-y-2 items-start w-[320px]">
              <h3 className="text-xl font-bold leading-[100%] tracking-[-5%]">
                Growth
              </h3>
              <p className="text-[14px] leading-[150%] tracking-[-5%] text-[#E8F6FA]">
                Best for brands rolling out across multiple SKUs and regions
              </p>
            </div>
            <div className="flex flex-col space-y-6 items-start">
              <p className="text-4xl font-bold">
                {/* $2,499 <span className="text-[14px] text-[#A7DFED]">/mo</span> */}
                <p className="text-4xl font-bold">Custom</p>
              </p>
              <div className="flex flex-col space-y-2">
                <p className="text-[14px] leading-[150%] tracking-[-5%] font-semibold">
                  Everything in Starter, plus
                </p>
                <ul className="list-disc list-inside w-[320px] text-[#E8F6FA] text-[14px] leading-[150%] tracking-[-5%]">
                  <li>Up to 1M unit codes / month (tiered discounts)</li>
                  <li>
                    Advanced anti-clone (geo/time anomaly scoring, re-scan
                    heatmaps)
                  </li>
                  <li>
                    Recall tools (batch/lot targeting; in-app consumer alerts)
                  </li>
                  <li>Carton ↔ unit linking (hierarchical serialization)</li>
                  <li>
                    Team & access: 10 seats, up to 5 plants, approval workflows
                  </li>
                  <li>
                    Custom fields on scan page (ingredients, warranty, care)
                  </li>
                  <li>
                    Analytics Pro (cohort trends, hotspot map, export to CSV)
                  </li>
                  <li>Webhooks & SDKs (connect ERP/WMS/CRM)</li>
                  <li>SLA support (business hours, 4h first response)</li>
                </ul>
                <p className="text-[14px] leading-[150%] tracking-[-5%] font-semibold">
                  Overages: lower $/1k after cap
                </p>
              </div>
              <button className="w-[320px] flex justify-center py-3 px-4 text-[#22AED1] rounded-[40px] border border-white bg-white hover:text-[#22AED1]/hover:bg-white">
                Contact sales
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-[#002164] p-8 rounded-[32px] flex flex-col justify-center items-center text-[#E5EBF6] space-y-[24px]">
            <div className="flex flex-col space-y-2 items-start w-[320px]">
              <h3 className="text-xl font-bold leading-[100%] tracking-[-5%]">
                Enterprise
              </h3>
              <p className="text-[14px] leading-[150%] tracking-[-5%] text-[#99AFDB]">
                Best for regulated, multi-country operations with strict SLAs
              </p>
            </div>
            <div className="flex flex-col space-y-6 items-start">
              <p className="text-4xl font-bold">Custom</p>
              <div className="flex flex-col space-y-2">
                <p className="text-[14px] leading-[150%] tracking-[-5%] font-semibold">
                  Everything in Growth, plus
                </p>
                <ul className="list-disc list-inside w-[320px] text-[#99AFDB] text-[14px] leading-[150%] tracking-[-5%]">
                  <li>
                    Unlimited codes (committed annual volume; best unit pricing)
                  </li>
                  <li>Multi-tenant & multi-brand workspaces</li>
                  <li>SSO / SAML, SCIM user provisioning</li>
                  <li>
                    Compliance pack (audit logs, IP allowlists, data residency
                    options)
                  </li>
                  <li>
                    Batch anchoring (optional blockchain) for audit trails
                  </li>
                  <li>
                    Fine-grained policies (geo-fencing, device reputation rules)
                  </li>
                  <li>
                    Premium support (24×7, dedicated manager, escalation SLAs)
                  </li>
                  <li>On-site/virtual onboarding & packaging guidance</li>
                </ul>
              </div>
              <button className="w-[320px] flex justify-center py-3 px-4 bg-transparent text-white rounded-[40px] border border-white hover:bg-white hover:text-[#112240]">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
