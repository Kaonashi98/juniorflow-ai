

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion, HardDrive, LoaderCircle } from "lucide-react";
import { useLanguage } from "@/components/app-providers";
import {
  getHistoryEntry,
  upsertHistoryEntry,
} from "@/lib/history-store";
import type { HistoryEntry, SeniorReview, TicketSubmission } from "@/types";
import { SolutionWorkspace } from "@/components/solution-workspace";
import { TicketDetails } from "@/components/ticket-details";

export function applyReviewEditDecision(
  entry: HistoryEntry,
  confirmed: boolean,
  savedAt = new Date().toISOString(),
): HistoryEntry {
  if (!confirmed) return entry;
  const { review: _review, ...withoutReview } = entry;
  void _review;
  return {
    ...withoutReview,
    submissionRevision: entry.submissionRevision + 1,
    status: "solution-draft",
    savedAt,
  };
}
export function resolveSavedSession(id: string, storage?: Storage) {
  return getHistoryEntry(id, storage);
}

export function SessionView({ id }: { id: string }) {
  const { t } = useLanguage();
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEntry(resolveSavedSession(id));
      setIsLoading(false);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [id]);

  function persist(next: HistoryEntry) {
    setEntry(next);
    if (!upsertHistoryEntry(next)) setStorageError(true);
  }

  function saveSubmission(submission: TicketSubmission) {
    if (!entry) return;
    persist({
      ...entry,
      submission,
      status: "solution-draft",
      savedAt: new Date().toISOString(),
    });
  }

  function saveReview(submission: TicketSubmission, review: SeniorReview) {
    if (!entry) return;
    persist({
      ...entry,
      submission,
      review,
      status: "reviewed",
      savedAt: new Date().toISOString(),
    });
  }

  function editSubmission() {
    if (!entry) return;
    persist(applyReviewEditDecision(entry, true));
  }
  if (isLoading) {
    return <main className="flex flex-1 items-center justify-center py-24"><LoaderCircle aria-hidden="true" className="animate-spin text-[#5e7a17]" /><span className="sr-only">{t("common.loading")}</span></main>;
  }

  if (!entry) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <span className="flex size-14 items-center justify-center bg-[#eef1e9]"><FileQuestion aria-hidden="true" size={26} /></span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t("session.missing.title")}</h1>
        <p className="mt-3 max-w-xl leading-7 text-[#64736d]">{t("session.missing.description")}</p>
        <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
          <Link href="/simulate" className="inline-flex min-h-11 items-center justify-center bg-[#14261f] px-5 font-semibold text-white">{t("session.new")}</Link>
          <Link href="/demo" className="inline-flex min-h-11 items-center justify-center border border-[#14261f] px-5 font-semibold">{t("session.demo")}</Link>
          <Link href="/history" className="inline-flex min-h-11 items-center justify-center border border-[#cbd4cc] px-5 font-semibold">{t("session.history")}</Link>
          <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#cbd4cc] px-5 font-semibold"><ArrowLeft aria-hidden="true" size={17} />{t("session.home")}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="border-b border-[#dce2dc] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <Link href="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64736d] hover:text-[#14261f]"><ArrowLeft aria-hidden="true" size={16} />History</Link>
            <p className="mt-2 text-sm text-[#66736d]">Status: <span className="font-semibold text-[#14261f]">{statusLabel(entry.status)}</span></p>
            <p className="mt-1 text-sm text-[#66736d]">Profile stack: <span className="font-semibold text-[#14261f]">{entry.profile.technologies.join(", ")}</span></p>
            {entry.submission && <p className="mt-1 text-sm text-[#66736d]">Submission type: <span className="font-semibold text-[#14261f]">{entry.submission.submissionType}</span></p>}
          </div>
          <p className="text-sm text-[#66736d]">Last saved {new Date(entry.savedAt).toLocaleString()}</p>
        </div>
      </div>

      {storageError && (
        <div role="alert" className="border-b border-[#e5c8bc] bg-[#fff7f3]">
          <div className="mx-auto flex max-w-7xl items-start gap-3 px-5 py-3 text-sm text-[#8f3f2d] sm:px-8">
            <HardDrive aria-hidden="true" size={17} className="mt-0.5 shrink-0" />
            <p>This update could not be saved in browser storage. Keep this page open and check your browser privacy settings.</p>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:px-8 sm:py-12 xl:grid-cols-[minmax(0,1.16fr)_minmax(380px,0.84fr)] xl:items-start">
        <TicketDetails ticket={entry.ticket} />
        <SolutionWorkspace
          sessionId={entry.id}
          submissionRevision={entry.submissionRevision}
          ticket={entry.ticket}
          initialSubmission={entry.submission}
          initialReview={entry.review}
          onSubmission={saveSubmission}
          onReview={saveReview}
          onEditSubmission={editSubmission}
        />
      </div>
    </main>
  );
}

function statusLabel(status: HistoryEntry["status"]) {
  if (status === "reviewed") return "Reviewed";
  if (status === "solution-draft") return "Solution in progress";
  return "Ticket generated";
}
