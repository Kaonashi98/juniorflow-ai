"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, LoaderCircle, MessageCircleQuestion } from "lucide-react";
import { DEMO_REVIEWS_BY_LOCALE } from "@/data/demo-review";
import { DEMO_SOLUTIONS_BY_LOCALE } from "@/data/demo-solution";
import { SeniorReviewCard } from "@/components/senior-review-card";
import { useLanguage } from "@/components/app-providers";
import { UI_COPY } from "@/lib/ui-copy";

export function DemoWorkspace() {
  const { locale } = useLanguage();
  const copy = UI_COPY[locale].demo;
  const solutionCopy = UI_COPY[locale].solution;
  const solution = DEMO_SOLUTIONS_BY_LOCALE[locale];
  const [isReviewing, setIsReviewing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isReviewing) return;
    setIsReviewing(true);
    window.setTimeout(() => {
      setIsReviewing(false);
      setShowReview(true);
      window.setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }, 800);
  }

  const inputClass = "mt-2 w-full border border-[#cbd4cc] bg-white px-3.5 py-3 leading-6 placeholder:text-[#6a766f] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40";

  return (
    <div className="min-w-0 space-y-6">
      <form key={locale} onSubmit={submit} className="border border-[#d5ddd6] bg-white">
        <header className="border-b border-[#e1e6e1] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5e7a17]">{copy.solution}</p>
          <h2 className="mt-2 text-2xl font-semibold">{copy.title}</h2>
          <p className="mt-2 leading-6 text-[#64736d]">{copy.static}</p>
        </header>
        <div className="space-y-6 p-6">
          <label className="block text-sm font-semibold">{solutionCopy.approach}
            <textarea required maxLength={2000} rows={5} className={inputClass} defaultValue={solution.approach} />
          </label>
          <label className="block text-sm font-semibold">{solutionCopy.code}
            <textarea required maxLength={8000} rows={10} spellCheck={false} className={`${inputClass} font-mono text-[13px]`} defaultValue={solution.code} />
          </label>
          <label className="block text-sm font-semibold">{solutionCopy.difficult}
            <textarea maxLength={1200} rows={3} className={inputClass} placeholder={solutionCopy.difficultPlaceholder} defaultValue={solution.difficulties} />
          </label>
          <label className="block text-sm font-semibold"><span className="flex items-center gap-2"><MessageCircleQuestion aria-hidden="true" size={17} className="text-[#5e7a17]" />{solutionCopy.question}</span>
            <textarea maxLength={1200} rows={3} className={inputClass} defaultValue={solution.seniorQuestion} />
          </label>
          <button type="submit" disabled={isReviewing} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#14261f] px-5 font-semibold text-white transition-colors hover:bg-[#29483b] disabled:opacity-60">
            {isReviewing ? <><LoaderCircle aria-hidden="true" size={18} className="animate-spin" />{copy.loading}</> : <>{copy.show} <ArrowRight aria-hidden="true" size={18} /></>}
          </button>
          <p className="text-center text-xs text-[#66736d]">{copy.privacy}</p>
        </div>
      </form>
      {showReview && <div ref={reviewRef} className="scroll-mt-24"><SeniorReviewCard review={DEMO_REVIEWS_BY_LOCALE[locale]} demo /></div>}
    </div>
  );
}
