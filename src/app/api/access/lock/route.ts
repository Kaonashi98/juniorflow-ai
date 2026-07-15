import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/access-session";
import { errorResponse } from "@/lib/api-errors";
import { requireSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const response = NextResponse.json({ unlocked: false });
    response.cookies.set(ACCESS_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}