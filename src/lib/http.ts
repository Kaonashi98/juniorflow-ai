import { PublicApiError } from "@/lib/api-errors";

const MAX_REQUEST_BYTES = 20_000;

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new PublicApiError(
      "INVALID_INPUT",
      "The request is too large.",
      413,
      false,
    );
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new PublicApiError(
      "INVALID_INPUT",
      "The request body must be valid JSON.",
      400,
      false,
    );
  }

  if (JSON.stringify(value).length > MAX_REQUEST_BYTES) {
    throw new PublicApiError(
      "INVALID_INPUT",
      "The request is too large.",
      413,
      false,
    );
  }

  return value;
}
