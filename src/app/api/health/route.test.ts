/**
 * @fileoverview Tests for the health route handler. Invokes the exported `GET`
 * directly (no server needed) — the pattern all route-handler tests follow.
 */

import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
