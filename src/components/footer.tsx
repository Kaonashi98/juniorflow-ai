"use client";

import Link from "next/link";
import { Braces } from "lucide-react";
import { useLanguage } from "@/components/app-providers";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-[#dce2dc] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[#64736d] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2 font-medium text-[#14261f]"><Braces aria-hidden="true" size={18} />JuniorFlow AI</div>
        <p>{t("footer.built")}</p>
        <div className="flex gap-5"><Link className="hover:text-[#14261f]" href="/how-it-works">{t("nav.guide")}</Link><Link className="hover:text-[#14261f]" href="/history">{t("nav.history")}</Link><Link className="hover:text-[#14261f]" href="/demo">{t("footer.demo")}</Link></div>
      </div>
    </footer>
  );
}