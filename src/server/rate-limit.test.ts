/**
 * @fileoverview Tests for the in-process rate limiter — the U2 abuse-control
 * baseline. Uses an injected clock so window behavior is deterministic: allow up
 * to the limit, reject past it with retry info, and reset after the window.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimit,
  resetRateLimits,
  clientKeyForRequest,
} from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows requests up to the limit within a window", () => {
    const opts = { limit: 3, windowMs: 1000, now: 0 };
    expect(rateLimit("k", opts).ok).toBe(true);
    expect(rateLimit("k", opts).ok).toBe(true);
    const third = rateLimit("k", opts);
    expect(third.ok).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("rejects once the limit is exceeded and reports retry time", () => {
    const opts = { limit: 2, windowMs: 1000, now: 0 };
    rateLimit("k", opts);
    rateLimit("k", opts);
    const over = rateLimit("k", { ...opts, now: 400 });
    expect(over.ok).toBe(false);
    expect(over.remaining).toBe(0);
    expect(over.retryAfterSeconds).toBe(1); // ceil((1000 - 400) / 1000)
  });

  it("resets after the window elapses", () => {
    const opts = { limit: 1, windowMs: 1000, now: 0 };
    expect(rateLimit("k", opts).ok).toBe(true);
    expect(rateLimit("k", { ...opts, now: 500 }).ok).toBe(false);
    expect(rateLimit("k", { ...opts, now: 1000 }).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const opts = { limit: 1, windowMs: 1000, now: 0 };
    expect(rateLimit("a", opts).ok).toBe(true);
    expect(rateLimit("b", opts).ok).toBe(true);
    expect(rateLimit("a", opts).ok).toBe(false);
  });
});

describe("clientKeyForRequest", () => {
  it("keys by first forwarded IP and pathname", () => {
    const req = new Request("http://localhost/api/meta", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(clientKeyForRequest(req)).toBe("203.0.113.5:/api/meta");
  });

  it("falls back to unknown when no IP header is present", () => {
    const req = new Request("http://localhost/api/meta");
    expect(clientKeyForRequest(req)).toBe("unknown:/api/meta");
  });
});
