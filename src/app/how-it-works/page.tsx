import { LocalizedDocumentTitle } from "@/components/localized-document-title";
import type { Metadata } from "next";
import { HowItWorksPage } from "@/components/how-it-works-page";

export const metadata: Metadata = {
  title: "How it works",
  description: "Learn how to configure a profile, work a ticket, and request an educational AI review.",
};

export default function Page() {
  return <><LocalizedDocumentTitle page="guide" /><HowItWorksPage /></>;
}