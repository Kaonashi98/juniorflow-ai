import { PublicApiError } from "@/lib/api-errors";

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    if (process.env.NODE_ENV === "production") {
      throw new PublicApiError("FORBIDDEN", "This request could not be verified.", 403, false);
    }
    return;
  }
  if (origin !== new URL(request.url).origin) {
    throw new PublicApiError("FORBIDDEN", "This request could not be verified.", 403, false);
  }
}