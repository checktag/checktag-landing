import type { Metadata } from "next";
import LegalDoc from "../LegalDoc";
import { TERMS_EFFECTIVE, TERMS_INTRO, termsSections } from "../../terms-and-conditions/content";

export const metadata: Metadata = {
  title: "Terms & Conditions – CheckTag®",
};

export default function InAppTermsPage() {
  return <LegalDoc title="Terms & Conditions" effective={TERMS_EFFECTIVE} intro={TERMS_INTRO} sections={termsSections} />;
}
