import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
    title: "Privacy Policy – CheckTag®",
    description: "Learn how CheckTag collects, uses, and protects your personal information.",
};

const sections = [
    {
        title: "1. Information We Collect",
        content: null,
        list: [
            "Account information: the email address and/or phone number you provide during sign-up. Phone numbers are used to deliver SMS one-time passcodes.",
            "Authentication data: the one-time verification code we send you, and the session token issued to your device after you sign in.",
            "Scan data: product scan events including timestamps and product identifiers.",
            "Report details: information you submit in counterfeit or quality reports, including any purchase location you choose to enter. This is typed in by you — CheckTag does not collect GPS or device location.",
            "Payout details: if you request a cash-back withdrawal, the payout details you provide (such as account number, bank code, and account name), which are used to set up a transfer recipient with our payment processor.",
            "Device information: device type, operating system, and app version for troubleshooting.",
        ],
    },
    {
        title: "2. How We Use Your Information",
        content: null,
        list: [
            "To create and manage your CheckTag account.",
            "To authenticate you securely and maintain session integrity.",
            "To process product scan events and deliver relevant content.",
            "To generate product summaries, health insights, and answer your product questions using AI.",
            "To process the reward withdrawals and payouts you request.",
            "To improve our services based on usage patterns.",
            "To send transactional communications (e.g., OTP codes).",
        ],
    },
    {
        title: "3. Data Sharing",
        content:
            "We do not sell your personal data. We share data with trusted third-party service providers who help us operate the platform: email delivery of one-time passcodes and transactional email (Resend); payment processing and payouts (Paystack); SMS delivery of one-time passcodes (Twilio); product identification via barcode lookup providers (Go-UPC, Open Food Facts, Barcode Lookup, and Barcode Spider), to which a scanned product's barcode is sent; AI product summaries and the in-app assistant (xAI / Grok), to which product and scan metadata may be sent to generate summaries and answer your questions; and cloud infrastructure and database hosting (Railway). We may also disclose data when required by applicable law.",
        list: null,
    },
    {
        title: "4. Data Retention",
        content:
            "We retain your personal data for as long as your account is active or as needed to provide our services. You may request deletion of your account and all associated data at any time via the app settings or by contacting us at support@checktag.io.",
        list: null,
    },
    {
        title: "5. Rewards & Security",
        content:
            "Inside the app you earn reward points for verifying products, redeemable for cash-back (processed via Paystack). Points are a loyalty balance, not a cryptocurrency. The CheckTag app does not create, hold, or provide a cryptocurrency wallet, and does not buy, sell, trade, or exchange digital assets. CheckTag never generates or stores private keys or recovery phrases for you. Any CTAG token activity is a separate, web-only matter handled outside the app on the CheckTag website, where you supply your own external wallet address as the destination — CheckTag does not custody, transfer, freeze, or recover any digital assets on your behalf. For the data we do process, we implement industry-standard security measures including HTTPS encryption, JWT-based authentication, and access controls. However, no method of data transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
        list: null,
    },
    {
        title: "6. Children's Privacy",
        content:
            "CheckTag is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately to have it removed.",
        list: null,
    },
    {
        title: "7. Your Rights",
        content:
            "Depending on your jurisdiction, you may have the right to access, correct, or delete the personal data we hold about you, as well as the right to object to or restrict processing. To exercise any of these rights, please contact us at support@checktag.io.",
        list: null,
    },
    {
        title: "8. Third-Party Links",
        content:
            "Our app and website may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties and encourage you to review their respective privacy policies.",
        list: null,
    },
    {
        title: "9. Changes to This Policy",
        content:
            'We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Effective" date at the top of this page. Your continued use of CheckTag after any changes constitutes your acceptance of the updated policy.',
        list: null,
    },
    {
        title: "10. Contact Us",
        content:
            "If you have questions or concerns about this Privacy Policy, please reach out to us at support@checktag.io. We aim to respond within 5 business days.",
        list: null,
    },
];

export default function PrivacyPage() {
    return (
        <div className="w-full min-h-screen overflow-x-hidden bg-[#020817] noise-bg text-white">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-16 px-4 md:px-[120px] text-center overflow-hidden">
                {/* Background radial glow */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="orb-1 absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#0037A6]/20 blur-[100px]" />
                    <div className="orb-2 absolute top-[20%] right-[10%] w-[250px] h-[250px] rounded-full bg-[#22AED1]/15 blur-[80px]" />
                </div>
                <div className="absolute inset-0 dot-pattern pointer-events-none" />
                <div className="relative z-10">
                    <p className="text-[#22AED1] text-sm font-semibold tracking-widest uppercase mb-3">
                        Legal
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">Privacy Policy</h1>
                    <p className="text-white/60 text-base max-w-xl mx-auto">
                        Effective date: <span className="text-white font-medium">September 24, 2026</span>
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-3xl mx-auto px-4 py-16 relative z-10">
                <p className="text-white/60 text-base leading-relaxed mb-10">
                    Welcome to CheckTag (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We are
                    committed to protecting your personal information and your right to privacy. This policy
                    explains how we collect, use, and safeguard your data when you use our mobile application
                    and related services.
                </p>

                <div className="space-y-10">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h2 className="text-lg font-bold text-white border-l-4 border-[#22AED1] pl-4 mb-3">
                                {section.title}
                            </h2>
                            {section.content && (
                                <p className="text-white/60 text-base leading-relaxed">{section.content}</p>
                            )}
                            {section.list && (
                                <ul className="list-disc list-inside space-y-2 text-white/60 text-base leading-relaxed font-normal">
                                    {section.list.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
