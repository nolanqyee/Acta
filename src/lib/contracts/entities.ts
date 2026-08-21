/**
 * @fileoverview Entity schemas — the stored nodes of the Acta graph. Endeavors
 * are the spine (the only entities drawn on the canvas); Captures are immutable
 * intake; Skills/People/Orgs/Metrics/Evidence are primary children; Stories and
 * Lessons are agent-synthesized, stamp-tracked secondaries. Owned by
 * docs/data-model.md; canvas-rendering rules live in docs/surfaces-and-flows.md.
 */

import { z } from "zod";
import { EntityStatus, Timeframe } from "./common";
import { ApplicationTag } from "./tags";

/** The kinds an Endeavor can take; drives suggestions + theming, not a second graph. */
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

/**
 * An Endeavor — the durable unit of "something you did" and the only entity
 * rendered as a canvas node. Nesting is expressed via `primaryParentId`
 * (e.g. a project `part_of` a role) rather than multi-kind nodes.
 */
export const Endeavor = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  kind: EndeavorKind,
  title: z.string().min(1),
  summary: z.string().optional(),
  timeframe: Timeframe.optional(),
  status: EntityStatus.default("active"),
  applicationTags: z.array(ApplicationTag).default([]),
  primaryParentId: z.uuid().nullable().optional(),
  ext: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Endeavor = z.infer<typeof Endeavor>;

/** How a Capture entered the system (typed yap vs an import source). */
export const CaptureSourceType = z.enum([
  "typed",
  "resume_import",
  "linkedin_import",
  "github_import",
  "other_import",
]);
export type CaptureSourceType = z.infer<typeof CaptureSourceType>;

/**
 * A Capture — immutable raw intake text (and optional source metadata) that the
 * Extract agent reads. Never a competing source of truth; kept for provenance
 * and re-extract.
 */
export const Capture = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  text: z.string().min(1),
  sourceType: CaptureSourceType,
  sourceMeta: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.iso.datetime(),
});
export type Capture = z.infer<typeof Capture>;

/** Coarse category of a Skill, used for grouping and extract priors. */
export const SkillKind = z.enum(["tech", "craft", "soft", "domain"]);
export type SkillKind = z.infer<typeof SkillKind>;

/** A Skill/technology/competency; deduped by name + aliases, not a canvas node. */
export const Skill = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string().min(1),
  skillKind: SkillKind,
  aliases: z.array(z.string()).optional(),
  status: EntityStatus.default("active"),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Skill = z.infer<typeof Skill>;

/** A concrete accomplishment statement attached to one or more endeavors. */
export const Achievement = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  statement: z.string().min(1),
  detail: z.string().optional(),
  timeframe: Timeframe.optional(),
  status: EntityStatus.default("active"),
  applicationTags: z.array(ApplicationTag).default([]),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Achievement = z.infer<typeof Achievement>;

/** A person connected to an endeavor (teammate, manager, collaborator). */
export const Person = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string().min(1),
  notes: z.string().optional(),
  status: EntityStatus.default("active"),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Person = z.infer<typeof Person>;

/** Coarse category of an Org (company, school, club, …). */
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
export type OrgKind = z.infer<typeof OrgKind>;

/** An organization context (company/school/…); attached to endeavors via `at_org`. */
export const Org = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string().min(1),
  orgKind: OrgKind.optional(),
  url: z.url().optional(),
  status: EntityStatus.default("active"),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Org = z.infer<typeof Org>;

/** A quantified result/evidence value (e.g. "~60% latency reduction"). */
export const Metric = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  label: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  direction: z.enum(["up", "down", "neutral"]).optional(),
  context: z.string().optional(),
  status: EntityStatus.default("active"),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Metric = z.infer<typeof Metric>;

/** Kind of supporting artifact backing an endeavor/achievement. */
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
export type EvidenceKind = z.infer<typeof EvidenceKind>;

/** A pointer to a supporting artifact (link, file, PR, doc, media). */
export const Evidence = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  evidenceKind: EvidenceKind,
  title: z.string().optional(),
  uri: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  status: EntityStatus.default("active"),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Evidence = z.infer<typeof Evidence>;

/** Lifecycle of an agent-synthesized secondary (Story/Lesson): draft → stamped, or stale. */
export const SynthesisStatus = z.enum(["draft", "stamped", "stale"]);
export type SynthesisStatus = z.infer<typeof SynthesisStatus>;

/**
 * A Story — agent-synthesized STAR-style narrative drawn from a subgraph.
 * Regenerable but hybrid-stamped: once the user stamps/edits it, their version
 * wins and re-extract may only mark it `stale`, never clobber it.
 */
export const Story = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  title: z.string().min(1),
  situation: z.string().optional(),
  task: z.string().optional(),
  action: z.string().optional(),
  result: z.string().optional(),
  body: z.string().optional(),
  synthesisStatus: SynthesisStatus.default("draft"),
  sourcedFromEntityIds: z.array(z.uuid()).default([]),
  sourceFingerprint: z.string().optional(),
  applicationTags: z.array(ApplicationTag).default([]),
  status: EntityStatus.default("active"),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Story = z.infer<typeof Story>;

/**
 * A Lesson — agent-synthesized "what happened / what I learned" reflection.
 * Same stamp lifecycle as Story (user edits win over regeneration).
 */
export const Lesson = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  title: z.string().min(1),
  whatHappened: z.string().optional(),
  whatLearned: z.string().optional(),
  synthesisStatus: SynthesisStatus.default("draft"),
  sourcedFromEntityIds: z.array(z.uuid()).default([]),
  sourceFingerprint: z.string().optional(),
  applicationTags: z.array(ApplicationTag).default([]),
  status: EntityStatus.default("active"),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});
export type Lesson = z.infer<typeof Lesson>;
