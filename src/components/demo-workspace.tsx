"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, LoaderCircle, MessageCircleQuestion } from "lucide-react";
import { DEMO_REVIEW } from "@/data/demo-review";
import { SeniorReviewCard } from "@/components/senior-review-card";

export function DemoWorkspace() {
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

  const inputClass = "mt-2 w-full border border-[#cbd4cc] bg-white px-3.5 py-3 leading-6 placeholder:text-[#97a29c] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40";

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="border border-[#d5ddd6] bg-white">
        <header className="border-b border-[#e1e6e1] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#678616]">Sample solution · Demo mode</p>
          <h2 className="mt-2 text-2xl font-semibold">Walk your senior through it.</h2>
          <p className="mt-2 leading-6 text-[#64736d]">This form returns a static sample review and never calls the API.</p>
        </header>
        <div className="space-y-6 p-6">
          <label className="block text-sm font-semibold">Your approach
            <textarea required maxLength={2000} rows={5} className={inputClass} defaultValue="I would first identify the component that owns the query states. Then I would add a focused EmptyProjects component and render it only after a successful request returns zero projects." />
          </label>
          <label className="block text-sm font-semibold">Code or pseudocode
            <textarea required maxLength={8000} rows={10} spellCheck={false} className={`${inputClass} font-mono text-[13px]`} defaultValue={`if (isLoading) return <DashboardSkeleton />;\nif (error) return <ProjectsError />;\nif (projects.length === 0) return <EmptyProjects />;\n\nreturn <ProjectGrid projects={projects} />;`} />
          </label>
          <label className="block text-sm font-semibold">What was difficult?
            <textarea maxLength={1200} rows={3} className={inputClass} placeholder="Tell your senior where you felt unsure…" />
          </label>
          <label className="block text-sm font-semibold"><span className="flex items-center gap-2"><MessageCircleQuestion aria-hidden="true" size={17} className="text-[#678616]" />Question for your senior</span>
            <textarea maxLength={1200} rows={3} className={inputClass} defaultValue="Would you test this inside the dashboard component or test EmptyProjects separately?" />
          </label>
          <button type="submit" disabled={isReviewing} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#14261f] px-5 font-semibold text-white transition-colors hover:bg-[#29483b] disabled:opacity-60">
            {isReviewing ? <><LoaderCircle aria-hidden="true" size={18} className="animate-spin" />Loading sample review…</> : <>Show sample review <ArrowRight aria-hidden="true" size={18} /></>}
          </button>
          <p className="text-center text-xs text-[#7c8983]">Sample ticket / Demo mode — no data is sent to OpenAI.</p>
        </div>
      </form>
      {showReview && <div ref={reviewRef} className="scroll-mt-24"><SeniorReviewCard review={DEMO_REVIEW} demo /></div>}
    </div>
  );
}
