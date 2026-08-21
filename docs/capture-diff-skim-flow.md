# Acta — Capture / diff-skim flow spec

Last updated: 2026-08-13

**Owns:** screen-by-screen behavior, storage layers, merge units, and proposal lifecycle for **Capture → Extract → diff-skim → per-node merge**. Contract altitude for IA lives in [`surfaces-and-flows.md`](surfaces-and-flows.md); write policy in [`agent-interaction-model.md`](agent-interaction-model.md); HTTP/state-machine detail in [`technical-implementation-plan.md`](technical-implementation-plan.md).

**Use when:** implementing U4/U5, designing the diff-skim panel, or reviewing whether a change belongs in Capture, Proposal, or Graph storage.

---

## Summary

1. User opens **Capture** → the **diff-skim panel** opens (chat-shaped: composer + proposal thread).
2. User submits a yap (typed now; voice later) → **Capture** row saved (immutable).
3. **Extract** auto-starts → proposal streams into the same panel + pending ghosts on canvas.
4. **Phase A (`streaming`):** preview only. No accept/discard/edit actions on merge units.
5. **Phase B (`ready`):** user may **edit** pending fields, then **accept / discard** one node, many selected, or all at once.
6. **Accept** on a node merges it and its bundled dependencies (new entities + updates to existing entities scoped to that node).
7. Unresolved nodes stay **pending** until the user decides. The user may **dismiss the panel** to view the graph and reopen later. **Capture+ stays blocked** until every node is accepted or discarded (or remainder discarded).
8. Proposal **closes** when no merge units remain pending.

---

## Primary surface: diff-skim panel (chat-shaped)

Capture is not a separate modal that disappears before skim. **One panel** on the right (Explore family, CoG shifts left):

| Zone | Role |
| --- | --- |
| **Thread / proposal list** | Capture source line, streaming changelog rows, future Extract chat turns |
| **Merge unit rows** | One row per proposed endeavor (selectable); expand for field detail |
| **Composer** | Text input at bottom (voice mic later); submits the next Capture when no open proposal |

**On Capture+ (no open proposal):** panel opens with empty thread + focused composer.

**On submit:** Capture persists; composer clears; Extract streams rows into the thread above. Ghosts appear on canvas.

**Panel dismiss (× or click away):** panel closes; **pending ghosts stay on canvas**; proposal stays open in DB. Reopen via Capture+ badge ("N pending") or top-right indicator. This is how users "step away to look at the graph" without abandoning work.

---

## Three storage layers

| Layer | What | Mutable? | Written when |
| --- | --- | --- | --- |
| **Capture** | Raw intake text (+ optional audio ref later) | **No** after create | User submits composer |
| **Proposal** | Extract draft: structured payload, merge units, per-unit disposition | Yes, until closed | Auto on Capture commit; Extract streams patches; user PATCHes fields |
| **Graph** | Committed endeavors, edges, secondary entities | Yes via normal edits | Each accept action (partial merge) |

**Rule:** Captures are intake, not a competing truth DB. The graph is source of truth only after accept.

---

## Merge unit (what one Accept action means)

**One merge unit = one proposed endeavor** on the canvas (`op: add` or `op: update`).

Each unit carries two kinds of bundled changes:

| Bundle kind | On **Accept** | On **Discard** |
| --- | --- | --- |
| **New** entities/edges linked only to this endeavor | Created in graph | Dropped from proposal (never written) |
| **Updates** to existing entities already linked (or matched by dedup) to this endeavor | Patch applied to graph | Patch dropped (graph unchanged) |

Included in the bundle:

- The endeavor row (new insert or patch)
- Achievements, skills, people, orgs, metrics, evidence **scoped to this unit**
- Edges internal to the bundle or endeavor-scoped (`part_of`, `used_skill`, etc.)
- Application tags on bundled entities

**Shared entities** referenced by multiple pending units (e.g. same skill on two proposed roles): remain in proposal until each referencing unit is accepted or discarded. First accept may create the skill; second accept links to it (dedup per data-model).

Skills/people/orgs do **not** get their own canvas nodes or separate accept buttons in v1.

---

## Review actions (Phase B only)

Available after proposal `ready`:

| Action | Scope |
| --- | --- |
| **Accept** | One merge unit |
| **Discard** | One merge unit |
| **Accept selected** | Checkbox selection on rows |
| **Discard selected** | Checkbox selection on rows |
| **Accept all** | All still-pending units in one transaction (or sequential partial merges) |
| **Discard all / Discard remaining** | All still-pending units; closes proposal |

**Manual edit (before accept):** user may PATCH fields on pending units (title, summary, kind, tags, etc.). User-touched fields are **not** overwritten by late stream patches. Edits stay on the proposal until accept.

**Phase A:** none of the above (including edit) until Extract finishes. Read and hover only.

---

## Leaving nodes pending (design)

**Good (supported):**

- Accept node A, leave node B pending, come back later in the same session or after refresh.
- Dismiss panel to view the full graph; ghosts remain; reopen panel from indicator.
- Multiple pending units coexist until user acts on each.

**Intentionally not supported (v1):**

- **Indefinitely orphaned pending ghosts** with no open proposal (would clutter canvas and block Capture+ forever).
- **Second Capture** while a proposal still has pending units. User must accept, discard, or discard-remaining first.

**Rationale:** "Leave in pending" = **defer the decision**, not a third disposition. Default state is already pending. Panel dismiss gives breathing room without a new lifecycle state. One open proposal prevents overlapping extracts and conflicting ghosts.

---

## Two UI phases

### Phase A — Streaming (`proposal.status = streaming`)

| User can | User cannot |
| --- | --- |
| Read thread rows as they append | Accept / discard (any scope) |
| See pending ghosts animate in | Edit pending fields |
| Hover ghosts for detail | Submit a new Capture |
| Dismiss panel (ghosts remain) | |

Panel status (indicative): **Extracting…**

No merge unit is actionable until the whole Extract job reaches **`ready`**.

### Phase B — Review (`proposal.status = ready`)

| User can | User cannot |
| --- | --- |
| Accept / discard one, selected, or all | Submit a new Capture (until proposal closed) |
| Edit pending fields before accept | Accept during Phase A |
| Dismiss panel and return later | Silent graph writes |
| Leave individual units pending | |

Panel status (indicative): **Review proposed changes**

Proposal closes when **zero** merge units remain in `pending` disposition.

---

## Screen walkthrough (quick-add / Flow 2)

```
[Graph home]
        │
        ▼ Capture+
[Diff-skim panel opens — composer focused, thread empty]
        │ user types + submits
        ▼
[Capture row saved]
        │
        ▼ auto
[Proposal streaming — thread fills, ghosts on canvas]
[Phase A — actions disabled]
        │
        ▼ Extract ready
[Phase B — edit, accept/discard one | selected | all]
        │
        ├── accept unit A ──► partial merge
        ├── leave unit B pending ──► dismiss panel ──► look at graph ──► reopen
        ├── discard unit C
        └── accept all / discard remaining
        │
        ▼ no pending units
[Proposal closed — panel may stay open for next Capture or dismiss]
```

---

## Proposal lifecycle

### Proposal-level status

```
streaming → ready | failed
ready → (partial merges) → closed
failed → retry → streaming | discarded (whole proposal) | **new Capture allowed** (prior `failed` auto-discarded)
```

| Status | Meaning |
| --- | --- |
| `streaming` | Extract running; preview only |
| `ready` | Extract done; review actions enabled |
| `failed` | Error or empty output; **does not block Capture+**. Retry Extract on same Capture or submit a new yap |
| `closed` | No pending merge units; terminal success |
| `discarded` | Whole proposal abandoned (terminal) |

Do **not** require all units to be decided in one sitting. **`closed`** means no pending units left, not "user clicked done."

### Per-unit disposition

```
pending → accepted | discarded
```

`pending` is the default. There is no `deferred` state: undecided = pending.

---

## Data shapes (logical)

### Capture (`captures`)

- `id`, `user_id`, `text`, `source_type` (`typed` | `voice` later), `created_at`
- Optional later: `audio_uri`, `transcript_model` for voice provenance
- Immutable after insert.

### Proposal (`extract_proposals`)

**Storage principle:** `payload` jsonb is the **source of truth** for structured extract output. `merge_units[]` (see below) is the **source of truth** for disposition and UI rows. Avoid maintaining three divergent copies of the same endeavor title.

Recommended shape:

- `id`, `user_id`, `capture_ids[]`, `status`, `payload` (full `ExtractProposal`)
- **`merge_units[]`** — normalized list (may live inside jsonb for MVP):
  - `tempId`, `endeavorPreview` (canvas ghost fields), `op: add | update`, `targetEndeavorId?`
  - **`disposition`:** `pending | accepted | discarded`
  - `bundledTempIds[]` — other entity/edge temp ids owned by this unit
  - `userEditedFields[]` — paths user touched (stream must not clobber)
- `changelog` — **derived or append-only audit trail** for the thread UI (not a second SoT for field values)
- `failure_reason`, `stream_cursor`, timestamps

### Graph

Written only on accept (partial merge per unit).

---

## HTTP surface (logical)

| Method | Path | When |
| --- | --- | --- |
| `POST` | `/captures` | Submit yap; auto-start Extract; returns `capture_id`, `proposal_id` |
| `GET` | `/proposals/open` | Hydrate open proposal on load |
| `GET` | `/proposals/:id` | Snapshot / reattach |
| `GET` | `/proposals/:id/events` | SSE during Phase A |
| `PATCH` | `/proposals/:id/units/:tempId` | User edit pending fields (Phase B) |
| `POST` | `/proposals/:id/units/:tempId/accept` | Partial merge one unit |
| `POST` | `/proposals/:id/units/:tempId/discard` | Drop one unit |
| `POST` | `/proposals/:id/units/accept` | Body: `{ tempIds: string[] }` — selected or all pending |
| `POST` | `/proposals/:id/units/discard` | Body: `{ tempIds: string[] \| "remaining" }` |
| `POST` | `/captures/:id/extract` | Retry after `failed` |

Future: `POST /proposals/:id/chat` for conversational Extract revisions (proposal-only).

---

## Voice capture (options, not v1)

Typed yap ships first. Voice feeds the **same Capture row** (`text` + `source_type: voice`).

| Option | Pros | Cons |
| --- | --- | --- |
| **OpenAI Whisper API** | Strong accuracy, simple HTTP (audio file → transcript), fits Vercel AI stack | Cost per minute; audio upload handling; latency for long rambles |
| **OpenAI Realtime / gpt-4o-transcribe** | Lower latency streaming transcription | More wiring; pricing model differs |
| **Browser Web Speech API** | No server audio storage; free | Quality varies by browser; privacy/consistency; not ideal for long rambles |
| **Deepgram / AssemblyAI** | Streaming, good UX for live captions | Another vendor; integration surface |
| **On-device (Whisper.cpp / WebAssembly)** | Privacy, offline | Bundle size, perf on mobile, quality vs cloud |

**Recommended default for Acta:** **Whisper API** (or current OpenAI transcription endpoint) for v1 voice: record in browser → upload blob → server transcribes → insert Capture with transcript text → existing Extract pipeline. No separate "voice graph write."

**Ramble UX:** optional live partial transcript (streaming STT) for feedback, but **Capture commits on stop** (or user edit of transcript before submit). Wispr-style always-on dictation is post-MVP.

Mic chrome on Capture+ can ship disabled until this path exists.

---

## Design review — model & lifecycle (self-audit)

Issues spotted and recommended stance:

| Issue | Risk | Recommendation |
| --- | --- | --- |
| **`payload` + `changelog` + `previews` triple-stored** | Drift: thread shows title A, payload has B | **Single SoT:** `payload` + `merge_units[]`; changelog is append-only events or derived on read |
| **Full jsonb rewrite each stream tick** | Write amplification, lost concurrent edits | **Patch/append** events; merge into payload at end of stream or on each validated chunk |
| **No normalized merge-unit table** | Partial accept logic in application code only | **OK for MVP** in jsonb `merge_units[]`; extract to table if query needs grow ("show all open pendings across captures") |
| **Shared skill across two pending units** | Double-create or wrong discard scope | **Explicit bundledTempIds** + dedup on first accept; discard unit B must not delete skill if unit A already accepted it |
| **Update-op bundles** | User discards patch but graph looked "pending" on canvas | Canvas **update** styling distinct from **add** ghost; discard reverts preview only |
| **Proposal `closed` vs row delete** | Audit / re-extract history lost | **Archive** closed proposals (soft) or keep row with `closed`; do not hard-delete if Capture provenance matters |
| **Indefinite pending + panel dismiss** | User forgets; Capture+ blocked | **Badge count** on Capture+; optional nudge after N days (U-H polish, not v1) |
| **Conversational Extract in same panel** | Scope creep in U4 | **U4:** thread shows capture + extract rows only; **P2:** chat turns via `update_proposal` |
| **Accept-all as one transaction** | Partial failure mid-batch | **Single DB transaction** for accept-all, or sequential with idempotent unit accepts |

Nothing here blocks MVP if we commit to **`merge_units[]` as disposition SoT** and **patch-style streaming** into `payload`.

---

## Deferred (post core loop)

| Item | Notes |
| --- | --- |
| **Conversational Extract** | Chat turns in panel to revise proposal before accept |
| **Voice capture** | Whisper (or chosen STT) → Capture text → same pipeline |
| **Import onboarding live-build** | Same panel language; longer threads ([`surfaces-and-flows.md`](surfaces-and-flows.md) Flow 1) |

---

## Build sequencing (implementation)

Backend-first; panel UI after SSE + snapshot work.

| Unit | Job |
| --- | --- |
| **U4-A** | Capture write |
| **U4-B** | Open-proposal guard |
| **U4-C** | Proposal shell + auto-start Extract |
| **U4-D** | Extract agent + stream persistence + **`merge_units[]`** |
| **U4-E** | SSE + snapshot + retry |
| **U4-F** | Panel (chat layout), Phase A/B, dismiss/reopen, canvas ghosts |
| **Lab** | `/lab/capture` — dev GUI using same `src/lib/api/*` clients as product |
| **U5** | Accept/discard (one, selected, all), PATCH edits, partial merge transactions |

---

## Changelog

- **2026-08-13:** **U4-F** — `/home` diff-skim panel wired: Capture+, thread, merge-unit preview rows, pending canvas ghosts, panel dismiss with badge reopen.
- **2026-08-13:** **U4-E** — `GET /proposals/:id`, SSE `/proposals/:id/events?cursor=`, `POST /captures/:id/extract` retry; `stream_cursor` on changelog writes.
- **2026-08-13:** New Capture **auto-discards** prior `failed` proposals (row kept, status → `discarded`).
- **2026-08-13:** **`failed` does not block Capture+** — nothing to review; user retries Extract or submits a new yap.
- **2026-08-13:** Removed **`captured_at`** — Capture sorts on `created_at` only; entity `timeframe` owns life dates.
- **2026-08-13:** Accept/discard **one, selected, and all**; manual edit before accept; panel dismiss without closing proposal; chat-shaped panel opens on Capture+; merge unit bundles **new + update** deps; voice options (Whisper default); design review section; `merge_units[]` as disposition SoT.
- **2026-08-12:** Created. Per-node confirm after `ready`; preview-only while streaming.
