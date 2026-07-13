import { z } from "zod";
import { EntityType } from "./common";

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

export const Edge = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: EdgeType,
  fromType: EntityType,
  fromId: z.string().uuid(),
  toType: EntityType,
  toId: z.string().uuid(),
  attrs: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime().optional(),
});
export type Edge = z.infer<typeof Edge>;
