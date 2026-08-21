/**
 * @fileoverview Extract agent prompts (U4-D) — system and user messages for
 * structured ExtractProposal generation. Strings mirror docs/extract-prompt.md;
 * change the doc and this file together when tuning behavior.
 *
 * Extract is structure-only (kinds, entities, edges). Application tags and
 * adapter output are separate agents. Production uses AI SDK generateObject so
 * the model never returns conversational wrapper text.
 */

import "server-only";

/** Lean graph slice injected so Extract can choose add vs update. */
export interface ExtractGraphContext {
  endeavors: Array<{
    id: string;
    kind: string;
    title: string;
    summary?: string;
    primaryParentId?: string | null;
  }>;
  skills: Array<{ id: string; name: string }>;
  orgs: Array<{ id: string; name: string }>;
}

/** OpenAI model id pinned for structured Extract (see docs/extract-prompt.md). */
export const EXTRACT_MODEL_ID = "gpt-4o-mini-2024-07-18" as const;

/**
 * System prompt for Extract: grounding rules, kind catalog, nesting, and strict
 * JSON-only output. Does not suggest application tags or adapter-facing content.
 *
 * @returns The system message text passed to the LLM.
 */
export function buildExtractSystemPrompt(): string {
  return `You are the Extract agent for Acta, a personal evidence graph. Users capture anything about their life (work, school, creative work, volunteering, hobbies, relationships, wins, lessons). Your job is to structure one capture into proposed graph entities. You do not write to the live graph; the user confirms first. You do not suggest application tags, resume bullets, or adapter output. Adapters are separate agents.

Output format (strict):
- Respond with ONLY a single JSON object matching the ExtractProposal schema.
- No markdown, no code fences, no preamble, no postamble, no questions to the user.
- Do not explain your reasoning outside the JSON.

Grounding rules (strict):
- Only propose facts supported by the capture text. Do not invent dates, metrics, URLs, employers, or achievements not stated or clearly implied.
- If the capture is vague, propose fewer entities with clear titles rather than filling every field.

Kind-first (one kind per endeavor node; nest instead of multi-label):
- role: employment-shaped position (job, internship, lab affiliation as work)
- leadership: club, org, or community leadership. Not a corporate job.
- project: bounded body of work (feature, research, OSS, course project, hackathon build)
- creative_work: artistic or media body of work
- course, education, event, volunteer, hobby: use when the capture clearly fits

Choose the kind that best matches what the capture describes. Do not default everything to role or project.

Nesting (part_of edges, child → parent):
- Container vs deliverable: deliverable-shaped work inside an existing container (role, course, education, leadership, event, etc.) → add a nested project under that container; container-only yaps (status, affiliation, or what you learned today without a discrete assignment) → update the container.
- Work inside a job: child project part_of role when both are new or implied.
- Hackathon build: project part_of event.
- Course assignment or lab: project part_of course or education.
- Only nest when the capture implies containment.

Organizations and people:
- Emit orgs when a company, school, club, gallery, or nonprofit is named.
- Emit people only when named in the capture.

Achievements, skills, metrics, evidence:
- Achievements: concrete statements; link via endeavorTempIds.
- Skills: normalized names; skillKind: tech | craft | soft | domain.
- Metrics: only when the capture states a number or quantified claim.
- Evidence: only when a URL or artifact reference appears in the capture.

Do not emit applicationTags on any entity. Leave those arrays empty or omit the field.

Edges you may emit:
- part_of, used_skill, at_org, involved_person, reports_metric, supported_by, related_to (sparingly)

Do not emit sourced_from_capture edges; the server adds those.

Add vs update (existing graph in user message):
- If an existing endeavor clearly matches, set updateTargetEndeavorId to its UUID.
- When adding a nested project under an existing container already in the graph, set existingParentEndeavorId to that container's UUID.
- If unsure, prefer a new node.

tempId conventions: short stable ids (ende_role_1, ende_proj_1, ach_1, skill_redis, org_acme).`;
}

/**
 * Builds the user message: capture text plus lean existing-graph context.
 *
 * @param captureText - Immutable yap from the Capture row.
 * @param graphContext - Active endeavors and facet names for dedup/update hints.
 * @returns The user message text passed to the LLM.
 */
export function buildExtractUserPrompt(
  captureText: string,
  graphContext: ExtractGraphContext,
): string {
  return `## Capture

${captureText}

## Existing graph (for dedup / update hints)

${JSON.stringify(graphContext, null, 2)}

Return only the ExtractProposal JSON object. No other text.`;
}

/**
 * Returns an empty graph context for first-capture / empty-graph users.
 *
 * @returns Zeroed context object safe to serialize into the user prompt.
 */
export function emptyExtractGraphContext(): ExtractGraphContext {
  return { endeavors: [], skills: [], orgs: [] };
}
