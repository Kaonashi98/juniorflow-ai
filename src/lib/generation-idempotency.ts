const PENDING_TTL_MS = 5 * 60 * 1_000;
const COMPLETED_TTL_MS = 10 * 60 * 1_000;

type Reservation<T> =
  | { state: "pending"; updatedAt: number }
  | { state: "completed"; updatedAt: number; value: T };

const ticketReservations = new Map<string, Reservation<unknown>>();

function prune<T>(reservations: Map<string, Reservation<T>>, now: number) {
  for (const [key, reservation] of reservations) {
    const ttl = reservation.state === "pending" ? PENDING_TTL_MS : COMPLETED_TTL_MS;
    if (now - reservation.updatedAt > ttl) reservations.delete(key);
  }
}

export function reserveTicket<T>(key: string, now = Date.now()) {
  const reservations = ticketReservations as Map<string, Reservation<T>>;
  prune(reservations, now);
  const existing = reservations.get(key);
  if (existing?.state === "completed") return { status: "completed" as const, value: existing.value };
  if (existing) return { status: "pending" as const };
  reservations.set(key, { state: "pending", updatedAt: now });
  return { status: "reserved" as const };
}

export function completeTicket<T>(key: string, value: T, now = Date.now()) {
  (ticketReservations as Map<string, Reservation<T>>).set(key, { state: "completed", value, updatedAt: now });
}

export function releaseTicket(key: string) {
  if (ticketReservations.get(key)?.state === "pending") ticketReservations.delete(key);
}

export function clearTicketReservations() {
  ticketReservations.clear();
}
