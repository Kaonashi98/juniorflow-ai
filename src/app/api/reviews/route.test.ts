import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";
import { clearReviewReservations } from "@/lib/review-idempotency";
import { PublicApiError } from "@/lib/api-errors";

vi.mock("@/lib/openai.server", () => ({
  generateReview: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn(),
}));
vi.mock("@/lib/botid.server", () => ({
  rejectAutomatedRequest: vi.fn(),
}));

vi.mock("@/lib/access.server", () => ({
  requireAiAccess: vi.fn(),
}));

vi.mock("@/lib/request-security", () => ({
  requireSameOrigin: vi.fn(),
}));

import { generateReview } from "@/lib/openai.server";
import { requireAiAccess } from "@/lib/access.server";
import { POST } from "@/app/api/reviews/route";

const mockedGenerateReview = vi.mocked(generateReview);
const mockedRequireAiAccess = vi.mocked(requireAiAccess);
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
    mockedRequireAiAccess.mockReset();
    mockedGenerateReview.mockResolvedValue(DEMO_REVIEW);
  });


  it("does not call OpenAI when the access session is missing", async () => {
    mockedRequireAiAccess.mockImplementationOnce(() => {
      throw new PublicApiError("ACCESS_REQUIRED", "Unlock the AI demo before using this feature.", 401, false);
    });
    const response = await POST(reviewRequest());
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("ACCESS_REQUIRED");
    expect(mockedGenerateReview).not.toHaveBeenCalled();
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
