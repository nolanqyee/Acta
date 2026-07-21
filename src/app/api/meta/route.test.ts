/**
 * @fileoverview Tests for the meta route handler. Confirms the handler echoes
 * the contract's entity types (so drift between the route and `@/lib/contracts`
 * fails loudly) and that the baseline rate limiter returns 429 past the window.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "./route";
import { EntityType } from "@/lib/contracts";
import { resetRateLimits } from "@/server/rate-limit";

/** Builds a request with a fixed client IP so rate-limit keys are stable. */
function metaRequest(ip = "203.0.113.1"): Request {
  return new Request("http://localhost/api/meta", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("GET /api/meta", () => {
  beforeEach(() => resetRateLimits());

  it("echoes the contract entity types", async () => {
    const res = await GET(metaRequest());
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      service: string;
      entityTypes: string[];
    };
    expect(body.service).toBe("acta");
    expect(body.entityTypes).toEqual(EntityType.options);
  });

  it("returns 429 once the per-window limit is exceeded", async () => {
    const req = metaRequest("198.51.100.7");
    // Limit is 60/min; the 61st request from the same IP should be rejected.
    for (let i = 0; i < 60; i++) {
      const ok = await GET(req);
      expect(ok.status).toBe(200);
    }
    const limited = await GET(req);
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBeTruthy();
  });
});
