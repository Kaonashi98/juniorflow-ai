import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SeniorReviewCard } from "@/components/senior-review-card";
import { canRequestReview, createReviewRequest, EditSubmissionDialog, SolutionWorkspace } from "@/components/solution-workspace";
import { applyReviewEditDecision } from "@/components/session-view";
import { createHistoryEntry } from "@/lib/history-store";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";
import type { TicketSubmission } from "@/types";

const sessionId = "00000000-0000-4000-8000-000000000030";
const submission: TicketSubmission = {
  submissionType: "Pseudocode / technical plan",
  approach: "A detailed technical approach covering the requested behavior.",
  code: "Check loading, error, empty, and populated states in order.",
  difficulties: "",
  seniorQuestion: "",
};

function reviewedWorkspaceMarkup() {
  return renderToStaticMarkup(<SolutionWorkspace sessionId={sessionId} submissionRevision={0} ticket={DEMO_TICKET} initialSubmission={submission} initialReview={DEMO_REVIEW} />);
}

describe("senior review experience", () => {
  it("creates one language-independent review request with a bilingual ticket", () => {
    const request = createReviewRequest(DEMO_TICKET, submission, sessionId, 3);
    expect(request.submissionRevision).toBe(3);
    expect(request).not.toHaveProperty("language");
    expect(request.ticket.content.en.title).toBeTruthy();
    expect(request.ticket.content.it.title).toBeTruthy();
    expect(request).not.toHaveProperty("ticket.createdAt");
  });

  it("locks a reviewed submission and prevents a duplicate request", () => {
    const html = reviewedWorkspaceMarkup();
    expect(html.match(/readOnly=""/g)).toHaveLength(4);
    expect(html).toContain('<fieldset disabled="">');
    expect(html).toContain("Review completed");
    expect(html).toContain("Edit submission");
    expect(canRequestReview({ hasReview: true, isReviewing: false, isSubmissionValid: true, hasSubmissionChanged: true })).toBe(false);
  });

  it("renders an accessible confirmation dialog before editing", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const html = renderToStaticMarkup(<EditSubmissionDialog open onCancel={onCancel} onConfirm={onConfirm} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("Editing will remove the current senior review.");
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("preserves the session when edit is cancelled and removes only the review when confirmed", () => {
    const entry = {
      ...createHistoryEntry({
        role: "Front-End" as const,
        experience: "6–12 months" as const,
        technologies: ["React", "TypeScript"],
        availableTime: "2 hours" as const,
        projectDescription: "A project-management dashboard for distributed product teams.",
      }, DEMO_TICKET, sessionId),
      submission,
      review: DEMO_REVIEW,
      status: "reviewed" as const,
    };
    expect(applyReviewEditDecision(entry, false)).toBe(entry);
    const edited = applyReviewEditDecision(entry, true, "2026-07-15T12:00:00.000Z");
    expect(edited.review).toBeUndefined();
    expect(edited.submission).toEqual(submission);
    expect(edited.ticket).toEqual(entry.ticket);
    expect(edited.submissionRevision).toBe(1);
  });

  it("renders all review content without truncation", () => {
    const longExplanation = "Detailed learning guidance. ".repeat(60);
    const review = {
      ...DEMO_REVIEW,
      content: {
        en: { ...DEMO_REVIEW.content.en, educationalExplanation: longExplanation },
        it: { ...DEMO_REVIEW.content.it, educationalExplanation: "Guida dettagliata. ".repeat(60) },
      },
    };
    const html = renderToStaticMarkup(<SeniorReviewCard review={review} submissionType="Working code" />);
    for (const heading of ["Review summary", "Top strengths", "Problems", "Security", "Acceptance criteria", "Educational explanation", "Skills to study next"]) {
      expect(html).toContain(heading);
    }
    expect(html).toContain(longExplanation);
    expect(html).not.toContain("line-clamp");
  });

  it("renders five accessible keyboard tabs", () => {
    const html = renderToStaticMarkup(<SeniorReviewCard review={DEMO_REVIEW} />);
    expect(html.match(/role="tab"/g)).toHaveLength(5);
    expect(html.match(/role="tabpanel"/g)).toHaveLength(5);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html.match(/ hidden=""/g)).toHaveLength(4);
  });

  it("renders safe empty states for empty localized arrays", () => {
    const review = {
      ...DEMO_REVIEW,
      content: {
        en: { ...DEMO_REVIEW.content.en, strengths: [], problems: [], possibleBugs: [], securityConcerns: [], acceptanceCriteriaAssessment: [], improvements: [], skillsToStudy: [] },
        it: { ...DEMO_REVIEW.content.it, strengths: [], problems: [], possibleBugs: [], securityConcerns: [], acceptanceCriteriaAssessment: [], improvements: [], skillsToStudy: [] },
      },
    };
    const html = renderToStaticMarkup(<SeniorReviewCard review={review} />);
    expect(html).toContain("No specific strengths were identified.");
    expect(html).toContain("No material problems identified.");
    expect(html).toContain("No study topics were suggested.");
  });
});