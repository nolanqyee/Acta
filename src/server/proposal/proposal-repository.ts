/**
 * @fileoverview ProposalRepository — reads and writes ExtractProposal rows for
 * capture guards (U4-B), proposal shell creation (U4-C), and hydrate routes.
 * Extract stream persistence expands in U4-D using the service role.
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ChangelogEntry,
  MergeUnit,
  OPEN_PROPOSAL_STATUSES,
  OpenProposalSummary,
  PendingEndeavorPreview,
  ProposalSnapshot,
  type OpenProposalSummary as OpenProposalSummaryType,
  type ProposalSnapshot as ProposalSnapshotType,
} from "@/lib/contracts/proposal";
import { ExtractProposal } from "@/lib/contracts/extract";

const PROPOSAL_SELECT =
  "id, user_id, capture_ids, status, payload, merge_units, changelog, pending_endeavor_previews, failure_reason, stream_cursor, created_at, updated_at";

/** Raised when a proposal read fails. */
export class ProposalReadError extends Error {
  /**
   * @param message - Log-safe context for the route handler.
   * @param cause - Underlying Supabase error.
   */
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ProposalReadError";
    this.cause = cause;
  }
}

/** Raised when a proposal insert or update fails. */
export class ProposalWriteError extends Error {
  /**
   * @param message - Log-safe context for the route handler.
   * @param cause - Underlying Supabase error.
   */
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ProposalWriteError";
    this.cause = cause;
  }
}

/**
 * Maps a `extract_proposals` table row to the {@link ProposalSnapshot} contract.
 *
 * @param row - Raw Supabase select row for one proposal.
 * @returns Parsed snapshot with ISO-normalized timestamps.
 */
export function mapProposalRow(row: {
  id: string;
  user_id: string;
  capture_ids: string[];
  status: string;
  payload: unknown;
  merge_units: unknown;
  changelog: unknown;
  pending_endeavor_previews: unknown;
  failure_reason: string | null;
  stream_cursor: string | null;
  created_at: string;
  updated_at: string;
}): ProposalSnapshotType {
  return ProposalSnapshot.parse({
    id: row.id,
    userId: row.user_id,
    captureIds: row.capture_ids,
    status: row.status,
    payload: ExtractProposal.parse(row.payload ?? {}),
    mergeUnits: Array.isArray(row.merge_units)
      ? row.merge_units.map((unit) => MergeUnit.parse(unit))
      : [],
    changelog: Array.isArray(row.changelog)
      ? row.changelog.map((entry) => {
          const parsed =
            typeof entry === "object" && entry !== null && "at" in entry
              ? {
                  ...entry,
                  at: new Date(String(entry.at)).toISOString(),
                }
              : entry;
          return ChangelogEntry.parse(parsed);
        })
      : [],
    pendingEndeavorPreviews: Array.isArray(row.pending_endeavor_previews)
      ? row.pending_endeavor_previews.map((preview) =>
          PendingEndeavorPreview.parse(preview),
        )
      : [],
    failureReason: row.failure_reason ?? undefined,
    streamCursor: row.stream_cursor ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  });
}

/**
 * Returns the user's most recent open proposal, if any.
 *
 * Open means status is still blocking a new Capture (`streaming`, `ready`, or
 * mid-merge `merging`). Terminal or non-blocking rows (`confirmed`, `discarded`,
 * `failed`) are ignored.
 *
 * @param supabase - RLS-bound client scoped to the session.
 * @param userId - Verified auth subject (also enforced by RLS).
 * @returns The newest blocking proposal, or `null` when Capture+ may proceed.
 * @throws {ProposalReadError} When the select fails.
 */
export async function findOpenProposal(
  supabase: SupabaseClient,
  userId: string,
): Promise<OpenProposalSummaryType | null> {
  const { data, error } = await supabase
    .from("extract_proposals")
    .select("id, status")
    .eq("user_id", userId)
    .in("status", [...OPEN_PROPOSAL_STATUSES])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ProposalReadError("open_proposal_lookup_failed", error);
  }

  if (!data) {
    return null;
  }

  return OpenProposalSummary.parse({
    id: data.id,
    status: data.status,
  });
}

/**
 * Loads the user's newest open proposal as a full snapshot, if any.
 *
 * @param supabase - RLS-bound client scoped to the session.
 * @param userId - Verified auth subject (also enforced by RLS).
 * @returns The newest open proposal snapshot, or `null` when none is blocking.
 * @throws {ProposalReadError} When the select fails or the row fails validation.
 */
export async function findOpenProposalSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProposalSnapshotType | null> {
  const { data, error } = await supabase
    .from("extract_proposals")
    .select(PROPOSAL_SELECT)
    .eq("user_id", userId)
    .in("status", [...OPEN_PROPOSAL_STATUSES])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ProposalReadError("open_proposal_lookup_failed", error);
  }

  if (!data) {
    return null;
  }

  return mapProposalRow(data);
}

/**
 * Inserts a streaming proposal shell linked to one committed Capture.
 *
 * @param supabase - RLS-bound client scoped to the session.
 * @param userId - Verified auth subject (also enforced by RLS).
 * @param captureId - Persisted Capture id that triggered Extract.
 * @returns The new proposal snapshot in `streaming` status.
 * @throws {ProposalWriteError} When the insert fails.
 */
export async function createProposalShell(
  supabase: SupabaseClient,
  userId: string,
  captureId: string,
): Promise<ProposalSnapshotType> {
  const startedAt = new Date().toISOString();
  const initialChangelog = ChangelogEntry.parse({
    id: crypto.randomUUID(),
    at: startedAt,
    kind: "capture",
    message: "Capture committed",
    captureId,
  });

  const { data, error } = await supabase
    .from("extract_proposals")
    .insert({
      user_id: userId,
      capture_ids: [captureId],
      status: "streaming",
      payload: ExtractProposal.parse({}),
      merge_units: [],
      changelog: [initialChangelog],
      pending_endeavor_previews: [],
      stream_cursor: initialChangelog.id,
    })
    .select(PROPOSAL_SELECT)
    .single();

  if (error || !data) {
    throw new ProposalWriteError("proposal_insert_failed", error);
  }

  return mapProposalRow(data);
}

/**
 * Marks all `failed` proposals for a user as `discarded` so a new Capture can
 * proceed without leaving stale failed rows as the newest proposal history.
 * Rows are retained for audit; nothing is hard-deleted.
 *
 * @param supabase - RLS-bound client scoped to the session.
 * @param userId - Verified auth subject (also enforced by RLS).
 * @returns Count of proposals transitioned to `discarded`.
 * @throws {ProposalWriteError} When the update fails.
 */
export async function discardFailedProposals(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("extract_proposals")
    .update({ status: "discarded", updated_at: now })
    .eq("user_id", userId)
    .eq("status", "failed")
    .select("id");

  if (error) {
    throw new ProposalWriteError("discard_failed_proposals_failed", error);
  }

  return data?.length ?? 0;
}

/**
 * Loads one proposal row by id for the signed-in user.
 *
 * @param supabase - RLS-bound client scoped to the session.
 * @param userId - Verified auth subject.
 * @param proposalId - Proposal primary key.
 * @returns Parsed snapshot, or `null` when not found.
 * @throws {ProposalReadError} When the select fails.
 */
export async function findProposalById(
  supabase: SupabaseClient,
  userId: string,
  proposalId: string,
): Promise<ProposalSnapshotType | null> {
  const { data, error } = await supabase
    .from("extract_proposals")
    .select(PROPOSAL_SELECT)
    .eq("id", proposalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ProposalReadError("proposal_lookup_failed", error);
  }

  if (!data) {
    return null;
  }

  return mapProposalRow(data);
}

/**
 * Returns the newest proposal linked to a Capture (any terminal or open status).
 *
 * @param supabase - RLS-bound client scoped to the session.
 * @param userId - Verified auth subject.
 * @param captureId - Capture id stored in `capture_ids`.
 * @returns Latest matching proposal, or `null`.
 * @throws {ProposalReadError} When the select fails.
 */
export async function findLatestProposalForCapture(
  supabase: SupabaseClient,
  userId: string,
  captureId: string,
): Promise<ProposalSnapshotType | null> {
  const { data, error } = await supabase
    .from("extract_proposals")
    .select(PROPOSAL_SELECT)
    .eq("user_id", userId)
    .contains("capture_ids", [captureId])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ProposalReadError("proposal_lookup_failed", error);
  }

  if (!data) {
    return null;
  }

  return mapProposalRow(data);
}

/**
 * Resets a failed or discarded proposal so Extract can run again on the same Capture.
 *
 * @param supabase - RLS-bound client scoped to the session.
 * @param userId - Verified auth subject.
 * @param proposalId - Proposal to reopen.
 * @param captureId - Capture id for the retry changelog line.
 * @returns Snapshot in `streaming` status.
 * @throws {ProposalWriteError} When the update fails.
 */
export async function resetProposalForExtractRetry(
  supabase: SupabaseClient,
  userId: string,
  proposalId: string,
  captureId: string,
): Promise<ProposalSnapshotType> {
  const { data: existing, error: readError } = await supabase
    .from("extract_proposals")
    .select(PROPOSAL_SELECT)
    .eq("id", proposalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError || !existing) {
    throw new ProposalWriteError("proposal_retry_read_failed", readError);
  }

  const snapshot = mapProposalRow(existing);
  const now = new Date().toISOString();
  const retryEntry = ChangelogEntry.parse({
    id: crypto.randomUUID(),
    at: now,
    kind: "status",
    message: "Extract retry started",
    captureId,
  });

  const { data, error } = await supabase
    .from("extract_proposals")
    .update({
      status: "streaming",
      payload: ExtractProposal.parse({}),
      merge_units: [],
      pending_endeavor_previews: [],
      failure_reason: null,
      changelog: [...snapshot.changelog, retryEntry],
      stream_cursor: retryEntry.id,
      updated_at: now,
    })
    .eq("id", proposalId)
    .eq("user_id", userId)
    .select(PROPOSAL_SELECT)
    .single();

  if (error || !data) {
    throw new ProposalWriteError("proposal_retry_update_failed", error);
  }

  return mapProposalRow(data);
}
