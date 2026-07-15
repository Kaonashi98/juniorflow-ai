"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Check, Code2, FileText, MessageSquareCode, Sparkles, Timer } from "lucide-react";
import { useLanguage } from "@/components/app-providers";
import { LANDING_COPY } from "@/lib/landing-copy";
import { formatDifficulty, formatEstimatedTime } from "@/lib/presentation";

const stepIcons = [BriefcaseBusiness, FileText, MessageSquareCode];

export function LandingPage() {
  const { locale } = useLanguage();
  const copy = LANDING_COPY[locale];
  return (
    <main>
      <section className="relative overflow-hidden border-b border-[#dce2dc]">
        <div className="dot-grid absolute inset-y-0 right-0 hidden w-[42%] opacity-70 lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-28">
          <div>
            <Image src="/branding/juniorflow-ai-brand.png" alt={copy.logoAlt} width={1536} height={1024} priority className="mb-6 h-24 w-auto border border-[#d5ddd6] object-cover shadow-[5px_5px_0_#c8f169]" />
            <div className="mb-7 inline-flex items-center gap-2 border border-[#c9d2c9] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#52615b]"><Sparkles aria-hidden="true" size={14} className="text-[#5e7a17]" />{copy.badge}</div>
            <h1 className="text-balance max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-0.045em] text-[#14261f] sm:text-6xl lg:text-7xl">
              {copy.titleStart} <span className="relative inline-block">{copy.titleAccent}<span className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-[#c8f169] sm:bottom-2" /></span>{" "}{copy.titleEnd}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5d6c66] sm:text-xl">{copy.intro}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/simulate" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#14261f] px-6 font-semibold text-white hover:bg-[#29483b]">{copy.start}<ArrowRight aria-hidden="true" size={18} /></Link>
              <Link href="/demo" className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#bdc8be] bg-white px-6 font-semibold text-[#14261f] hover:border-[#14261f]">{copy.demo}</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#64736d]">{copy.benefits.map((item) => <span key={item} className="flex items-center gap-2"><Check aria-hidden="true" size={15} className="text-[#5e7a17]" />{item}</span>)}</div>
            <p className="mt-3 max-w-xl text-xs leading-5 text-[#66736d]">{copy.accessNote}</p>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -left-5 -top-5 size-24 bg-[#c8f169]" />
            <div className="relative border border-[#14261f] bg-white shadow-[10px_10px_0_#14261f]">
              <div className="flex items-center justify-between border-b border-[#dce2dc] px-5 py-4"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#ff7066]" /><span className="size-2.5 rounded-full bg-[#f5c451]" /><span className="size-2.5 rounded-full bg-[#74bf78]" /></div><span className="font-mono text-xs text-[#64736d]">JF-2048</span></div>
              <div className="p-6 sm:p-8">
                <div className="mb-5 flex flex-wrap gap-2"><span className="bg-[#eef8d6] px-2.5 py-1 text-xs font-semibold text-[#536e12]">{formatDifficulty("Easy", locale).toUpperCase()}</span><span className="bg-[#f1f3f0] px-2.5 py-1 text-xs font-semibold text-[#52615b]">FRONT-END</span></div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight">{copy.sampleTitle}</h2>
                <p className="mt-4 leading-7 text-[#64736d]">{copy.sampleBody}</p>
                <div className="mt-6 grid gap-3 border-t border-[#e3e8e2] pt-6 sm:grid-cols-2">
                  <div className="flex items-center gap-3"><Timer aria-hidden="true" size={18} className="text-[#5e7a17]" /><div><p className="text-xs text-[#66736d]">{copy.estimated}</p><p className="text-sm font-semibold">{formatEstimatedTime("60–90 minutes", locale)}</p></div></div>
                  <div className="flex items-center gap-3"><Code2 aria-hidden="true" size={18} className="text-[#5e7a17]" /><div><p className="text-xs text-[#66736d]">{copy.stack}</p><p className="text-sm font-semibold">React · TypeScript</p></div></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-7 -right-3 flex items-center gap-3 border border-[#dce2dc] bg-[#f7f8f3] px-4 py-3 shadow-sm sm:-right-7"><BadgeCheck aria-hidden="true" className="text-[#5e7a17]" size={22} /><div><p className="text-xs text-[#64736d]">{copy.senior}</p><p className="text-sm font-semibold">{copy.seniorReady}</p></div></div>
          </div>
        </div>
      </section>
      <section className="bg-white py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5e7a17]">{copy.how}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{copy.gap}</h2></div><div className="mt-12 grid border-l border-t border-[#dce2dc] md:grid-cols-3">{copy.steps.map((step,index)=>{const Icon=stepIcons[index];return <article key={step.title} className="group border-b border-r border-[#dce2dc] p-7 hover:bg-[#f7f8f3] sm:p-8"><div className="flex items-start justify-between"><span className="font-mono text-sm text-[#66736d]">0{index+1}</span><Icon aria-hidden="true" size={25} className="text-[#5e7a17]" /></div><h3 className="mt-12 text-xl font-semibold">{step.title}</h3><p className="mt-3 leading-7 text-[#64736d]">{step.description}</p></article>})}</div></div></section>
      <section className="border-y border-[#dce2dc] bg-[#14261f] py-20 text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c8f169]">{copy.practice}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{copy.around}</h2></div><div className="grid gap-px bg-[#385045] sm:grid-cols-2">{copy.skills.map(item=><div key={item} className="flex items-center gap-3 bg-[#1c3229] p-5"><Check aria-hidden="true" size={18} className="shrink-0 text-[#c8f169]" /><span>{item}</span></div>)}</div></div></section>
      <section className="py-20 sm:py-28"><div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><h2 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{copy.ready}</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#64736d]">{copy.readyBody}</p><Link href="/simulate" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-[#c8f169] px-7 font-semibold text-[#14261f] hover:bg-[#b8e257]">{copy.create}<ArrowRight aria-hidden="true" size={18} /></Link></div></section>
    </main>
  );
}