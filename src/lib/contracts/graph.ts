/**
 * @fileoverview Canvas projection contracts — the shape `GET /api/graph` returns
 * and the force canvas renders. This is deliberately *not* the storage schema: it
 * is the Endeavors-only projection the Graph home canvas needs (per
 * docs/surfaces-and-flows.md, Skills/People/Orgs are stored entities but never
 * physics nodes, so they arrive flattened onto each node as `facets` for hover
 * cards and the filter menu). Pure Zod, no secrets — safe on both sides of the
 * server/client split.
 */

import { z } from "zod";
import { EntityStatus, Timeframe } from "./common";
import { EndeavorKind } from "./entities";
import { ApplicationTag } from "./tags";

/**
 * Whether a canvas node is part of the committed graph or an unconfirmed extract
 * proposal ghost. U3 only ever emits `committed`; `pending` exists so U4 can
 * stream proposal nodes onto the same canvas without a contract change.
 */
export const CanvasNodeState = z.enum(["committed", "pending"]);
export type CanvasNodeState = z.infer<typeof CanvasNodeState>;

/**
 * The non-canvas entities related to one endeavor, flattened to display names.
 * Powers kind-rich hover cards and the filter menu's facet-value lists without
 * drawing skills/people/orgs as nodes.
 */
export const GraphNodeFacets = z.object({
  skills: z.array(z.string()).default([]),
  people: z.array(z.string()).default([]),
  orgs: z.array(z.string()).default([]),
});
export type GraphNodeFacets = z.infer<typeof GraphNodeFacets>;

/** One Endeavor as drawn on the canvas, plus the context its hover card shows. */
export const GraphNode = z.object({
  id: z.uuid(),
  kind: EndeavorKind,
  title: z.string().min(1),
  summary: z.string().optional(),
  timeframe: Timeframe.optional(),
  status: EntityStatus.default("active"),
  applicationTags: z.array(ApplicationTag).default([]),
  primaryParentId: z.uuid().nullable().default(null),
  facets: GraphNodeFacets,
  state: CanvasNodeState.default("committed"),
});
export type GraphNode = z.infer<typeof GraphNode>;

/**
 * Why two endeavors are connected on the plane. `part_of`/`related_to` are stored
 * edges; the `shared_*` relations are *derived* — endeavors that share a skill,
 * person, or org (see docs/graph-canvas.md, "edges = relationships between
 * endeavors (shared skill/person/org/time, or explicit links)").
 */
export const GraphLinkRelation = z.enum([
  "part_of",
  "related_to",
  "shared_skill",
  "shared_person",
  "shared_org",
]);
export type GraphLinkRelation = z.infer<typeof GraphLinkRelation>;

/**
 * Spring emphasis per relation (0–1): containment binds hardest, a coincidental
 * shared skill least. Shared by the server projection and the canvas so a link's
 * pull is one decision, not two.
 */
export const GRAPH_LINK_WEIGHT: Record<GraphLinkRelation, number> = {
  part_of: 1,
  related_to: 0.7,
  shared_org: 0.5,
  shared_person: 0.4,
  shared_skill: 0.3,
};

/**
 * An undirected line between two canvas nodes. `weight` (0–1) is the spring
 * emphasis: containment pulls harder than a coincidental shared skill, which is
 * what makes clusters read as clusters.
 */
export const GraphLink = z.object({
  id: z.string().min(1),
  source: z.uuid(),
  target: z.uuid(),
  relation: GraphLinkRelation,
  weight: z.number().min(0).max(1),
});
export type GraphLink = z.infer<typeof GraphLink>;

/** Everything the canvas needs for one paint of a user's graph. */
export const GraphSnapshot = z.object({
  nodes: z.array(GraphNode),
  links: z.array(GraphLink),
  generatedAt: z.iso.datetime(),
});
export type GraphSnapshot = z.infer<typeof GraphSnapshot>;
