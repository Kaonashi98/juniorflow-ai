"use client";

import {
  type KeyboardEvent,
  useId,
  useRef,
  useState,
} from "react";
import {
  BookOpen,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Lightbulb,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { SeniorReview, TicketSubmission } from "@/types";

const REVIEW_TABS = [
  { id: "overview", label: "Overview" },
  { id: "strengths", label: "Strengths & priorities" },
  { id: "technical", label: "Technical review" },
  { id: "acceptance", label: "Acceptance criteria" },
  { id: "learning", label: "Learning plan" },
] as const;

type ReviewTabId = (typeof REVIEW_TABS)[number]["id"];

export function SeniorReviewCard({
  review,
  submissionType = "Pseudocode / technical plan",
  demo = false,
}: {
  review: SeniorReview;
  submissionType?: TicketSubmission["submissionType"];
  demo?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<ReviewTabId>("overview");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const instanceId = useId();

  function selectTab(index: number) {
    const tab = REVIEW_TABS[index];
    if (!tab) return;
    setActiveTab(tab.id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % REVIEW_TABS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + REVIEW_TABS.length) % REVIEW_TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = REVIEW_TABS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      selectTab(nextIndex);
    }
  }

  return (
    <article className="border border-[#14261f] bg-white shadow-[6px_6px_0_#c8f169]">
      <header className="flex items-start justify-between gap-4 border-b border-[#dfe5df] p-5 sm:gap-6 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5e7a17]">
            Senior review{demo ? " · Sample / Demo mode" : " · GPT-5.6"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Your review is ready.</h2>
        </div>
        <div className="flex size-20 shrink-0 flex-col items-center justify-center bg-[#14261f] text-white">
          <span className="text-2xl font-bold">{review.overallScore}</span>
          <span className="text-[10px] uppercase tracking-wide">/ 100</span>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Senior review sections"
        className="flex overflow-x-auto border-b border-[#dfe5df] bg-[#f7f9f4] px-1 sm:grid sm:grid-cols-5 sm:overflow-x-visible sm:px-2"
      >
        {REVIEW_TABS.map((tab, index) => {
          const selected = activeTab === tab.id;
          const tabId = instanceId + "-review-tab-" + tab.id;
          const panelId = instanceId + "-review-panel-" + tab.id;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={
                "min-h-12 shrink-0 border-b-2 px-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#678616] focus-visible:ring-inset sm:min-w-0 sm:px-1 " +
                (selected
                  ? "border-[#678616] text-[#14261f]"
                  : "border-transparent text-[#64736d] hover:text-[#14261f]")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <ReviewPanel instanceId={instanceId} id="overview" activeTab={activeTab}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#eef1e9] px-2.5 py-1 text-xs font-semibold text-[#52615b]">
              {submissionType}
            </span>
            <span className="text-sm font-semibold text-[#52615b]">
              Overall score: {review.overallScore}/100
            </span>
          </div>
          <section>
            <h3 className="font-semibold text-[#52615b]">Review summary</h3>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-[#52615b]">
              {review.approachAssessment}
            </p>
          </section>
        </div>
      </ReviewPanel>

      <ReviewPanel instanceId={instanceId} id="strengths" activeTab={activeTab}>
        <div className="grid gap-4 md:grid-cols-2">
          <HighlightList
            title="Top strengths"
            items={review.strengths}
            empty="No specific strengths were identified."
            tone="good"
          />
          <HighlightList
            title="Improvement priorities"
            items={review.improvements}
            empty="No immediate improvements were identified."
            tone="warn"
          />
        </div>
      </ReviewPanel>

      <ReviewPanel instanceId={instanceId} id="technical" activeTab={activeTab}>
        <div className="grid gap-7 md:grid-cols-2">
          <ReviewList icon={Bug} title="Problems" items={review.problems} tone="warn" empty="No material problems identified." />
          <ReviewList icon={Target} title="Possible bugs" items={review.possibleBugs} tone="warn" empty="No likely bugs identified." />
          <ReviewList icon={ShieldCheck} title="Security" items={review.securityConcerns} tone="neutral" empty="No specific security concerns identified." />
          <TextSection icon={Code2} title="Readability assessment" text={review.readabilityAssessment} />
        </div>
      </ReviewPanel>

      <ReviewPanel instanceId={instanceId} id="acceptance" activeTab={activeTab}>
        <ReviewList
          icon={ClipboardCheck}
          title="Acceptance criteria"
          items={review.acceptanceCriteriaAssessment}
          tone="neutral"
          empty="No acceptance-criteria assessment is available."
        />
      </ReviewPanel>

      <ReviewPanel instanceId={instanceId} id="learning" activeTab={activeTab}>
        <div className="space-y-7">
          <section className="border-l-4 border-[#c8f169] bg-[#f5f8ef] p-5">
            <h3 className="flex items-center gap-2 font-semibold"><BookOpen aria-hidden="true" size={18} />Educational explanation</h3>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-[#52615b]">{review.educationalExplanation}</p>
          </section>
          <TextSection icon={Lightbulb} title="Ideal solution, in short" text={review.conciseIdealSolution} />
          <TextSection icon={Target} title="Recommended next ticket" text={review.recommendedNextTicket} />
          <section>
            <h3 className="font-semibold">Skills to study next</h3>
            {review.skillsToStudy.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.skillsToStudy.map((skill, index) => (
                  <span key={skill + index} className="bg-[#eef1e9] px-3 py-1.5 text-sm font-medium">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[#64736d]">No study topics were suggested.</p>
            )}
          </section>
        </div>
      </ReviewPanel>
    </article>
  );
}

function ReviewPanel({
  instanceId,
  id,
  activeTab,
  children,
}: {
  instanceId: string;
  id: ReviewTabId;
  activeTab: ReviewTabId;
  children: React.ReactNode;
}) {
  const selected = activeTab === id;
  return (
    <div
      id={instanceId + "-review-panel-" + id}
      role="tabpanel"
      aria-labelledby={instanceId + "-review-tab-" + id}
      tabIndex={0}
      hidden={!selected}
      className="p-5 outline-none focus-visible:ring-2 focus-visible:ring-[#678616] focus-visible:ring-inset sm:p-6"
    >
      {children}
    </div>
  );
}

function HighlightList({
  title,
  items,
  empty,
  tone,
}: {
  title: string;
  items: string[];
  empty: string;
  tone: "good" | "warn";
}) {
  const visibleItems = items.length ? items : [empty];
  return (
    <section className="border border-[#dfe5df] bg-[#fafbf8] p-4">
      <h3 className={tone === "good" ? "font-semibold text-[#5e7a17]" : "font-semibold text-[#9a5137]"}>{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#5d6c66]">
        {visibleItems.map((item, index) => <li key={item + index} className="flex gap-2"><span>—</span><span>{item}</span></li>)}
      </ul>
    </section>
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
  empty: string;
}) {
  const color = tone === "good" ? "text-[#5e7a17]" : tone === "warn" ? "text-[#b45f3e]" : "text-[#52615b]";
  const visibleItems = items.length ? items : [empty];
  return (
    <section>
      <h3 className={"flex items-center gap-2 font-semibold " + color}><Icon aria-hidden="true" size={18} />{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5d6c66]">
        {visibleItems.map((item, index) => <li key={item + index} className="flex gap-2"><span>—</span><span>{item}</span></li>)}
      </ul>
    </section>
  );
}

function TextSection({ icon: Icon, title, text }: { icon: typeof Code2; title: string; text: string }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 font-semibold text-[#52615b]"><Icon aria-hidden="true" size={18} />{title}</h3>
      <p className="mt-3 whitespace-pre-wrap leading-7 text-[#64736d]">{text}</p>
    </section>
  );
}
