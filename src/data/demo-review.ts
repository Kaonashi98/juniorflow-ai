import type { SeniorReview } from "@/types";

export const DEMO_REVIEW: SeniorReview = {
  score: 84,
  doneWell: [
    "You separated the empty state into a focused component.",
    "The conditional rendering preserves the existing project grid.",
    "Your call to action uses a semantic link with a clear label.",
  ],
  problems: [
    "The empty state is also rendered before the projects request has completed.",
    "The illustration has empty alt text but is not marked as decorative.",
  ],
  possibleBugs: [
    "A failed request with no cached projects may be mistaken for a valid empty result.",
  ],
  securityIssues: [
    "No direct security issue found. Keep authorization checks on the server when creating a project.",
  ],
  criteriaAssessment: [
    "Empty array: met",
    "Existing grid preserved: met",
    "Navigation to /projects/new: met",
    "Loading-state separation: needs improvement",
  ],
  improvements: [
    "Branch on loading and error states before checking projects.length.",
    "Add tests for loading, failure, empty, and populated responses.",
  ],
  educationalExplanation:
    "An empty state is a successful data state, not the absence of data while it loads. Model each request state explicitly so users never receive a misleading message.",
  idealSolution:
    "Handle loading and error first, then render EmptyProjects when projects.length === 0; otherwise render ProjectGrid. Cover each branch with a focused component test.",
  skillsToStudy: ["Async UI states", "React Testing Library", "Accessible empty states"],
};
