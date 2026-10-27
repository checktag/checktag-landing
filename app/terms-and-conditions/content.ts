// The Terms and Conditions text, shared by checktag.io/terms-and-conditions
// and the copy the mobile app shows (/in-app/terms).

export const TERMS_EFFECTIVE = "October 26, 2026";

export const TERMS_INTRO =
    "Please read these Terms and Conditions carefully before using the CheckTag mobile application or website. These terms govern your access to and use of our services.";

export const termsSections: { title: string; content: string; list: string[] | null }[] = [
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
        title: "6. Rewards, Missions and Status",
        content:
            "CheckTag may award reward points for eligible activity, such as a verified first scan of a product, approved product additions, corrections and reports, inviting a friend who then makes their first genuine scan, and completing missions. The value of your points is shown in US dollars in the app.",
        list: [
            "Only genuine, eligible activity earns points. Repeat scans of the same product, scans that fail our anti-fraud checks and activity by brand staff don't earn points. We may hold, reverse or cancel points earned through fraud, abuse, automation or error.",
            "Redeeming points is subject to the minimum amount, limits and identity checks shown in the app at the time.",
            "Boosters (for example for scanning on consecutive days) and missions are promotional. They are capped, paid from limited budgets, and may change, pause or end at any time, including part-way through a week.",
            "Sponsored missions are funded by the brand named on the mission and end when that brand's budget is spent.",
            "XP, levels, badges, leagues and team rankings show your progress only. They have no monetary value and can't be exchanged for points or money.",
            "Leaderboards show your username unless you turn leaderboards off in the app.",
            "Creator programme applications are reviewed by CheckTag. Approved creators earn through the standard invite rewards, only when people they invite make their first genuine scan.",
        ],
    },
    {
        title: "7. Reviews & User Content",
        content:
            "If you post reviews or other content on CheckTag, you must follow our Community Guidelines (checktag.io/community-guidelines), which you accept before your first post. CheckTag has zero tolerance for objectionable content or abusive users. You are responsible for what you post. You keep ownership of your content, and you grant CheckTag a non-exclusive, worldwide, royalty-free licence to host, display, and distribute it as part of the service. We may screen, hide, or remove any content, and suspend or remove your ability to post, if we believe it breaks these Terms or the Community Guidelines. To report objectionable content or an abusive user, use Report in the app or email support@checktag.io.",
        list: null,
    },
    {
        title: "8. Disclaimers",
        content:
            'The service is provided "as is" and "as available" without warranties of any kind, either express or implied. CheckTag does not warrant that the service will be uninterrupted, error-free, or free of harmful components.',
        list: null,
    },
    {
        title: "9. Limitation of Liability",
        content:
            "To the fullest extent permitted by law, CheckTag shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, even if we have been advised of the possibility of such damages.",
        list: null,
    },
    {
        title: "10. Termination",
        content:
            "We reserve the right to terminate or suspend your account at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.",
        list: null,
    },
    {
        title: "11. Changes to Terms",
        content:
            "We may modify these Terms at any time. We will notify you of significant changes by updating the date above. Your continued use of the service after any changes constitutes acceptance of the revised Terms.",
        list: null,
    },
    {
        title: "12. Governing Law",
        content:
            "These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts.",
        list: null,
    },
    {
        title: "13. Contact Us",
        content:
            "If you have questions about these Terms and Conditions, please contact us at support@checktag.io.",
        list: null,
    },
];
