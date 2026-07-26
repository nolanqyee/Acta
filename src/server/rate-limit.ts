/**
 * @fileoverview In-process, fixed-window rate limiter for route handlers — the
 * first abuse control (R11/KTD13). Keying is per-caller-per-route: authenticated
 * requests should key by user id, unauthenticated ones by client IP. A single
 * in-memory Map is intentionally fine for a single-region MVP; the documented
 * escape hatch is a shared store (Upstash/Redis) once serverless instances fan
 * out (in-process counters don't share across lambdas). `server-only` keeps this
 * out of client bundles.
 */

import "server-only";

/** Tuning for a limit check: at most `limit` requests per `windowMs` window. */
export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  /** Injectable clock for deterministic tests; defaults to `Date.now()`. */
  now?: number;
}

/** Outcome of a limit check, including headers-friendly reset/retry info. */
export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
  /** Seconds until reset, for a `Retry-After` header (0 when allowed). */
  retryAfterSeconds: number;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Records a hit against `key` and reports whether it's within the limit. The
 * window is fixed: the first hit starts it and it resets `windowMs` later.
 *
 * @param key - Stable identifier for the caller+route (see `clientKeyForRequest`).
 * @param options - `limit`, `windowMs`, and an optional injected `now`.
 * @returns Whether the request is allowed plus remaining/reset metadata.
 */
export function rateLimit(
  key: string,
  { limit, windowMs, now = Date.now() }: RateLimitOptions,
): RateLimitResult {
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      ok: true,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const ok = existing.count <= limit;

  return {
    ok,
    limit,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSeconds: ok ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

/**
 * Clears all counters. Test-only helper so cases don't leak state into each
 * other (the Map is module-global by design in production).
 */
export function resetRateLimits(): void {
  buckets.clear();
}

/**
 * Derives a stable rate-limit key for a request, scoped per route so limits
 * don't bleed across endpoints. Uses the client IP from proxy headers; falls
 * back to `unknown` when unavailable (e.g. in unit tests).
 *
 * @param request - The incoming request.
 * @returns A `"<ip>:<pathname>"` key.
 */
export function clientKeyForRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  let pathname: string;
  try {
    pathname = new URL(request.url).pathname;
  } catch {
    pathname = "";
  }
  return `${ip}:${pathname}`;
}

/**
 * Wraps a route handler with IP-keyed rate limiting, returning 429 (with a
 * `Retry-After` header) when the caller exceeds the window. Authenticated
 * routes can adopt user-id keying later (U4); this baseline protects the
 * public surface now.
 *
 * @param handler - The underlying route handler.
 * @param options - Limit + window for this route.
 * @returns A handler that short-circuits with 429 when over the limit.
 */
export function withRateLimit(
  handler: (request: Request) => Response | Promise<Response>,
  options: { limit: number; windowMs: number },
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const result = rateLimit(clientKeyForRequest(request), options);
    if (!result.ok) {
      return Response.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        },
      );
    }
    return handler(request);
  };
}
