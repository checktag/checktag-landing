import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
    title: "Privacy Policy – CheckTag®",
    description: "Learn how CheckTag collects, uses, and protects your personal information.",
};

const linkClass = "text-[#22AED1] underline underline-offset-2 hover:text-white transition-colors";

const DbIpAttribution = (
    <a href="https://db-ip.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
        IP geolocation by DB-IP
    </a>
);

const sections: {
    id: string;
    title: string;
    content: ReactNode | null;
    list: ReactNode[] | null;
}[] = [
    {
        id: "information-we-collect",
        title: "1. Information We Collect",
        content: null,
        list: [
            "Account information: the email address and/or phone number you provide during sign-up. Phone numbers are used to deliver SMS one-time passcodes.",
            "Username: your account is given a pseudonymous username (a generated handle, not your real name). This is the name shown publicly on reviews you post.",
            "Authentication data: the one-time verification code we send you, and the session token issued to your device after you sign in.",
            "Scan data: product scan events including timestamps, product identifiers and, where available, the two-letter country code of the country the scan was made from.",
            <>
                Approximate country: we work out the country you are in from your IP address, on our own servers, using a local copy of the DB-IP Lite database ({DbIpAttribution}). Your IP address is not sent to anyone for this and is not stored — only the resulting two-letter country code (for example, &ldquo;NG&rdquo;) is kept. If the IP address gives no answer, your device may send the country of its time-zone setting as a hint. You can change or clear your country at any time in settings. CheckTag never uses GPS or your device&rsquo;s precise location.
            </>,
            "CheckTag code checks: some brands print a CheckTag code (a QR code unique to one pack) on their products. When you check one, in the app or on checktag.io, we record the check with the code, the time, the two-letter country it came from and, if you are signed in, your account. To work out the country we use your IP address once and do not store it; on checktag.io, our website host (Vercel) tells us the country of your connection. We use these records to spot copied codes, for example one code being checked in two different countries. CheckTag never uses GPS or your device’s precise location for this.",
            "Community reviews: the star rating and text of reviews you post, when you posted or edited them, the reviews you mark as helpful, the reports you file (the reason and any note you add), the users you block, and when you accepted the Community Guidelines.",
            "Label photos: photos of product packaging labels (such as ingredients or nutrition panels) that you choose to submit, the details read from them, and any corrections you make before submitting.",
            "Report details: information you submit in counterfeit or quality reports, including any purchase location you choose to enter. This is typed in by you — CheckTag does not collect GPS or device location.",
            "Payout details: if you request a cash-back withdrawal, the payout details you provide (such as account number, bank code, and account name), which are used to set up a transfer recipient with our payment processor.",
            "Messaging data: if you use CheckTag through our Telegram bot or mini app, we receive your Telegram user ID and basic profile information (such as your first name) from Telegram, along with the barcodes and messages you send, so we can show you results and link your activity to your CheckTag account.",
            "Device information: device type, operating system, and app version for troubleshooting.",
            "Progress and missions: the XP, levels, badges, streak days, mission progress, league and team you take part in, worked out from your scans and other activity. To count streak days in your own time zone, the app sends your device's offset from UTC (for example \u201c+60 minutes\u201d); this is not your location.",
            "Your reasons for checking products: if you tell us why you check products (for example health, value or authenticity), we keep that choice to order product information and suggest missions. You can change it at any time.",
            "Creator programme: if you apply, the social media handle, platform, topic, audience size and note you provide, so our team can review your application.",
            "Family profiles stay on your phone: the names, allergies and diets you add in Family profiles are stored only on your device and are never sent to CheckTag.",
        ],
    },
    {
        id: "how-we-use",
        title: "2. How We Use Your Information",
        content: null,
        list: [
            "To create and manage your CheckTag account.",
            "To authenticate you securely and maintain session integrity.",
            "To process product scan events and deliver relevant content.",
            "To generate product summaries, health insights, and answer your product questions using AI.",
            "To show regional information, such as which similar products are popular or available in your country.",
            "To publish community reviews, screen them for content that breaks our Community Guidelines, act on reports, and keep the community safe.",
            "To read the label photos you submit and prepare proposed product-information updates for review by our moderators.",
            "To process the reward withdrawals and payouts you request.",
            "To improve our services based on usage patterns.",
            "To send transactional communications (e.g., OTP codes).",
        ],
    },
    {
        id: "community",
        title: "3. Reviews, Community & Public Information",
        content: null,
        list: [
            "Public reviews: reviews you post are public. Anyone viewing the product — including people who are not signed in — can see your rating, your review text, when it was posted, and your pseudonymous username (and profile picture, if you have one).",
            <>
                Moderation: reviews are screened automatically when you post them, and may be checked by AI (see Data Sharing). Reviews that are held by our filters or reported by other users may be reviewed by our moderators, who can see the review, its reports, and your account identifier. Reviews that break our{" "}
                <Link href="/community-guidelines" className={linkClass}>
                    Community Guidelines
                </Link>{" "}
                are removed, and users who repeatedly or seriously break them can be banned from posting.
            </>,
            "Reporting and blocking: if you report a review, its author is not told who reported it. If you block a user, their reviews are hidden from you; they are not notified.",
            "Your control: you can edit or delete your reviews at any time. A deleted review is removed from public view immediately; we may keep a record of it for moderation and abuse-prevention purposes.",
            "Brands on CheckTag: brands we have verified can use the CheckTag brand portal for their own products. There they see how often those products were scanned and their codes checked, counted by country only, and the public reviews posted on them. Brands never see who scanned or checked a product, or any location finer than the country. A verified brand can reply publicly to reviews of its products; its reply appears under the review as a “Response from” the brand.",
            "Reports and brands: if you report a problem with a product (for example a suspected fake or an expired pack), the product’s verified brand can see the text and photos of your report in the brand portal. It never sees your name, username or email address.",
            "Leaderboards and teams: league and team leaderboards show your username, profile picture and XP for the week to other people in the same league or team. You can turn leaderboards off in the app; you are then shown as \u201cPrivate member\u201d. Teams show their name and member count to their members.",
            "Live activity feed: we show an anonymised feed of recent scans and aggregated product statistics (such as scan counts by country). These show only the product, the country, and whether a scan earned cash-back — never your name, username, or any other information that identifies you.",
            "Label photos: label photos you submit are stored as evidence so that a moderator can check the proposed product information against your photo. Nothing is changed in our product catalogue until a moderator approves it. Please photograph only the product packaging, and avoid including people or personal documents.",
        ],
    },
    {
        id: "data-sharing",
        title: "4. Data Sharing",
        content: (
            <>
                We do not sell your personal data. We share data with trusted third-party service providers who help us operate the platform: email delivery of one-time passcodes and transactional email (Resend); payment processing and payouts (Paystack); SMS delivery of one-time passcodes (Twilio); product identification via barcode lookup providers (Go-UPC, Open Food Facts, Barcode Lookup, and Barcode Spider), to which a scanned product&rsquo;s barcode is sent; our AI provider (xAI / Grok), to which product and scan metadata may be sent to generate summaries and answer your questions, label photos you submit are sent so the label text can be read, and review text is sent to check it against our Community Guidelines; image storage and delivery for submitted photos (Cloudinary); website hosting (Vercel), which also tells us the country of your connection when you check a CheckTag code on checktag.io; and cloud infrastructure and database hosting (Railway). If you use our Telegram bot or mini app, your messages pass through Telegram, under Telegram&rsquo;s own privacy policy. Country detection uses a copy of the DB-IP Lite database held on our own servers, so your IP address is not shared with DB-IP or anyone else for that purpose ({DbIpAttribution}). We may also disclose data when required by applicable law.
            </>
        ),
        list: null,
    },
    {
        id: "data-retention",
        title: "5. Data Retention",
        content:
            "We retain your personal data for as long as your account is active or as needed to provide our services. Your country code is kept with your account until you change or clear it. Label photos and moderation records are kept as long as needed to review submissions and prevent abuse. You may request deletion of your account and all associated data at any time via the app settings or by contacting us at support@checktag.io.",
        list: null,
    },
    {
        id: "rewards-security",
        title: "6. Rewards & Security",
        content:
            "Inside the app you earn reward points for verifying products, redeemable for cash-back (processed via Paystack). Points are a loyalty balance, not a cryptocurrency. The CheckTag app does not create, hold, or provide a cryptocurrency wallet, and does not buy, sell, trade, or exchange digital assets. CheckTag never generates or stores private keys or recovery phrases for you. Any CTAG token activity is a separate, web-only matter handled outside the app on the CheckTag website, where you supply your own external wallet address as the destination — CheckTag does not custody, transfer, freeze, or recover any digital assets on your behalf. For the data we do process, we implement industry-standard security measures including HTTPS encryption, JWT-based authentication, and access controls. However, no method of data transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
        list: null,
    },
    {
        id: "cookies",
        title: "7. Cookies & Local Storage",
        content:
            "This website does not use advertising or third-party tracking cookies. Inside Telegram, the CheckTag mini app stores only your display preferences (such as light or dark mode) on your device.",
        list: null,
    },
    {
        id: "children",
        title: "8. Children's Privacy",
        content:
            "CheckTag is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately to have it removed.",
        list: null,
    },
    {
        id: "your-rights",
        title: "9. Your Rights",
        content:
            "Depending on your jurisdiction, you may have the right to access, correct, or delete the personal data we hold about you, as well as the right to object to or restrict processing. You can change or clear your country in settings and delete your reviews in the app at any time. To exercise any of your other rights, please contact us at support@checktag.io.",
        list: null,
    },
    {
        id: "third-party-links",
        title: "10. Third-Party Links",
        content:
            "Our app and website may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties and encourage you to review their respective privacy policies.",
        list: null,
    },
    {
        id: "changes",
        title: "11. Changes to This Policy",
        content:
            'We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Effective" date at the top of this page. Your continued use of CheckTag after any changes constitutes your acceptance of the updated policy.',
        list: null,
    },
    {
        id: "contact",
        title: "12. Contact Us",
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
                        Effective date: <span className="text-white font-medium">October 26, 2026</span>
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-3xl mx-auto px-4 py-16 relative z-10">
                <p className="text-white/60 text-base leading-relaxed mb-10">
                    Welcome to CheckTag (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We are
                    committed to protecting your personal information and your right to privacy. This policy
                    explains how we collect, use, and safeguard your data when you use our mobile application,
                    website, Telegram bot and related services.
                </p>

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
