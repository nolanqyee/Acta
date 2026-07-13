import { z } from "zod";

export const EntityStatus = z.enum(["active", "demoted", "archived"]);
export type EntityStatus = z.infer<typeof EntityStatus>;

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
