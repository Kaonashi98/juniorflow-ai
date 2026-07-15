import {
  generatedTicketSchema,
  seniorReviewSchema,
  type GeneratedTicket,
  type SeniorReview,
} from "@/schemas";
import { PublicApiError } from "@/lib/api-errors";

export function parseGeneratedTicket(value: unknown): GeneratedTicket {
  const result = generatedTicketSchema.safeParse(value);
  if (!result.success) {
    throw new PublicApiError(
      "INVALID_MODEL_OUTPUT",
      "The AI service returned an invalid ticket. Please retry.",
      502,
      true,
    );
  }
  return result.data;
}

export function parseSeniorReview(value: unknown): SeniorReview {
  const result = seniorReviewSchema.safeParse(value);
  if (!result.success) {
    throw new PublicApiError(
      "INVALID_MODEL_OUTPUT",
      "The AI service returned an invalid review. Please retry.",
      502,
      true,
    );
  }
  return result.data;
}
