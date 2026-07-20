/**
 * @fileoverview Shared primitive schemas for the Acta graph contracts —
 * entity lifecycle status, fuzzy timeframes, and the closed set of entity
 * types. Imported by every other contract module so FE and BE agree on the
 * lowest-level shapes. Owned conceptually by docs/data-model.md.
 */

import { z } from "zod";

/** Lifecycle state of any stored entity (user-facing soft states, not hard delete). */
export const EntityStatus = z.enum(["active", "demoted", "archived"]);
export type EntityStatus = z.infer<typeof EntityStatus>;

/**
 * A fuzzy, partially-known time span (year required, month/day optional; end
 * may be the literal "ongoing"). Models real-life dates that are often
 * imprecise ("summer 2024", "2023–present").
 */
export const Timeframe = z.object({
  start: z
    .object({
      year: z.number().int(),
      month: z.number().int().min(1).max(12).optional(),
      day: z.number().int().min(1).max(31).optional(),
    })
    .optional(),
  end: z
    .union([
      z.object({
        year: z.number().int(),
        month: z.number().int().min(1).max(12).optional(),
        day: z.number().int().min(1).max(31).optional(),
      }),
      z.literal("ongoing"),
    ])
    .optional(),
  label: z.string().optional(),
});
export type Timeframe = z.infer<typeof Timeframe>;

/** Closed set of node/entity types in the graph; used to type edge endpoints. */
export const EntityType = z.enum([
  "capture",
  "endeavor",
  "achievement",
  "skill",
  "person",
  "org",
  "metric",
  "evidence",
  "story",
  "lesson",
]);
export type EntityType = z.infer<typeof EntityType>;
