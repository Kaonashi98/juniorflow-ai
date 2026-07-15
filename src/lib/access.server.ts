import { ACCESS_COOKIE_NAME, constantTimeEqual, readCookie, verifyAccessToken } from "@/lib/access-session";
import { PublicApiError } from "@/lib/api-errors";

export function getAccessConfiguration() {
  const code = process.env.DEMO_ACCESS_CODE;
  const secret = process.env.APP_SESSION_SECRET;
  if (!code || !secret || secret.length < 32) {
    throw new PublicApiError("CONFIGURATION_ERROR", "The protected AI demo is not configured.", 503, false);
  }
  return { code, secret };
}

export function isRequestUnlocked(request: Request) {
  const { secret } = getAccessConfiguration();
  const token = readCookie(request.headers.get("cookie"), ACCESS_COOKIE_NAME);
  return verifyAccessToken(token, secret);
}

export function requireAiAccess(request: Request) {
  if (!isRequestUnlocked(request)) {
    throw new PublicApiError("ACCESS_REQUIRED", "Unlock the AI demo before using this feature.", 401, false);
  }
}

export function verifyAccessCode(value: string) {
  const { code, secret } = getAccessConfiguration();
  return constantTimeEqual(value, code, secret);
}