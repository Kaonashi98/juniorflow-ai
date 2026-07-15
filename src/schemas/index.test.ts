import { describe, expect, it } from "vitest";
import {
  generatedTicketSchema,
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

  it("validates generated ticket and review structures", () => {
    expect(generatedTicketSchema.safeParse(generatedTicket).success).toBe(true);
    expect(seniorReviewSchema.safeParse(DEMO_REVIEW).success).toBe(true);
  });

  it("rejects review input with excessive code", () => {
    expect(
      reviewInputSchema.safeParse({
        ticket: generatedTicket,
        approach: "A sufficiently detailed approach to solve this task.",
        code: "x".repeat(8001),
        difficulties: "",
        seniorQuestion: "",
      }).success,
    ).toBe(false);
  });
});
