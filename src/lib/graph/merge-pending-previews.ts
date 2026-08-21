/**
 * @fileoverview Merges open-proposal pending endeavor previews into a committed
 * {@link GraphSnapshot} for canvas rendering (U4-F).
 */

import {
  GRAPH_LINK_WEIGHT,
  type GraphLink,
  type GraphNode,
  type GraphSnapshot,
} from "@/lib/contracts";
import type { ProposalSnapshot } from "@/lib/contracts/proposal";
import { pendingGhostNodeId } from "./pending-ghost-id";

/**
 * Appends pending endeavor ghosts and `part_of` links onto a committed snapshot.
 *
 * @param snapshot - Committed graph from `GET /api/graph`.
 * @param proposal - Open proposal with `pendingEndeavorPreviews`.
 * @returns Combined snapshot; unchanged when there are no pending previews.
 */
export function mergePendingPreviewsIntoSnapshot(
  snapshot: GraphSnapshot,
  proposal: ProposalSnapshot,
): GraphSnapshot {
  const pendingPreviews = proposal.pendingEndeavorPreviews.filter(
    (preview) => preview.disposition === "pending",
  );

  if (pendingPreviews.length === 0) {
    return snapshot;
  }

  const committedIds = new Set(snapshot.nodes.map((node) => node.id));
  const tempToNodeId = new Map<string, string>();

  for (const preview of pendingPreviews) {
    tempToNodeId.set(
      preview.tempId,
      pendingGhostNodeId(proposal.id, preview.tempId),
    );
  }

  const pendingNodes: GraphNode[] = pendingPreviews.map((preview) => ({
    id: tempToNodeId.get(preview.tempId)!,
    kind: preview.kind,
    title: preview.title,
    summary: preview.summary,
    status: "active",
    applicationTags: [],
    primaryParentId: preview.existingParentEndeavorId ?? null,
    facets: { skills: [], people: [], orgs: [] },
    state: "pending",
  }));

  const pendingLinks: GraphLink[] = [];

  for (const preview of pendingPreviews) {
    const childId = tempToNodeId.get(preview.tempId)!;
    let parentId: string | null = null;

    if (
      preview.existingParentEndeavorId &&
      committedIds.has(preview.existingParentEndeavorId)
    ) {
      parentId = preview.existingParentEndeavorId;
    } else if (
      preview.primaryParentTempId &&
      tempToNodeId.has(preview.primaryParentTempId)
    ) {
      parentId = tempToNodeId.get(preview.primaryParentTempId)!;
    }

    if (parentId && parentId !== childId) {
      pendingLinks.push({
        id: `pending:${proposal.id}:${preview.tempId}:part_of`,
        source: childId,
        target: parentId,
        relation: "part_of",
        weight: GRAPH_LINK_WEIGHT.part_of,
      });
    }
  }

  return {
    ...snapshot,
    nodes: [...snapshot.nodes, ...pendingNodes],
    links: [...snapshot.links, ...pendingLinks],
  };
}
