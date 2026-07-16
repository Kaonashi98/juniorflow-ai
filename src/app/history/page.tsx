import { LocalizedDocumentTitle } from "@/components/localized-document-title";
import { localizedPageMetadata } from "@/lib/request-locale.server";
import { HistoryList } from "@/components/history-list";
import { LocalizedPageIntro } from "@/components/localized-page-intro";

export const generateMetadata = () => localizedPageMetadata("history");

export default function HistoryPage() {
  return <><LocalizedDocumentTitle page="history" /><main className="flex-1"><LocalizedPageIntro eyebrow="history.eyebrow" title="history.title" description="history.description" width="max-w-6xl" /><HistoryList /></main></>;
}