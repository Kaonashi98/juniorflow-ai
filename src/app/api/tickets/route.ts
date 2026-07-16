import { NextResponse } from "next/server";
import { profileInputSchema } from "@/schemas";
import { errorResponse, PublicApiError } from "@/lib/api-errors";
import { readJsonBody } from "@/lib/http";
import { generateTicket } from "@/lib/openai.server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { rejectAutomatedRequest } from "@/lib/botid.server";
import { requireAiAccess } from "@/lib/access.server";
import { requireSameOrigin } from "@/lib/request-security";
import { completeTicket, releaseTicket, reserveTicket } from "@/lib/generation-idempotency";
import type { GeneratedTicket } from "@/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  let idempotencyKey: string | null = null;
  let ownsReservation = false;
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

    idempotencyKey = request.headers.get("idempotency-key");
    if (!idempotencyKey || !/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
      throw new PublicApiError("INVALID_INPUT", "A valid idempotency key is required.", 400, false);
    }

    const reservation = reserveTicket<GeneratedTicket>(idempotencyKey);
    if (reservation.status === "completed") {
      return NextResponse.json({ ticket: reservation.value });
    }
    if (reservation.status === "pending") {
      throw new PublicApiError("GENERATION_IN_PROGRESS", "This ticket generation is already in progress.", 409, true);
    }
    ownsReservation = true;

    const ticket = await generateTicket(parsed.data);
    completeTicket(idempotencyKey, ticket);
    return NextResponse.json({ ticket });
  } catch (error) {
    if (idempotencyKey && ownsReservation) releaseTicket(idempotencyKey);
    return errorResponse(error);
  }
}
