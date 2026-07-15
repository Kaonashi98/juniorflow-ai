import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";
import { clearReviewReservations } from "@/lib/review-idempotency";

vi.mock("@/lib/openai.server", () => ({
  generateReview: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn(),
}));

import { generateReview } from "@/lib/openai.server";
import { POST } from "@/app/api/reviews/route";

const mockedGenerateReview = vi.mocked(generateReview);
const { createdAt: _createdAt, isDemo: _isDemo, ...ticket } = DEMO_TICKET;
void _createdAt;
void _isDemo;

function reviewRequest() {
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId: "00000000-0000-4000-8000-000000000050",
      submissionRevision: 0,
      ticket,
      submissionType: "Pseudocode / technical plan",
      approach: "A detailed technical approach covering the requested behavior.",
      code: "Check loading, error, empty, and populated states in order.",
      difficulties: "",
      seniorQuestion: "",
    }),
  });
}

describe("POST /api/reviews duplicate protection", () => {
  beforeEach(() => {
    clearReviewReservations();
    mockedGenerateReview.mockReset();
    mockedGenerateReview.mockResolvedValue(DEMO_REVIEW);
  });

  it("does not call OpenAI logic for a repeated completed review", async () => {
    const first = await POST(reviewRequest());
    const duplicate = await POST(reviewRequest());
    const payload = await duplicate.json();

    expect(first.status).toBe(200);
    expect(duplicate.status).toBe(409);
    expect(payload.error.code).toBe("DUPLICATE_REVIEW");
    expect(payload.error.message).toContain("Edit submission");
    expect(mockedGenerateReview).toHaveBeenCalledTimes(1);
  });
});
