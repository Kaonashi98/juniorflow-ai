import { PublicApiError } from "@/lib/api-errors";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

export function enforceRateLimit(request: Request, scope: string, limit: number) {
  const forwarded = request.headers.get("x-forwarded-for");
  const clientId = forwarded?.split(",")[0]?.trim() || "local";
  const key = `${scope}:${clientId}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (current.count >= limit) {
    throw new PublicApiError(
      "RATE_LIMITED",
      "Too many requests. Please wait a moment and retry.",
      429,
      true,
    );
  }

  current.count += 1;

  if (buckets.size > 500) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }
}

export function resetRateLimitForTests() {
  buckets.clear();
}
