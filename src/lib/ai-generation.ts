import "server-only";

import OpenAI from "openai";

export type AiOperation = "ticket" | "review";
export type AiPhase = "provider" | "validation" | "complete";

function diagnosticError(error: unknown) {
  if (!(error instanceof OpenAI.APIError)) return {};
  return {
    code: typeof error.code === "string" ? error.code : undefined,
    status: error.status,
    requestId: error.requestID,
  };
}

export function startAiGeneration(operation: AiOperation) {
  const correlationId = crypto.randomUUID();
  const startedAt = Date.now();
  let phase: AiPhase = "provider";

  console.info(JSON.stringify({ event: "ai_generation", correlationId, operation, status: "started", startedAt: new Date(startedAt).toISOString() }));

  return {
    validation() { phase = "validation"; },
    complete() {
      phase = "complete";
      console.info(JSON.stringify({ event: "ai_generation", correlationId, operation, status: "completed", durationMs: Date.now() - startedAt }));
    },
    fail(error: unknown) {
      console.error(JSON.stringify({ event: "ai_generation", correlationId, operation, status: "failed", phase, durationMs: Date.now() - startedAt, ...diagnosticError(error) }));
    },
  };
}
