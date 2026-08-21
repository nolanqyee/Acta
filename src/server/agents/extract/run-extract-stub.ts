/**
 * @fileoverview Extract agent stub (U4-C) — detached post-capture job that marks
 * a proposal shell as started and completes with an empty validated payload until
 * U4-D replaces this with real LLM streaming via the service role.
 */

import "server-only";

import { after } from "next/server";
import { ChangelogEntry } from "@/lib/contracts/proposal";
import { ExtractProposal } from "@/lib/contracts/extract";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { mapProposalRow } from "@/server/proposal/proposal-repository";

/** Input for the logical `extract_capture` job started after Capture commit. */
export interface ExtractJobInput {
  proposalId: string;
  captureId: string;
  userId: string;
}

/**
 * Schedules the stub Extract job after the Capture response is sent.
 *
 * Uses Next's `after()` so the HTTP handler can return 201 immediately while
 * Extract continues in-process. U4-D swaps the body for real LLM streaming.
 *
 * @param input - Verified proposal, capture, and user ids from the route handler.
 */
export function scheduleExtractStub(input: ExtractJobInput): void {
  after(async () => {
    await runExtractStub(input);
  });
}

/**
 * Stub Extract implementation: append thread rows and latch `ready` with an empty
 * validated payload. Writes through the service role with an explicit `user_id`
 * filter because the detached task has no live cookie session.
 *
 * @param input - Verified proposal, capture, and user ids.
 */
export async function runExtractStub(input: ExtractJobInput): Promise<void> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const { data: existing, error: readError } = await supabase
    .from("extract_proposals")
    .select(
      "id, user_id, capture_ids, status, payload, merge_units, changelog, pending_endeavor_previews, failure_reason, stream_cursor, created_at, updated_at",
    )
    .eq("id", input.proposalId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (readError || !existing) {
    console.error("extract_stub_proposal_missing", readError);
    return;
  }

  if (existing.status !== "streaming") {
    return;
  }

  const snapshot = mapProposalRow(existing);
  const startedEntry = ChangelogEntry.parse({
    id: crypto.randomUUID(),
    at: now,
    kind: "extract_started",
    message: "Extract started",
    captureId: input.captureId,
  });
  const readyEntry = ChangelogEntry.parse({
    id: crypto.randomUUID(),
    at: now,
    kind: "extract_ready",
    message: "Stub extract complete (U4-D replaces with LLM stream)",
    captureId: input.captureId,
  });
  const payload = ExtractProposal.parse({});

  const { error: updateError } = await supabase
    .from("extract_proposals")
    .update({
      status: "ready",
      payload,
      changelog: [...snapshot.changelog, startedEntry, readyEntry],
      updated_at: now,
    })
    .eq("id", input.proposalId)
    .eq("user_id", input.userId)
    .eq("status", "streaming");

  if (updateError) {
    console.error("extract_stub_update_failed", updateError);
  }
}
