# Acta — Extract prompt spec (U4-D)

Last updated: 2026-08-13

**Owns:** prompt content, graph-context injection, and output rules for the Extract agent. Code lives in [`src/server/agents/extract/extract-prompt.ts`](../src/server/agents/extract/extract-prompt.ts). Emit shape: [`src/lib/contracts/extract.ts`](../src/lib/contracts/extract.ts). Write policy: [`agent-interaction-model.md`](agent-interaction-model.md). Kind profiles: [`data-model.md`](data-model.md) § Kind suggestion profiles.

**Use when:** changing Extract behavior, reviewing add-vs-update logic, or tuning kind-first extraction.

---

## Extract vs adapters (locked for v1)

| Agent | Job | Does not do |
| --- | --- | --- |
| **Extract** | Structure capture text into graph entities (kinds, nesting, skills, achievements, edges) | Application tags, resume wording, JD relevance, artifact drafts |
| **Adapters** | Generate grounded artifacts (resume, interview answer, …) from committed graph | Invent new graph structure from whole cloth |

**Application tags** (`internship_resume`, `portfolio`, etc.) are **out of Extract** for v1. Leave `applicationTags` empty on proposals. Tagging and relevance belong to adapters and a later tagging pass if needed. See [`personal-evidence-graph.md`](personal-evidence-graph.md) (intake tags remain **proposed**, not Extract scope).

**Not in this prompt:** GTM wedge, user demographics, or output-audience guessing.

---

## Job

Turn one **Capture** (immutable yap text) into an **ExtractProposal**: proposed endeavors (canvas nodes), bundled achievements/skills/people/orgs/metrics/evidence, and edges. Proposal only. Nothing writes to the live graph until the user accepts in diff-skim.

Extract is **graph-context-aware**: when the yap clearly extends something already on the graph, prefer **update** over duplicating a node with the same title and kind.

---

## Design principle: kind-first, structure-only

| Do | Don't |
| --- | --- |
| Infer the best **Endeavor kind** from what the capture describes | Suggest application tags or adapter-facing relevance |
| Use **kind suggestion profiles** (data-model) for likely children, skills, evidence | Add conversational prose around the JSON |
| Allow sparse graphs (one hobby node, one creative_work, no metrics) | Force role + project + achievement on every yap |

**Container vs deliverable (v1 steer):** Deliverable-shaped work inside an existing container endeavor (`role`, `course`, `education`, `leadership`, `event`, and similar) → **add** a nested `project` under that container; container-only yaps (status, affiliation, or what you learned today without a discrete assignment) → **update** the container. Same pattern for an internship task and for a class project vs a lecture takeaway.

---

## Output format (locked)

**Production (Acta code):** Vercel AI SDK `generateObject` with Zod schema + OpenAI structured output. The API returns parsed JSON only; no markdown wrapper.

**Prompt rule (also for manual playground tests):** The model must emit **only** a single JSON object matching `ExtractProposal`. Nothing else.

Forbidden in the model response:

- Preamble ("Here's a proposed structure…")
- Postamble ("Let me know if you'd like adjustments…")
- Markdown code fences (` ```json `)
- Commentary, bullet summaries, or questions to the user

If using OpenAI Playground for prompt iteration: enable **JSON schema / structured output** (or Responses API with `text.format.type: json_schema`), not default chat. Chat mode will add conversational wrapping even with a strict system prompt.

---

## Inputs

| Input | Source | Notes |
| --- | --- | --- |
| Capture text | `captures.text` | Only ground truth for what happened in this yap |
| Existing endeavors | lean graph read | `id`, `kind`, `title`, optional `summary`, `primaryParentId` |
| Existing skills / orgs (optional v1) | same read | Names + ids for dedup hints |

---

## Post-processing (code, not LLM)

- Build **`merge_units[]`** from each proposed endeavor
- Build **`pending_endeavor_previews[]`** for canvas ghosts
- Append **`sourced_from_capture`** edges at persist time
- **`applicationTags`:** always empty from Extract; never prompt for them

---

## Prompt architecture

1. **System:** role, grounding, kind catalog, nesting, add-vs-update, **JSON-only output rule**, tempId/edge conventions.
2. **User:** capture text + existing-graph JSON block + one-line instruction to return JSON only.

**Model:** `gpt-4o-mini-2024-07-18`

**Temperature:** `0`

---

## System prompt (draft v3)

```text
You are the Extract agent for Acta, a personal evidence graph. Users capture anything about their life (work, school, creative work, volunteering, hobbies, relationships, wins, lessons). Your job is to structure one capture into proposed graph entities. You do not write to the live graph; the user confirms first. You do not suggest application tags, resume bullets, or adapter output. Adapters are separate agents.

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
- If unsure, prefer a new node.

tempId conventions: short stable ids (ende_role_1, ende_proj_1, ach_1, skill_redis, org_acme).
```

---

## User message template (draft v3)

```text
## Capture

{captureText}

## Existing graph (for dedup / update hints)

{graphContextJson}

Return only the ExtractProposal JSON object. No other text.
```

---

## Schema extension for add vs update (proposed)

Optional on each endeavor proposal:

```typescript
updateTargetEndeavorId: z.uuid().optional()
existingParentEndeavorId: z.uuid().optional()
```

`existingParentEndeavorId` links a **new** nested endeavor to an existing graph parent (e.g. project under an existing role).

---

## Expected outputs (examples)

### Internship yap (manual test)

**Capture:** `today at my internship for abode money i basically rearchitected the LCM communication layer in our backend which fires to customer io. worked with noah to test payloads and event firings on status conditions as well as timing based things`

| Entity | Expect |
| --- | --- |
| Endeavor `role` or existing role **update** | Internship at Abode Money (if graph empty: new role) |
| Endeavor `project` | LCM communication layer rearchitecture (nested under role) |
| Org | Abode Money |
| Person | Noah (`involved_person`) |
| Skills | backend, Customer.io / integrations, event-driven messaging (as stated) |
| Achievement | rearchitecture + testing payloads/event firings |
| Metric | none (no numbers in yap) |
| applicationTags | **none** (empty) |

### Course yap

**Capture:** `In CS229 today we covered transformers; still wrapping my head on attention.`

| Entity | Expect |
| --- | --- |
| Endeavor `course` | **update** CS229 (learning takeaway, no discrete assignment) |
| Endeavor `project` | none |

**Capture:** `Finished the CS229 final project on sentiment classification with BERT.`

| Entity | Expect |
| --- | --- |
| Endeavor `course` | existing CS229 (link, do not duplicate) |
| Endeavor `project` | **add** nested under course |

### Creative yap (data-model B)

**Capture:** `Finished three paintings for the spring show at Grove Gallery.`

`creative_work`, achievement, craft skill. No role. No tags.

---

## Open decisions

| # | Question | Status |
| --- | --- | --- |
| 1 | Application tags in Extract? | **No** — adapters / later pass |
| 2 | Few-shot in prompt? | Zero-shot first |
| 3 | `updateTargetEndeavorId` / `existingParentEndeavorId`? | **Implemented** in contracts + prompts |
| 4 | Timeframes in v1? | Defer unless capture states dates |
| 5 | Empty extract? | Zero endeavors + zero achievements → `failed` / `empty` |

---

## Changelog

- **2026-08-13:** U4-D wired: `existingParentEndeavorId` for nested projects under existing containers; schema fields implemented in code.
- **2026-08-13:** v3.1: container vs deliverable steer (role, course, etc.); course examples.
- **2026-08-13:** v3: no application tags in Extract; JSON-only output rule; playground structured-output note.
- **2026-08-13:** v2: kind-first, removed wedge framing.
- **2026-08-13:** v1 (superseded).
