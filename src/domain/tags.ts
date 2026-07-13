import { z } from "zod";

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

export const ApplicationTag = z.object({
  tag: ApplicationTagName,
  source: z.enum(["llm", "user"]),
  confidence: z.number().min(0).max(1).optional(),
  overridden: z.boolean().default(false),
});
export type ApplicationTag = z.infer<typeof ApplicationTag>;
