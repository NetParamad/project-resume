import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  retryAfterSec: number;
};

/**
 * In-memory sliding-window limiter. Kept as a synchronous fallback for
 * IP-scoped / non-auth routes and in tests; the auth'd route helper
 * (`enforceRateLimit`) prefers the shared Supabase RPC so limits hold
 * across instances.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function toResponse(result: RateLimitResult): NextResponse | null {
  if (result.ok) return null;
  return NextResponse.json(
    { error: "Too many requests", code: "rate_limited", retryAfterSec: result.retryAfterSec },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } },
  );
}

/**
 * Convenience wrapper for route handlers: returns a ready-to-send 429
 * response when the limit is exceeded, or null when the request may proceed.
 *
 * Uses the shared Supabase RPC (`rate_limit_bump`) so limits are enforced
 * consistently across instances/workers. If the RPC is missing (migration
 * not applied yet) or unreachable, it transparently falls back to the
 * in-memory limiter so routes keep working.
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<NextResponse | null> {
  try {
    const supabase = await createClient();
    const userId = key.match(UUID_PATTERN)?.[0] ?? null;
    const { data, error } = await supabase.rpc("rate_limit_bump", {
      p_key: key,
      p_user: userId,
      p_limit: limit,
      p_window_ms: windowMs,
    });

    if (!error && data && typeof data === "object") {
      const record = data as { ok?: boolean; retry_after_sec?: number };
      return toResponse({
        ok: record.ok !== false,
        retryAfterSec: Number(record.retry_after_sec) || 0,
      });
    }
  } catch {
    // RPC unavailable — fall through to in-memory.
  }

  return toResponse(rateLimit(key, limit, windowMs));
}