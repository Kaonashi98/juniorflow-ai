import { LocalizedDocumentTitle } from "@/components/localized-document-title";
import { localizedPageMetadata } from "@/lib/request-locale.server";
import { HowItWorksPage } from "@/components/how-it-works-page";

export const generateMetadata = () => localizedPageMetadata("guide");

export default function Page() {
  return <><LocalizedDocumentTitle page="guide" /><HowItWorksPage /></>;
}