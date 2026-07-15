import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectAutomatedRequest } from "@/lib/botid.server";
import { getAccessConfiguration, verifyAccessCode } from "@/lib/access.server";
import { ACCESS_COOKIE_NAME, ACCESS_MAX_AGE_SECONDS, createAccessToken } from "@/lib/access-session";
import { errorResponse, PublicApiError } from "@/lib/api-errors";
import { readJsonBody } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

const unlockSchema = z.object({ code: z.string().trim().min(1).max(128) }).strict();

export async function POST(request: Request) {
  try {
    await rejectAutomatedRequest();
    requireSameOrigin(request);
    enforceRateLimit(request, "access-unlock", 5);
    const parsed = unlockSchema.safeParse(await readJsonBody(request));
    if (!parsed.success || !verifyAccessCode(parsed.data.code)) {
      throw new PublicApiError("UNAUTHORIZED", "The access code is invalid.", 401, false);
    }

    const { secret } = getAccessConfiguration();
    const response = NextResponse.json({ unlocked: true });
    response.cookies.set(ACCESS_COOKIE_NAME, createAccessToken(secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}