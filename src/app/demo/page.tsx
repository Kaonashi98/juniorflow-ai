import { LocalizedDocumentTitle } from "@/components/localized-document-title";
import { localizedPageMetadata } from "@/lib/request-locale.server";
import { DemoPageContent } from "@/components/demo-page-content";

export const generateMetadata = () => localizedPageMetadata("demo");

export default function DemoPage() {
  return <><LocalizedDocumentTitle page="demo" /><DemoPageContent /></>;
}