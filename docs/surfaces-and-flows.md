# Acta — Surfaces & Core Flows

Last updated: 2026-07-14

**Owns:** information architecture (primary surfaces) and end-to-end interaction flows at contract altitude — not pixels, brand tokens, or full adapter editor design.

Companions: [`personal-evidence-graph.md`](personal-evidence-graph.md) (product), [`data-model.md`](data-model.md) (schema), [`agent-interaction-model.md`](agent-interaction-model.md) (write policy), [`building-plan.md`](building-plan.md) (roadmap).

Status: **v1 locked** for capture+render build (**U-B** + **U-C**). Open questions resolved 2026-07-13.

---

## Settled product framing (for IA)

- **Home = Graph** — the durable object is the self-graph, not a daily planner. Other surfaces are **rooted in** the graph (overlays, sidebars, or routes that leave a mini-graph footprint).
- **No “Today” / notifications home** — nothing day-ritual. Deepen lives as an optional **backlog** of thin items to fill (pull when you want), plus skippable JIT at Generate — never a morning inbox or push-notification center.
- **Value mix:** find (query/filter) + add (capture) + open (node modal) + use (generate). Generate is a primary *outcome*, not the home.
- **Graph view is primary and marketable** — literal nodes on a surface, Obsidian graph–like (pan, zoom, navigate). **Canvas nodes = Endeavors only** (skills, people, and orgs are **not** canvas nodes — see below).
- **First implementation unit:** **capture + render** (yap/import → extract → merge → nodes appear on the canvas). Adapter editors deepen later.
- **Adapter editors (resume UI polish)** deferred in detail — see building-plan **U-F**. Thin generate entry + adapter *routing* is in scope here.

---

## Surface map

### Primary surfaces (v1)

| Surface | Job (one purpose) | Chrome |
| --- | --- | --- |
| **Graph home** | See and navigate the life graph; filter; zoom/pan; NL search; quick-add | Full-bleed canvas — app homepage |
| **Node (modal)** | Read/edit one entity (endeavor, org, skill, person, story, …) Notion-like | Centered modal over Graph (skills/people open here even though not on canvas) |
| **Explore results** | Ranked hits for an NL ask | **Right sidebar** over Graph + same highlight on canvas |
| **Capture / diff-skim** | Confirm extract proposal, then merge | **Right sidebar** (Explore family) + pending nodes on canvas |
| **Onboarding import** | Connectors + Qs → skeleton graph while watching it grow | Sidebar over Graph; graph updates live |
| **Deepen backlog** | See thin endeavors worth filling; open one to deepen | Panel/slide-over from Graph (not a separate app home; not push notifications) |
| **Generate** | Pick an adapter family and open its workspace | **Left sidebar** on Graph → navigates to adapter **pages** |
| **Adapter pages** | Draft / manage artifacts (resume, interview, app Q) | Own routes; **expandable mini-graph peek** |
| **Settings / export** | Account, connectors, export, rare hard-delete | Standard settings surface |

### Graph home — composition (contract)

The homepage of the app. Other surfaces are rooted here (overlays, sidebars, or routes that leave a mini-graph footprint).

1. **Canvas** — literal nodes on a surface like **Obsidian’s graph view**. **Default layout: force-directed** — related nodes cluster (containment + associative edges pull together). This is a primary product WOW, not a secondary view. Controls to **filter, navigate, zoom in/out**. Kind may theme endeavor nodes (brand later). Containment-tree / other projections may exist later as *modes*, not the default.
2. **Ask / search bar** — persistent, **browser-search-bar–like** NL query (“what have I done related to Redis?”). Results → **Explore results** chrome (below), not a separate Explore app. Distinct from filters.
3. **Filter chips (separate)** — sit **next to** the ask bar (not inside it). Chips for facets such as **skill, person, org**, kind, application tags, status, etc. Selecting a chip slices/highlights endeavors on the canvas (same highlight language as NL). Does **not** add Skill/Person/Org as canvas nodes.
4. **Hover card** — on hover, a small **kind-rich** card **at the cursor** (compact layout — dense, not a mini-modal). Unique UI per endeavor kind, e.g. role → org/title; project → stack/metric teaser; course → school; leadership → org/role. Peek only; click opens full modal. Pending proposal nodes use a distinct pending state — hover shows the proposed change.
5. **Click → node modal** — expands into a **centered modal** about that entity (see Node).
6. **Quick-add capture** — start a yap (later: attach) without leaving Graph; completes via diff-skim → merge → nodes appear/update on canvas.
7. **List mode (secondary)** — same underlying canvas set for people who don’t want the force view. Not the marketing default; not removed.
8. **Deepen backlog** — entry (badge count / “To deepen” control) opens a **backlog panel**: ranked list of thin endeavors (project + role first — weak summary, few achievements, missing metrics, etc.). Pick one → Node modal + Deepen prompts. Soft forever: dismiss/snooze/ignore OK; **not** notifications, **not** a Today home. Same backlog feeds skippable JIT at Generate.
9. **Generate entry** — opens the **left Generate sidebar** (not a separate home).

### Deepen backlog — composition (contract)

Job: a **pull** queue of “stuff to fill,” not alerts.

1. **List** — thin endeavors with short why (“no achievements,” “summary too thin”). Priority: project + role first (product settled).
2. **Open** → Node modal with deepen prompts / chips (Deepen agent).
3. **Optional canvas link** — selecting a backlog row may focus/highlight that endeavor on the graph.
4. **Never blocks** capture, explore, or generate. Empty backlog = healthy enough skeleton (or everything dismissed).
5. **Naming:** prefer backlog / “To deepen” language over “Notifications.”

**Canvas node set (locked):**

| On canvas | Not on canvas |
| --- | --- |
| **Endeavors** (all kinds) — including `role` / `education` / etc., which already carry org context via `at_org` on the endeavor | **Skills** — ~5–10× endeavors would muddle force layout. Surface via endeavor fields, skill filter, Explore → endeavors / skill modal |
| | **People** — low utility on canvas; endeavor modal / edges only |
| | **Orgs** — redundant with role/education endeavors that already sit *at* an org; Org remains a stored entity + field/`at_org` edge, not a physics node |

Skills, people, and orgs remain first-class **entities** in [`data-model.md`](data-model.md); this decision is **Graph UI rendering**, not schema deletion.

**Projections / filters** (over one stored edge set): **ask bar** (NL) and **filter chips** (skill, person, org, kind, tags, status, …) are **separate controls** sharing one highlight language. Containment emphasis may be an optional later mode. **v1 default = force-directed clustering** of **Endeavors only**. Do **not** ship skill/person/org physics nodes on Graph home.

**Aspirational:** highlight nodes used in a tailored artifact — same highlight language; full “why” chrome is building-plan **U-G** (thin citation UX is required earlier by **U-D**).

### Node (modal) — composition (contract)

Not a separate full-page wiki competing with the graph. A **centered modal** over Graph home (Notion-like structured page):

- Title, kind, summary, timeframe, status, application tags (editable; user wins)
- Parents / children (`part_of`)
- Achievements, skills, people, orgs, metrics, evidence
- Same pattern for endeavors, and (when opened from an endeavor / Explore) skill, person, or org detail — those open as modals without being canvas nodes
- Stories when opened from deepen / generate
- Actions: deepen prompts, propose/stamp story, focus endeavor on graph (when applicable), soft archive

Escape / close returns to Graph with focus optionally retained on that node.

### Explore results — composition (contract)

Triggered by NL search from the ask bar. **Not** a separate Explore app.

1. **Right sidebar** — hovers over the graph surface with ranked results (list of hits + short why/snippet).
2. **Viewport adjust** — the **center of the graph shifts slightly left** so the viewable graph panel isn’t covered up by the sidebar. The sidebar **overlaps** the surface; the graph **reframes/recenters** so you can still see nodes cleanly.
3. **Dual highlight** — matching **endeavor** canvas nodes emphasized; sidebar may also list skill/person/org hits that resolve to related endeavors (those entity types are not drawn on the canvas).
4. Click hit → open **Node modal** (or focus endeavor on canvas).

Clear search / close sidebar → graph recenters to normal framing.

### Capture / diff-skim — composition (contract)

**Locked chrome: right hover sidebar** (same family as Explore) — graph stays visible so **new / updated nodes can animate in**.

Confirmable extract proposal → merge. Diff-skim must stay **clear** inside the sidebar (not a cramped afterthought).

1. **Right sidebar** — proposal workspace over Graph (graph recenters left like Explore).
2. **Changelog summary** — top of sidebar: readable summary of pending adds/edits/removes (“+2 projects, update Redis caching summary, +3 skills on Bubble role…”). Primary skim path.
3. **Pending on canvas** — as the proposal develops (and while open), affected endeavors appear or update in a **pending** visual state on the force graph (animate in when new). User can see *where* changes land without leaving the graph.
4. **Hover pending → change detail** — hovering a pending canvas node shows the proposed diff for that node (complements the sidebar changelog).
5. **Sidebar detail** — expand any changelog row for full field-level edit/fix before confirm.
6. **Confirm / discard** — merge writes graph; pending styling clears; confirmed nodes settle into normal state. Discard removes pending ghosts.

Fat onboarding imports use the **same** pattern (sidebar + live pending nodes), sized for longer changelogs — not a separate modal shell.

### Onboarding import — composition (contract)

One-time / rare re-import, rooted in Graph:

1. **Sidebar flow** — questions / connector steps while the **graph remains visible**.
2. **Live build** — after every answered step that actually creates nodes, **pending → confirmed endeavors animate onto the canvas** (same diff-skim language: changelog in sidebar, pending state on graph). User watches their graph assemble in real time.
3. **Connectors + redirect** — manage connected sources; OAuth / redirect / reconnect flows as needed. Classic sources: resume upload/paste, LinkedIn, GitHub.
4. **Agent connectors (later):** connect **Claude / other coding agents** and pull **chat histories** for feature/project-level work → capture → extract. **Build order: after classic MVP imports** (resume / LinkedIn / GitHub) — not parallel with capture+render. Same connector-management surface when the time comes; do not stub loudly in v1 onboarding.

Partial import OK; never block entry on deepen. Land (or already are) on Graph home with a skeleton.

### Generate — composition (contract)

1. **Left sidebar** on Graph — entry controls for adapter families: **resume**, **interview**, **app questions**, etc.
2. Choosing an adapter **opens that adapter’s page** (own route). Prefer **not** stacking further sidebars over the graph for the editing session (“other sidebars over the graph? probably not”).
3. **Adapter pages** keep graph context via an **expandable peek** (collapsed chip/handle → expands a **mini graph** when wanted) — not always-on. Editor stays primary; graph is one click away without eating the layout.
4. **Adapter internals deferred (F)** — e.g. a resume **manager**: (+) new resume, choose export/format (**markdown / DOCX / LaTeX**), **fork from** an existing resume, etc. Explore as we build; do not block the first unit on this.
5. Thin path still: grounded draft + citations → edit/copy; full editor polish is **U-F**.
6. **First implementation unit:** **capture + render** (get nodes on the canvas). Generate/adapters come after that loop works.

### Settings / export

As expected: account, connector management (including reconnect / redirect), export graph, rare hard-delete. No special homepage role.

### Surfaces explicitly not in v1 home IA

| Surface | Why |
| --- | --- |
| Today / daily inbox / notification center | No daily ritual; use **Deepen backlog** (pull) instead |
| Separate Explore app | Fold into Graph ask bar + right results sidebar |
| Full resume structured editor as home | Building-plan **U-F**; Generate sidebar only routes there |
| Obsidian-parity local files | Cloud graph; different product |

---

## Navigation model

```
[Sign-in]
    → Onboarding sidebar (if empty) — watch Graph build live → Graph home
    → Graph home (returning)

Graph home (canvas)
    → Hover card (peek)
    → Click node → Node modal (Notion-like)
    → NL ask → Right Explore sidebar (+ graph recenters left; highlights)
    → Quick-add → Right diff-skim sidebar (changelog + pending nodes animate in) → confirm → settled on canvas
    → Deepen backlog panel → Node modal (deepen prompts)
    → Left Generate sidebar → Adapter page (expandable mini-graph peek)
    → Settings / export
    ↔ List mode (secondary)

Node modal
    → close → Graph (optionally focused)
    → Generate with this node in context

Adapter page
    → back to Graph
    → open cited node → Node modal or return-to-Graph focus
```

Global chrome (minimal): Graph (home), Generate (left entry), Settings. Capture is primarily **quick-add on Graph** (+ onboarding).

---

## Core flows

Altitude: steps, actors, graph mutations, fail/skip. Not UI mockups.

### Flow 1 — Import → diff-skim → enter (live graph)

| | |
| --- | --- |
| **Trigger** | New user / empty graph / “Re-import” |
| **Actors** | User; Extract agent |
| **Steps** | 1) User connects sources and/or answers onboarding steps in a **sidebar**. 2) System creates Capture(s). 3) Extract emits proposal; **right diff-skim sidebar** shows **changelog summary**; **pending endeavor nodes** appear/update on the visible Graph (animate in). 4) User skims changelog + hover pending nodes for per-node diffs; inline fix. 5) Confirm merge → pending clears. 6) Finish on Graph home with skeleton. |
| **Mutations** | Captures immutable; entities + edges + tags written on confirm |
| **Fail / skip** | Partial import OK (one source). Extract failure → retry or manual quick-add. Enter with thin graph — deepen later. **Never** block entry on deep-dives. |

### Flow 2 — Yap → extract → merge (quick-add)

| | |
| --- | --- |
| **Trigger** | Quick-add on Graph |
| **Actors** | User; Extract agent |
| **Steps** | 1) User types yap. 2) Capture saved. 3) Extract proposal. 4) **Right diff-skim sidebar** + **changelog summary** + **pending nodes** animate onto Graph. 5) Skim/fix via sidebar and hover-on-pending. 6) Confirm merge; pending → settled. |
| **Mutations** | Same as import merge; `sourced_from_capture` links |
| **Fail / skip** | User discards proposal → capture may remain for later re-extract; no silent graph write without confirm. |

### Flow 3 — Deepen (backlog + skippable JIT)

| | |
| --- | --- |
| **Trigger** | Deepen backlog on Graph; or JIT when starting Generate on a thin node |
| **Actors** | User; Deepen agent (prompts only) |
| **Steps** | 1) System maintains a **backlog** of thin endeavors (e.g. weak summary / few achievements) — project + role first. 2) User opens backlog panel, picks an item (or hits JIT). 3) Node modal + deepen prompts / chips. 4) Answers → achievements, metrics, people, evidence. 5) Optional: propose Story (draft). Item leaves backlog when no longer thin (or user dismisses/snoozes). |
| **Mutations** | Entity updates; optional Story `draft`; never auto-overwrite `stamped` stories |
| **Fail / skip** | **JIT always skippable** — Generate/export must not hard-gate on depth. Backlog is soft forever — not notifications that demand clearance. |

### Flow 4 — Explore NL → open node

| | |
| --- | --- |
| **Trigger** | Ask bar on Graph |
| **Actors** | User; Explore agent (read-only) |
| **Steps** | 1) User asks NL question. 2) System ranks entities. 3) **Right Explore sidebar** opens; graph **recenters left**; matching **endeavor** nodes **highlighted** on canvas; skill/person/org hits in the sidebar jump to related endeavors (those types not drawn as canvas nodes). 4) User clicks → **Node modal** (or focus on canvas). |
| **Mutations** | **None** (read-only). Adapters draft text elsewhere. |
| **Fail / skip** | No hits → clear empty state; suggest broaden filters or capture. Must not invent facts. |

### Flow 5 — Filter chips on Graph

| | |
| --- | --- |
| **Trigger** | Filter chips next to ask bar (skill, person, org, kind, tags, status, …) |
| **Actors** | User |
| **Steps** | 1) User sets chip filter(s). 2) Same highlight language as NL (in-focus vs dimmed) on **endeavor** canvas nodes — e.g. skill chip highlights endeavors with that `used_skill`; person/org chips highlight related endeavors. Does not add those entity types to the canvas. 3) List mode respects same filter. Ask bar remains independent (can combine: NL results ∩ chip slice, or sequential). |
| **Mutations** | None |
| **Fail / skip** | Clear chips = full active endeavor graph (archived hidden by default). |

### Flow 6 — Generate (thin) → cite → edit → export

| | |
| --- | --- |
| **Trigger** | Left Generate sidebar; optional selection/context from Graph |
| **Actors** | User; Adapter agent |
| **Steps** | 1) User picks adapter family from left sidebar. 2) Navigate to **adapter page** (**expandable mini-graph peek**). 3) Optional paste JD/question. 4) Agent reads graph (tags narrow → rank); prefers stamped stories. 5) Draft + **citations** to node IDs. 6) User edits text. 7) Copy / download later. |
| **Mutations** | May create Story `draft` if synthesizing; must not invent unsupported claims. User edits to draft text are local to artifact unless they stamp a story. |
| **Fail / skip** | Thin graph → warn + skippable deepen JIT. Weaker draft OK. Full resume manager / format / fork UX = **U-F**. |

### Flow 7 — Soft archive / tag override

| | |
| --- | --- |
| **Trigger** | Node modal (or bulk later) |
| **Actors** | User |
| **Steps** | **Tags:** edit application tags; `source=user`, override wins. **Archive:** set `demoted` / `archived` (soft); hard delete rare/confirm. |
| **Mutations** | Tag fields; status. Demoted can still resurface in explore if useful. |
| **Fail / skip** | No auto-purge for “outdated.” |

### Flow 8 — Story propose → stamp

| | |
| --- | --- |
| **Trigger** | Node modal / deepen / generate needing narrative |
| **Actors** | User; Story agent |
| **Steps** | 1) Agent proposes Story from subgraph → `draft`. 2) User edits. 3) Stamp → `stamped` (no silent overwrite). 4) Material primary edits → `stale` nudge, don’t clobber. |
| **Mutations** | Story create/update; fingerprint per data-model |
| **Fail / skip** | User can ignore draft; regenerate requires confirm if stamped. |

---

## Flow ↔ surface matrix

| Flow | Primary surfaces |
| --- | --- |
| Yap → merge | Graph (quick-add), Right diff-skim sidebar + pending canvas, Graph |
| Import → enter | Onboarding sidebar, Right diff-skim + pending canvas, Graph (live build) |
| Deepen | Deepen backlog panel, Node modal, Generate (JIT) |
| NL explore | Graph ask, Right Explore sidebar + highlight, Node modal |
| Filter | Graph (ask bar independent; filter chips + canvas + list) |
| Generate thin | Left Generate sidebar → Adapter page (+ expandable mini-graph peek), Node modal |
| Archive / tags | Node modal |
| Story stamp | Node modal, Generate |

---

## Build note (implementation order)

**First unit:** capture + render — get material in and see nodes on the Obsidian-like canvas (hover cards + node modal can follow immediately after nodes exist). Sidebars (Explore / Generate / onboarding live-build) and adapter pages come once the graph surface is real. Do not start with resume-editor depth (**U-F**).

---

## Non-goals (this doc)

- Brand tokens, typography, motion (building-plan **U-A**)
- Agent tool API / prompt text — write **policy** is [`agent-interaction-model.md`](agent-interaction-model.md); prompts still out of this doc
- Auth/session (building-plan **U-E**)
- Full adapter editor IA — formats, fork, multi-resume manager (building-plan **U-F**)
- Rich citation / provenance chrome (building-plan **U-G**) — thin citation UX lives in agent model
- Empty-state copywriting (building-plan **U-H**/**U-I**)

---

## Open questions

- [x] v1 canvas default: **force-directed** (related clusters = product WOW); hierarchy projections optional later, not default
- [x] Canvas node set: **Endeavors only**; **Skills, People, and Orgs are not canvas nodes** (skills muddle; people low utility; orgs redundant with role/education endeavors via `at_org`). Still data entities; skill = filter / modal / Explore → endeavors
- [x] Quick-add / diff-skim: **right hover sidebar** (Explore family) + **changelog summary** + **pending nodes on canvas** (animate in; hover pending for per-node diff); must stay clear/readable in sidebar
- [x] Ask bar vs filters: **separate** — browser-like ask/search bar + **filter chips beside it** (skill, person, org, kind, tags, status, …); shared highlight language; chips do not put those entities on the canvas
- [x] Hover card density: **kind-rich** (compact) — unique peek UI per endeavor kind; not a mini-modal
- [x] Adapter page mini-graph: **expandable peek** (collapsed → expand when wanted); not always-on
- [x] Agent connectors: **after classic MVP only** (resume / LinkedIn / GitHub first); Claude/etc. chat histories in later kitchen-sink wave — not parallel with capture+render; no loud v1 stub

---

## Changelog

- **2026-07-14:** Product brand → **Acta**.
- **2026-07-13:** Cross-refs use building-plan **U-A…U-I** convention.
- **2026-07-13:** Deepen = **backlog panel** (“stuff to fill”) from Graph — not notifications / Today inbox; still soft + skippable JIT at Generate.
- **2026-07-13:** Agent connectors = **after classic MVP** (not early parallel / not loud stub).
- **2026-07-13:** Ask bar = browser-like NL search; **filter chips separate beside it** (skill, person, org, …).
- **2026-07-13:** Canvas = **Endeavors only** (drop Orgs — redundant with role/education + `at_org`). Diff-skim locked to **right sidebar** + changelog summary + pending canvas nodes (animate in; hover for per-node diff).
- **2026-07-13:** Locked canvas node set = Endeavors (+ briefly Orgs; superseded); Skills and People not drawn on canvas.
- **2026-07-13:** Locked canvas default = **force-directed** (related clusters as product WOW); hierarchy modes optional later.
- **2026-07-13:** Deepened IA vision — Graph as root chrome; kind-specific hover cards + centered Notion-like node modal; Explore as right sidebar with left-recenter; Generate as left sidebar → adapter pages (+ mini corner graph; resume manager/formats/fork deferred); onboarding sidebar with live graph build; **agent connectors** (Claude/etc. chat histories for feature-level work); capture/diff-skim modal or hover sidebar; first impl unit = capture + render. Removed session `HANDOFF.md` (bootstrap-only).
- **2026-07-10:** Initial IA — Graph home (canvas-first, ask + filter highlight, list secondary, quick-add); docs-style node pages; no Today home; core flows 1–8; matrix to surfaces.
