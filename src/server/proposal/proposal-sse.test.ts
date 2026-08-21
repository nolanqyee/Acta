/**
 * @fileoverview Unit tests for proposal SSE helpers (U4-E).
 */

import { describe, expect, it } from "vitest";
import { ChangelogEntry } from "@/lib/contracts/proposal";
import {
  buildChangelogAppendFrames,
  buildTerminalProposalFrames,
  changelogEntriesAfterCursor,
  encodeProposalSseFrame,
} from "./proposal-sse";
import { ExtractProposal } from "@/lib/contracts/extract";

describe("proposal SSE helpers", () => {
  const entryA = ChangelogEntry.parse({
    id: "a",
    at: "2026-08-13T17:00:00.000Z",
    kind: "capture",
  });
  const entryB = ChangelogEntry.parse({
    id: "b",
    at: "2026-08-13T17:00:01.000Z",
    kind: "extract_started",
  });

  it("filters changelog entries after cursor", () => {
    expect(changelogEntriesAfterCursor([entryA, entryB], "a")).toEqual([entryB]);
    expect(changelogEntriesAfterCursor([entryA, entryB], undefined)).toEqual([
      entryA,
      entryB,
    ]);
  });

  it("builds changelog_append frames", () => {
    const frames = buildChangelogAppendFrames([entryA, entryB], "a");
    expect(frames).toHaveLength(1);
    expect(frames[0]?.event).toBe("changelog_append");
  });

  it("encodes SSE event lines", () => {
    const bytes = encodeProposalSseFrame({
      event: "stream_done",
      data: { status: "ready" },
    });
    expect(new TextDecoder().decode(bytes)).toBe(
      'event: stream_done\ndata: {"status":"ready"}\n\n',
    );
  });

  it("builds terminal frames for ready proposals", () => {
    const proposal = {
      id: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      captureIds: ["33333333-3333-4333-8333-333333333333"],
      status: "ready" as const,
      payload: ExtractProposal.parse({}),
      mergeUnits: [],
      changelog: [],
      pendingEndeavorPreviews: [],
      createdAt: "2026-08-13T17:00:00.000Z",
      updatedAt: "2026-08-13T17:00:00.000Z",
    };
    const events = buildTerminalProposalFrames(proposal);
    expect(events.map((e) => e.event)).toEqual([
      "proposal_upsert",
      "stream_done",
    ]);
  });
});
