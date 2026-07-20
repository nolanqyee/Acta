/**
 * @fileoverview Application-tag schemas — the audience/output facets ("this is
 * resume-worthy", "keep personal") that can be attached to endeavors,
 * achievements, and stories. Tags carry provenance (llm vs user) so user
 * overrides win over model suggestions. Owned by docs/data-model.md.
 */

import { z } from "zod";

/** Closed set of audience/output facets an entity can be tagged for. */
export const ApplicationTagName = z.enum([
  "internship_resume",
  "interview_story",
  "app_question",
  "linkedin",
  "personal_site",
  "portfolio",
  "keep_personal",
]);
export type ApplicationTagName = z.infer<typeof ApplicationTagName>;

/**
 * A single application tag with provenance: whether it came from the LLM or the
 * user, optional model confidence, and whether the user has overridden it
 * (override wins per the agent write policy).
 */
export const ApplicationTag = z.object({
  tag: ApplicationTagName,
  source: z.enum(["llm", "user"]),
  confidence: z.number().min(0).max(1).optional(),
  overridden: z.boolean().default(false),
});
export type ApplicationTag = z.infer<typeof ApplicationTag>;
