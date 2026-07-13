import { z } from "zod";
import { EntityStatus, Timeframe } from "./common";
import { ApplicationTag } from "./tags";

export const EndeavorKind = z.enum([
  "role",
  "leadership",
  "project",
  "creative_work",
  "course",
  "education",
  "event",
  "volunteer",
  "hobby",
]);
export type EndeavorKind = z.infer<typeof EndeavorKind>;

export const Endeavor = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  kind: EndeavorKind,
  title: z.string().min(1),
  summary: z.string().optional(),
  timeframe: Timeframe.optional(),
  status: EntityStatus.default("active"),
  applicationTags: z.array(ApplicationTag).default([]),
  primaryParentId: z.string().uuid().nullable().optional(),
  ext: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Endeavor = z.infer<typeof Endeavor>;

export const CaptureSourceType = z.enum([
  "typed",
  "resume_import",
  "linkedin_import",
  "github_import",
  "other_import",
]);

export const Capture = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  text: z.string().min(1),
  sourceType: CaptureSourceType,
  sourceMeta: z.record(z.string(), z.unknown()).optional(),
  capturedAt: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
});
export type Capture = z.infer<typeof Capture>;

export const SkillKind = z.enum(["tech", "craft", "soft", "domain"]);

export const Skill = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  skillKind: SkillKind,
  aliases: z.array(z.string()).optional(),
  status: EntityStatus.default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Skill = z.infer<typeof Skill>;

export const Achievement = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  statement: z.string().min(1),
  detail: z.string().optional(),
  timeframe: Timeframe.optional(),
  status: EntityStatus.default("active"),
  applicationTags: z.array(ApplicationTag).default([]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Achievement = z.infer<typeof Achievement>;

export const Person = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  notes: z.string().optional(),
  status: EntityStatus.default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Person = z.infer<typeof Person>;

export const OrgKind = z.enum([
  "company",
  "school",
  "club",
  "lab",
  "nonprofit",
  "gallery",
  "label",
  "other",
]);

export const Org = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  orgKind: OrgKind.optional(),
  url: z.string().url().optional(),
  status: EntityStatus.default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Org = z.infer<typeof Org>;

export const Metric = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  direction: z.enum(["up", "down", "neutral"]).optional(),
  context: z.string().optional(),
  status: EntityStatus.default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Metric = z.infer<typeof Metric>;

export const EvidenceKind = z.enum([
  "commit",
  "pr",
  "doc",
  "url",
  "image",
  "audio",
  "video",
  "portfolio_file",
  "other",
]);

export const Evidence = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  evidenceKind: EvidenceKind,
  title: z.string().optional(),
  uri: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  status: EntityStatus.default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Evidence = z.infer<typeof Evidence>;

export const SynthesisStatus = z.enum(["draft", "stamped", "stale"]);

export const Story = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1),
  situation: z.string().optional(),
  task: z.string().optional(),
  action: z.string().optional(),
  result: z.string().optional(),
  body: z.string().optional(),
  synthesisStatus: SynthesisStatus.default("draft"),
  sourcedFromEntityIds: z.array(z.string().uuid()).default([]),
  sourceFingerprint: z.string().optional(),
  applicationTags: z.array(ApplicationTag).default([]),
  status: EntityStatus.default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Story = z.infer<typeof Story>;

export const Lesson = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1),
  whatHappened: z.string().optional(),
  whatLearned: z.string().optional(),
  synthesisStatus: SynthesisStatus.default("draft"),
  sourcedFromEntityIds: z.array(z.string().uuid()).default([]),
  sourceFingerprint: z.string().optional(),
  applicationTags: z.array(ApplicationTag).default([]),
  status: EntityStatus.default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Lesson = z.infer<typeof Lesson>;
