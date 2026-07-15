"use client";

import { useEffect } from "react";


import { useLanguage } from "@/components/app-providers";
import type { Locale } from "@/lib/i18n";

export type LocalizedPageTitle = "home" | "simulate" | "history" | "demo" | "guide" | "session";

const TITLES: Record<LocalizedPageTitle, Record<Locale, string>> = {
  home: { en: "JuniorFlow AI — Your first job, before your first job", it: "JuniorFlow AI — Il tuo primo lavoro, prima del primo lavoro" },
  simulate: { en: "Create a simulation | JuniorFlow AI", it: "Crea una simulazione | JuniorFlow AI" },
  history: { en: "History | JuniorFlow AI", it: "Storico | JuniorFlow AI" },
  demo: { en: "Demo ticket | JuniorFlow AI", it: "Ticket demo | JuniorFlow AI" },
  guide: { en: "How it works | JuniorFlow AI", it: "Come funziona | JuniorFlow AI" },
  session: { en: "Work session | JuniorFlow AI", it: "Sessione di lavoro | JuniorFlow AI" },
};

export function localizedDocumentTitle(page: LocalizedPageTitle, locale: Locale) {
  return TITLES[page][locale];
}

export function LocalizedDocumentTitle({ page }: { page: LocalizedPageTitle }) {
  const { locale } = useLanguage();

    useEffect(() => {
    const desired = localizedDocumentTitle(page, locale);
    const applyTitle = () => {
      if (document.title !== desired) document.title = desired;
    };
    applyTitle();
    const frame = window.requestAnimationFrame(applyTitle);
    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [locale, page]);

  return null;
}