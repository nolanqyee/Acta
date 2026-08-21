/**
 * @fileoverview OpenAI-safe ExtractProposal schema (U4-D). The Responses API strict
 * JSON Schema mode rejects `z.record()`, optional object keys, and partial
 * `required` arrays. This module defines nullable required fields plus a coerce
 * step into {@link ExtractProposal} for persistence.
 */

import { z } from "zod";
import { EndeavorKind, SkillKind, EvidenceKind } from "./entities";
import { EdgeType } from "./edges";
import { EntityType } from "./common";
import { ExtractProposal, type ExtractProposal as ExtractProposalType } from "./extract";

/** Nullable string for optional LLM fields (key present, value may be null). */
const NStr = z.union([z.string(), z.null()]);

/** Nullable UUID for optional LLM fields. */
const NUuid = z.union([z.uuid(), z.null()]);

/** Nullable string array for optional LLM fields. */
const NStrArray = z.union([z.array(z.string()), z.null()]);

const OrgKind = z.enum([
  "company",
  "school",
  "club",
  "lab",
  "nonprofit",
  "gallery",
  "label",
  "other",
]);

const MetricDirection = z.enum(["up", "down", "neutral"]);

/**
 * Schema passed to OpenAI `generateObject`. Every object property is required;
 * use null when the model has no value. No `applicationTags` (Extract v1 does
 * not emit tags).
 */
export const ExtractProposalLlm = z.object({
  endeavors: z.array(
    z.object({
      tempId: z.string(),
      kind: EndeavorKind,
      title: z.string().min(1),
      summary: NStr,
      primaryParentTempId: NStr,
      updateTargetEndeavorId: NUuid,
      existingParentEndeavorId: NUuid,
    }),
  ),
  achievements: z.array(
    z.object({
      tempId: z.string(),
      statement: z.string().min(1),
      detail: NStr,
      endeavorTempIds: z.array(z.string()),
    }),
  ),
  skills: z.array(
    z.object({
      tempId: z.string(),
      name: z.string().min(1),
      skillKind: SkillKind,
      aliases: NStrArray,
    }),
  ),
  people: z.array(
    z.object({
      tempId: z.string(),
      name: z.string().min(1),
      notes: NStr,
    }),
  ),
  orgs: z.array(
    z.object({
      tempId: z.string(),
      name: z.string().min(1),
      orgKind: z.union([OrgKind, z.null()]),
    }),
  ),
  metrics: z.array(
    z.object({
      tempId: z.string(),
      label: z.string().min(1),
      value: z.union([z.number(), z.string()]),
      unit: NStr,
      direction: z.union([MetricDirection, z.null()]),
      context: NStr,
    }),
  ),
  evidence: z.array(
    z.object({
      tempId: z.string(),
      evidenceKind: EvidenceKind,
      title: NStr,
      uri: NStr,
    }),
  ),
  edges: z.array(
    z.object({
      type: EdgeType,
      fromTempId: z.string(),
      fromType: EntityType,
      toTempId: z.string(),
      toType: EntityType,
    }),
  ),
});
export type ExtractProposalLlm = z.infer<typeof ExtractProposalLlm>;

/**
 * Drops null LLM sentinels and parses into the full {@link ExtractProposal}.
 *
 * @param raw - Structured output from `generateObject`.
 * @returns Canonical extract payload for proposal storage.
 */
export function parseExtractProposalFromLlm(raw: unknown): ExtractProposalType {
  const llm = ExtractProposalLlm.parse(raw);

  return ExtractProposal.parse({
    endeavors: llm.endeavors.map((e) => ({
      tempId: e.tempId,
      kind: e.kind,
      title: e.title,
      ...(e.summary ? { summary: e.summary } : {}),
      ...(e.primaryParentTempId
        ? { primaryParentTempId: e.primaryParentTempId }
        : {}),
      ...(e.updateTargetEndeavorId
        ? { updateTargetEndeavorId: e.updateTargetEndeavorId }
        : {}),
      ...(e.existingParentEndeavorId
        ? { existingParentEndeavorId: e.existingParentEndeavorId }
        : {}),
    })),
    achievements: llm.achievements.map((a) => ({
      tempId: a.tempId,
      statement: a.statement,
      endeavorTempIds: a.endeavorTempIds,
      ...(a.detail ? { detail: a.detail } : {}),
    })),
    skills: llm.skills.map((s) => ({
      tempId: s.tempId,
      name: s.name,
      skillKind: s.skillKind,
      ...(s.aliases?.length ? { aliases: s.aliases } : {}),
    })),
    people: llm.people.map((p) => ({
      tempId: p.tempId,
      name: p.name,
      ...(p.notes ? { notes: p.notes } : {}),
    })),
    orgs: llm.orgs.map((o) => ({
      tempId: o.tempId,
      name: o.name,
      ...(o.orgKind ? { orgKind: o.orgKind } : {}),
    })),
    metrics: llm.metrics.map((m) => ({
      tempId: m.tempId,
      label: m.label,
      value: m.value,
      ...(m.unit ? { unit: m.unit } : {}),
      ...(m.direction ? { direction: m.direction } : {}),
      ...(m.context ? { context: m.context } : {}),
    })),
    evidence: llm.evidence.map((e) => ({
      tempId: e.tempId,
      evidenceKind: e.evidenceKind,
      ...(e.title ? { title: e.title } : {}),
      ...(e.uri ? { uri: e.uri } : {}),
    })),
    edges: llm.edges,
  });
}
