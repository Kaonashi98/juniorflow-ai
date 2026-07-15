import { NextResponse } from "next/server";
import { profileInputSchema } from "@/schemas";
import { errorResponse, PublicApiError } from "@/lib/api-errors";
import { readJsonBody } from "@/lib/http";
import { generateTicket } from "@/lib/openai.server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { rejectAutomatedRequest } from "@/lib/botid.server";
import { requireAiAccess } from "@/lib/access.server";
import { requireSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await rejectAutomatedRequest();
    requireSameOrigin(request);
    requireAiAccess(request);
    enforceRateLimit(request, "tickets", 8);
    const body = await readJsonBody(request);
    const parsed = profileInputSchema.safeParse(body);

    if (!parsed.success) {
      throw new PublicApiError(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message ?? "Invalid profile.",
        400,
        false,
      );
    }

    const ticket = await generateTicket(parsed.data);
    return NextResponse.json({ ticket });
  } catch (error) {
    return errorResponse(error);
  }
}
