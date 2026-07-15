import { describe, expect, it } from "vitest";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_MAX_AGE_SECONDS,
  constantTimeEqual,
  createAccessToken,
  readCookie,
  verifyAccessToken,
} from "@/lib/access-session";

const SECRET = "a-test-secret-that-is-at-least-32-characters-long";

describe("access sessions", () => {
  it("compares access codes without exposing them", () => {
    expect(constantTimeEqual("correct", "correct", SECRET)).toBe(true);
    expect(constantTimeEqual("wrong", "correct", SECRET)).toBe(false);
    expect(constantTimeEqual("", "correct", SECRET)).toBe(false);
  });

  it("accepts a valid signed cookie for no more than eight hours", () => {
    const now = Date.UTC(2026, 6, 15);
    const token = createAccessToken(SECRET, now);
    expect(token).not.toContain("demo-code");
    expect(verifyAccessToken(token, SECRET, now + 1_000)).toBe(true);
    expect(verifyAccessToken(token, SECRET, now + ACCESS_MAX_AGE_SECONDS * 1_000)).toBe(false);
  });

  it("rejects tampered, expired, and wrong-secret cookies", () => {
    const now = Date.UTC(2026, 6, 15);
    const token = createAccessToken(SECRET, now);
    expect(verifyAccessToken(token + "x", SECRET, now)).toBe(false);
    expect(verifyAccessToken(token, "another-secret-that-is-at-least-32-characters", now)).toBe(false);
    expect(verifyAccessToken(token, SECRET, now + (ACCESS_MAX_AGE_SECONDS + 1) * 1_000)).toBe(false);
  });

  it("reads only the named cookie", () => {
    expect(readCookie(`theme=dark; ${ACCESS_COOKIE_NAME}=signed.value; other=x`, ACCESS_COOKIE_NAME)).toBe("signed.value");
    expect(readCookie(null, ACCESS_COOKIE_NAME)).toBeUndefined();
  });
});