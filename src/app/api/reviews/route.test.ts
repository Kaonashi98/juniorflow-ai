import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_REVIEW } from "@/data/demo-review";
import { DEMO_TICKET } from "@/data/demo-ticket";
import { ACCESS_MAX_AGE_SECONDS, ACCESS_COOKIE_NAME, createAccessToken } from "@/lib/access-session";
import { clearReviewReservations } from "@/lib/review-idempotency";
import { PublicApiError } from "@/lib/api-errors";

const { botCheck } = vi.hoisted(() => ({ botCheck: vi.fn() }));
vi.mock("@/lib/openai.server", () => ({ generateReview: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: vi.fn() }));
vi.mock("@/lib/botid.server", () => ({ rejectAutomatedRequest: botCheck }));

import { generateReview } from "@/lib/openai.server";
import { POST } from "@/app/api/reviews/route";

const mockedGenerateReview = vi.mocked(generateReview);
const SECRET = "test-app-session-secret-with-more-than-thirty-two-characters";
const { createdAt: _createdAt, isDemo: _isDemo, ...ticket } = DEMO_TICKET;
void _createdAt;
void _isDemo;

function reviewRequest(cookie?: string, origin: string | null = "http://localhost") {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (origin !== null) headers.origin = origin;
  if (cookie) headers.cookie = ACCESS_COOKIE_NAME + "=" + cookie;
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    headers,
    body: JSON.stringify({
      sessionId: "00000000-0000-4000-8000-000000000050",
      submissionRevision: 0,
      ticket,
      language: "English",
      submissionType: "Pseudocode / technical plan",
      approach: "A detailed technical approach covering the requested behavior.",
      code: "Check loading, error, empty, and populated states in order.",
      difficulties: "",
      seniorQuestion: "",
    }),
  });
}

describe("POST /api/reviews security and duplicate protection", () => {
  beforeEach(() => {
    process.env.DEMO_ACCESS_CODE = "temporary-test-code";
    process.env.APP_SESSION_SECRET = SECRET;
    clearReviewReservations();
    botCheck.mockReset();
    botCheck.mockResolvedValue(undefined);
    mockedGenerateReview.mockReset();
    mockedGenerateReview.mockResolvedValue(DEMO_REVIEW);
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each([
    ["missing", undefined],
    ["expired", createAccessToken(SECRET, Date.now() - (ACCESS_MAX_AGE_SECONDS + 1) * 1000)],
    ["tampered", createAccessToken(SECRET) + "x"],
    ["wrong-secret", createAccessToken("different-test-secret-with-more-than-thirty-two-characters")],
  ])("rejects a %s access session without calling OpenAI", async (_case, cookie) => {
    const response = await POST(reviewRequest(cookie));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("ACCESS_REQUIRED");
    expect(mockedGenerateReview).not.toHaveBeenCalled();
  });

  it.each([
    ["cross-origin", "https://attacker.example"],
    ["missing production origin", null],
  ])("rejects %s before calling OpenAI", async (_case, origin) => {
    if (origin === null) vi.stubEnv("NODE_ENV", "production");
    const response = await POST(reviewRequest(createAccessToken(SECRET), origin));
    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe("FORBIDDEN");
    expect(mockedGenerateReview).not.toHaveBeenCalled();
  });

  it("rejects a bot without calling OpenAI", async () => {
    botCheck.mockRejectedValueOnce(new PublicApiError("BOT_DETECTED", "This request could not be completed.", 403, false));
    const response = await POST(reviewRequest(createAccessToken(SECRET)));
    expect(response.status).toBe(403);
    expect(mockedGenerateReview).not.toHaveBeenCalled();
  });

  it("does not reserve a review for a rejected access request", async () => {
    const rejected = await POST(reviewRequest());
    const accepted = await POST(reviewRequest(createAccessToken(SECRET)));
    expect(rejected.status).toBe(401);
    expect(accepted.status).toBe(200);
    expect(mockedGenerateReview).toHaveBeenCalledTimes(1);
  });

  it("does not call OpenAI logic for a repeated completed review", async () => {
    const cookie = createAccessToken(SECRET);
    const first = await POST(reviewRequest(cookie));
    const duplicate = await POST(reviewRequest(cookie));
    const payload = await duplicate.json();
    expect(first.status).toBe(200);
    expect(duplicate.status).toBe(409);
    expect(payload.error.code).toBe("DUPLICATE_REVIEW");
    expect(mockedGenerateReview).toHaveBeenCalledTimes(1);
  });
});