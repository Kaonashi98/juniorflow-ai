import type { Metadata } from "next";
import { SessionView } from "@/components/session-view";
import { LocalizedDocumentTitle } from "@/components/localized-document-title";

export const metadata: Metadata = {
  title: "Work session",
  description: "Continue a saved JuniorFlow AI ticket and review.",
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <><LocalizedDocumentTitle page="session" /><SessionView id={id} /></>;
}
