import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/botid.server", () => ({ rejectAutomatedRequest: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: vi.fn() }));

import { POST as unlock } from "@/app/api/access/unlock/route";
import { POST as lock } from "@/app/api/access/lock/route";
import { GET as status } from "@/app/api/access/status/route";

const SECRET = "test-app-session-secret-with-more-than-thirty-two-characters";

function unlockRequest(code: string) {
  return new Request("http://localhost/api/access/unlock", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify({ code }),
  });
}

describe("protected demo access routes", () => {
  beforeEach(() => {
    process.env.DEMO_ACCESS_CODE = "temporary-test-code";
    process.env.APP_SESSION_SECRET = SECRET;
  });

  it("returns a generic error for an incorrect code and never echoes it", async () => {
    const response = await unlock(unlockRequest("very-wrong-secret"));
    const text = await response.text();
    expect(response.status).toBe(401);
    expect(text).not.toContain("very-wrong-secret");
    expect(text).not.toContain("temporary-test-code");
  });

  it("sets a secure server-only session cookie for a correct code", async () => {
    const response = await unlock(unlockRequest("temporary-test-code"));
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(response.status).toBe(200);
    expect(cookie).toContain("juniorflow_ai_access=");
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
    expect(cookie).toContain("Max-Age=28800");

    const cookiePair = cookie.split(";")[0];
    const statusResponse = await status(new Request("http://localhost/api/access/status", { headers: { cookie: cookiePair } }));
    expect(await statusResponse.json()).toEqual({ unlocked: true });
  });

  it("locks by expiring the session cookie", async () => {
    const response = await lock(new Request("http://localhost/api/access/lock", { method: "POST", headers: { origin: "http://localhost" } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});