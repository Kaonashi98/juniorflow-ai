

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
  language: "English",
  projectDescription: "A task management dashboard used by distributed product teams.",
} as const;

const { createdAt: _createdAt, isDemo: _isDemo, ...generatedTicket } = DEMO_TICKET;
void _createdAt;
void _isDemo;

const fivePredefined = [
  "TypeScript",
  "Java",
  "SQL",
  "Angular",
  "Spring Boot",
];

function profileWithTechnologies(
  predefinedTechnologies: string[],
  customTechnologies: string,
) {
  return {
    ...validProfile,
    predefinedTechnologies,
    customTechnologies,
    technologies: mergeTechnologies(
      predefinedTechnologies,
      customTechnologies,
    ),
  };
}
describe("shared Zod schemas", () => {
  it("accepts a bounded developer profile", () => {
    expect(profileInputSchema.parse(validProfile)).toEqual(validProfile);
  });

  it("rejects oversized and unknown profile fields", () => {
    expect(
      profileInputSchema.safeParse({
        ...validProfile,
        projectDescription: "x".repeat(801),
      }).success,
    ).toBe(false);
    expect(
      profileInputSchema.safeParse({ ...validProfile, unexpected: true }).success,
    ).toBe(false);
  });

  it("accepts internship experience and normalizes custom technologies", () => {
    const result = profileInputSchema.parse({
      ...validProfile,
      experience: "Junior with internship experience",
      technologies: ["Angular", "Docker", "GraphQL"],
      customTechnologies: " Docker, docker, , GraphQL ",
    });

    expect(result.experience).toBe("Junior with internship experience");
    expect(result.customTechnologies).toBe("Docker, GraphQL");
    expect(result.technologies).toEqual(["Angular", "Docker", "GraphQL"]);
  });

  it("merges predefined and custom technologies without duplicates", () => {
    expect(
      mergeTechnologies(
        ["React", "Angular"],
        " Docker, react, GraphQL, docker ",
      ),
    ).toEqual(["React", "Angular", "Docker", "GraphQL"]);
    expect(normalizeCustomTechnologies("Redis, , redis, RabbitMQ")).toEqual([
      "Redis",
      "RabbitMQ",
    ]);
  });

  it("accepts five predefined technologies with two custom technologies", () => {
    const parsed = profileInputSchema.parse(
      profileWithTechnologies(fivePredefined, "REST APIs, MySQL"),
    );

    expect(parsed.technologies).toEqual([
      ...fivePredefined,
      "REST APIs",
      "MySQL",
    ]);
  });

  it("accepts five predefined technologies with five custom technologies", () => {
    const parsed = profileInputSchema.parse(
      profileWithTechnologies(
        fivePredefined,
        "REST APIs, MySQL, Docker, Redis, GraphQL",
      ),
    );

    expect(parsed.technologies).toHaveLength(10);
  });

  it("rejects six predefined technologies with the specific message", () => {
    const result = profileInputSchema.safeParse(
      profileWithTechnologies([...fivePredefined, "React"], ""),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Choose no more than five predefined technologies.",
      );
    }
  });

  it("rejects six custom technologies with the specific message", () => {
    const result = profileInputSchema.safeParse(
      profileWithTechnologies(
        fivePredefined,
        "REST APIs, MySQL, Docker, Redis, GraphQL, RabbitMQ",
      ),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Add no more than five custom technologies.",
      );
    }
  });

  it("deduplicates predefined and custom values case-insensitively", () => {
    const parsed = profileInputSchema.parse(
      profileWithTechnologies(
        fivePredefined,
        "typescript, Docker, docker",
      ),
    );

    expect(parsed.technologies).toEqual([...fivePredefined, "Docker"]);
    expect(
      getEffectiveCustomTechnologies(
        fivePredefined,
        "typescript, Docker, docker",
      ),
    ).toEqual(["Docker"]);
  });

  it("ignores empty comma-separated custom values", () => {
    const parsed = profileInputSchema.parse(
      profileWithTechnologies(
        fivePredefined,
        " , REST APIs, , MySQL, ",
      ),
    );

    expect(parsed.technologies).toEqual([
      ...fivePredefined,
      "REST APIs",
      "MySQL",
    ]);
    expect(parsed.customTechnologies).toBe("REST APIs, MySQL");
  });

  it("reports the sanitized total technology limit separately", () => {
    const result = profileInputSchema.safeParse({
      ...validProfile,
      predefinedTechnologies: fivePredefined,
      customTechnologies: "One, Two, Three, Four, Five",
      technologies: [
        ...fivePredefined,
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Choose no more than ten total technologies.",
      );
    }
  });
  it("rejects invalid custom technology input on the shared server schema", () => {
    expect(customTechnologiesSchema.safeParse("x".repeat(151)).success).toBe(false);
    expect(customTechnologiesSchema.safeParse("x".repeat(41)).success).toBe(false);
    expect(
      profileInputSchema.safeParse({
        ...validProfile,
        technologies: ["React", "Docker"],
        customTechnologies: "GraphQL",
      }).success,
    ).toBe(false);
  });

  it("validates generated ticket and review structures", () => {
    expect(generatedTicketSchema.safeParse(generatedTicket).success).toBe(true);
    expect(seniorReviewSchema.safeParse(DEMO_REVIEW).success).toBe(true);
  });

  it("accepts pseudocode and working-code review submissions", () => {
    const baseSubmission = {
      sessionId: "00000000-0000-4000-8000-000000000020",
      submissionRevision: 0,
      ticket: generatedTicket,
      approach: "A sufficiently detailed approach to solve this task.",
      code: "Check the request state, then render the matching UI branch.",
      difficulties: "",
      seniorQuestion: "",
    };

    expect(
      reviewInputSchema.safeParse({
        ...baseSubmission,
        submissionType: "Pseudocode / technical plan",
      }).success,
    ).toBe(true);
    expect(
      reviewInputSchema.safeParse({
        ...baseSubmission,
        submissionType: "Working code",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid submission type", () => {
    expect(
      reviewInputSchema.safeParse({
        sessionId: "00000000-0000-4000-8000-000000000020",
        submissionRevision: 0,
        ticket: generatedTicket,
        submissionType: "Draft",
        approach: "A sufficiently detailed approach to solve this task.",
        code: "Check the request state, then render the matching UI branch.",
        difficulties: "",
        seniorQuestion: "",
      }).success,
    ).toBe(false);
  });

  it("accepts review arrays that are empty", () => {
    expect(
      seniorReviewSchema.safeParse({
        ...DEMO_REVIEW,
        strengths: [],
        problems: [],
        possibleBugs: [],
        securityConcerns: [],
        acceptanceCriteriaAssessment: [],
        improvements: [],
        skillsToStudy: [],
      }).success,
    ).toBe(true);
  });
  it("rejects review input with excessive code", () => {
    expect(
      reviewInputSchema.safeParse({
        sessionId: "00000000-0000-4000-8000-000000000020",
        submissionRevision: 0,
        ticket: generatedTicket,
        submissionType: "Working code",
        approach: "A sufficiently detailed approach to solve this task.",
        code: "x".repeat(8001),
        difficulties: "",
        seniorQuestion: "",
      }).success,
    ).toBe(false);
  });
});
