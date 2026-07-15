import { NextResponse } from "next/server";
import { reviewInputSchema } from "@/schemas";
import { errorResponse, PublicApiError } from "@/lib/api-errors";
import { readJsonBody } from "@/lib/http";
import { generateReview } from "@/lib/openai.server";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "reviews", 12);
    const body = await readJsonBody(request);
    const parsed = reviewInputSchema.safeParse(body);

    if (!parsed.success) {
      throw new PublicApiError(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message ?? "Invalid review submission.",
        400,
        false,
      );
    }

    const review = await generateReview(parsed.data);
    return NextResponse.json({ review });
  } catch (error) {
    return errorResponse(error);
  }
}
