import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SeniorReviewCard } from "@/components/senior-review-card";
import {
  canRequestReview,
  createReviewRequest,
  EditSubmissionDialog,
  SolutionWorkspace,
} from "@/components/solution-workspace";
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
  return renderToStaticMarkup(
    <SolutionWorkspace
      sessionId={sessionId}
      submissionRevision={0}
      ticket={DEMO_TICKET}
      initialSubmission={submission}
      initialReview={DEMO_REVIEW}
    />,
  );
}

function panelMarkup(html: string, id: string, nextId: string) {
  const start = html.indexOf("-review-panel-" + id + '" role="tabpanel"');
  const end = html.indexOf("-review-panel-" + nextId + '" role="tabpanel"');
  return html.slice(start, end);
}

describe("senior review experience", () => {
  it("includes the session revision and pseudocode mode in the review request", () => {
    const request = createReviewRequest(
      DEMO_TICKET,
      submission,
      sessionId,
      3,
      "Italian",
    );

    expect(request.sessionId).toBe(sessionId);
    expect(request.submissionRevision).toBe(3);
    expect(request.language).toBe("Italian");
    expect(request.submissionType).toBe("Pseudocode / technical plan");
    expect(request.ticket.ticketId).toBe(DEMO_TICKET.ticketId);
    expect(request).not.toHaveProperty("ticket.createdAt");
  });

  it("locks a saved reviewed submission and replaces the request action", () => {
    const html = reviewedWorkspaceMarkup();

    expect(html.match(/readOnly=""/g)).toHaveLength(4);
    expect(html).toContain('<fieldset disabled="">');
    expect(html).toContain("Review completed");
    expect(html).toContain("Edit submission");
    expect(html).not.toContain("Request senior review");
  });

  it("prevents another request while a review exists", () => {
    expect(
      canRequestReview({
        hasReview: true,
        isReviewing: false,
        isSubmissionValid: true,
        hasSubmissionChanged: true,
      }),
    ).toBe(false);
    expect(
      canRequestReview({
        hasReview: false,
        isReviewing: false,
        isSubmissionValid: true,
        hasSubmissionChanged: true,
      }),
    ).toBe(true);
  });

  it("renders an explicit confirmation dialog before editing", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const html = renderToStaticMarkup(
      <EditSubmissionDialog
        open
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("Editing will remove the current senior review.");
    expect(html).toContain("Cancel");
    expect(html).toContain("Remove review and edit");
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("keeps the session unchanged when edit confirmation is cancelled", () => {
    const entry = {
      ...createHistoryEntry(
        {
          role: "Front-End" as const,
          experience: "6–12 months" as const,
          technologies: ["React", "TypeScript"],
          availableTime: "2 hours" as const,
          language: "English" as const,
          projectDescription: "A project-management dashboard for distributed product teams.",
        },
        DEMO_TICKET,
        sessionId,
      ),
      submission,
      review: DEMO_REVIEW,
      status: "reviewed" as const,
    };

    expect(applyReviewEditDecision(entry, false)).toBe(entry);
  });

  it("removes only the review and increments revision after confirmation", () => {
    const entry = {
      ...createHistoryEntry(
        {
          role: "Front-End" as const,
          experience: "6–12 months" as const,
          technologies: ["React", "TypeScript"],
          availableTime: "2 hours" as const,
          language: "English" as const,
          projectDescription: "A project-management dashboard for distributed product teams.",
        },
        DEMO_TICKET,
        sessionId,
      ),
      submission,
      review: DEMO_REVIEW,
      status: "reviewed" as const,
    };
    const edited = applyReviewEditDecision(
      entry,
      true,
      "2026-07-15T12:00:00.000Z",
    );

    expect(edited.review).toBeUndefined();
    expect(edited.submission).toEqual(submission);
    expect(edited.ticket).toEqual(entry.ticket);
    expect(edited.profile).toEqual(entry.profile);
    expect(edited.status).toBe("solution-draft");
    expect(edited.submissionRevision).toBe(1);
  });

  it("renders every review section and does not truncate long content", () => {
    const longExplanation = "Detailed learning guidance. ".repeat(60);
    const html = renderToStaticMarkup(
      <SeniorReviewCard
        review={{
          ...DEMO_REVIEW,
          educationalExplanation: longExplanation,
        }}
        submissionType="Working code"
      />,
    );

    for (const heading of [
      "Review summary",
      "Top strengths",
      "Improvement priorities",
      "Problems",
      "Possible bugs",
      "Security",
      "Readability assessment",
      "Acceptance criteria",
      "Educational explanation",
      "Ideal solution, in short",
      "Recommended next ticket",
      "Skills to study next",
    ]) {
      expect(html).toContain(heading);
    }
    expect(html).toContain(longExplanation);
    expect(html).not.toContain("line-clamp");
    expect(html).toContain("Working code");
  });

  it("renders five accessible tabs with Overview selected by default", () => {
    const html = renderToStaticMarkup(
      <SeniorReviewCard review={DEMO_REVIEW} />,
    );

    expect(html.match(/role="tab"/g)).toHaveLength(5);
    expect(html.match(/role="tabpanel"/g)).toHaveLength(5);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html.match(/aria-selected="false"/g)).toHaveLength(4);
    expect(html).toContain("Strengths &amp; priorities");
    expect(html).toContain('aria-controls=');
    expect(html).toContain('aria-labelledby=');
    expect(html.match(/ hidden=""/g)).toHaveLength(4);
  });

  it("keeps strengths and priorities out of Overview", () => {
    const html = renderToStaticMarkup(
      <SeniorReviewCard review={DEMO_REVIEW} />,
    );
    const overview = panelMarkup(html, "overview", "strengths");
    const strengths = panelMarkup(html, "strengths", "technical");

    expect(overview).toContain("Review summary");
    expect(overview).not.toContain("Top strengths");
    expect(overview).not.toContain("Improvement priorities");
    expect(strengths).toContain("Top strengths");
    expect(strengths).toContain("Improvement priorities");
    expect(strengths).toContain(DEMO_REVIEW.strengths[0]);
    expect(strengths).toContain(DEMO_REVIEW.improvements[0]);
  });

  it("renders safe empty states for empty review arrays", () => {
    const html = renderToStaticMarkup(
      <SeniorReviewCard
        review={{
          ...DEMO_REVIEW,
          strengths: [],
          problems: [],
          possibleBugs: [],
          securityConcerns: [],
          acceptanceCriteriaAssessment: [],
          improvements: [],
          skillsToStudy: [],
        }}
      />,
    );

    expect(html).toContain("No specific strengths were identified.");
    expect(html).toContain("No immediate improvements were identified.");
    expect(html).toContain("No material problems identified.");
    expect(html).toContain("No acceptance-criteria assessment is available.");
    expect(html).toContain("No study topics were suggested.");
  });
});
