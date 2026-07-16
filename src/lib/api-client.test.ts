import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { postJson } from "@/lib/api-client";

describe("browser API client", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("aborts at the client boundary and maps a timeout safely", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", { setTimeout, clearTimeout });
    vi.stubGlobal("fetch", vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    })));

    const request = postJson("/api/tickets", {}, z.object({ ok: z.boolean() }));
    const expectation = expect(request).rejects.toMatchObject({ code: "TIMEOUT", retryable: true });
    await vi.advanceTimersByTimeAsync(270_000);
    await expectation;
  });

  it("rejects invalid successful payloads without exposing raw data", async () => {
    vi.stubGlobal("window", { setTimeout, clearTimeout });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ secretDetail: "hidden" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })));

    await expect(postJson("/api/tickets", {}, z.object({ ok: z.boolean() })))
      .rejects.toMatchObject({ code: "INVALID_RESPONSE", retryable: true });
  });
});
