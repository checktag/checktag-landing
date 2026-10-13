import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
    title: "Community Guidelines – CheckTag®",
    description:
        "The rules for posting product reviews on CheckTag, how to report or block, and how we moderate.",
};

// Kept word-for-word in sync with the guidelines users accept in the app
// (backend COMMUNITY_GUIDELINES, version 2026-10-04).
const GUIDELINES = [
    "Review products honestly, based on your own experience.",
    "No hate speech, harassment, threats, or sexual content.",
    "No spam, advertising, links, or personal contact details.",
    "Don't post anyone's personal information.",
    "Reviews can be reported by anyone. Content that breaks these rules is removed, and repeat offenders lose the ability to post.",
];

const ZERO_TOLERANCE = "CheckTag has zero tolerance for objectionable content or abusive users.";

const linkClass = "text-[#22AED1] underline underline-offset-2 hover:text-white transition-colors";

const sections = [
    {
        id: "guidelines",
        title: "1. The Guidelines",
        content: "Before you post your first review, you'll be asked to accept these guidelines:",
        list: GUIDELINES,
    },
    {
        id: "posting",
        title: "2. Who Can Post",
        content: null,
        list: [
            "You need to be signed in, and to have accepted these guidelines.",
            "You can only review a product you have scanned yourself — every review is a verified scan.",
            "One review per product. You can edit or delete your review at any time.",
            "Reviews are shown publicly under your CheckTag username, never your email address or phone number.",
        ],
    },
    {
        id: "not-allowed",
        title: "3. What Isn't Allowed",
        content: null,
        list: [
            "Hate speech, or attacks on people based on who they are.",
            "Harassment, bullying, threats, or encouraging harm.",
            "Sexual or graphic content.",
            "Spam, advertising, promotions, links, or contact details such as phone numbers and email addresses.",
            "Anyone's personal information — including your own.",
            "Reviews that are not about the product, or that deliberately mislead other shoppers.",
        ],
    },
    {
        id: "report-block",
        title: "4. Report & Block",
        content: null,
        list: [
            "Every review has a Report option. Choose a reason — spam, offensive, harassment, misleading, or other — and add a note if it helps. The author is never told who reported them.",
            "Every review also lets you Block its author. You won't see reviews from people you've blocked, and they aren't notified. You can unblock them later.",
            "Your honest negative opinion about a product is allowed. Reporting is for content that breaks these guidelines, not for reviews you disagree with.",
        ],
    },
    {
        id: "moderation",
        title: "5. How We Moderate",
        content: null,
        list: [
            "Every review is screened automatically when it is posted. Reviews containing links, contact details, or offensive language are held until a moderator has checked them.",
            "Published reviews may also be checked by AI, which can hide content it judges harmful until a moderator looks at it.",
            "A review that is reported by several people is hidden automatically until a moderator reviews it.",
            "Our moderators review held and reported content, remove anything that breaks these guidelines, and can ban users from posting. A ban also removes that user's published reviews.",
            "If your review is removed, we'll let you know in the app.",
        ],
    },
];

export default function CommunityGuidelinesPage() {
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
                        Community
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">Community Guidelines</h1>
                    <p className="text-white/60 text-base max-w-xl mx-auto">
                        Effective date: <span className="text-white font-medium">October 4, 2026</span>
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-3xl mx-auto px-4 py-16 relative z-10">
                <p className="text-white/60 text-base leading-relaxed mb-8">
                    CheckTag reviews help people understand what&rsquo;s in the products they buy. These
                    guidelines keep reviews honest, useful, and safe for everyone. They apply to everything
                    you post on CheckTag — in the mobile app, on the web, and in our Telegram mini app.
                </p>

                <div className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                    <p className="text-white text-base font-semibold leading-relaxed">{ZERO_TOLERANCE}</p>
                    <p className="mt-1 text-white/60 text-sm leading-relaxed">
                        Objectionable content is removed and abusive users lose the ability to post.
                    </p>
                </div>

                <div className="space-y-10">
                    {sections.map((section) => (
                        <div key={section.id} id={section.id} className="scroll-mt-28">
                            <h2 className="text-lg font-bold text-white border-l-4 border-[#22AED1] pl-4 mb-3">
                                {section.title}
                            </h2>
                            {section.content && (
                                <p className="text-white/60 text-base leading-relaxed mb-3">{section.content}</p>
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

                    <div id="contact" className="scroll-mt-28">
                        <h2 className="text-lg font-bold text-white border-l-4 border-[#22AED1] pl-4 mb-3">
                            6. Contact Us
                        </h2>
                        <p className="text-white/60 text-base leading-relaxed">
                            To report objectionable content or an abusive user, or to appeal a moderation
                            decision, email{" "}
                            <a href="mailto:support@checktag.io" className={linkClass}>
                                support@checktag.io
                            </a>
                            . Include the product and the reviewer&rsquo;s username if you can. We aim to act on
                            reports of objectionable content within 24 hours. See our{" "}
                            <Link href="/privacy#community" className={linkClass}>
                                Privacy Policy
                            </Link>{" "}
                            for how review data is handled, and our{" "}
                            <Link href="/terms-and-conditions" className={linkClass}>
                                Terms &amp; Conditions
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
