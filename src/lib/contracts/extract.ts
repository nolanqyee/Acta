/**
 * @fileoverview ExtractProposal schema — the structured payload the Extract
 * agent emits from a Capture's raw text. This is a *proposal only*: it uses
 * client-local `tempId`s (not persisted UUIDs) to wire up relationships before
 * the user confirms, and is Zod-validated before the diff-skim merge writes any
 * canonical graph rows. Owned by docs/data-model.md (extract emit shape) and
 * governed by docs/agent-interaction-model.md (proposal-only writes).
 */

import { z } from "zod";
import { EndeavorKind, SkillKind, EvidenceKind } from "./entities";
import { ApplicationTag } from "./tags";
import { EdgeType } from "./edges";
import { EntityType } from "./common";

/** One proposed endeavor in an ExtractProposal emit. */
export const ExtractEndeavorProposal = z.object({
  tempId: z.string(),
  kind: EndeavorKind,
  title: z.string().min(1),
  summary: z.string().optional(),
  ext: z.record(z.string(), z.unknown()).optional(),
  applicationTags: z.array(ApplicationTag).optional(),
  primaryParentTempId: z.string().optional(),
  /** When updating an existing canvas endeavor instead of inserting a new one. */
  updateTargetEndeavorId: z.uuid().optional(),
  /** When nesting under an existing graph parent (not a proposed temp parent). */
  existingParentEndeavorId: z.uuid().optional(),
});

/** One proposed edge in an ExtractProposal emit. */
export const ExtractEdgeProposal = z.object({
  type: EdgeType,
  fromTempId: z.string(),
  fromType: EntityType,
  toTempId: z.string(),
  toType: EntityType,
  attrs: z.record(z.string(), z.unknown()).optional(),
});

/**
 * The full extract emit shape: proposed entities keyed by `tempId` plus edges
 * that reference those temp ids. Every collection defaults to empty so a sparse
 * model response still parses. Validated before merge; never written directly.
 */
export const ExtractProposal = z.object({
  endeavors: z.array(ExtractEndeavorProposal).default([]),
  achievements: z
    .array(
      z.object({
        tempId: z.string(),
        statement: z.string().min(1),
        detail: z.string().optional(),
        endeavorTempIds: z.array(z.string()).default([]),
        applicationTags: z.array(ApplicationTag).optional(),
      }),
    )
    .default([]),
  skills: z
    .array(
      z.object({
        tempId: z.string(),
        name: z.string().min(1),
        skillKind: SkillKind,
        aliases: z.array(z.string()).optional(),
      }),
    )
    .default([]),
  people: z
    .array(
      z.object({
        tempId: z.string(),
        name: z.string().min(1),
        notes: z.string().optional(),
      }),
    )
    .default([]),
  orgs: z
    .array(
      z.object({
        tempId: z.string(),
        name: z.string().min(1),
        orgKind: z
          .enum([
            "company",
            "school",
            "club",
            "lab",
            "nonprofit",
            "gallery",
            "label",
            "other",
          ])
          .optional(),
      }),
    )
    .default([]),
  metrics: z
    .array(
      z.object({
        tempId: z.string(),
        label: z.string().min(1),
        value: z.union([z.number(), z.string()]),
        unit: z.string().optional(),
        direction: z.enum(["up", "down", "neutral"]).optional(),
        context: z.string().optional(),
      }),
    )
    .default([]),
  evidence: z
    .array(
      z.object({
        tempId: z.string(),
        evidenceKind: EvidenceKind,
        title: z.string().optional(),
        uri: z.string().optional(),
      }),
    )
    .default([]),
  edges: z.array(ExtractEdgeProposal).default([]),
});
export type ExtractProposal = z.infer<typeof ExtractProposal>;

export { ExtractProposalLlm, parseExtractProposalFromLlm } from "./extract-llm";
export type { ExtractProposalLlm as ExtractProposalLlmType } from "./extract-llm";
