import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SeniorReviewCard } from "@/components/senior-review-card";
import { createReviewRequest } from "@/components/solution-workspace";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";

describe("senior review experience", () => {
  it("includes pseudocode mode in the review request without calling OpenAI", () => {
    const request = createReviewRequest(DEMO_TICKET, {
      submissionType: "Pseudocode / technical plan",
      approach: "A detailed technical approach covering the requested behavior.",
      code: "Check loading, error, empty, and populated states in order.",
      difficulties: "",
      seniorQuestion: "",
    });

    expect(request.submissionType).toBe("Pseudocode / technical plan");
    expect(request.ticket.ticketId).toBe(DEMO_TICKET.ticketId);
    expect(request).not.toHaveProperty("ticket.createdAt");
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
      "What you did well",
      "How to improve",
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

  it("renders accessible tabs with one selected panel by default", () => {
    const html = renderToStaticMarkup(
      <SeniorReviewCard review={DEMO_REVIEW} />,
    );

    expect(html.match(/role="tab"/g)).toHaveLength(4);
    expect(html.match(/role="tabpanel"/g)).toHaveLength(4);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html.match(/aria-selected="false"/g)).toHaveLength(3);
    expect(html).toContain('aria-controls=');
    expect(html).toContain('aria-labelledby=');
    expect(html.match(/ hidden=""/g)).toHaveLength(3);
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
    expect(html).toContain("No material problems identified.");
    expect(html).toContain("No acceptance-criteria assessment is available.");
    expect(html).toContain("No study topics were suggested.");
  });

  it("limits persistent header highlights to three items", () => {
    const html = renderToStaticMarkup(
      <SeniorReviewCard
        review={{
          ...DEMO_REVIEW,
          strengths: ["First", "Second", "Third", "Fourth"],
          improvements: ["One", "Two", "Three", "Four"],
        }}
      />,
    );

    expect(html.match(/Fourth/g)).toHaveLength(1);
    expect(html.match(/>First</g)).toHaveLength(2);
  });
});
