import type { Locale } from "@/lib/i18n";
import type { ReviewContent, SeniorReview, TicketContent, WorkTicket } from "@/types";

export function ticketContent(ticket: WorkTicket, locale: Locale): TicketContent {
  return ticket.content[locale];
}

export function reviewContent(review: SeniorReview, locale: Locale): ReviewContent {
  return review.content[locale];
}