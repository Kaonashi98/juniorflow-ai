"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, LoaderCircle, MessageCircleQuestion } from "lucide-react";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_SOLUTIONS_BY_LOCALE } from "@/data/demo-solution";
import { SeniorReviewCard } from "@/components/senior-review-card";
import { useLanguage } from "@/components/app-providers";

type DemoField = "approach" | "code" | "difficulties" | "seniorQuestion";

export function DemoWorkspace() {
  const { locale, copy: appCopy } = useLanguage();
  const copy = appCopy.demo;
  const solutionCopy = appCopy.solution;
  const localizedSolution = DEMO_SOLUTIONS_BY_LOCALE[locale];
  const [values, setValues] = useState(localizedSolution);
  const dirtyFields = useRef<Set<DemoField>>(new Set());
  const [isReviewing, setIsReviewing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValues((current) => ({
      approach: dirtyFields.current.has("approach") ? current.approach : localizedSolution.approach,
      code: dirtyFields.current.has("code") ? current.code : localizedSolution.code,
      difficulties: dirtyFields.current.has("difficulties") ? current.difficulties : localizedSolution.difficulties,
      seniorQuestion: dirtyFields.current.has("seniorQuestion") ? current.seniorQuestion : localizedSolution.seniorQuestion,
    }));
  }, [localizedSolution]);

  function updateField(field: DemoField, value: string) {
    dirtyFields.current.add(field);
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isReviewing) return;
    setIsReviewing(true);
    window.setTimeout(() => {
      setIsReviewing(false);
      setShowReview(true);
      window.setTimeout(
        () => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    }, 800);
  }

  const inputClass = "mt-2 w-full border border-[#cbd4cc] bg-white px-3.5 py-3 leading-6 placeholder:text-[#6a766f] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40";

  return (
    <div className="min-w-0 space-y-6">
      <form onSubmit={submit} className="border border-[#d5ddd6] bg-white">
        <header className="border-b border-[#e1e6e1] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5e7a17]">{copy.solution}</p>
          <h2 className="mt-2 text-2xl font-semibold">{copy.title}</h2>
          <p className="mt-2 leading-6 text-[#64736d]">{copy.static}</p>
        </header>
        <div className="space-y-6 p-6">
          <label className="block text-sm font-semibold">
            {solutionCopy.approach}
            <textarea required maxLength={2000} rows={5} className={inputClass} value={values.approach} onChange={(event) => updateField("approach", event.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            {solutionCopy.code}
            <textarea required maxLength={8000} rows={10} spellCheck={false} className={`${inputClass} font-mono text-[13px]`} value={values.code} onChange={(event) => updateField("code", event.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            {solutionCopy.difficult}
            <textarea maxLength={1200} rows={3} className={inputClass} placeholder={solutionCopy.difficultPlaceholder} value={values.difficulties} onChange={(event) => updateField("difficulties", event.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            <span className="flex items-center gap-2"><MessageCircleQuestion aria-hidden="true" size={17} className="text-[#5e7a17]" />{solutionCopy.question}</span>
            <textarea maxLength={1200} rows={3} className={inputClass} value={values.seniorQuestion} onChange={(event) => updateField("seniorQuestion", event.target.value)} />
          </label>
          <button type="submit" disabled={isReviewing} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#14261f] px-5 font-semibold text-white transition-colors hover:bg-[#29483b] disabled:opacity-60">
            {isReviewing ? <><LoaderCircle aria-hidden="true" size={18} className="animate-spin" />{copy.loading}</> : <>{copy.show} <ArrowRight aria-hidden="true" size={18} /></>}
          </button>
          <p className="text-center text-xs text-[#66736d]">{copy.privacy}</p>
        </div>
      </form>
      {showReview && <div ref={reviewRef} className="scroll-mt-24"><SeniorReviewCard review={DEMO_REVIEW} demo /></div>}
    </div>
  );
}
