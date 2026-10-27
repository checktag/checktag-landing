import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { PRIVACY_EFFECTIVE, PRIVACY_INTRO, privacySections } from "./content";

export const metadata: Metadata = {
    title: "Privacy Policy – CheckTag®",
    description: "Learn how CheckTag collects, uses, and protects your personal information.",
};

const linkClass = "text-[#22AED1] underline underline-offset-2 hover:text-white transition-colors";
const sections = privacySections({ inApp: false, linkClass });

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
                        Effective date: <span className="text-white font-medium">{PRIVACY_EFFECTIVE}</span>
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-3xl mx-auto px-4 py-16 relative z-10">
                <p className="text-white/60 text-base leading-relaxed mb-10">{PRIVACY_INTRO}</p>

                <div className="space-y-10">
                    {sections.map((section) => (
                        <div key={section.id} id={section.id} className="scroll-mt-28">
                            <h2 className="text-lg font-bold text-white border-l-4 border-[#22AED1] pl-4 mb-3">
                                {section.title}
                            </h2>
                            {section.content && (
                                <p className="text-white/60 text-base leading-relaxed">{section.content}</p>
                            )}
                            {section.list && (
                                <ul className="list-disc list-inside space-y-2 text-white/60 text-base leading-relaxed font-normal">
                                    {section.list.map((item, i) => (
                                        <li key={i}>{item}</li>
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
