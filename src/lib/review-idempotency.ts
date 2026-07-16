import type { ReviewInput, SeniorReview } from "@/schemas";

const PENDING_TTL_MS = 5 * 60_000;
const COMPLETED_TTL_MS = 6 * 60 * 60 * 1_000;

type ReservationState = "pending" | "completed";

interface Reservation {
  state: ReservationState;
  updatedAt: number;
  value?: SeniorReview;
}

const reservations = new Map<string, Reservation>();

export function reviewReservationKey(
  input: Pick<ReviewInput, "sessionId" | "submissionRevision">,
) {
  return input.sessionId + ":" + input.submissionRevision;
}

function pruneReservations(now: number) {
  for (const [key, reservation] of reservations) {
    const ttl = reservation.state === "pending"
      ? PENDING_TTL_MS
      : COMPLETED_TTL_MS;
    if (now - reservation.updatedAt > ttl) reservations.delete(key);
  }
}

export function reserveReview(key: string, now = Date.now()) {
  pruneReservations(now);
  if (reservations.has(key)) return false;
  reservations.set(key, { state: "pending", updatedAt: now });
  return true;
}

export function completeReviewReservation(key: string, value: SeniorReview, now = Date.now()) {
  reservations.set(key, { state: "completed", updatedAt: now, value });
}

export function getCompletedReview(key: string, now = Date.now()) {
  pruneReservations(now);
  const reservation = reservations.get(key);
  return reservation?.state === "completed" ? reservation.value : undefined;
}

export function releaseReviewReservation(key: string) {
  const reservation = reservations.get(key);
  if (reservation?.state === "pending") reservations.delete(key);
}

export function clearReviewReservations() {
  reservations.clear();
}
