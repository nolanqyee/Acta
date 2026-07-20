/**
 * @fileoverview Edge schemas — the typed relationships between graph entities
 * (containment, skill/person/org links, provenance back to captures). Edges are
 * the connective tissue the force canvas and adapters traverse. Owned by
 * docs/data-model.md.
 */

import { z } from "zod";
import { EntityType } from "./common";

/** Closed set of relationship types allowed between entities. */
export const EdgeType = z.enum([
  "part_of",
  "used_skill",
  "involved_person",
  "at_org",
  "reports_metric",
  "supported_by",
  "sourced_from_capture",
  "about",
  "derived_from",
  "related_to",
]);
export type EdgeType = z.infer<typeof EdgeType>;

/**
 * A stored, directed relationship between two entities, typed on both ends so
 * the endpoints can be validated (e.g. a `part_of` edge from endeavor→endeavor).
 */
export const Edge = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  type: EdgeType,
  fromType: EntityType,
  fromId: z.uuid(),
  toType: EntityType,
  toId: z.uuid(),
  attrs: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.iso.datetime().optional(),
});
export type Edge = z.infer<typeof Edge>;
