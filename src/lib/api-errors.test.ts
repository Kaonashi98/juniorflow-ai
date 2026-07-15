import OpenAI from "openai";
import { describe, expect, it } from "vitest";
import { mapProviderError, PublicApiError } from "@/lib/api-errors";

describe("public API error mapping", () => {
  it("preserves explicit public errors", () => {
    const error = new PublicApiError("INVALID_INPUT", "Invalid request.", 400, false);
    expect(mapProviderError(error)).toBe(error);
  });

  it("maps authentication failures without provider details", () => {
    const providerError = new OpenAI.AuthenticationError(
      401,
      { message: "secret provider detail" },
      "raw provider message",
      new Headers(),
    );
    const mapped = mapProviderError(providerError);
    expect(mapped.code).toBe("UNAUTHORIZED");
    expect(mapped.message).not.toContain("secret provider detail");
    expect(mapped.retryable).toBe(false);
  });

  it("maps timeouts as retryable", () => {
    const mapped = mapProviderError(new OpenAI.APIConnectionTimeoutError());
    expect(mapped.code).toBe("TIMEOUT");
    expect(mapped.status).toBe(504);
    expect(mapped.retryable).toBe(true);
  });

  it("maps unknown errors to a generic response", () => {
    const mapped = mapProviderError(new Error("internal stack detail"));
    expect(mapped.code).toBe("INTERNAL_ERROR");
    expect(mapped.message).not.toContain("internal stack detail");
  });
});
