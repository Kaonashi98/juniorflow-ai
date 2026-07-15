"use client";

import { z } from "zod";
import { apiErrorSchema } from "@/schemas";

export class ClientApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

export async function postJson<T>(
  url: string,
  body: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 50_000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const parsedError = apiErrorSchema.safeParse(payload);
      if (parsedError.success) {
        throw new ClientApiError(
          parsedError.data.error.message,
          parsedError.data.error.code,
          parsedError.data.error.retryable,
        );
      }
      throw new ClientApiError(
        "The server returned an unexpected error. Please retry.",
        "UNEXPECTED_RESPONSE",
        true,
      );
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new ClientApiError(
        "The server returned an invalid response. Please retry.",
        "INVALID_RESPONSE",
        true,
      );
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ClientApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ClientApiError(
        "The request timed out. Please retry.",
        "TIMEOUT",
        true,
      );
    }
    throw new ClientApiError(
      "The network request failed. Check your connection and retry.",
      "NETWORK_ERROR",
      true,
    );
  } finally {
    window.clearTimeout(timeout);
  }
}
