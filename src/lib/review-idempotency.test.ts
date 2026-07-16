import { beforeEach, describe, expect, it } from "vitest";
import { DEMO_REVIEW } from "@/data/demo-review";
import {
  clearReviewReservations,
  completeReviewReservation,
  releaseReviewReservation,
  reserveReview,
  reviewReservationKey,
} from "@/lib/review-idempotency";

describe("review request idempotency", () => {
  beforeEach(() => {
    clearReviewReservations();
  });

  it("rejects concurrent and completed duplicate requests", () => {
    const key = reviewReservationKey({
      sessionId: "00000000-0000-4000-8000-000000000040",
      submissionRevision: 0,
    });

    expect(reserveReview(key, 1_000)).toBe(true);
    expect(reserveReview(key, 1_001)).toBe(false);
    completeReviewReservation(key, DEMO_REVIEW, 1_002);
    expect(reserveReview(key, 1_003)).toBe(false);
  });

  it("allows retry after failure and a new revision after editing", () => {
    const sessionId = "00000000-0000-4000-8000-000000000040";
    const firstKey = reviewReservationKey({
      sessionId,
      submissionRevision: 0,
    });
    const editedKey = reviewReservationKey({
      sessionId,
      submissionRevision: 1,
    });

    expect(reserveReview(firstKey, 2_000)).toBe(true);
    releaseReviewReservation(firstKey);
    expect(reserveReview(firstKey, 2_001)).toBe(true);
    completeReviewReservation(firstKey, DEMO_REVIEW, 2_002);
    expect(reserveReview(editedKey, 2_003)).toBe(true);
  });
});
