# Stilva — Agent / System Interaction Model

Last updated: 2026-07-13

**Owns:** capture **pipeline** vs reasoning **agents**; read vs write; confirm vs auto; pending proposals; what must not be invented; how proposals become graph state.

Companions: [`data-model.md`](data-model.md) (schema, extract emit, stamp rules), [`surfaces-and-flows.md`](surfaces-and-flows.md) (chrome + flows), [`building-plan.md`](building-plan.md) (roadmap **U-D**), [`personal-evidence-graph.md`](personal-evidence-graph.md) (product).

Status: **v1 locked** for implementation planning (building-plan **U-D**). Not prompt text or HTTP API design.

---

## Principles

1. **Graph is source of truth.** Agents read entities + edges. Captures are intake + provenance, not a parallel truth DB.
2. **No silent graph writes for structure.** Creating/updating Endeavors, Achievements, Skills, People, Orgs, Metrics, Evidence, or edges from extraction requires **user confirm** (diff-skim). Exception: the **Capture** pipeline stage may auto-save immutable intake text — that is not an agent write to the life graph.
3. **Pending ≠ committed.** Extract proposals exist as a **Proposal** until confirm/discard. Canvas may show **pending** endeavor ghosts; they are not canonical until merge.
4. **User edits win.** After merge, user field edits are canonical. Re-extract must not clobber stamped Stories/Lessons; may mark `stale`.
5. **Must not invent facts.** Explore and adapters cite graph (or clearly mark synthesis as draft from subgraph). No unsupported claims in grounded drafts. **Not** claim-policing soft metrics the user entered — if it’s in the graph (user-confirmed or user-typed), agents may use it; we don’t build a “is this number real?” guard. We also don’t coach users to fabricate metrics.
6. **Guideline-first.** Kind profiles bias extract/deepen suggestions; users may attach atypical evidence — agents must allow, not hard-reject.
7. **Never hard-gate Generate on deepen.** Soft **Deepen backlog** (pull queue) + skippable JIT only — not a notification center.
8. **Canvas rendering ≠ schema.** Agents may return Skill/Person/Org hits; Graph UI draws **Endeavors only** (see surfaces).

---

## Capture pipeline (not an agent)

Intake is **plumbing**, not a reasoning agent. Split from Extract so “save my yap” never gets confused with “write my life graph.”

```
yap / import
    → Capture          (auto — immutable raw text / blob)
    → Extract agent    (propose structure only)
    → Diff-skim UI     (changelog + pending endeavor nodes)
    → Merge            (user confirm)  OR  Discard
```

| Stage | What it is | Writes |
| --- | --- | --- |
| **Capture** | System persist of intake | **Capture row only** (auto) |
| **Extract** | Agent — see catalog below | **Proposal only** until confirm |
| **Diff-skim** | User + UI (surfaces) | Edits stay on the proposal |
| **Merge / Discard** | User decision | Merge → canonical graph; Discard → drop proposal (Capture may remain for re-extract) |

### Capture stage contract

- **In:** yap text, import blob, connector chunk.
- **Out:** Capture row (`raw_text` / blob refs immutable).
- **Writes:** Capture only. No Endeavors, edges, or tags.

---

## Agent catalog

Reasoning / model-backed roles only. There is no “auto-organize my life” agent that writes the graph without confirm.

| Agent | Mode | Primary job | Graph writes? |
| --- | --- | --- | --- |
| **Extract** | Write-propose | Capture → ExtractProposal (entities, edges, tags) | **Proposal only** until user confirm → merge |
| **Explore** | Read-only | NL ask → ranked hits + citations; drive highlight | **None** |
| **Deepen** | Prompt-only (+ optional Story propose) | Flag thin endeavors; ask questions / suggest chips | User answers write entities; agent may `propose_story` → `draft` |
| **Story / Lesson** | Write-propose | Synthesize narrative from subgraph | Creates/updates `draft`; stamp/regenerate need user |
| **Adapter family** (resume / interview / app Q / …) | Read + artifact draft | Each type has its own draft logic; shared policy: cite graph, optional Story `draft`, artifact text is **local** unless user stamps |
| **Dedup / merge** | Write-propose | Propose skill (etc.) merges | User confirms; no silent collapse |

---

## Proposal & pending model

### ExtractProposal (logical)

Matches [`data-model.md`](data-model.md) extract emit shape: endeavors, achievements, skills, people, orgs, metrics, evidence, edges, application_tags, capture_links.

Plus UI-facing:

| Field | Notes |
| --- | --- |
| `proposal_id` | Stable for the skim session |
| `capture_ids[]` | Source captures |
| `changelog_summary` | Human skim list: adds / updates / link changes (endeavor-first) |
| `pending_endeavor_previews[]` | Enough to render canvas ghosts (temp id, kind, title, parent hints, op: add\|update) |

### Lifecycle

```
Capture saved (immutable)
    → Extract runs → ExtractProposal (pending)
    → UI: right sidebar changelog + pending endeavor nodes on canvas
    → User edits proposal inline (still pending)
    → Confirm → Merge into graph (canonical) → pending clears
    → OR Discard → proposal dropped; Capture may remain for later re-extract
```

**Merge rules**

- Write entities + edges + tags; attach `sourced_from_capture`.
- Dedup per data-model identity table; when unsure, keep distinct and surface in skim — don’t silently collapse.
- Do **not** overwrite `stamped` Stories/Lessons; fingerprint drift → `stale` nudge.
- Do **not** rewrite Capture text from entities.

**Pending canvas rules**

- Only **Endeavor** pendings appear as physics nodes (add/update ghosts).
- Skills/people/orgs in the proposal show in changelog / hover detail, not as canvas nodes.
- Hover pending node → per-node diff; sidebar changelog is the primary skim path.
- Pending nodes are not queryable as canonical for Explore/Adapters until merge.

**Pending persistence (locked):** ExtractProposals are **stored until confirm or discard** (survive refresh). Scaffold may keep them in memory; production (**U-E**) persists Proposal rows (or equivalent) per user. After merge/discard, drop or archive the proposal. Captures remain immutable either way.

**Streaming extract (locked): incremental.** As Extract emits (or the user edits/confirms pieces), **pending endeavor nodes animate in/update** and the changelog grows. Partial proposals are first-class; mid-stream dedup may refine pending ghosts (merge/replace) with animation — don’t block the UI on a complete proposal.

**Implement lean (so this isn’t heroic):**
- Emit/append pending endeavors in chunks; changelog is append-only + patch rows, not a full rewrite every token.
- Global force re-layout can be cheap/throttled; prefer local spawn + light settle over constant full physics restart.
- User confirm of a chunk (onboarding live-build) may merge that slice while other pendings stay pending — optional v1; minimum is incremental *preview*, batch confirm still OK for small yaps.
- Small yaps will often look “single-shot” simply because Extract finishes fast — same incremental path, not a second mode.

---

## Confirm vs auto matrix

| Action | Auto OK? | Confirm / UI |
| --- | --- | --- |
| Create Capture (yap/import blob) | **Yes** | — |
| Extract → propose entities/edges | Runs auto; **writes proposal only** | Diff-skim required before graph merge |
| Merge ExtractProposal | **No** | Confirm (or discard) |
| User edit entity fields in modal | **Yes** (user is actor) | — |
| Soft archive / demote / user tags | **Yes** (user) | Hard delete = confirm |
| Explore NL | **Yes** (read) | — |
| Filter chips | **Yes** (read) | — |
| Deepen prompts | **Yes** (prompts only) | User answers write graph |
| Propose Story/Lesson | Creates **`draft` only** | Stamp = user; regenerate stamped = confirm |
| Adapter draft artifact (per type) | Writes **artifact local** (+ optional Story `draft`) | User edits artifact; stamp Story separately |
| Skill merge / alias | Propose only | User confirm |
| Application tags from extract | In proposal | User can override at skim or later (`source=user` wins) |

---

## Must not invent (by agent)

| Agent | Must not |
| --- | --- |
| **Extract** | Invent endeavors/metrics not grounded in Capture (or clear import fields). Prefer kind-profile fields; may emit atypical links if source text supports them. |
| **Explore** | Invent facts or long-form essays. Return hits + short why/citation only. |
| **Deepen** | Force answers; invent achievements the user didn’t provide. May suggest chips from kind profile. |
| **Story / Lesson** | Present `draft` as user-approved. Must keep `sourced_from_entity_ids` + fingerprint. Never auto-overwrite `stamped`. |
| **Adapter** (each type) | Claim metrics/roles/stories not in graph (or not in the draft’s citations). Prefer `stamped` stories; if synthesizing, store Story as `draft` and cite. Thin graph → warn + skippable deepen — still may produce weaker grounded draft. |

---

## Per-agent contracts

### Extract

- **In:** Capture(s); existing graph for dedup hints.
- **Out:** ExtractProposal + changelog_summary + pending_endeavor_previews.
- **Writes:** Proposal store only until merge.
- **UI:** Right sidebar diff-skim (surfaces). **Incremental** pending nodes + changelog as Extract emits; user edits/confirms can animate too. Onboarding live-build uses the same path.
- **Fail:** Retry extract; user can discard and yap manually. Partial import OK.

### Explore

- **In:** NL query; optional active filter chips (intersection or sequential — product may combine).
- **Out:** Ranked hits (endeavors primary for canvas highlight; skill/person/org hits resolve to related endeavors) + citations/why snippets.
- **Writes:** None.
- **Fail:** Empty state; suggest broaden or capture. Never fabricate nodes.

### Deepen

- **In:** Endeavor id or “thin” set from **Deepen backlog** / JIT (weak summary / few achievements — project + role first).
- **Out:** Prompts + suggested evidence/field chips from kind profile; backlog rows include short why.
- **Writes:** Only via **user** answers (entity updates). Optional call to Story agent → `draft`.
- **Fail / skip:** Always skippable at Generate JIT; backlog items dismissable/snoozable — never required clearance.

### Story / Lesson

- **In:** Endeavor ids / subgraph.
- **Out:** Story or Lesson with `synthesis_status=draft`, sources + fingerprint.
- **Writes:** draft create/update; `stamped` only on user stamp; regenerate on stamped requires confirm; material primary change → `stale`, don’t clobber body.
- **Fail:** User ignores draft; OK.

### Adapter family (thin)

Not one function — a **family** of adapter agents (resume, interview stories, app question, …). Each has **its own** draft logic and I/O shape; they share a **policy** contract:

- **In (shared):** optional ask (JD/question); optional selected endeavor ids; application tags → narrow → rank (product hybrid relevance). Per-type extras allowed (e.g. resume template choice later in **U-F**).
- **Out (shared):** artifact draft + **citations** (see thin citation UX below); optional Story `draft` if narrative was synthesized.
- **Writes (shared):** Optional Story `draft` only. Artifact body is **local** to that adapter — not graph truth — until user stamps a Story or edits entities.
- **Fail (shared):** Thin graph → warn + skippable deepen; still allow weaker grounded draft.
- **Must not (shared):** Claim things not in graph / not cited. Prefer `stamped` stories when narrative is needed.

**Thin citation UX (locked for U-D — not full U-G polish):**

1. Draft text includes **inline marks** (or equivalent) tied to citation ids.
2. **Click / activate a citation** → focus the endeavor on Graph (or open Node modal if off-Graph); expandable mini-graph peek may pulse the cited node when present.
3. Contract still requires `citations[]` with entity ids in every `draft_*` response.
4. Richer “why this node” / provenance theater = building-plan **U-G** later.

Per-type agents (illustrative — names can evolve):

| Adapter | Distinct job (sketch) |
| --- | --- |
| **Resume** | Structured resume-shaped draft from tagged/ranked endeavors + achievements/metrics |
| **Interview** | Story pack / STAR-oriented drafts; heavy Story agent use |
| **App question** | Single paste-ready answer grounded in ranked subgraph for *this* question |

Do **not** collapse these into one `draft_adapter(...)` with a type switch as the SoT — shared policy, separate implementations.

### Dedup / merge

- **In:** Candidate skill (etc.) ids.
- **Out:** Merge proposal.
- **Writes:** Only after user confirm.

---

## Logical tools (implementers)

Stable names for code; not an HTTP API.

**Read**

- `list_endeavors({ kind?, tag?, status? })`
- `get_endeavor_subgraph(id)`
- `list_skills()` / `get_skill(id)` → skill + linked endeavors
- `explore_nl(query, { chip_filters? })` → hits + citations
- `list_thin_endeavors({ priority: project|role })`

**Intake / extract pipeline**

- `create_capture({ text | blob, source_type })` — pipeline stage, not an agent tool in product language
- `extract_capture(capture_ids[])` → ExtractProposal — **Extract agent**
- `update_proposal(proposal_id, patch)` — user inline fixes
- `confirm_proposal(proposal_id)` → merge
- `discard_proposal(proposal_id)`

**Write (user-gated or user-actor)**

- `upsert_entity` / `set_application_tags` — user wins on tags
- `soft_archive(entity_id)`
- `propose_story(endeavor_ids[])` / `stamp_story(id)` / `regenerate_story(id, { confirm: true })`
- `propose_skill_merge(ids[])` / `confirm_skill_merge(proposal_id)`
- `attach_evidence(entity_id, evidence)` — user or confirm path

**Adapter family** (separate entry points — not one `draft_adapter`)

- `draft_resume({ ask?, context_ids? })` → { artifact, citations[], optional story_draft_id }
- `draft_interview_pack({ ask?, context_ids? })` → { … }
- `draft_app_question({ question, context_ids? })` → { … }
- (Future adapters add their own `draft_*`; shared policy + **thin citation UX** in Adapter family contract above)

Agents **must not** expose a tool that merges extract or overwrites stamped stories without the confirm flags above.

---

## How this maps to surfaces

| Moment | Surface chrome |
| --- | --- |
| Capture → Extract → pending | Quick-add / onboarding → right sidebar changelog + pending endeavor nodes (animate in) |
| Explore | Ask bar → right sidebar + endeavor highlight |
| Deepen | **Deepen backlog** panel / node modal / skippable JIT on Generate |
| Story stamp | Node modal / Generate |
| Adapter | Left Generate sidebar → adapter page (+ expandable mini-graph peek) |

Details: [`surfaces-and-flows.md`](surfaces-and-flows.md). Schemas: [`data-model.md`](data-model.md).

---

## Adding a new agent (checklist)

1. Confirm it’s actually an **agent** (reasons over graph/text) — not a pipeline stage like Capture.
2. Name it; declare **read / write-propose / user-actor only**.
3. List **must not invent** rules.
4. If it would change Endeavors/edges from model output → **Proposal + confirm** (reuse ExtractProposal pattern or a typed sibling).
5. If it synthesizes narrative → Story/Lesson **draft** lifecycle only.
6. If it drafts an artifact → it’s a **new adapter type** with its own `draft_*` entry point; must satisfy the shared Adapter family policy (citations; graph writes only via draft Story or user edits).
7. Update this doc + data-model consumption table; don’t invent policy in chat.

---

## Open questions

- [x] Proposal persistence: **store until confirm/discard** (survive refresh); memory OK in scaffold, persisted with **U-E**
- [x] Streaming extract: **incremental** — pending nodes/changelog animate as proposals (and user decisions) land; same path for small yaps (just finishes fast). Implement lean: chunked append, throttled layout, batch confirm still OK
- [x] Adapter citation UX: **thin UX** — inline marks + click → focus endeavor / node modal (+ optional mini-graph pulse). `citations[]` ids required. Richer provenance = **U-G**

*(No open questions remaining — **U-D locked** 2026-07-13.)*

---

## Changelog

- **2026-07-13:** **U-D locked** for implementation planning.
- **2026-07-13:** Locked thin citation UX (inline + click-to-node). Open questions cleared. Building-plan units = **U-A…U-I**.
- **2026-07-13:** Locked streaming extract = **incremental** (with implement-lean notes). Locked proposal persistence = store until confirm/discard.
- **2026-07-13:** Adapters = **family** with per-type `draft_*` entry points (not one `draft_adapter` type-switch). Shared policy; separate logic.
- **2026-07-13:** Split **Capture pipeline** (plumbing) from **agents**. Capture is not an agent; pipeline = Capture → Extract → Diff-skim → Merge/Discard.
- **2026-07-13:** Status = co-design draft (not agent-locked). Clarified “must not invent” ≠ metric verification; don’t police user-entered soft numbers; don’t coach fabrication.
- **2026-07-13:** Created (building-plan **U-D**). Agents: Extract, Explore, Deepen, Story/Lesson, Adapter family, Dedup. Pending proposal + confirm matrix; must-not-invent; logical tools; add-agent checklist.
