"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Send, GraduationCap, History, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/app-providers";

const steps = [
  ["guide.s1.title", "guide.s1.body", BriefcaseBusiness],
  ["guide.s2.title", "guide.s2.body", FileText],
  ["guide.s3.title", "guide.s3.body", Send],
  ["guide.s4.title", "guide.s4.body", GraduationCap],
  ["guide.s5.title", "guide.s5.body", History],
] as const;

export function HowItWorksPage() {
  const { t } = useLanguage();
  return (
    <main className="flex-1">
      <section className="border-b border-[#dce2dc] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5e7a17]">{t("guide.eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{t("guide.title")}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#64736d]">{t("guide.intro")}</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <ol className="grid gap-4">
          {steps.map(([title, body, Icon], index) => (
            <li key={title} className="grid gap-5 border border-[#d5ddd6] bg-white p-6 sm:grid-cols-[64px_1fr] sm:p-7">
              <span className="flex size-14 items-center justify-center bg-[#eef8d6] text-[#526d14]"><Icon aria-hidden="true" size={24} /></span>
              <div><p className="font-mono text-xs text-[#66736d]">0{index + 1}</p><h2 className="mt-1 text-xl font-semibold">{t(title)}</h2><p className="mt-2 leading-7 text-[#64736d]">{t(body)}</p></div>
            </li>
          ))}
        </ol>
<section className="mt-8 flex gap-4 border border-[#dbe5c6] bg-[#f5f8ef] p-5 sm:p-6"><ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[#5e7a17]" size={22} /><div><h2 className="font-semibold">{t("guide.transparency.title")}</h2><p className="mt-2 leading-7 text-[#64736d]">{t("guide.transparency.body")}</p></div></section>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/simulate" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#14261f] px-6 font-semibold text-white">{t("guide.cta")}<ArrowRight aria-hidden="true" size={17} /></Link>
          <Link href="/demo" className="inline-flex min-h-12 items-center justify-center border border-[#14261f] px-6 font-semibold">{t("guide.demo")}</Link>
        </div>
      </section>
    </main>
  );
}