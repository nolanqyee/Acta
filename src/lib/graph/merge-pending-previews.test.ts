/**
 * @fileoverview Tests for pending preview projection onto GraphSnapshot (U4-F).
 */

import { describe, expect, it } from "vitest";
import { GraphSnapshot } from "@/lib/contracts";
import { mergePendingPreviewsIntoSnapshot } from "./merge-pending-previews";
import { pendingGhostNodeId } from "./pending-ghost-id";
import { ExtractProposal } from "@/lib/contracts/extract";

const PROPOSAL_ID = "11111111-1111-4111-8111-111111111111";
const PARENT_ID = "22222222-2222-4222-8222-222222222222";

describe("mergePendingPreviewsIntoSnapshot", () => {
  it("returns the snapshot unchanged when there are no pending previews", () => {
    const snapshot = GraphSnapshot.parse({
      nodes: [],
      links: [],
      generatedAt: "2026-08-13T18:00:00.000Z",
    });
    const merged = mergePendingPreviewsIntoSnapshot(snapshot, {
      id: PROPOSAL_ID,
      userId: "33333333-3333-4333-8333-333333333333",
      captureIds: ["44444444-4444-4444-8444-444444444444"],
      status: "ready",
      payload: ExtractProposal.parse({}),
      mergeUnits: [],
      changelog: [],
      pendingEndeavorPreviews: [],
      createdAt: "2026-08-13T18:00:00.000Z",
      updatedAt: "2026-08-13T18:00:00.000Z",
    });
    expect(merged).toBe(snapshot);
  });

  it("adds pending nodes and part_of links to committed parents", () => {
    const snapshot = GraphSnapshot.parse({
      nodes: [
        {
          id: PARENT_ID,
          kind: "role",
          title: "Intern",
          facets: { skills: [], people: [], orgs: [] },
          state: "committed",
        },
      ],
      links: [],
      generatedAt: "2026-08-13T18:00:00.000Z",
    });

    const childTempId = "ende_proj_1";
    const merged = mergePendingPreviewsIntoSnapshot(snapshot, {
      id: PROPOSAL_ID,
      userId: "33333333-3333-4333-8333-333333333333",
      captureIds: ["44444444-4444-4444-8444-444444444444"],
      status: "ready",
      payload: ExtractProposal.parse({}),
      mergeUnits: [],
      changelog: [],
      pendingEndeavorPreviews: [
        {
          tempId: childTempId,
          kind: "project",
          title: "Redis cache",
          op: "add",
          existingParentEndeavorId: PARENT_ID,
          disposition: "pending",
        },
      ],
      createdAt: "2026-08-13T18:00:00.000Z",
      updatedAt: "2026-08-13T18:00:00.000Z",
    });

    expect(merged.nodes).toHaveLength(2);
    expect(merged.nodes[1]?.state).toBe("pending");
    expect(merged.nodes[1]?.id).toBe(
      pendingGhostNodeId(PROPOSAL_ID, childTempId),
    );
    expect(merged.links[0]?.relation).toBe("part_of");
    expect(merged.links[0]?.target).toBe(PARENT_ID);
  });
});
