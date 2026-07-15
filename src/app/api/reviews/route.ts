import { NextResponse } from "next/server";
import { reviewInputSchema } from "@/schemas";
import { errorResponse, PublicApiError } from "@/lib/api-errors";
import { readJsonBody } from "@/lib/http";
import { generateReview } from "@/lib/openai.server";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  completeReviewReservation,
  releaseReviewReservation,
  reserveReview,
  reviewReservationKey,
} from "@/lib/review-idempotency";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let reservationKey: string | null = null;
  let ownsReservation = false;

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

    reservationKey = reviewReservationKey(parsed.data);
    if (!reserveReview(reservationKey)) {
      throw new PublicApiError(
        "DUPLICATE_REVIEW",
        "This submission already has a completed or in-progress review. Choose Edit submission before requesting another review.",
        409,
        false,
      );
    }

    ownsReservation = true;
    const review = await generateReview(parsed.data);
    completeReviewReservation(reservationKey);
    return NextResponse.json({ review });
  } catch (error) {
    if (reservationKey && ownsReservation) releaseReviewReservation(reservationKey);
    return errorResponse(error);
  }
}
