

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileQuestion,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  clearHistory,
  deleteHistoryEntry,
  loadHistory,
} from "@/lib/history-store";
import type { HistoryEntry, HistoryStatus } from "@/types";
import { useLanguage } from "@/components/app-providers";
import { UI_COPY } from "@/lib/ui-copy";
import { formatDate, formatEstimatedTime, formatHistoryStatus, formatRole, formatSubmissionType } from "@/lib/presentation";

type StatusFilter = "all" | HistoryStatus;

export function HistoryList() {
  const { locale } = useLanguage();
  const copy = UI_COPY[locale].history;
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [isReady, setIsReady] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const result = loadHistory();
      setEntries(result.entries);
      setRecovered(result.recoveredFromCorruption);
      setStorageAvailable(result.storageAvailable);
      setIsReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesText =
        !normalized ||
        entry.ticket.title.toLowerCase().includes(normalized) ||
        entry.ticket.ticketId.toLowerCase().includes(normalized) ||
        entry.profile.role.toLowerCase().includes(normalized) ||
        entry.profile.technologies.some((item) => item.toLowerCase().includes(normalized)) ||
        entry.ticket.technologies.some((item) => item.toLowerCase().includes(normalized));
      return matchesText && (status === "all" || entry.status === status);
    });
  }, [entries, query, status]);

  function removeEntry(entry: HistoryEntry) {
    if (!window.confirm(copy.deleteOne.replace("{title}", entry.ticket.title))) return;
    if (deleteHistoryEntry(entry.id)) {
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    }
  }

  function removeAll() {
    if (!window.confirm(copy.deleteAll)) return;
    if (clearHistory()) setEntries([]);
  }

  if (!isReady) {
    return <section className="mx-auto flex min-h-72 max-w-6xl items-center justify-center px-5 py-10 text-sm text-[#66736d] sm:px-8">{copy.loading}</section>;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {!storageAvailable && (
        <div role="alert" className="mb-6 border border-[#e5c8bc] bg-[#fff7f3] p-4 text-sm text-[#8f3f2d]">
          {copy.storage}
        </div>
      )}
      {recovered && (
        <div role="status" className="mb-6 border border-[#ead9a7] bg-[#fffbed] p-4 text-sm text-[#795f19]">
          {copy.recovered}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <label className="block w-full max-w-md text-sm font-semibold">
            {copy.search}
            <span className="relative mt-2 block">
              <Search aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#66736d]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-12 w-full border border-[#cbd4cc] bg-white pl-10 pr-4 placeholder:text-[#6a766f] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40" placeholder={copy.placeholder} />
            </span>
          </label>
          <label className="block text-sm font-semibold">
            {copy.status}
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="mt-2 min-h-12 w-full border border-[#cbd4cc] bg-white px-3.5 sm:w-52">
              <option value="all">{copy.all}</option>
              <option value="ticket-generated">{formatHistoryStatus("ticket-generated", locale)}</option>
              <option value="solution-draft">{formatHistoryStatus("solution-draft", locale)}</option>
              <option value="reviewed">{formatHistoryStatus("reviewed", locale)}</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <p className="text-sm text-[#66736d]">{filteredEntries.length} {filteredEntries.length === 1 ? copy.ticket : copy.tickets}</p>
          {entries.length > 0 && <button type="button" onClick={removeAll} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9a4433] hover:underline"><Trash2 aria-hidden="true" size={15} />{copy.clearAll}</button>}
        </div>
      </div>

      {filteredEntries.length ? (
        <div className="mt-7 grid gap-4">
          {filteredEntries.map((entry) => (
            <article key={entry.id} className="group border border-[#d5ddd6] bg-white p-5 transition-colors hover:border-[#92a097] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={entry.status} locale={locale} />
                    <span className="font-mono text-xs text-[#66736d]">{entry.ticket.ticketId}</span>
                    {entry.review && <span className="border border-[#cfe0aa] px-2 py-1 text-xs font-semibold text-[#526d14]">{entry.review.overallScore}/100</span>}
                    {entry.submission && <span className="bg-[#eef1e9] px-2 py-1 text-xs font-semibold text-[#52615b]">{formatSubmissionType(entry.submission.submissionType, locale)}</span>}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight group-hover:text-[#526d14]">{entry.ticket.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#66736d]">
                    <span className="flex items-center gap-1.5"><CalendarDays aria-hidden="true" size={15} />{formatDate(entry.ticket.createdAt, locale)}</span>
                    <span className="flex items-center gap-1.5"><Clock3 aria-hidden="true" size={15} />{formatEstimatedTime(entry.ticket.estimatedTime, locale)}</span>
                    <span>{formatRole(entry.profile.role, locale)}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#66736d]">
                    {copy.stack}: {entry.profile.technologies.join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => removeEntry(entry)} aria-label={copy.deleteAria.replace("{title}", entry.ticket.title)} className="inline-flex size-11 items-center justify-center border border-[#d5ddd6] text-[#8e4a3a] hover:border-[#8e4a3a]"><Trash2 aria-hidden="true" size={17} /></button>
                  <Link href={`/session/${entry.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#14261f] px-4 text-sm font-semibold transition-colors hover:bg-[#14261f] hover:text-white">{copy.open} <ArrowRight aria-hidden="true" size={16} /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 border border-dashed border-[#bfc9c0] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center bg-[#eef1e9] text-[#64736d]"><FileQuestion aria-hidden="true" size={23} /></span>
          <h2 className="mt-5 text-xl font-semibold">{entries.length ? copy.noMatch : copy.empty}</h2>
          <p className="mx-auto mt-2 max-w-sm leading-7 text-[#66736d]">{entries.length ? copy.try : copy.emptyBody}</p>
          {entries.length ? (
            <button type="button" onClick={() => { setQuery(""); setStatus("all"); }} className="mt-5 font-semibold text-[#5e7a17] underline underline-offset-4">{copy.clearFilters}</button>
          ) : (
            <Link href="/simulate" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#14261f] px-5 font-semibold text-white">{copy.create} <ArrowRight aria-hidden="true" size={16} /></Link>
          )}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 border border-[#dbe5c6] bg-[#f5f8ef] p-4 text-sm text-[#52615b]">
        <Sparkles aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[#5e7a17]" />
        <p>{copy.local}</p>
      </div>
    </section>
  );
}

function StatusBadge({ status, locale }: { status: HistoryStatus; locale: "en" | "it" }) {
  const className = status === "reviewed" ? "bg-[#c8f169]" : status === "solution-draft" ? "bg-[#fff0c2]" : "bg-[#eef1e9]";
  return <span className={`${className} px-2 py-1 text-[10px] font-bold uppercase tracking-wide`}>{formatHistoryStatus(status, locale)}</span>;
}
