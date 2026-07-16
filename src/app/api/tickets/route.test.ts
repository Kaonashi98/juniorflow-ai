import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_TICKET } from "@/data/demo-ticket";
import { ACCESS_MAX_AGE_SECONDS, createAccessToken, ACCESS_COOKIE_NAME } from "@/lib/access-session";
import { PublicApiError } from "@/lib/api-errors";

const { botCheck } = vi.hoisted(() => ({ botCheck: vi.fn() }));

vi.mock("@/lib/botid.server", () => ({ rejectAutomatedRequest: botCheck }));
vi.mock("@/lib/openai.server", () => ({ generateTicket: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: vi.fn() }));

import { generateTicket } from "@/lib/openai.server";
import { POST } from "@/app/api/tickets/route";

const mockGenerateTicket = vi.mocked(generateTicket);
const SECRET = "test-app-session-secret-with-more-than-thirty-two-characters";

function request(cookie?: string, origin: string | null = "http://localhost") {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (origin !== null) headers.origin = origin;
  if (cookie) headers.cookie = ACCESS_COOKIE_NAME + "=" + cookie;
  return new Request("http://localhost/api/tickets", {
    method: "POST",
    headers,
    body: JSON.stringify({
      role: "Front-End",
      experience: "Junior with internship experience",
      predefinedTechnologies: ["TypeScript", "React"],
      customTechnologies: "Docker",
      technologies: ["TypeScript", "React", "Docker"],
      availableTime: "2 hours",
      projectDescription: "A project dashboard used by small distributed product teams.",
    }),
  });
}

describe("POST /api/tickets security boundary", () => {
  beforeEach(() => {
    process.env.DEMO_ACCESS_CODE = "temporary-test-code";
    process.env.APP_SESSION_SECRET = SECRET;
    botCheck.mockReset();
    botCheck.mockResolvedValue(undefined);
    mockGenerateTicket.mockReset();
    mockGenerateTicket.mockResolvedValue(DEMO_TICKET);
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each([
    ["missing", undefined],
    ["expired", createAccessToken(SECRET, Date.now() - (ACCESS_MAX_AGE_SECONDS + 1) * 1000)],
    ["tampered", createAccessToken(SECRET) + "x"],
    ["wrong-secret", createAccessToken("different-test-secret-with-more-than-thirty-two-characters")],
  ])("rejects a %s access session without calling OpenAI", async (_case, cookie) => {
    const response = await POST(request(cookie));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("ACCESS_REQUIRED");
    expect(mockGenerateTicket).not.toHaveBeenCalled();
  });

  it.each([
    ["cross-origin", "https://attacker.example"],
    ["missing production origin", null],
  ])("rejects %s before calling OpenAI", async (_case, origin) => {
    if (origin === null) vi.stubEnv("NODE_ENV", "production");
    const response = await POST(request(createAccessToken(SECRET), origin));
    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe("FORBIDDEN");
    expect(mockGenerateTicket).not.toHaveBeenCalled();
  });

  it("accepts a valid signed session for a human request", async () => {
    const response = await POST(request(createAccessToken(SECRET)));
    expect(response.status).toBe(200);
    expect(mockGenerateTicket).toHaveBeenCalledTimes(1);
  });

  it("rejects a bot before access validation and never calls OpenAI", async () => {
    botCheck.mockRejectedValueOnce(new PublicApiError("BOT_DETECTED", "This request could not be completed.", 403, false));
    const response = await POST(request(createAccessToken(SECRET)));
    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe("BOT_DETECTED");
    expect(mockGenerateTicket).not.toHaveBeenCalled();
  });
});