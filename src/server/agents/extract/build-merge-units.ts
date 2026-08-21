/**
 * @fileoverview Post-processing for Extract output (U4-D) — derives merge_units
 * and pending_endeavor_previews from a validated ExtractProposal. Disposition
 * starts as pending; U5 accept/discard mutates merge_units.
 */

import "server-only";

import type { ExtractProposal } from "@/lib/contracts/extract";
import {
  MergeUnit,
  PendingEndeavorPreview,
  type MergeUnit as MergeUnitType,
  type PendingEndeavorPreview as PendingEndeavorPreviewType,
} from "@/lib/contracts/proposal";

/** Result of building merge artifacts from one Extract payload. */
export interface MergeArtifacts {
  mergeUnits: MergeUnitType[];
  pendingEndeavorPreviews: PendingEndeavorPreviewType[];
}

/**
 * Returns whether Extract produced no structurable entities.
 *
 * @param payload - Validated ExtractProposal from the LLM.
 * @returns True when every entity collection is empty.
 */
export function isEmptyExtract(payload: ExtractProposal): boolean {
  return (
    payload.endeavors.length === 0 &&
    payload.achievements.length === 0 &&
    payload.skills.length === 0 &&
    payload.people.length === 0 &&
    payload.orgs.length === 0 &&
    payload.metrics.length === 0 &&
    payload.evidence.length === 0
  );
}

/**
 * Collects temp ids bundled with one proposed endeavor merge unit.
 *
 * Achievements linked to the endeavor, non-endeavor edge endpoints, and edges
 * themselves are included. Other proposed endeavors (siblings or part_of
 * parents/children) stay separate units.
 *
 * @param payload - Full ExtractProposal.
 * @param endeavorTempId - Temp id of the merge unit's endeavor.
 * @returns Temp ids owned by this unit (includes the endeavor temp id).
 */
export function bundleTempIdsForEndeavor(
  payload: ExtractProposal,
  endeavorTempId: string,
): string[] {
  const bundled = new Set<string>([endeavorTempId]);

  for (const achievement of payload.achievements) {
    if (achievement.endeavorTempIds.includes(endeavorTempId)) {
      bundled.add(achievement.tempId);
    }
  }

  for (const edge of payload.edges) {
    const involvesEndeavor =
      edge.fromTempId === endeavorTempId || edge.toTempId === endeavorTempId;
    if (!involvesEndeavor) {
      continue;
    }

    const otherTempId =
      edge.fromTempId === endeavorTempId ? edge.toTempId : edge.fromTempId;
    const otherType =
      edge.fromTempId === endeavorTempId ? edge.toType : edge.fromType;

    if (otherType !== "endeavor") {
      bundled.add(otherTempId);
      continue;
    }

    if (edge.type === "part_of") {
      continue;
    }
  }

  return [...bundled];
}

/**
 * Resolves parent hint fields for canvas ghosts from proposal + part_of edges.
 *
 * @param payload - Full ExtractProposal.
 * @param endeavor - One proposed endeavor row.
 * @returns Parent temp id and/or existing parent UUID when inferable.
 */
function resolveParentHints(
  payload: ExtractProposal,
  endeavor: ExtractProposal["endeavors"][number],
): {
  primaryParentTempId?: string;
  existingParentEndeavorId?: string;
} {
  const hints: {
    primaryParentTempId?: string;
    existingParentEndeavorId?: string;
  } = {};

  if (endeavor.primaryParentTempId) {
    hints.primaryParentTempId = endeavor.primaryParentTempId;
  }
  if (endeavor.existingParentEndeavorId) {
    hints.existingParentEndeavorId = endeavor.existingParentEndeavorId;
  }

  for (const edge of payload.edges) {
    if (edge.type !== "part_of" || edge.fromTempId !== endeavor.tempId) {
      continue;
    }
    if (edge.toType === "endeavor") {
      hints.primaryParentTempId = edge.toTempId;
    }
  }

  return hints;
}

/**
 * Builds merge_units and pending_endeavor_previews from a validated ExtractProposal.
 *
 * @param payload - LLM output after Zod validation.
 * @returns Normalized merge artifacts for proposal persistence.
 */
export function buildMergeArtifacts(payload: ExtractProposal): MergeArtifacts {
  const mergeUnits: MergeUnitType[] = [];
  const pendingEndeavorPreviews: PendingEndeavorPreviewType[] = [];

  for (const endeavor of payload.endeavors) {
    const op = endeavor.updateTargetEndeavorId ? "update" : "add";
    const targetEndeavorId = endeavor.updateTargetEndeavorId;
    const parentHints = resolveParentHints(payload, endeavor);

    const endeavorPreview = {
      tempId: endeavor.tempId,
      kind: endeavor.kind,
      title: endeavor.title,
      ...(endeavor.summary ? { summary: endeavor.summary } : {}),
      ...parentHints,
    };

    mergeUnits.push(
      MergeUnit.parse({
        tempId: endeavor.tempId,
        op,
        ...(targetEndeavorId ? { targetEndeavorId } : {}),
        disposition: "pending",
        endeavorPreview,
        bundledTempIds: bundleTempIdsForEndeavor(payload, endeavor.tempId),
        userEditedFields: [],
      }),
    );

    pendingEndeavorPreviews.push(
      PendingEndeavorPreview.parse({
        ...endeavorPreview,
        op,
        ...(targetEndeavorId ? { targetEndeavorId } : {}),
        disposition: "pending",
      }),
    );
  }

  return { mergeUnits, pendingEndeavorPreviews };
}
