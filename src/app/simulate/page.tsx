import { LocalizedDocumentTitle } from "@/components/localized-document-title";
import { localizedPageMetadata } from "@/lib/request-locale.server";
import { LocalizedPageIntro } from "@/components/localized-page-intro";
import { ProfileForm } from "@/components/profile-form";

export const generateMetadata = () => localizedPageMetadata("simulate");

export default function SimulatePage() {
  return <><LocalizedDocumentTitle page="simulate" /><main className="flex-1"><LocalizedPageIntro eyebrow="simulate.eyebrow" title="simulate.title" description="simulate.description" compact /><ProfileForm /></main></>;
}