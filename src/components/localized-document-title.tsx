"use client";

import { useEffect } from "react";
import { useLanguage } from "@/components/app-providers";
import { APP_COPY, type LocalizedPageTitle } from "@/lib/app-copy";
import type { Locale } from "@/lib/i18n";

export type { LocalizedPageTitle } from "@/lib/app-copy";

export function localizedDocumentTitle(page: LocalizedPageTitle, locale: Locale) {
  return APP_COPY[locale].common.titles[page];
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
