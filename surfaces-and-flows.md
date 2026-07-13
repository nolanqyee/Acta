# Stilva — Surfaces & Core Flows

Last updated: 2026-07-10

**Owns:** information architecture (primary surfaces) and end-to-end interaction flows at contract altitude — not pixels, brand tokens, or full adapter editor design.

Companions: [`personal-evidence-graph.md`](personal-evidence-graph.md) (product), [`data-model.md`](data-model.md) (schema), [`building-plan.md`](building-plan.md) (roadmap).

Status: **v1 draft** for build hardening (workstreams B + C).

---

## Settled product framing (for IA)

- **Home = Graph** — the durable object is the self-graph, not a daily planner.
- **No “Today” home** — nothing reliably repeats day-by-day; deepen nudges are soft (badge/panel), not a morning inbox.
- **Value mix:** find (query/filter) + add (capture) + open (doc page) + use (generate). Generate is a primary *outcome*, not the home.
- **Graph view is primary and marketable** (Obsidian-like nodes/edges). List and doc pages exist so people can work in preferred modes.
- **Adapter editors (resume UI polish)** deferred — see building-plan **F**. Thin generate flow is in scope here.

---

## Surface map

### Primary surfaces (v1)

| Surface | Job (one purpose) | Notes |
| --- | --- | --- |
| **Graph home** | See and navigate the life graph; query; filter; quick-add | Default post-onboarding home |
| **Node page** | Read/edit one entity (endeavor-first; skills/stories as needed) in a docs-style layout | Opens from graph node, list, or query hit |
| **Capture / diff-skim** | Turn import or yap into a confirmable extract proposal, then merge | Modal or dedicated step; not the home |
| **Onboarding import** | Resume + LinkedIn + GitHub → skeleton extract → broad diff-skim → enter Graph | One-time / rare re-import |
| **Explore results** | *(may be inline on Graph)* Show ranked hits for an NL ask | Prefer **inline on Graph** (highlight + optional hit rail) over a separate Explore app |
| **Generate (thin)** | Pick an adapter ask → grounded draft + citations → edit/copy | Workspace or panel; full resume editor later (**F**) |
| **Settings / export** | Account, export graph, rare hard-delete | Secondary |

### Graph home — composition (contract)

Not layout pixels — required capabilities:

1. **Canvas (default)** — nodes + edges (containment and/or associative edges per projection). Kind may theme nodes (product later / brand later).
2. **Ask / query bar** — persistent. NL questions (“what have I done related to Redis?”) retrieve nodes; **results show on the graph** (highlight / emphasize matching nodes, dim others) plus a compact hit list if useful.
3. **Filters** — kind, application tags, status (active/demoted), maybe skill. Filters **literally show up on the graph** (same highlight language as query — one visual system for “what’s in focus”).
4. **Quick-add capture** — start a yap (and later attach) without leaving Graph; completes via diff-skim → merge → new/updated nodes appear.
5. **List mode (secondary)** — same underlying set; toggle or sidebar for people who don’t want canvas. Not the marketing default; not removed.
6. **Deepen signal** — soft checklist / “N thin projects” as badge or slide-over on Graph — not a Today home.
7. **Generate entry** — clear action to start thin generate (from selection or global).

**Projections** (from data-model): containment, kind, skill hub, people, tags — switchable filters/layouts on the same Graph surface over time. v1 minimum: containment-ish layout + kind/tag filters + NL highlight.

**Aspirational (product already):** highlight nodes used in a tailored artifact — same highlight language; full “why” chrome is building-plan **G**.

### Node page — composition (contract)

Docs-style page for an endeavor (and similarly for skill hub / story when opened):

- Title, kind, summary, timeframe, status, application tags (editable; user wins)
- Parents / children (`part_of`)
- Achievements, skills, people, orgs, metrics, evidence
- Actions: deepen prompts, propose/stamp story, open in graph (focus node), soft archive
- Not a freeform wiki competing with the graph — structured fields + links

### Surfaces explicitly not in v1 home IA

| Surface | Why |
| --- | --- |
| Today / daily inbox | No daily ritual; use deepen badge instead |
| Separate Explore app | Fold into Graph ask bar + highlight |
| Full resume structured editor | Building-plan **F** |
| Obsidian-parity local files | Cloud graph; different product |

---

## Navigation model

```
[Sign-in]
    → Onboarding import (if empty) → Diff-skim → Graph home
    → Graph home (returning)

Graph home
    ↔ List mode (same data)
    → Node page (click node / hit)
    → Quick-add → Diff-skim → back to Graph
    → Generate (thin)
    → Settings / export

Node page
    → back to Graph (focused)
    → Generate with this node in context
```

Global chrome (minimal): Graph (home), Generate, Settings. Capture is primarily **quick-add on Graph** (+ onboarding import).

---

## Core flows

Altitude: steps, actors, graph mutations, fail/skip. Not UI mockups.

### Flow 1 — Import → diff-skim → enter

| | |
| --- | --- |
| **Trigger** | New user / empty graph / “Re-import” |
| **Actors** | User; Extract agent |
| **Steps** | 1) User uploads/pastes resume and/or LinkedIn and/or GitHub. 2) System creates Capture(s). 3) Extract emits proposal (endeavors + key children + edges + tags). 4) **Diff-skim**: user sees skeleton (roles/projects/skills…), inline fix. 5) Merge into graph. 6) Land on **Graph home**. |
| **Mutations** | Captures immutable; entities + edges + tags written on confirm |
| **Fail / skip** | Partial import OK (one source). Extract failure → retry or manual quick-add. User can enter with thin graph — deepen later. **Never** block entry on deep-dives. |

### Flow 2 — Yap → extract → merge (quick-add)

| | |
| --- | --- |
| **Trigger** | Quick-add on Graph (or capture entry) |
| **Actors** | User; Extract agent |
| **Steps** | 1) User types yap. 2) Capture saved. 3) Extract proposal. 4) Diff-skim (same pattern as import, smaller). 5) Merge. 6) Graph updates; new nodes focus/highlight briefly. |
| **Mutations** | Same as import merge; `sourced_from_capture` links |
| **Fail / skip** | User discards proposal → capture may remain for later re-extract; no silent graph write without confirm. |

### Flow 3 — Deepen (checklist + skippable JIT)

| | |
| --- | --- |
| **Trigger** | Soft checklist on Graph; or JIT when starting Generate on a thin node |
| **Actors** | User; Deepen agent (prompts only) |
| **Steps** | 1) System flags thin endeavors (e.g. weak summary / few achievements) — project + role first. 2) User opens Node page or inline deepen. 3) Answers prompts / adds achievements, metrics, people, evidence. 4) Optional: propose Story (draft). |
| **Mutations** | Entity updates; optional Story `draft`; never auto-overwrite `stamped` stories |
| **Fail / skip** | **JIT always skippable** — Generate/export must not hard-gate on depth. Checklist is soft forever. |

### Flow 4 — Explore NL → open node

| | |
| --- | --- |
| **Trigger** | Ask bar on Graph |
| **Actors** | User; Explore agent (read-only) |
| **Steps** | 1) User asks NL question. 2) System ranks nodes. 3) **Graph highlights** matches; optional hit rail. 4) User clicks → Node page (or focus on canvas). |
| **Mutations** | **None** (read-only). Adapters draft text elsewhere. |
| **Fail / skip** | No hits → clear empty state; suggest broaden filters or capture. Must not invent facts. |

### Flow 5 — Filter / projection on Graph

| | |
| --- | --- |
| **Trigger** | Kind / tag / status / skill filters |
| **Actors** | User |
| **Steps** | 1) User sets filter(s). 2) Same highlight language as NL (in-focus vs dimmed). 3) List mode respects same filter. |
| **Mutations** | None |
| **Fail / skip** | Clear filters = full active graph (archived hidden by default). |

### Flow 6 — Generate (thin) → cite → edit → export

| | |
| --- | --- |
| **Trigger** | Generate action; optional selection/context from Graph |
| **Actors** | User; Adapter agent |
| **Steps** | 1) User picks adapter type (app question / interview story pack / resume draft — thin). 2) Optional paste JD/question. 3) Agent reads graph (tags narrow → rank); prefers stamped stories. 4) Draft + **citations** to node IDs. 5) User edits text. 6) Copy / download PDF later. |
| **Mutations** | May create Story `draft` if synthesizing; must not invent unsupported claims. User edits to draft text are local to artifact unless they stamp a story. |
| **Fail / skip** | Thin graph → warn + skippable deepen JIT. User can still get a weaker draft. Full resume editor UX = **F** later. |

### Flow 7 — Soft archive / tag override

| | |
| --- | --- |
| **Trigger** | Node page (or bulk later) |
| **Actors** | User |
| **Steps** | **Tags:** edit application tags; `source=user`, override wins. **Archive:** set `demoted` / `archived` (soft); hard delete rare/confirm. |
| **Mutations** | Tag fields; status. Demoted can still resurface in explore if useful. |
| **Fail / skip** | No auto-purge for “outdated.” |

### Flow 8 — Story propose → stamp

| | |
| --- | --- |
| **Trigger** | Node page / deepen / generate needing narrative |
| **Actors** | User; Story agent |
| **Steps** | 1) Agent proposes Story from subgraph → `draft`. 2) User edits. 3) Stamp → `stamped` (no silent overwrite). 4) Material primary edits → `stale` nudge, don’t clobber. |
| **Mutations** | Story create/update; fingerprint per data-model |
| **Fail / skip** | User can ignore draft; regenerate requires confirm if stamped. |

---

## Flow ↔ surface matrix

| Flow | Primary surfaces |
| --- | --- |
| Import → enter | Onboarding import, Diff-skim, Graph home |
| Yap → merge | Graph (quick-add), Diff-skim, Graph |
| Deepen | Graph (badge), Node page, Generate (JIT) |
| NL explore | Graph (ask + highlight), Node page |
| Filter | Graph (canvas + list) |
| Generate thin | Generate, Graph (context), Node page |
| Archive / tags | Node page |
| Story stamp | Node page, Generate |

---

## Non-goals (this doc)

- Brand tokens, typography, motion (building-plan **A**)
- Agent tool API / prompt text (building-plan **D** — use these flows as input)
- Auth/session (building-plan **E**)
- Full adapter editor IA (building-plan **F**)
- Citation hover chrome polish (building-plan **G**)
- Empty-state copywriting (building-plan **H**/**I**)

---

## Open questions

- [ ] v1 canvas: force-directed only vs simple containment tree layout as default
- [ ] Ask bar: one unified control for NL + structured filters, or filter chips separate from prompt
- [ ] Quick-add: floating composer vs side panel vs full-screen capture step
- [ ] Whether skill/person nodes appear on the same canvas as endeavors in v1 or only via hubs/filters

---

## Changelog

- **2026-07-10:** Initial IA — Graph home (canvas-first, ask + filter highlight, list secondary, quick-add); docs-style node pages; no Today home; core flows 1–8; matrix to surfaces.
