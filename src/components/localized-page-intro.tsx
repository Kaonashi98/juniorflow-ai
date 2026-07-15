"use client";

import { useLanguage } from "@/components/app-providers";
import type { MessageKey } from "@/lib/i18n";

export function LocalizedPageIntro({ eyebrow, title, description, width = "max-w-5xl" }: { eyebrow: MessageKey; title: MessageKey; description: MessageKey; width?: string }) {
  const { t } = useLanguage();
  return (
    <section className="border-b border-[#dce2dc] bg-white">
      <div className={`mx-auto ${width} px-5 py-12 sm:px-8 sm:py-16`}>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5e7a17]">{t(eyebrow)}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{t(title)}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#64736d]">{t(description)}</p>
      </div>
    </section>
  );
}