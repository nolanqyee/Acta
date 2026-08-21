/**
 * @fileoverview Unit tests for proposal mapping and open-status constants (U4-B/C).
 */

import { describe, expect, it } from "vitest";
import { ExtractProposal } from "@/lib/contracts/extract";
import { OPEN_PROPOSAL_STATUSES } from "@/lib/contracts/proposal";
import { mapProposalRow } from "./proposal-repository";

describe("OPEN_PROPOSAL_STATUSES", () => {
  it("blocks capture while extract is in flight or awaiting review", () => {
    expect(OPEN_PROPOSAL_STATUSES).toEqual([
      "streaming",
      "ready",
      "merging",
    ]);
  });

  it("does not treat terminal or failed statuses as open", () => {
    expect(OPEN_PROPOSAL_STATUSES).not.toContain("confirmed");
    expect(OPEN_PROPOSAL_STATUSES).not.toContain("discarded");
    expect(OPEN_PROPOSAL_STATUSES).not.toContain("failed");
  });
});

describe("mapProposalRow", () => {
  it("normalizes timestamps and parses empty extract payload", () => {
    const proposal = mapProposalRow({
      id: "11111111-1111-4111-8111-111111111111",
      user_id: "22222222-2222-4222-8222-222222222222",
      capture_ids: ["33333333-3333-4333-8333-333333333333"],
      status: "streaming",
      payload: ExtractProposal.parse({}),
      merge_units: [],
      changelog: [
        {
          id: "log-1",
          at: "2026-08-13T16:10:54.123456+00:00",
          kind: "capture",
          captureId: "33333333-3333-4333-8333-333333333333",
        },
      ],
      pending_endeavor_previews: [],
      failure_reason: null,
      stream_cursor: null,
      created_at: "2026-08-13T16:10:54.123456+00:00",
      updated_at: "2026-08-13T16:10:54.123456+00:00",
    });

    expect(proposal.createdAt).toBe("2026-08-13T16:10:54.123Z");
    expect(proposal.changelog[0]?.at).toBe("2026-08-13T16:10:54.123Z");
    expect(proposal.captureIds).toHaveLength(1);
    expect(proposal.mergeUnits).toEqual([]);
  });
});
