import { LocalizedDocumentTitle } from "@/components/localized-document-title";
import type { Metadata } from "next";
import { DemoPageContent } from "@/components/demo-page-content";

export const metadata: Metadata = { title: "Demo ticket", description: "Explore a complete JuniorFlow AI ticket and senior review flow." };

export default function DemoPage() {
  return <><LocalizedDocumentTitle page="demo" /><DemoPageContent /></>;
}