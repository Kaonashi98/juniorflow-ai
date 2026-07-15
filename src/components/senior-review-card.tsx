import {
  BookOpen,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import type { SeniorReview } from "@/types";

export function SeniorReviewCard({
  review,
  demo = false,
}: {
  review: SeniorReview;
  demo?: boolean;
}) {
  return (
    <article className="border border-[#14261f] bg-white shadow-[6px_6px_0_#c8f169]">
      <header className="flex items-center justify-between gap-5 border-b border-[#dfe5df] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#678616]">
            Senior review{demo ? " · Sample / Demo mode" : " · GPT-5.6"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Your review is ready.</h2>
          <p className="mt-2 leading-6 text-[#64736d]">{review.approachAssessment}</p>
        </div>
        <div className="flex size-20 shrink-0 flex-col items-center justify-center bg-[#14261f] text-white">
          <span className="text-2xl font-bold">{review.overallScore}</span>
          <span className="text-[10px] uppercase tracking-wide">/ 100</span>
        </div>
      </header>
      <div className="space-y-7 p-6">
        <ReviewList icon={CheckCircle2} title="What you did well" items={review.strengths} tone="good" />
        <ReviewList icon={Bug} title="Problems" items={review.problems} tone="warn" empty="No material problems identified." />
        <ReviewList icon={Target} title="Possible bugs" items={review.possibleBugs} tone="warn" empty="No likely bugs identified." />
        <ReviewList icon={ShieldCheck} title="Security" items={review.securityConcerns} tone="neutral" empty="No specific security concerns identified." />
        <TextSection icon={Code2} title="Readability assessment" text={review.readabilityAssessment} />
        <ReviewList icon={ClipboardCheck} title="Acceptance criteria" items={review.acceptanceCriteriaAssessment} tone="neutral" />
        <ReviewList icon={TrendingUp} title="How to improve" items={review.improvements} tone="neutral" />
        <section className="border-l-4 border-[#c8f169] bg-[#f5f8ef] p-5">
          <h3 className="flex items-center gap-2 font-semibold"><BookOpen aria-hidden="true" size={18} />Educational explanation</h3>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-[#52615b]">{review.educationalExplanation}</p>
        </section>
        <TextSection icon={Lightbulb} title="Ideal solution, in short" text={review.conciseIdealSolution} />
        <TextSection icon={Target} title="Recommended next ticket" text={review.recommendedNextTicket} />
        <section>
          <h3 className="font-semibold">Skills to study next</h3>
          <div className="mt-3 flex flex-wrap gap-2">{review.skillsToStudy.map((skill) => <span key={skill} className="bg-[#eef1e9] px-3 py-1.5 text-sm font-medium">{skill}</span>)}</div>
        </section>
      </div>
    </article>
  );
}

function ReviewList({
  icon: Icon,
  title,
  items,
  tone,
  empty,
}: {
  icon: typeof CheckCircle2;
  title: string;
  items: string[];
  tone: "good" | "warn" | "neutral";
  empty?: string;
}) {
  const color = tone === "good" ? "text-[#678616]" : tone === "warn" ? "text-[#b45f3e]" : "text-[#52615b]";
  const visibleItems = items.length ? items : empty ? [empty] : [];
  return <section><h3 className={`flex items-center gap-2 font-semibold ${color}`}><Icon aria-hidden="true" size={18} />{title}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#5d6c66]">{visibleItems.map((item) => <li key={item} className="flex gap-2"><span>—</span><span>{item}</span></li>)}</ul></section>;
}

function TextSection({ icon: Icon, title, text }: { icon: typeof Code2; title: string; text: string }) {
  return <section><h3 className="flex items-center gap-2 font-semibold text-[#52615b]"><Icon aria-hidden="true" size={18} />{title}</h3><p className="mt-3 whitespace-pre-wrap leading-7 text-[#64736d]">{text}</p></section>;
}
