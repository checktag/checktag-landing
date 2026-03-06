import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
    title: "Terms & Conditions – CheckTag®",
    description: "Read the Terms and Conditions for using the CheckTag platform and mobile application.",
};

const sections = [
    {
        title: "1. Acceptance of Terms",
        content:
            "By accessing or using CheckTag's mobile application or website, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of our services.",
        list: null,
    },
    {
        title: "2. Use of the Service",
        content:
            "CheckTag grants you a limited, non-exclusive, non-transferable license to use the app for personal, non-commercial purposes. You agree not to misuse the platform or attempt to gain unauthorized access to any part of it.",
        list: [
            "You must be at least 13 years old to use CheckTag.",
            "You are responsible for maintaining the confidentiality of your account.",
            "You agree not to use the service for any unlawful or fraudulent purposes.",
            "You must not attempt to reverse-engineer, decompile, or disassemble any part of the service.",
        ],
    },
    {
        title: "3. User Accounts",
        content:
            "When you create an account, you must provide accurate and complete information. You are solely responsible for any activity that occurs under your account. Notify us immediately at support@checktag.io if you become aware of any unauthorized use.",
        list: null,
    },
    {
        title: "4. Intellectual Property",
        content:
            "All content, trademarks, logos, and intellectual property displayed on CheckTag are the property of CheckTag or its licensors. You may not copy, reproduce, distribute, or create derivative works without our express written permission.",
        list: null,
    },
    {
        title: "5. Product Scanning and Data",
        content:
            "CheckTag enables users to scan and authenticate products. Scan data is processed on our servers and used to deliver authentication results. We make no guarantee regarding the accuracy of third-party product information provided by manufacturers.",
        list: null,
    },
    {
        title: "6. Disclaimers",
        content:
            'The service is provided "as is" and "as available" without warranties of any kind, either express or implied. CheckTag does not warrant that the service will be uninterrupted, error-free, or free of harmful components.',
        list: null,
    },
    {
        title: "7. Limitation of Liability",
        content:
            "To the fullest extent permitted by law, CheckTag shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, even if we have been advised of the possibility of such damages.",
        list: null,
    },
    {
        title: "8. Termination",
        content:
            "We reserve the right to terminate or suspend your account at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.",
        list: null,
    },
    {
        title: "9. Changes to Terms",
        content:
            "We may modify these Terms at any time. We will notify you of significant changes by updating the date above. Your continued use of the service after any changes constitutes acceptance of the revised Terms.",
        list: null,
    },
    {
        title: "10. Governing Law",
        content:
            "These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts.",
        list: null,
    },
    {
        title: "11. Contact Us",
        content:
            "If you have questions about these Terms and Conditions, please contact us at support@checktag.io.",
        list: null,
    },
];

export default function TermsPage() {
    return (
        <div className="w-screen min-h-screen overflow-x-hidden bg-white">
            <Navbar />

            {/* Hero */}
            <section className="bg-[#001642] text-white pt-32 pb-16 px-4 md:px-[120px] text-center">
                <p className="text-[#7ACEE3] text-sm font-semibold tracking-widest uppercase mb-3">
                    Legal
                </p>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">Terms &amp; Conditions</h1>
                <p className="text-white/60 text-base max-w-xl mx-auto">
                    Effective date: <span className="text-white font-medium">March 5, 2026</span>
                </p>
            </section>

            {/* Content */}
            <section className="max-w-3xl mx-auto px-4 py-16">
                <p className="text-gray-600 text-base leading-relaxed mb-10">
                    Please read these Terms and Conditions carefully before using the CheckTag mobile
                    application or website. These terms govern your access to and use of our services.
                </p>

                <div className="space-y-10">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h2 className="text-lg font-bold text-[#001642] border-l-4 border-[#7ACEE3] pl-4 mb-3">
                                {section.title}
                            </h2>
                            {section.content && (
                                <p className="text-gray-600 text-base leading-relaxed">{section.content}</p>
                            )}
                            {section.list && (
                                <ul className="list-disc list-inside space-y-2 text-gray-600 text-base leading-relaxed mt-2">
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
