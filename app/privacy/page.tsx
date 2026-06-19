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
            "Account information: email address provided during sign-up.",
            "Authentication data: tokens used to verify your identity securely via Privy.",
            "Wallet addresses: Ethereum and Solana wallet addresses generated for your account.",
            "Scan data: product scan events including timestamps and product identifiers.",
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
            "To improve our services based on usage patterns.",
            "To send transactional communications (e.g., OTP codes).",
        ],
    },
    {
        title: "3. Data Sharing",
        content:
            "We do not sell your personal data. We may share data with trusted third-party service providers who assist us in operating our platform, including authentication providers (Privy), cloud infrastructure (Railway), and database services. We may also disclose data when required by applicable law.",
        list: null,
    },
    {
        title: "4. Data Retention",
        content:
            "We retain your personal data for as long as your account is active or as needed to provide our services. You may request deletion of your account and all associated data at any time via the app settings or by contacting us at support@checktag.io.",
        list: null,
    },
    {
        title: "5. Security",
        content:
            "We implement industry-standard security measures including HTTPS encryption, JWT-based authentication, and access controls. However, no method of data transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
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
                        Effective date: <span className="text-white font-medium">March 5, 2026</span>
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
