import { describe, expect, it } from "vitest";
import { parseGeneratedTicket, parseSeniorReview } from "@/lib/ai-output";
import { PublicApiError } from "@/lib/api-errors";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";

const { createdAt: _createdAt, isDemo: _isDemo, ...generatedTicket } = DEMO_TICKET;
void _createdAt;
void _isDemo;

describe("structured model output parsing", () => {
  it("parses valid ticket and review output", () => {
    expect(parseGeneratedTicket(generatedTicket).ticketId).toBe("JF-2048");
    expect(parseSeniorReview(DEMO_REVIEW).overallScore).toBe(84);
  });

  it("maps invalid output to a safe public error", () => {
    expect(() => parseGeneratedTicket({ title: "Incomplete" })).toThrowError(
      PublicApiError,
    );
    try {
      parseSeniorReview({ overallScore: 120 });
    } catch (error) {
      expect(error).toBeInstanceOf(PublicApiError);
      expect((error as PublicApiError).code).toBe("INVALID_MODEL_OUTPUT");
      expect((error as PublicApiError).message).not.toContain("Zod");
    }
  });
});
