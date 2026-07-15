import OpenAI from "openai";
import {
  ContentFilterFinishReasonError,
  LengthFinishReasonError,
} from "openai/error";
import { NextResponse } from "next/server";
import type { ApiErrorPayload } from "@/schemas";

export type ApiErrorCode =
  | "CONFIGURATION_ERROR"
  | "INVALID_INPUT"
  | "DUPLICATE_REVIEW"
  | "UNAUTHORIZED"
  | "INSUFFICIENT_CREDIT"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "MODEL_REFUSAL"
  | "INVALID_MODEL_OUTPUT"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class PublicApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "PublicApiError";
  }
}

export function mapProviderError(error: unknown): PublicApiError {
  if (error instanceof PublicApiError) return error;

  if (error instanceof OpenAI.AuthenticationError || error instanceof OpenAI.PermissionDeniedError) {
    return new PublicApiError(
      "UNAUTHORIZED",
      "The AI service could not authorize this request. Check the server API key.",
      503,
      false,
    );
  }

  if (error instanceof OpenAI.RateLimitError) {
    if (error.code === "insufficient_quota" || error.type === "insufficient_quota") {
      return new PublicApiError(
        "INSUFFICIENT_CREDIT",
        "The AI service account has insufficient credit. Please check billing and try again.",
        503,
        false,
      );
    }
    return new PublicApiError(
      "RATE_LIMITED",
      "The AI service is receiving too many requests. Please wait a moment and retry.",
      429,
      true,
    );
  }

  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new PublicApiError(
      "TIMEOUT",
      "The AI service took too long to respond. Please retry.",
      504,
      true,
    );
  }

  if (error instanceof OpenAI.APIConnectionError) {
    return new PublicApiError(
      "NETWORK_ERROR",
      "The server could not reach the AI service. Please retry.",
      502,
      true,
    );
  }

  if (
    error instanceof LengthFinishReasonError ||
    error instanceof ContentFilterFinishReasonError
  ) {
    return new PublicApiError(
      "INVALID_MODEL_OUTPUT",
      "The AI service could not return a complete structured response. Please retry.",
      502,
      true,
    );
  }

  if (error instanceof OpenAI.APIError && typeof error.status === "number" && error.status >= 500) {
    return new PublicApiError(
      "SERVICE_UNAVAILABLE",
      "The AI service is temporarily unavailable. Please retry shortly.",
      503,
      true,
    );
  }

  return new PublicApiError(
    "INTERNAL_ERROR",
    "An unexpected server error occurred. Please retry.",
    500,
    true,
  );
}

export function errorResponse(error: unknown) {
  const publicError = mapProviderError(error);
  const body: ApiErrorPayload = {
    error: {
      code: publicError.code,
      message: publicError.message,
      retryable: publicError.retryable,
    },
  };

  return NextResponse.json(body, {
    status: publicError.status,
    headers: publicError.code === "RATE_LIMITED" ? { "Retry-After": "30" } : undefined,
  });
}
