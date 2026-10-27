import type { Metadata } from "next";
import LegalDoc from "../LegalDoc";
import { PRIVACY_EFFECTIVE, PRIVACY_INTRO, privacySections } from "../../privacy/content";

export const metadata: Metadata = {
  title: "Privacy Policy – CheckTag®",
};

export default function InAppPrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      effective={PRIVACY_EFFECTIVE}
      intro={PRIVACY_INTRO}
      sections={privacySections({ inApp: true, linkClass: "ia-link" })}
    />
  );
}
