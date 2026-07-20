/**
 * @fileoverview Tests for the meta route handler. Confirms the handler echoes
 * the contract's entity types, so a drift between the route and `@/lib/contracts`
 * fails loudly.
 */

import { describe, it, expect } from "vitest";
import { GET } from "./route";
import { EntityType } from "@/lib/contracts";

describe("GET /api/meta", () => {
  it("echoes the contract entity types", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      service: string;
      entityTypes: string[];
    };
    expect(body.service).toBe("acta");
    expect(body.entityTypes).toEqual(EntityType.options);
  });
});
