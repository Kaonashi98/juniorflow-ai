import { localizedPageMetadata } from "@/lib/request-locale.server";
import { SessionView } from "@/components/session-view";
import { LocalizedDocumentTitle } from "@/components/localized-document-title";

export const generateMetadata = () => localizedPageMetadata("session");

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <><LocalizedDocumentTitle page="session" /><SessionView id={id} /></>;
}
