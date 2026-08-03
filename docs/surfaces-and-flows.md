# Acta — Surfaces & Core Flows

Last updated: 2026-08-03

**Owns:** information architecture (primary surfaces) and end-to-end interaction flows at contract altitude — not pixels, brand tokens, or full adapter editor design.

Companions: [`personal-evidence-graph.md`](personal-evidence-graph.md) (product), [`data-model.md`](data-model.md) (schema), [`agent-interaction-model.md`](agent-interaction-model.md) (write policy), [`building-plan.md`](building-plan.md) (roadmap), [`graph-canvas.md`](graph-canvas.md) (the live canvas spec).

Status: **v1 locked** for capture+render build (**U-B** + **U-C**). Graph-home chrome revised 2026-07-15 from founder sketch (full-bleed canvas + overlay controls).

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
| **Graph home** | See and navigate the life graph; filter; physics/display; NL search; quick-add | **Full-bleed canvas** = entire app background; all other chrome **overlays** the canvas |
| **Node (modal)** | Read/edit one entity (endeavor, org, skill, person, story, …) | Centered modal over Graph; **header image** + title straddling image/body |
| **Explore results** | Ranked hits for an NL ask | **Floating right panel** (same family as diff-skim) + canvas highlight; graph CoG shifts left |
| **Capture / diff-skim** | Confirm extract proposal, then merge | **Floating right panel** under top-right controls + pending nodes on canvas |
| **Onboarding import** | Connectors + Qs → skeleton graph while watching it grow | Floating panel / flow over Graph; graph updates live |
| **Deepen backlog** | See thin endeavors worth filling; open one to deepen | Panel from top-right deepen control (inbox-like + badge); not push notifications |
| **Generate / adapters** | Pick an adapter and leave Graph for its workspace | **Top-left hamburger** expands adapter menu → navigates to adapter **pages** |
| **Adapter pages** | Draft / manage artifacts (resume, interview, app Q) | Own routes; **expandable mini-graph peek** |
| **Settings / export** | Account, connectors, export, rare hard-delete | Via **profile menu** (top right) + in-menu app settings |

### Route map (Next App Router)

Concrete URL ↔ surface mapping so route names don't drift. **Key distinction:** most graph-adjacent surfaces are **overlays on `/`** (client state / intercepting routes), *not* separate pages — only adapters, settings, and auth are their own routes. Placeholder segments already exist in `src/app/` to pin these names.

| URL / segment | Surface | Kind | Built in |
| --- | --- | --- | --- |
| `/` | **Graph home** — full-bleed canvas + overlays | Route (client canvas island) | U3 |
| ↳ on `/` | Node modal, Explore results, Capture / diff-skim, Onboarding, Deepen backlog | **Overlays** (client / intercepting routes) — **not** separate routes | U3–U5 |
| `/generate` | Adapter picker (hamburger target) | Route | U6 (thin) → U-F |
| `/adapters/[kind]` | Adapter workspace (resume, interview, app Q) | Route (+ mini-graph peek) | U-F |
| `/settings` | Account, connectors, export, hard-delete | Route (via profile menu) | U2 (auth/connectors) → U-E |
| `/login` (in `(auth)`) | Sign in | Route | U2 |
| `/auth/callback` | Supabase code exchange | Route handler | U2 |
| `/api/*` | Backend API (`health`, `meta` now; `captures`, `proposals`, `graph`, `extract` later) | Route handlers | U1 → U5 |

Explore and Capture are deliberately **not** routes (Explore "is not a separate Explore app"; both float over the visible graph). Don't scaffold `/explore` or `/capture` pages.

### Graph home — composition (contract)

The homepage of the app. **The graph canvas is the entire background.** Every control and info surface **sits on top of** that canvas (no chrome “frame” that owns layout outside the graph).

#### Canvas / physics

1. **Full-bleed canvas** — Obsidian-class nodes + edges (Endeavors only). Pan / zoom / navigate.
2. **Force layout** — nodes are **draggable**; simulation should **resolve toward a circular / radial balance** in the Obsidian graph spirit (not a free scatter that never settles). Related nodes still cluster via edges.
3. **Graph settings** (control next to Filters) — user can dial **forces / physics**, **display**, **sizing**, and related view options. Highly customizable; defaults stay calm and Obsidian-like.
4. **Hover** → compact **kind-rich hover card** at the cursor (peek only). Pending nodes: distinct pending state; hover shows proposed change.
5. **Click** → **centered node modal** (see Node).

#### Bottom chrome — ask / filter / graph settings

6. **Ask bar** — persistent **bottom** control, **liquid-glass–esque**, prompt/chat-like (familiar AI-chat affordance). NL query (“what have I done related to Redis?”). Results → Explore floating panel + canvas highlight — not a separate Explore app.
7. **Filters** — **not** always-visible chips. A **filter button** beside the ask cluster opens a panel. Filtering is **facet selection that slices endeavors**, not “toggle entity types onto the canvas”:
    - **Kind** — include/exclude endeavor kinds (role, project, …).
    - **Specific skills / people / orgs** — pick concrete values (e.g. skill=`Redis`, person=`Alex`, org=`Bubble`) to **highlight** related **endeavors** (accent). Optional search within each facet list. Active filters show as removable pills. Dimming non-matches deferred until density needs it (see brand).
    - Same highlight language as NL. Still does **not** draw Skill/Person/Org as canvas nodes.
8. **Graph settings button** — beside the filter button; opens physics / display / sizing controls (see above).

#### Top-left chrome — brand + adapters

9. **Logo + wordmark** — top left. Mark candidates: **stylistic A** or a **3-point star** rotated ~190° so one point sits at the bottom (open brand choice — see [`archive/brand-design-system.md`](archive/brand-design-system.md)).
10. **Hamburger (under brand)** — expands **adapter selection** menu.
    - **Hover:** menu opens while pointer stays within the expansion; leave → closes.
    - **Click:** menu **stays open** until dismissed / navigated.
    - Choosing an adapter **navigates away** from Graph to that adapter page (mini-graph peek on adapter routes still applies).

#### Top-right chrome — capture, deepen, theme, account

11. **Capture** — distinct CTA **“Capture +”** plus a **connected mic** control for **eventual voice capture** (type remains MVP path; mic is chrome-forward, behavior can land post type-only). Opens capture → extract → diff-skim.
12. **Deepen** — icon suggesting “things to fill” (**inbox-like** lean + **notification badge** count). Opens deepen backlog panel. Still a **pull** queue — not a Today/notifications home; naming can stay backlog-forward in copy even if icon reads inbox.
13. **Theme** — **light only for now** (dark mode deferred until the visual system is rebuilt on screen; no toggle in the current slice).
14. **Profile** — avatar + **user name**; click expands menu: profile, account settings, app settings, logout, etc.

#### Other

15. **List mode (secondary)** — same underlying set for people who don’t want the force view. Not marketing default.
16. **No visible hairline borders** between overlay panels and canvas — separate by elevation / blur / soft bg (brand).

**Canvas node set (locked):** unchanged — Endeavors only on canvas; Skills / People / Orgs not physics nodes.

**Projections / filters:** ask bar (NL) and filter menu remain **separate controls** sharing one highlight language. Filter menu = **kind + specific skill/person/org values** (and later tags/status) → endeavor slice. **v1 default = force-directed**, circular settle, Endeavors only.

### Deepen backlog — composition (contract)

Job: a **pull** queue of “stuff to fill,” not alerts.

1. **Entry** — top-right deepen control with badge.
2. **List** — thin endeavors with short why (“no achievements,” “summary too thin”). Priority: project + role first.
3. **Open** → Node modal with deepen prompts / chips (Deepen agent).
4. **Optional canvas link** — selecting a backlog row may focus/highlight that endeavor on the graph.
5. **Never blocks** capture, explore, or generate. Empty backlog = healthy enough skeleton (or everything dismissed).
6. **Naming:** prefer backlog / “To deepen” in copy; icon may be inbox-like for recognition.

### Node (modal) — composition (contract)

Centered modal over Graph home:

- **Header image** — AI-generated from content *or* curated **kind presets** (open implementation choice; visual required).
- **Title** sits **straddling** the header image and the body (half on image, half on content). Use a **drop shadow** (or equivalent) so the title stays legible on the image.
- Kind, summary, timeframe, status, application tags (editable; user wins)
- Parents / children (`part_of`)
- Achievements, skills, people, orgs, metrics, evidence
- Same pattern for endeavors; skill / person / org open as modals without being canvas nodes
- Stories when opened from deepen / generate
- Actions: deepen prompts, propose/stamp story, focus endeavor on graph (when applicable), soft archive

Escape / close returns to Graph with focus optionally retained on that node.

### Explore results — composition (contract)

Triggered by NL search from the **bottom ask bar**. **Not** a separate Explore app.

1. **Floating right panel** — same family as diff-skim (not a full-height docked sidebar). Sits **under** top-right controls, **right-aligned**.
2. **Viewport adjust** — **center of gravity of the graph shifts left** so nodes remain visible while the panel is open.
3. **Dual highlight** — matching endeavor nodes emphasized; panel may list skill/person/org hits that resolve to related endeavors.
4. Click hit → **Node modal** (or focus endeavor on canvas).

Clear search / close panel → graph recenters to normal framing.

### Capture / diff-skim — composition (contract)

**Locked chrome: floating right panel** (Explore family) — graph stays visible so **new / updated nodes can animate in**.

1. **Floating right panel** — under top-right controls, right-aligned; graph CoG shifts left.
2. **Changelog summary** — top of panel: readable summary of pending adds/edits/removes. Primary skim path.
3. **Pending on canvas** — affected endeavors appear/update in **pending** state (animate in when new).
4. **Hover pending → change detail** — complements changelog.
5. **Panel detail** — expand any changelog row for field-level edit/fix before confirm.
6. **Confirm / discard** — merge writes graph; pending styling clears. Discard removes pending ghosts.

Fat onboarding imports use the **same** pattern (panel + live pending nodes), sized for longer changelogs.

### Onboarding import — composition (contract)

One-time / rare re-import, rooted in Graph:

1. **Floating panel / flow** — questions / connector steps while the **graph remains visible**.
2. **Live build** — after every answered step that actually creates nodes, **pending → confirmed endeavors animate onto the canvas** (same diff-skim language: changelog in panel, pending state on graph). User watches their graph assemble in real time.
3. **Connectors + redirect** — manage connected sources; OAuth / redirect / reconnect flows as needed. Classic sources: resume upload/paste, LinkedIn, GitHub.
4. **Agent connectors (later):** connect **Claude / other coding agents** and pull **chat histories** for feature/project-level work → capture → extract. **Build order: after classic MVP imports** (resume / LinkedIn / GitHub) — not parallel with capture+render. Same connector-management surface when the time comes; do not stub loudly in v1 onboarding.

Partial import OK; never block entry on deepen. Land (or already are) on Graph home with a skeleton.

### Generate — composition (contract)

1. **Top-left hamburger** under brand — expands **adapter selection** menu (hover opens while in expansion; click pins open).
2. Choosing an adapter **navigates to that adapter’s page** (own route). Editing does **not** stack more panels over the graph.
3. **Adapter pages** keep graph context via an **expandable peek** (collapsed chip/handle → expands a **mini graph** when wanted) — not always-on.
4. **Adapter internals deferred (U-F)** — resume manager, formats, fork, etc.
5. Thin path still: grounded draft + citations → edit/copy; full editor polish is **U-F**.
6. **First implementation unit:** **capture + render** (get nodes on the canvas). Generate/adapters come after that loop works.

### Settings / export

As expected: account, connector management (including reconnect / redirect), export graph, rare hard-delete. No special homepage role.

### Surfaces explicitly not in v1 home IA

| Surface | Why |
| --- | --- |
| Today / daily inbox / notification center | No daily ritual; use **Deepen backlog** (pull) instead |
| Separate Explore app | Fold into bottom ask bar + floating right results panel |
| Full resume structured editor as home | Building-plan **U-F**; hamburger adapters menu only routes there |
| Obsidian-parity local files | Cloud graph; different product |

---

## Navigation model

```
[Sign-in]
    → Onboarding panel (if empty) — watch Graph build live → Graph home
    → Graph home (returning)

Graph home (full-bleed canvas + overlays)
    → Hover card (peek)
    → Click node → Node modal (header image + straddling title)
    → Bottom ask → Floating right Explore panel (+ graph CoG left; highlights)
    → Capture + → Floating right diff-skim panel (changelog + pending nodes) → confirm → settled
    → Top-right deepen (badge) → backlog panel → Node modal
    → Top-left hamburger → Adapter menu → Adapter page (expandable mini-graph peek)
    → Profile menu → settings / logout
    ↔ List mode (secondary)
    ↔ Graph settings (physics / display / sizing)

Node modal
    → close → Graph (optionally focused)
    → Generate with this node in context

Adapter page
    → back to Graph
    → open cited node → Node modal or return-to-Graph focus
```

Global chrome: brand + hamburger (adapters), bottom ask + filter + graph settings, top-right Capture / deepen / theme / profile. Graph is always the background on home.

---

## Core flows

Altitude: steps, actors, graph mutations, fail/skip. Not UI mockups.

### Flow 1 — Import → diff-skim → enter (live graph)

| | |
| --- | --- |
| **Trigger** | New user / empty graph / “Re-import” |
| **Actors** | User; Extract agent |
| **Steps** | 1) User connects sources and/or answers onboarding steps in a **floating panel**. 2) System creates Capture(s). 3) Extract emits proposal; **floating right diff-skim panel** shows **changelog summary**; **pending endeavor nodes** appear/update on the visible Graph (animate in). 4) User skims changelog + hover pending nodes for per-node diffs; inline fix. 5) Confirm merge → pending clears. 6) Finish on Graph home with skeleton. |
| **Mutations** | Captures immutable; entities + edges + tags written on confirm |
| **Fail / skip** | Partial import OK (one source). Extract failure → retry or manual quick-add. Enter with thin graph — deepen later. **Never** block entry on deep-dives. |

### Flow 2 — Yap → extract → merge (quick-add)

| | |
| --- | --- |
| **Trigger** | Capture + on Graph (mic chrome optional / voice later) |
| **Actors** | User; Extract agent |
| **Steps** | 1) User types yap. 2) Capture saved. 3) Extract proposal. 4) **Floating right diff-skim panel** + **changelog summary** + **pending nodes** animate onto Graph (CoG shifts left). 5) Skim/fix via panel and hover-on-pending. 6) Confirm merge; pending → settled. |
| **Mutations** | Same as import merge; `sourced_from_capture` links |
| **Fail / skip** | User discards proposal → capture may remain for later re-extract; no silent graph write without confirm. |

### Flow 3 — Deepen (backlog + skippable JIT)

| | |
| --- | --- |
| **Trigger** | Top-right deepen control (badge); or JIT when starting Generate on a thin node |
| **Actors** | User; Deepen agent (prompts only) |
| **Steps** | 1) System maintains a **backlog** of thin endeavors (e.g. weak summary / few achievements) — project + role first. 2) User opens backlog panel, picks an item (or hits JIT). 3) Node modal + deepen prompts / chips. 4) Answers → achievements, metrics, people, evidence. 5) Optional: propose Story (draft). Item leaves backlog when no longer thin (or user dismisses/snoozes). |
| **Mutations** | Entity updates; optional Story `draft`; never auto-overwrite `stamped` stories |
| **Fail / skip** | **JIT always skippable** — Generate/export must not hard-gate on depth. Backlog is soft forever — not notifications that demand clearance. |

### Flow 4 — Explore NL → open node

| | |
| --- | --- |
| **Trigger** | Bottom ask bar on Graph |
| **Actors** | User; Explore agent (read-only) |
| **Steps** | 1) User asks NL question. 2) System ranks entities. 3) **Floating right Explore panel** opens (under top-right controls); graph **CoG shifts left**; matching **endeavor** nodes **highlighted**; skill/person/org hits in the panel jump to related endeavors. 4) User clicks → **Node modal** (or focus on canvas). |
| **Mutations** | **None** (read-only). Adapters draft text elsewhere. |
| **Fail / skip** | No hits → clear empty state; suggest broaden filters or capture. Must not invent facts. |

### Flow 5 — Filters on Graph

| | |
| --- | --- |
| **Trigger** | **Filter button** (near bottom ask) → filter menu |
| **Actors** | User |
| **Steps** | 1) User opens filter menu. 2) Selects **kind**(s) and/or **specific** skills/people/orgs (searchable lists; not merely “show Skills as a type”). 3) Canvas **highlights** matching **endeavors** (same language as NL; accent). 4) Active filters appear as removable pills. 5) List mode respects same slice. Ask bar remains independent (can combine). |
| **Mutations** | None |
| **Fail / skip** | Clear filters = full active endeavor graph (archived hidden by default). Empty facet result → empty-state + clear suggestion. |

### Flow 6 — Generate (thin) → cite → edit → export

| | |
| --- | --- |
| **Trigger** | Top-left hamburger → adapter menu; optional selection/context from Graph |
| **Actors** | User; Adapter agent |
| **Steps** | 1) User picks adapter from hamburger menu. 2) Navigate to **adapter page** (**expandable mini-graph peek**). 3) Optional paste JD/question. 4) Agent reads graph (tags narrow → rank); prefers stamped stories. 5) Draft + **citations** to node IDs. 6) User edits text. 7) Copy / download later. |
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
| Filter | Graph (ask bar independent; filter menu + canvas + list) |
| Generate thin | Left Generate sidebar → Adapter page (+ expandable mini-graph peek), Node modal |
| Archive / tags | Node modal |
| Story stamp | Node modal, Generate |

---

## Build note (implementation order)

**First unit:** capture + render — get material in and see nodes on the Obsidian-like **full-bleed** canvas (hover cards + node modal can follow immediately after nodes exist). Overlay panels (Explore / diff-skim / onboarding live-build) and adapter pages come once the graph surface is real. Do not start with resume-editor depth (**U-F**).

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
- [x] Quick-add / diff-skim: **floating right panel** (under top-right controls) + **changelog** + **pending nodes**; graph CoG shifts left
- [x] Ask vs filters: **separate** — **bottom** liquid-glass ask bar + **filter button** (menu, not always-on chips) + **graph settings** (physics/display/sizing)
- [x] Hover card density: **kind-rich** (compact); click → modal with **header image** + title straddling image/body
- [x] Generate entry: **top-left hamburger** → adapter menu (hover expand / click pin) → adapter pages
- [x] Adapter page mini-graph: **expandable peek**; not always-on
- [x] Agent connectors: **after classic MVP only**
- [ ] Mark: stylistic **A** vs **3-point star** (~190° rotation, point at bottom) — brand open
- [ ] Deepen icon: inbox-like vs alternate — lean inbox + badge

---

## Changelog

- **2026-08-03:** **Light mode only in the current slice.** Top-right theme toggle removed;
  dark mode deferred until the visual system is rebuilt on screen (see graph-canvas.md).

- **2026-07-26 (later):** **Node click surface reconsidered: left panel, not a centered
  modal.** The first node-detail build (docs/graph-canvas.md's ninth pass) followed this
  doc's §346 checkbox literally — centered, scrim behind it — and the founder's reaction
  to that description (not yet seen on screen) was that a dark overlay over a live graph
  is heavier than it needs to be, and centering hides the graph rather than sitting next
  to it. It's rebuilt as an opaque **left-side floating panel** with no scrim, and the
  canvas nudges its own visual centre right while the panel is open (a camera-level
  offset, not a re-fit) so nothing sits behind it — see graph-canvas.md's tenth pass.
  The header-image + straddling-title design in the §346 checkbox is **not** part of
  this build (no image field exists on an endeavor yet regardless); that line should be
  read as superseded, not as a rework target the way the straddling-title bug below
  still is.
- **2026-07-26:** **The chrome described here is currently unbuilt — on purpose.** The
  first Graph-home implementation shipped every surface below in one pass and none of
  them landed well; the canvas was rebuilt from scratch and the chrome was deleted with
  it (see [`graph-canvas.md`](graph-canvas.md)). **This doc remains the intended IA** —
  what surfaces exist, what they're for, how they relate — and each one gets built and
  reviewed as its own slice on top of a canvas that reads well. Two specifics that need
  rework when their slice comes up: the **node modal's straddling title** (the title was
  painted under the header image, so the image covered it — the overlap needs an
  explicit stacking context, or the pattern needs replacing), and **liquid-glass
  translucency**, which made text unreadable over the live graph and is shelved in
  favour of opaque surfaces until the visual system is rebuilt from working screens.
- **2026-07-25:** **Graph home built (U-J U3)** — *(superseded 2026-07-26; the code
  described here has been removed)* — the locked chrome now exists in code (`src/features/graph`): full-bleed canvas, bottom ask + filter menu + graph settings, top-left brand/adapters hamburger, top-right capture/deepen/theme/profile, hover card, node modal, floating right panels with CoG shift, quiet empty state. Two additions to this doc's surfaces, both deliberately small: the **empty state offers a "Preview a sample graph" escape hatch** (clearly labelled unsaved) so layout can be dogfooded before Extract exists, and a **sample-graph notice** replaces it while previewing. The **Explore panel currently lists substring matches** rather than ranked hits, and the **deepen backlog uses a placeholder thinness heuristic** — both labelled in-product so no one mistakes them for the real Explore/Deepen agents. Mic in the capture control is present but disabled (voice is out of scope for now).
- **2026-07-20:** Added **§ Route map (Next App Router)** — URL ↔ surface mapping; marks Explore/Capture/Node-modal/Onboarding/Deepen as **overlays on `/`**, not routes. Placeholder route segments scaffolded in `src/app/` (`/settings`, `/generate`, `/adapters/[kind]`, `(auth)/login`) to pin naming.
- **2026-07-15:** Filter/ask canvas cue = **highlight** (accent); dim non-matches deferred (brand).
- **2026-07-15:** Filters clarified — facet **values** (specific skill/person/org + kind), not type toggles onto canvas.
- **2026-07-15:** Graph-home chrome from founder sketch — full-bleed canvas; bottom liquid-glass ask; filter button (not chips); graph settings; top-left brand + hamburger adapters; top-right Capture+/mic, deepen badge, theme, profile; floating right panels; circular force settle; node modal header image + straddling title.
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
