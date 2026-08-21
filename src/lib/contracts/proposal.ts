/**
 * @fileoverview ExtractProposal HTTP contracts — lifecycle status, persisted row
 * shape, and conflict responses shared by capture guards, proposal routes, and
 * the dev lab. Physical storage lives in `extract_proposals`.
 */

import { z } from "zod";
import { EndeavorKind } from "./entities";
import { ExtractProposal } from "./extract";

/** Per-unit disposition on merge_units (accept/discard in U5). */
export const MergeUnitDisposition = z.enum([
  "pending",
  "accepted",
  "discarded",
]);
export type MergeUnitDisposition = z.infer<typeof MergeUnitDisposition>;

/** Canvas ghost fields for one proposed endeavor (shared by merge unit + preview). */
export const EndeavorPreview = z.object({
  tempId: z.string(),
  kind: EndeavorKind,
  title: z.string(),
  summary: z.string().optional(),
  primaryParentTempId: z.string().optional(),
  existingParentEndeavorId: z.uuid().optional(),
});
export type EndeavorPreview = z.infer<typeof EndeavorPreview>;

/**
 * One merge unit: a proposed endeavor plus bundled entity temp ids and
 * disposition. Disposition SoT for diff-skim accept/discard (U5).
 */
export const MergeUnit = z.object({
  tempId: z.string(),
  op: z.enum(["add", "update"]),
  targetEndeavorId: z.uuid().optional(),
  disposition: MergeUnitDisposition.default("pending"),
  endeavorPreview: EndeavorPreview,
  bundledTempIds: z.array(z.string()).default([]),
  userEditedFields: z.array(z.string()).default([]),
});
export type MergeUnit = z.infer<typeof MergeUnit>;

/** Pending endeavor ghost row for canvas bootstrap during skim. */
export const PendingEndeavorPreview = EndeavorPreview.extend({
  op: z.enum(["add", "update"]),
  targetEndeavorId: z.uuid().optional(),
  disposition: z
    .enum(["pending", "confirmed", "discarded"])
    .default("pending"),
});
export type PendingEndeavorPreview = z.infer<typeof PendingEndeavorPreview>;

/** Proposal-level status stored on `extract_proposals.status`. */
export const ProposalStatus = z.enum([
  "streaming",
  "ready",
  "failed",
  "merging",
  "confirmed",
  "discarded",
]);
export type ProposalStatus = z.infer<typeof ProposalStatus>;

/**
 * Statuses that keep Capture+ blocked until the user finishes or abandons work.
 * `failed` is intentionally excluded: there is nothing to review, so the user
 * may submit a new Capture (or retry Extract on the same Capture via U4 retry).
 */
export const OPEN_PROPOSAL_STATUSES = [
  "streaming",
  "ready",
  "merging",
] as const satisfies readonly ProposalStatus[];

/** One append-only row in the diff-skim thread changelog. */
export const ChangelogEntry = z.object({
  id: z.string(),
  at: z.iso.datetime(),
  kind: z.enum([
    "capture",
    "extract_started",
    "extract_ready",
    "extract_failed",
    "status",
  ]),
  message: z.string().optional(),
  captureId: z.uuid().optional(),
});
export type ChangelogEntry = z.infer<typeof ChangelogEntry>;

/** Full proposal row returned by hydrate and snapshot routes. */
export const ProposalSnapshot = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  captureIds: z.array(z.uuid()),
  status: ProposalStatus,
  payload: ExtractProposal,
  mergeUnits: z.array(MergeUnit).default([]),
  changelog: z.array(ChangelogEntry),
  pendingEndeavorPreviews: z.array(PendingEndeavorPreview).default([]),
  failureReason: z.string().optional(),
  /** Last changelog entry id — SSE reattach cursor (see U4-E). */
  streamCursor: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type ProposalSnapshot = z.infer<typeof ProposalSnapshot>;

/** Body for `GET /proposals/:id`. */
export const ProposalSnapshotResponse = z.object({
  proposal: ProposalSnapshot,
});
export type ProposalSnapshotResponse = z.infer<typeof ProposalSnapshotResponse>;

/** Body for `POST /captures/:id/extract` retry. */
export const RetryExtractResponse = z.object({
  proposalId: z.uuid(),
  captureId: z.uuid(),
  status: z.literal("streaming"),
});
export type RetryExtractResponse = z.infer<typeof RetryExtractResponse>;

/** Named SSE event on `GET /proposals/:id/events`. */
export const ProposalSseEventName = z.enum([
  "snapshot",
  "changelog_append",
  "proposal_upsert",
  "stream_done",
  "stream_error",
]);
export type ProposalSseEventName = z.infer<typeof ProposalSseEventName>;

/** Minimal open-proposal row returned by guards and `GET /proposals/open`. */
export const OpenProposalSummary = z.object({
  id: z.uuid(),
  status: ProposalStatus,
});
export type OpenProposalSummary = z.infer<typeof OpenProposalSummary>;

/** Body for `GET /proposals/open` — zero or one blocking proposal. */
export const OpenProposalResponse = z.object({
  proposal: ProposalSnapshot.nullable(),
});
export type OpenProposalResponse = z.infer<typeof OpenProposalResponse>;

/** Body for `409` when `POST /captures` is rejected due to an open proposal. */
export const OpenProposalConflictError = z.object({
  error: z.literal("open_proposal_exists"),
  proposalId: z.uuid(),
  status: ProposalStatus,
});
export type OpenProposalConflictError = z.infer<typeof OpenProposalConflictError>;
