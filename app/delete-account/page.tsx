import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
    title: "Delete Your Account – CheckTag®",
    description:
        "How to request deletion of your CheckTag account and associated data, what is deleted, and what is retained.",
};

const steps = [
    {
        n: "1",
        title: "Delete instantly in the CheckTag app",
        body: "Open the CheckTag app → go to Profile → tap the settings (gear) icon → select Delete account → confirm. Your account and associated data are deleted immediately. This cannot be undone.",
    },
    {
        n: "2",
        title: "Or request deletion by email",
        body: "If you can no longer access the app, email support@checktag.io from the email address registered to your CheckTag account, with the subject \"Delete my account\". We will verify your identity and delete your account within 30 days.",
    },
];

const deleted = [
    "Your account and profile — email address and username.",
    "Your scan history — all scan events and verification records tied to your account.",
    "Your rewards data — the points and cash-back ledger for your account.",
    "Reports you submitted — counterfeit and suspicious-product reports.",
    "Authentication data — sessions, verification codes and sign-in events.",
];

const retained = [
    "Transaction and financial records. Marketplace orders, payments and protection claims may be retained where we are legally required to keep them (for accounting, tax, and fraud-prevention purposes), typically for up to 7 years. These are minimised and de-identified from your account wherever possible.",
    "Encrypted backups. Residual copies may persist in encrypted system backups for up to 30 days after deletion, after which they are permanently purged.",
    "Aggregated, anonymised statistics that can no longer identify you.",
];

export default function DeleteAccountPage() {
    return (
        <div className="w-full min-h-screen overflow-x-hidden bg-[#020817] noise-bg text-white">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-16 px-4 md:px-[120px] text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="orb-1 absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#0037A6]/20 blur-[100px]" />
                    <div className="orb-2 absolute top-[20%] right-[10%] w-[250px] h-[250px] rounded-full bg-[#22AED1]/15 blur-[80px]" />
                </div>
                <div className="absolute inset-0 dot-pattern pointer-events-none" />
                <div className="relative z-10">
                    <p className="text-[#22AED1] text-sm font-semibold tracking-widest uppercase mb-3">
                        Account &amp; Data
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                        Delete your CheckTag account
                    </h1>
                    <p className="text-white/60 text-base max-w-2xl mx-auto">
                        This page explains how to request deletion of your <span className="text-white font-medium">CheckTag</span> account
                        (app published by <span className="text-white font-medium">CHECKTAG LTD</span>), what data is deleted, and what is retained.
                    </p>
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-4 pb-20 relative z-10">
                {/* Steps */}
                <h2 className="text-lg font-bold text-white border-l-4 border-[#22AED1] pl-4 mb-6">
                    How to request account deletion
                </h2>
                <div className="space-y-4 mb-14">
                    {steps.map((s) => (
                        <div
                            key={s.n}
                            className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5"
                        >
                            <div className="flex-none w-9 h-9 rounded-lg bg-[#22AED1]/15 border border-[#22AED1]/30 text-[#22AED1] font-bold flex items-center justify-center">
                                {s.n}
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                                <p className="text-white/60 text-base leading-relaxed">{s.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Deleted */}
                <h2 className="text-lg font-bold text-white border-l-4 border-[#22AED1] pl-4 mb-3">
                    What is deleted
                </h2>
                <p className="text-white/60 text-base leading-relaxed mb-3">
                    When your account is deleted, the following are permanently removed from our systems:
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/60 text-base leading-relaxed mb-14">
                    {deleted.map((d) => (
                        <li key={d}>{d}</li>
                    ))}
                </ul>

                {/* Retained */}
                <h2 className="text-lg font-bold text-white border-l-4 border-[#E0A800] pl-4 mb-3">
                    What is retained, and for how long
                </h2>
                <ul className="list-disc list-inside space-y-2 text-white/60 text-base leading-relaxed mb-14">
                    {retained.map((r) => (
                        <li key={r}>{r}</li>
                    ))}
                </ul>

                {/* Partial deletion */}
                <h2 className="text-lg font-bold text-white border-l-4 border-[#22AED1] pl-4 mb-3">
                    Deleting some data without closing your account
                </h2>
                <p className="text-white/60 text-base leading-relaxed mb-14">
                    You do not have to delete your whole account to remove data. You can ask us to delete
                    specific data — for example your scan history or submitted reports — while keeping your
                    account open. Email{" "}
                    <a href="mailto:support@checktag.io" className="text-[#22AED1] hover:underline">
                        support@checktag.io
                    </a>{" "}
                    from your registered address and tell us what you would like removed. We respond within 30 days.
                </p>

                {/* Contact */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="text-white font-semibold mb-2">Need help?</h3>
                    <p className="text-white/60 text-base leading-relaxed">
                        Contact us at{" "}
                        <a href="mailto:support@checktag.io" className="text-[#22AED1] hover:underline">
                            support@checktag.io
                        </a>
                        . For full details on how we handle your information, see our{" "}
                        <a href="/privacy" className="text-[#22AED1] hover:underline">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
