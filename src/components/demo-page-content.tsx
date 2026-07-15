"use client";

import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { useLanguage } from "@/components/app-providers";
import { DemoWorkspace } from "@/components/demo-workspace";
import { TicketDetails } from "@/components/ticket-details";
import { DEMO_TICKET } from "@/data/demo-ticket";
import { UI_COPY } from "@/lib/ui-copy";

export function DemoPageContent() {
  const { locale } = useLanguage();
  const copy = UI_COPY[locale].demo;
  return <main className="flex-1"><div className="border-b border-[#dce2dc] bg-[#eef8d6]"><div className="mx-auto flex max-w-7xl items-start gap-3 px-5 py-3 text-sm text-[#476013] sm:items-center sm:px-8"><Info aria-hidden="true" size={17} className="mt-0.5 shrink-0 sm:mt-0" /><p><strong>{copy.label}</strong> {copy.body}</p></div></div><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"><Link href="/simulate" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#64736d] hover:text-[#14261f]"><ArrowLeft aria-hidden="true" size={16} />{copy.back}</Link><div className="grid gap-7 xl:grid-cols-[minmax(0,1.16fr)_minmax(380px,0.84fr)] xl:items-start"><TicketDetails ticket={DEMO_TICKET} /><DemoWorkspace /></div></div></main>;
}