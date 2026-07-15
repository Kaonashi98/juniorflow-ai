

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion, HardDrive, LoaderCircle } from "lucide-react";
import {
  getHistoryEntry,
  upsertHistoryEntry,
} from "@/lib/history-store";
import type { HistoryEntry, SeniorReview, TicketSubmission } from "@/types";
import { SolutionWorkspace } from "@/components/solution-workspace";
import { TicketDetails } from "@/components/ticket-details";

export function SessionView({ id }: { id: string }) {
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEntry(getHistoryEntry(id));
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

  if (isLoading) {
    return <main className="flex flex-1 items-center justify-center py-24"><LoaderCircle aria-hidden="true" className="animate-spin text-[#678616]" /><span className="sr-only">Loading saved ticket</span></main>;
  }

  if (!entry) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <span className="flex size-14 items-center justify-center bg-[#eef1e9]"><FileQuestion aria-hidden="true" size={26} /></span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Saved ticket not found.</h1>
        <p className="mt-3 leading-7 text-[#64736d]">It may have been removed or your browser storage may have been cleared.</p>
        <Link href="/history" className="mt-7 inline-flex min-h-11 items-center gap-2 bg-[#14261f] px-5 font-semibold text-white"><ArrowLeft aria-hidden="true" size={17} />Back to history</Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="border-b border-[#dce2dc] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <Link href="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64736d] hover:text-[#14261f]"><ArrowLeft aria-hidden="true" size={16} />History</Link>
            <p className="mt-2 text-sm text-[#718079]">Status: <span className="font-semibold text-[#14261f]">{statusLabel(entry.status)}</span></p>
            <p className="mt-1 text-sm text-[#718079]">Profile stack: <span className="font-semibold text-[#14261f]">{entry.profile.technologies.join(", ")}</span></p>
          </div>
          <p className="text-sm text-[#718079]">Last saved {new Date(entry.savedAt).toLocaleString()}</p>
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
          ticket={entry.ticket}
          initialSubmission={entry.submission}
          initialReview={entry.review}
          onSubmission={saveSubmission}
          onReview={saveReview}
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
