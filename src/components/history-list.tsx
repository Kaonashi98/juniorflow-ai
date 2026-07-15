"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileQuestion,
  Search,
  Sparkles,
} from "lucide-react";
import { DEMO_HISTORY } from "@/data/demo-ticket";

export function HistoryList() {
  const [query, setQuery] = useState("");
  const entries = DEMO_HISTORY.filter((entry) =>
    entry.ticket.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block w-full max-w-md text-sm font-semibold">
          Search tickets
          <span className="relative mt-2 block">
            <Search aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77847e]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-12 w-full border border-[#cbd4cc] bg-white pl-10 pr-4 placeholder:text-[#98a29e] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40" placeholder="Search by ticket title…" />
          </span>
        </label>
        <p className="text-sm text-[#74817b]">{entries.length} {entries.length === 1 ? "ticket" : "tickets"}</p>
      </div>

      {entries.length ? (
        <div className="mt-7 grid gap-4">
          {entries.map((entry) => (
            <article key={entry.id} className="group border border-[#d5ddd6] bg-white p-5 transition-colors hover:border-[#92a097] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#c8f169] px-2 py-1 text-[10px] font-bold tracking-wide">DEMO RECORD</span>
                    <span className="font-mono text-xs text-[#77847e]">{entry.ticket.id}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight group-hover:text-[#526d14]">{entry.ticket.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#718079]">
                    <span className="flex items-center gap-1.5"><CalendarDays aria-hidden="true" size={15} />Jul 15, 2026</span>
                    <span className="flex items-center gap-1.5"><Clock3 aria-hidden="true" size={15} />{entry.ticket.estimatedTime}</span>
                    <span>{entry.profile.role}</span>
                  </div>
                </div>
                <Link href="/demo" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-[#14261f] px-4 text-sm font-semibold transition-colors hover:bg-[#14261f] hover:text-white">Open ticket <ArrowRight aria-hidden="true" size={16} /></Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 border border-dashed border-[#bfc9c0] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center bg-[#eef1e9] text-[#64736d]"><FileQuestion aria-hidden="true" size={23} /></span>
          <h2 className="mt-5 text-xl font-semibold">No tickets found</h2>
          <p className="mx-auto mt-2 max-w-sm leading-7 text-[#718079]">Try a different search, or start a fresh simulation to add a new ticket.</p>
          <button type="button" onClick={() => setQuery("")} className="mt-5 font-semibold text-[#5e7a17] underline underline-offset-4">Clear search</button>
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 border border-[#dbe5c6] bg-[#f5f8ef] p-4 text-sm text-[#52615b]">
        <Sparkles aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[#678616]" />
        <p>This phase displays demo history. Browser-based local storage will be connected in the dedicated History phase.</p>
      </div>
    </section>
  );
}
