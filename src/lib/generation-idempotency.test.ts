import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTicketReservations,
  completeTicket,
  releaseTicket,
  reserveTicket,
} from "@/lib/generation-idempotency";

describe("ticket generation idempotency", () => {
  beforeEach(clearTicketReservations);

  it("blocks an in-progress duplicate and reuses a completed result", () => {
    expect(reserveTicket<string>("request-a", 1_000).status).toBe("reserved");
    expect(reserveTicket<string>("request-a", 1_001).status).toBe("pending");
    completeTicket("request-a", "ticket", 1_002);
    expect(reserveTicket<string>("request-a", 1_003)).toEqual({ status: "completed", value: "ticket" });
  });

  it("allows a controlled retry after a failed request", () => {
    expect(reserveTicket("request-b", 2_000).status).toBe("reserved");
    releaseTicket("request-b");
    expect(reserveTicket("request-b", 2_001).status).toBe("reserved");
  });
});
