import { beforeEach, describe, expect, it } from "vitest";
import { PublicApiError } from "@/lib/api-errors";
import {
  enforceRateLimit,
  resetRateLimitForTests,
} from "@/lib/rate-limit";

describe("application rate limiting", () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it("allows requests up to the configured limit", () => {
    const request = new Request("http://localhost/api/tickets", {
      headers: { "x-forwarded-for": "203.0.113.8" },
    });
    expect(() => enforceRateLimit(request, "ticket-test", 2)).not.toThrow();
    expect(() => enforceRateLimit(request, "ticket-test", 2)).not.toThrow();
  });

  it("returns a safe retryable error above the limit", () => {
    const request = new Request("http://localhost/api/tickets", {
      headers: { "x-forwarded-for": "203.0.113.9" },
    });
    enforceRateLimit(request, "ticket-test", 1);
    try {
      enforceRateLimit(request, "ticket-test", 1);
      throw new Error("Expected rate limit error");
    } catch (error) {
      expect(error).toBeInstanceOf(PublicApiError);
      expect((error as PublicApiError).code).toBe("RATE_LIMITED");
      expect((error as PublicApiError).retryable).toBe(true);
    }
  });
});
