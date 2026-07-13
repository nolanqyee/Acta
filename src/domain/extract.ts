import { z } from "zod";
import { EndeavorKind } from "./entities";
import { SkillKind, EvidenceKind } from "./entities";
import { ApplicationTag } from "./tags";
import { EdgeType } from "./edges";
import { EntityType } from "./common";

/** LLM / import extract proposal — validated before diff-skim merge */
export const ExtractProposal = z.object({
  endeavors: z
    .array(
      z.object({
        tempId: z.string(),
        kind: EndeavorKind,
        title: z.string().min(1),
        summary: z.string().optional(),
        ext: z.record(z.string(), z.unknown()).optional(),
        applicationTags: z.array(ApplicationTag).optional(),
        primaryParentTempId: z.string().optional(),
      }),
    )
    .default([]),
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
  edges: z
    .array(
      z.object({
        type: EdgeType,
        fromTempId: z.string(),
        fromType: EntityType,
        toTempId: z.string(),
        toType: EntityType,
        attrs: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .default([]),
});
export type ExtractProposal = z.infer<typeof ExtractProposal>;
