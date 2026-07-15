import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE_NAME = "juniorflow_ai_access";
export const ACCESS_MAX_AGE_SECONDS = 8 * 60 * 60;

function digest(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest();
}

export function constantTimeEqual(value: string, expected: string, secret: string) {
  return timingSafeEqual(digest(value, secret), digest(expected, secret));
}

export function createAccessToken(secret: string, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + ACCESS_MAX_AGE_SECONDS;
  const payload = `v1.${expiresAt}.${randomBytes(18).toString("base64url")}`;
  const signature = digest(payload, secret).toString("base64url");
  return `${payload}.${signature}`;
}

export function verifyAccessToken(token: string | undefined, secret: string, now = Date.now()) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) return false;
  const payload = parts.slice(0, 3).join(".");
  const expected = digest(payload, secret);
  let supplied: Buffer;
  try {
    supplied = Buffer.from(parts[3], "base64url");
  } catch {
    return false;
  }
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function readCookie(cookieHeader: string | null, name: string) {
  return cookieHeader
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)
    ?.slice(1)
    .join("=");
}