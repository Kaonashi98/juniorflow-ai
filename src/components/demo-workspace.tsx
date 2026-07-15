"use client";

import { FormEvent, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bug,
  CheckCircle2,
  LoaderCircle,
  MessageCircleQuestion,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { DEMO_REVIEW } from "@/data/demo-review";

export function DemoWorkspace() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsReviewing(true);
    window.setTimeout(() => {
      setIsReviewing(false);
      setShowReview(true);
      window.setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }, 1000);
  }

  const inputClass = "mt-2 w-full border border-[#cbd4cc] bg-white px-3.5 py-3 leading-6 placeholder:text-[#97a29c] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40";

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="border border-[#d5ddd6] bg-white">
        <header className="border-b border-[#e1e6e1] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#678616]">Your solution</p>
          <h2 className="mt-2 text-2xl font-semibold">Walk your senior through it.</h2>
          <p className="mt-2 leading-6 text-[#64736d]">The reasoning matters as much as the final code.</p>
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
            {isReviewing ? <><LoaderCircle aria-hidden="true" size={18} className="animate-spin" />Your senior is reviewing…</> : <>Request demo review <ArrowRight aria-hidden="true" size={18} /></>}
          </button>
          <p className="text-center text-xs text-[#7c8983]">Demo interaction — no data is sent to OpenAI yet.</p>
        </div>
      </form>

      {showReview && (
        <div ref={reviewRef} className="scroll-mt-24 border border-[#14261f] bg-white shadow-[6px_6px_0_#c8f169]" aria-live="polite">
          <header className="flex items-center justify-between gap-5 border-b border-[#dfe5df] p-6">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#678616]">Senior review · Demo</p><h2 className="mt-2 text-2xl font-semibold">Strong foundation, one state bug.</h2></div>
            <div className="flex size-20 shrink-0 flex-col items-center justify-center bg-[#14261f] text-white"><span className="text-2xl font-bold">{DEMO_REVIEW.score}</span><span className="text-[10px] uppercase tracking-wide">/ 100</span></div>
          </header>
          <div className="space-y-7 p-6">
            <ReviewList icon={CheckCircle2} title="What you did well" items={DEMO_REVIEW.doneWell} tone="good" />
            <ReviewList icon={Bug} title="Problems & possible bugs" items={[...DEMO_REVIEW.problems, ...DEMO_REVIEW.possibleBugs]} tone="warn" />
            <ReviewList icon={ShieldCheck} title="Security" items={DEMO_REVIEW.securityIssues} tone="neutral" />
            <ReviewList icon={TrendingUp} title="How to improve" items={DEMO_REVIEW.improvements} tone="neutral" />
            <section className="border-l-4 border-[#c8f169] bg-[#f5f8ef] p-5"><h3 className="flex items-center gap-2 font-semibold"><BookOpen aria-hidden="true" size={18} />Senior explanation</h3><p className="mt-3 leading-7 text-[#52615b]">{DEMO_REVIEW.educationalExplanation}</p></section>
            <section><h3 className="font-semibold">Ideal solution, in short</h3><p className="mt-2 leading-7 text-[#64736d]">{DEMO_REVIEW.idealSolution}</p></section>
            <section><h3 className="font-semibold">Skills to study next</h3><div className="mt-3 flex flex-wrap gap-2">{DEMO_REVIEW.skillsToStudy.map((skill) => <span key={skill} className="bg-[#eef1e9] px-3 py-1.5 text-sm font-medium">{skill}</span>)}</div></section>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewList({ icon: Icon, title, items, tone }: { icon: typeof BadgeCheck; title: string; items: string[]; tone: "good" | "warn" | "neutral" }) {
  const color = tone === "good" ? "text-[#678616]" : tone === "warn" ? "text-[#b45f3e]" : "text-[#52615b]";
  return <section><h3 className={`flex items-center gap-2 font-semibold ${color}`}><Icon aria-hidden="true" size={18} />{title}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#5d6c66]">{items.map((item) => <li key={item} className="flex gap-2"><span>—</span><span>{item}</span></li>)}</ul></section>;
}
