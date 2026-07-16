"use client";

import { useLanguage } from "@/components/app-providers";


export default function Loading() {
  const { copy } = useLanguage();
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 animate-pulse px-5 py-12 sm:px-8">
      <div className="h-4 w-28 bg-[#dfe5df]" />
      <div className="mt-5 h-11 max-w-xl bg-[#dfe5df]" />
      <div className="mt-4 h-5 max-w-2xl bg-[#e8ece7]" />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="h-96 border border-[#dfe5df] bg-white" />
        <div className="h-96 border border-[#dfe5df] bg-white" />
      </div>
      <span className="sr-only">{copy.pages.loading}</span>
    </main>
  );
}
