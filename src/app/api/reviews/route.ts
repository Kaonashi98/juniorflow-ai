import { NextResponse } from "next/server";
import { reviewInputSchema } from "@/schemas";
import { errorResponse, PublicApiError } from "@/lib/api-errors";
import { readJsonBody } from "@/lib/http";
import { generateReview } from "@/lib/openai.server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { rejectAutomatedRequest } from "@/lib/botid.server";
import { requireAiAccess } from "@/lib/access.server";
import { requireSameOrigin } from "@/lib/request-security";
import {
  completeReviewReservation,
  getCompletedReview,
  releaseReviewReservation,
  reserveReview,
  reviewReservationKey,
} from "@/lib/review-idempotency";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  let reservationKey: string | null = null;
  let ownsReservation = false;

  try {
    await rejectAutomatedRequest();
    requireSameOrigin(request);
    requireAiAccess(request);
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

    reservationKey = reviewReservationKey(parsed.data);
    const completedReview = getCompletedReview(reservationKey);
    if (completedReview) return NextResponse.json({ review: completedReview });
    if (!reserveReview(reservationKey)) {
      throw new PublicApiError(
        "GENERATION_IN_PROGRESS",
        "This review generation is already in progress.",
        409,
        true,
      );
    }

    ownsReservation = true;
    const review = await generateReview(parsed.data);
    completeReviewReservation(reservationKey, review);
    return NextResponse.json({ review });
  } catch (error) {
    if (reservationKey && ownsReservation) releaseReviewReservation(reservationKey);
    return errorResponse(error);
  }
}
