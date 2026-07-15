import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_TICKET } from "@/data/demo-ticket";
import { createAccessToken, ACCESS_COOKIE_NAME } from "@/lib/access-session";
import { PublicApiError } from "@/lib/api-errors";

const { botCheck } = vi.hoisted(() => ({ botCheck: vi.fn() }));

vi.mock("@/lib/botid.server", () => ({ rejectAutomatedRequest: botCheck }));
vi.mock("@/lib/openai.server", () => ({ generateTicket: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: vi.fn() }));

import { generateTicket } from "@/lib/openai.server";
import { POST } from "@/app/api/tickets/route";

const mockGenerateTicket = vi.mocked(generateTicket);
const SECRET = "test-app-session-secret-with-more-than-thirty-two-characters";

function request(cookie?: string) {
  return new Request("http://localhost/api/tickets", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      ...(cookie ? { cookie: `${ACCESS_COOKIE_NAME}=${cookie}` } : {}),
    },
    body: JSON.stringify({
      role: "Front-End",
      experience: "Junior with internship experience",
      predefinedTechnologies: ["TypeScript", "React"],
      customTechnologies: "Docker",
      technologies: ["TypeScript", "React", "Docker"],
      availableTime: "2 hours",
      language: "English",
      projectDescription: "A project dashboard used by small distributed product teams.",
    }),
  });
}

describe("POST /api/tickets access and BotID protection", () => {
  beforeEach(() => {
    process.env.DEMO_ACCESS_CODE = "temporary-test-code";
    process.env.APP_SESSION_SECRET = SECRET;
    botCheck.mockReset();
    botCheck.mockResolvedValue(undefined);
    mockGenerateTicket.mockReset();
    mockGenerateTicket.mockResolvedValue(DEMO_TICKET);
  });

  it("rejects a missing access session without calling OpenAI", async () => {
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("ACCESS_REQUIRED");
    expect(mockGenerateTicket).not.toHaveBeenCalled();
  });

  it("accepts a valid signed session for a human request", async () => {
    const response = await POST(request(createAccessToken(SECRET)));
    expect(response.status).toBe(200);
    expect(mockGenerateTicket).toHaveBeenCalledTimes(1);
    expect(mockGenerateTicket).toHaveBeenCalledWith(expect.objectContaining({ language: "English" }));
  });

  it("rejects a bot before access validation and never calls OpenAI", async () => {
    botCheck.mockRejectedValueOnce(new PublicApiError("BOT_DETECTED", "This request could not be completed.", 403, false));
    const response = await POST(request(createAccessToken(SECRET)));
    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe("BOT_DETECTED");
    expect(mockGenerateTicket).not.toHaveBeenCalled();
  });
});