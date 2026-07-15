"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/components/app-providers";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useLanguage();
  const copy = locale === "it" ? { title: "Qualcosa è andato fuori copione.", body: "Il tuo lavoro è ancora qui. Prova a ricaricare questa schermata.", retry: "Riprova" } : { title: "Something went off-script.", body: "Your work is still here. Try loading this screen again.", retry: "Try again" };
  return <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center"><span className="flex size-14 items-center justify-center bg-[#f7e9e4] text-[#a84f36]"><AlertCircle aria-hidden="true" size={26} /></span><h1 className="mt-6 text-3xl font-semibold tracking-tight">{copy.title}</h1><p className="mt-3 leading-7 text-[#64736d]">{copy.body}</p><button type="button" onClick={reset} className="mt-7 inline-flex min-h-11 items-center gap-2 bg-[#14261f] px-5 font-semibold text-white hover:bg-[#29483b]"><RotateCcw aria-hidden="true" size={17} />{copy.retry}</button></main>;
}