import { describe, expect, it } from "vitest";
import {
  customTechnologiesSchema,
  generatedTicketSchema,
  getEffectiveCustomTechnologies,
  mergeTechnologies,
  normalizeCustomTechnologies,
  profileInputSchema,
  reviewInputSchema,
  seniorReviewSchema,
} from "@/schemas";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";

const validProfile = {
  role: "Front-End",
  experience: "6–12 months",
  technologies: ["React", "TypeScript"],
  availableTime: "2 hours",
  projectDescription: "A task management dashboard used by distributed product teams.",
} as const;

const { createdAt: _createdAt, isDemo: _isDemo, ...generatedTicket } = DEMO_TICKET;
void _createdAt;
void _isDemo;
const fivePredefined = ["TypeScript", "Java", "SQL", "Angular", "Spring Boot"];

function profileWithTechnologies(predefinedTechnologies: string[], customTechnologies: string) {
  return {
    ...validProfile,
    predefinedTechnologies,
    customTechnologies,
    technologies: mergeTechnologies(predefinedTechnologies, customTechnologies),
  };
}

describe("shared Zod schemas", () => {
  it("accepts a bounded profile without a separate language field", () => {
    expect(profileInputSchema.parse(validProfile)).toEqual(validProfile);
    expect(profileInputSchema.safeParse({ ...validProfile, language: "English" }).success).toBe(false);
  });

  it("rejects oversized and unknown profile fields", () => {
    expect(profileInputSchema.safeParse({ ...validProfile, projectDescription: "x".repeat(801) }).success).toBe(false);
    expect(profileInputSchema.safeParse({ ...validProfile, unexpected: true }).success).toBe(false);
  });

  it("accepts internship experience and normalizes custom technologies", () => {
    const result = profileInputSchema.parse({
      ...validProfile,
      experience: "Junior with internship experience",
      technologies: ["Angular", "Docker", "GraphQL"],
      customTechnologies: " Docker, , GraphQL ",
    });
    expect(result.customTechnologies).toBe("Docker, GraphQL");
  });

  it("merges technologies without case-insensitive duplicates or empty values", () => {
    expect(mergeTechnologies(["React", "Angular"], " Docker, react, GraphQL, docker ")).toEqual(["React", "Angular", "Docker", "GraphQL"]);
    expect(normalizeCustomTechnologies("Redis, , redis, RabbitMQ")).toEqual(["Redis", "RabbitMQ"]);
  });

  it("accepts at most five total technologies", () => {
    expect(profileInputSchema.parse(profileWithTechnologies(["TypeScript", "Angular", "Git / GitHub"], "REST APIs, MySQL")).technologies).toHaveLength(5);
  });

  it("rejects a sixth total technology with a specific message", () => {
    const result = profileInputSchema.safeParse(profileWithTechnologies(fivePredefined, "Docker"));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.message === "Choose no more than 5 total technologies.")).toBe(true);
  });

  it("rejects six predefined technologies with a specific message", () => {
    const result = profileInputSchema.safeParse(profileWithTechnologies([...fivePredefined, "React"], ""));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("Choose no more than five predefined technologies.");
  });

  it("rejects six custom technologies with a specific message", () => {
    const result = profileInputSchema.safeParse(profileWithTechnologies(fivePredefined, "REST APIs, MySQL, Docker, Redis, GraphQL, RabbitMQ"));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("Add no more than five custom technologies.");
  });

  it("rejects duplicate custom and predefined/custom values case-insensitively", () => {
    expect(profileInputSchema.safeParse(profileWithTechnologies(["TypeScript"], "Docker, docker")).success).toBe(false);
    expect(profileInputSchema.safeParse(profileWithTechnologies(["TypeScript"], "typescript, Docker")).success).toBe(false);
    expect(getEffectiveCustomTechnologies(["TypeScript"], "typescript, Docker")).toEqual(["Docker"]);
  });

  it("ignores empty comma-separated custom values", () => {
    const parsed = profileInputSchema.parse(profileWithTechnologies(["TypeScript"], " , Docker, , GraphQL, "));
    expect(parsed.technologies).toEqual(["TypeScript", "Docker", "GraphQL"]);
  });

  it("validates custom technology bounds", () => {
    expect(customTechnologiesSchema.safeParse("x".repeat(151)).success).toBe(false);
    expect(customTechnologiesSchema.safeParse("x".repeat(41)).success).toBe(false);
  });

  it("validates a bilingual ticket with shared technical metadata", () => {
    expect(generatedTicketSchema.safeParse(generatedTicket).success).toBe(true);
    expect(generatedTicket.content.en.title).not.toBe(generatedTicket.content.it.title);
    expect(generatedTicket.likelyFiles).toEqual(DEMO_TICKET.likelyFiles);
  });

  it("rejects a ticket missing either localized version", () => {
    const invalid = { ...generatedTicket, content: { en: generatedTicket.content.en } };
    expect(generatedTicketSchema.safeParse(invalid).success).toBe(false);
  });

  it("validates a bilingual review with one shared score", () => {
    expect(seniorReviewSchema.safeParse(DEMO_REVIEW).success).toBe(true);
    expect(DEMO_REVIEW.content.en.educationalExplanation).not.toBe(DEMO_REVIEW.content.it.educationalExplanation);
  });

  it("accepts both submission modes without a language field", () => {
    const base = {
      sessionId: "00000000-0000-4000-8000-000000000020",
      submissionRevision: 0,
      ticket: generatedTicket,
      approach: "A sufficiently detailed approach to solve this task.",
      code: "Check the request state, then render the matching UI branch.",
      difficulties: "",
      seniorQuestion: "",
    };
    expect(reviewInputSchema.safeParse({ ...base, submissionType: "Pseudocode / technical plan" }).success).toBe(true);
    expect(reviewInputSchema.safeParse({ ...base, submissionType: "Working code" }).success).toBe(true);
    expect(reviewInputSchema.safeParse({ ...base, submissionType: "Working code", language: "Italian" }).success).toBe(false);
  });

  it("accepts empty review lists in both languages", () => {
    const emptyLists = {
      ...DEMO_REVIEW,
      content: {
        en: { ...DEMO_REVIEW.content.en, strengths: [], problems: [], possibleBugs: [], securityConcerns: [], acceptanceCriteriaAssessment: [], improvements: [], skillsToStudy: [] },
        it: { ...DEMO_REVIEW.content.it, strengths: [], problems: [], possibleBugs: [], securityConcerns: [], acceptanceCriteriaAssessment: [], improvements: [], skillsToStudy: [] },
      },
    };
    expect(seniorReviewSchema.safeParse(emptyLists).success).toBe(true);
  });

  it("rejects excessive submitted code", () => {
    expect(reviewInputSchema.safeParse({
      sessionId: "00000000-0000-4000-8000-000000000020",
      submissionRevision: 0,
      ticket: generatedTicket,
      submissionType: "Working code",
      approach: "A sufficiently detailed approach to solve this task.",
      code: "x".repeat(8001),
      difficulties: "",
      seniorQuestion: "",
    }).success).toBe(false);
  });
});