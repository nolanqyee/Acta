/**
 * @fileoverview Unit tests for Extract graph context mapping (U4-D).
 */

import { describe, expect, it } from "vitest";
import { mapExtractGraphContext } from "./build-extract-graph-context";

describe("mapExtractGraphContext", () => {
  it("returns empty collections when the user graph is empty", () => {
    expect(
      mapExtractGraphContext({ endeavors: [], skills: [], orgs: [] }),
    ).toEqual({ endeavors: [], skills: [], orgs: [] });
  });

  it("maps endeavor rows into prompt-friendly shape", () => {
    const context = mapExtractGraphContext({
      endeavors: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          kind: "role",
          title: "Bubble SWE intern",
          summary: "Backend internship",
          primary_parent_id: null,
        },
      ],
      skills: [{ id: "22222222-2222-4222-8222-222222222222", name: "Redis" }],
      orgs: [{ id: "33333333-3333-4333-8333-333333333333", name: "Bubble" }],
    });

    expect(context.endeavors).toEqual([
      {
        id: "11111111-1111-4111-8111-111111111111",
        kind: "role",
        title: "Bubble SWE intern",
        summary: "Backend internship",
      },
    ]);
    expect(context.skills).toHaveLength(1);
    expect(context.orgs[0]?.name).toBe("Bubble");
  });
});
