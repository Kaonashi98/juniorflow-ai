"use client";

import Image from "next/image";
import Link from "next/link";
import { History, KeyRound, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";
import { useAccess, useLanguage } from "@/components/app-providers";

export function Header() {
  const { locale, setLocale, t, copy } = useLanguage();
  const { unlocked, checking, openUnlock, lock } = useAccess();

  return (
    <header className="sticky top-0 z-40 border-b border-[#dce2dc] bg-[#f7f8f3]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-2 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight text-[#14261f]" aria-label={t("nav.home")}>
          <Image src="/branding/juniorflow-ai-brand.png" alt={copy.common.logoAlt} width={1536} height={1024} priority className="size-10 border border-[#14261f] object-contain" />
          <span>JuniorFlow <span className="text-[#5e7a17]">AI</span></span>
        </Link>
        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm font-medium sm:order-2 sm:w-auto" aria-label={t("nav.main")}>
          <Link href="/how-it-works" className="whitespace-nowrap px-2 py-2 text-[#52615b] hover:text-[#14261f]">{t("nav.guide")}</Link>
          <Link href="/history" className="inline-flex whitespace-nowrap items-center gap-1.5 px-2 py-2 text-[#52615b] hover:text-[#14261f]"><History aria-hidden="true" size={15} />{t("nav.history")}</Link>
          <Link href="/simulate" className="inline-flex whitespace-nowrap items-center gap-1.5 bg-[#14261f] px-3 py-2.5 text-white hover:bg-[#29483b]"><Sparkles aria-hidden="true" size={15} />{t("nav.start")}</Link>
        </nav>
        <div className="order-2 flex items-center gap-2 sm:order-3">
          <label className="sr-only" htmlFor="interface-language">{t("language.label")}</label>
          <select id="interface-language" value={locale} onChange={(event) => setLocale(event.target.value as "en" | "it")} className="min-h-10 border border-[#cbd4cc] bg-white px-2 text-sm focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40" aria-label={t("language.label")}>
            <option value="en">{t("language.english")}</option>
            <option value="it">{t("language.italian")}</option>
          </select>
          {checking ? (
            <button type="button" disabled aria-label={t("access.checking")} title={t("access.checking")} className="inline-flex min-h-10 items-center gap-1.5 border border-[#b9c4ba] px-2 text-xs font-semibold text-[#66736d] disabled:cursor-wait">
              <LoaderCircle aria-hidden="true" size={14} className="animate-spin" /><span className="hidden lg:inline">{t("access.checking")}</span>
            </button>
          ) : unlocked ? (
            <button type="button" onClick={lock} aria-label={t("access.lock")} className="inline-flex min-h-10 items-center gap-1.5 border border-[#b9c4ba] px-2 text-xs font-semibold text-[#52615b]" title={t("access.unlocked")}><LockKeyhole aria-hidden="true" size={14} /><span className="hidden lg:inline">{t("access.lock")}</span></button>
          ) : (
            <button type="button" onClick={openUnlock} aria-label={t("access.unlock")} className="inline-flex min-h-10 items-center gap-1.5 border border-[#14261f] px-2 text-xs font-semibold text-[#14261f]"><KeyRound aria-hidden="true" size={14} /><span className="hidden lg:inline">{t("access.unlock")}</span></button>
          )}
        </div>
      </div>
    </header>
  );
}