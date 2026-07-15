import { LocalizedDocumentTitle } from "@/components/localized-document-title";
import type { Metadata } from "next";
import { LocalizedPageIntro } from "@/components/localized-page-intro";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = { title: "Create a simulation", description: "Configure a realistic junior developer work ticket." };

export default function SimulatePage() {
  return <><LocalizedDocumentTitle page="simulate" /><main className="flex-1"><LocalizedPageIntro eyebrow="simulate.eyebrow" title="simulate.title" description="simulate.description" compact /><ProfileForm /></main></>;
}