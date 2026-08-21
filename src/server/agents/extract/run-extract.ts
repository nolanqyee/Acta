/**
 * @fileoverview Extract agent (U4-D) — detached post-capture job that loads the
 * Capture text, calls OpenAI structured output, and persists payload + merge
 * units on the proposal row via the service role.
 */

import "server-only";

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { after } from "next/server";
import { ChangelogEntry } from "@/lib/contracts/proposal";
import { ExtractProposal, ExtractProposalLlm, parseExtractProposalFromLlm } from "@/lib/contracts/extract";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { mapProposalRow } from "@/server/proposal/proposal-repository";
import { buildExtractGraphContext } from "./build-extract-graph-context";
import {
  buildMergeArtifacts,
  isEmptyExtract,
} from "./build-merge-units";
import {
  EXTRACT_MODEL_ID,
  buildExtractSystemPrompt,
  buildExtractUserPrompt,
} from "./extract-prompt";

/** Input for the logical `extract_capture` job started after Capture commit. */
export interface ExtractJobInput {
  proposalId: string;
  captureId: string;
  userId: string;
}

const PROPOSAL_SELECT =
  "id, user_id, capture_ids, status, payload, merge_units, changelog, pending_endeavor_previews, failure_reason, stream_cursor, created_at, updated_at";

/**
 * Schedules Extract after the Capture response is sent.
 *
 * @param input - Verified proposal, capture, and user ids from the route handler.
 */
export function scheduleExtract(input: ExtractJobInput): void {
  after(async () => {
    await runExtract(input);
  });
}

/**
 * Marks a streaming proposal as failed with a reason and changelog entry.
 *
 * @param input - Job ids.
 * @param failureReason - Stored on the proposal row.
 * @param message - Human thread line for the skim panel.
 */
async function markExtractFailed(
  input: ExtractJobInput,
  failureReason: string,
  message: string,
): Promise<void> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const { data: existing, error: readError } = await supabase
    .from("extract_proposals")
    .select(PROPOSAL_SELECT)
    .eq("id", input.proposalId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (readError || !existing || existing.status !== "streaming") {
    console.error("extract_failed_proposal_missing", readError);
    return;
  }

  const snapshot = mapProposalRow(existing);
  const failedEntry = ChangelogEntry.parse({
    id: crypto.randomUUID(),
    at: now,
    kind: "extract_failed",
    message,
    captureId: input.captureId,
  });

  const { error: updateError } = await supabase
    .from("extract_proposals")
    .update({
      status: "failed",
      failure_reason: failureReason,
      changelog: [...snapshot.changelog, failedEntry],
      stream_cursor: failedEntry.id,
      updated_at: now,
    })
    .eq("id", input.proposalId)
    .eq("user_id", input.userId)
    .eq("status", "streaming");

  if (updateError) {
    console.error("extract_failed_update_error", updateError);
  }
}

/**
 * Runs structured Extract for one Capture and latches the proposal to `ready`.
 *
 * @param input - Verified proposal, capture, and user ids.
 */
export async function runExtract(input: ExtractJobInput): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await markExtractFailed(
      input,
      "missing_api_key",
      "Extract failed: OpenAI API key not configured",
    );
    return;
  }

  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const { data: existing, error: readError } = await supabase
    .from("extract_proposals")
    .select(PROPOSAL_SELECT)
    .eq("id", input.proposalId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (readError || !existing) {
    console.error("extract_proposal_missing", readError);
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

  const { error: startedError } = await supabase
    .from("extract_proposals")
    .update({
      changelog: [...snapshot.changelog, startedEntry],
      stream_cursor: startedEntry.id,
      updated_at: now,
    })
    .eq("id", input.proposalId)
    .eq("user_id", input.userId)
    .eq("status", "streaming");

  if (startedError) {
    console.error("extract_started_update_failed", startedError);
    return;
  }

  const { data: captureRow, error: captureError } = await supabase
    .from("captures")
    .select("text")
    .eq("id", input.captureId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (captureError || !captureRow?.text) {
    await markExtractFailed(
      input,
      "capture_not_found",
      "Extract failed: capture text unavailable",
    );
    return;
  }

  let graphContext;
  try {
    graphContext = await buildExtractGraphContext(supabase, input.userId);
  } catch (error) {
    console.error("extract_graph_context_failed", error);
    await markExtractFailed(
      input,
      "graph_context_error",
      "Extract failed: could not load graph context",
    );
    return;
  }

  let payload: ExtractProposal;
  try {
    const openai = createOpenAI({ apiKey });
    const result = await generateObject({
      model: openai(EXTRACT_MODEL_ID),
      schema: ExtractProposalLlm,
      system: buildExtractSystemPrompt(),
      prompt: buildExtractUserPrompt(captureRow.text, graphContext),
      temperature: 0,
    });
    payload = parseExtractProposalFromLlm(result.object);
  } catch (error) {
    console.error("extract_llm_failed", error);
    await markExtractFailed(
      input,
      "model_error",
      "Extract failed: model returned invalid output",
    );
    return;
  }

  if (isEmptyExtract(payload)) {
    await markExtractFailed(
      input,
      "empty",
      "Extract failed: no structurable entities in capture",
    );
    return;
  }

  const { mergeUnits, pendingEndeavorPreviews } = buildMergeArtifacts(payload);
  const readyAt = new Date().toISOString();
  const readyEntry = ChangelogEntry.parse({
    id: crypto.randomUUID(),
    at: readyAt,
    kind: "extract_ready",
    message: `Extract ready (${mergeUnits.length} endeavor${mergeUnits.length === 1 ? "" : "s"})`,
    captureId: input.captureId,
  });

  const { data: latest, error: latestError } = await supabase
    .from("extract_proposals")
    .select("changelog")
    .eq("id", input.proposalId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (latestError || !latest) {
    console.error("extract_ready_read_failed", latestError);
    return;
  }

  const latestChangelog = Array.isArray(latest.changelog) ? latest.changelog : [];

  const { error: updateError } = await supabase
    .from("extract_proposals")
    .update({
      status: "ready",
      payload,
      merge_units: mergeUnits,
      pending_endeavor_previews: pendingEndeavorPreviews,
      changelog: [
        ...latestChangelog.map((entry) => {
          const parsed =
            typeof entry === "object" && entry !== null && "at" in entry
              ? { ...entry, at: new Date(String(entry.at)).toISOString() }
              : entry;
          return ChangelogEntry.parse(parsed);
        }),
        readyEntry,
      ],
      failure_reason: null,
      stream_cursor: readyEntry.id,
      updated_at: readyAt,
    })
    .eq("id", input.proposalId)
    .eq("user_id", input.userId)
    .eq("status", "streaming");

  if (updateError) {
    console.error("extract_ready_update_failed", updateError);
  }
}
