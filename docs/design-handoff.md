# Acta — Design session handoff

Last updated: 2026-07-29

**Purpose:** Give a visual/design session enough product context to judge surfaces, flows, and chrome **without** reading the whole repo. This doc synthesizes the locked IA from [`surfaces-and-flows.md`](surfaces-and-flows.md) and the **live canvas behavior** from [`graph-canvas.md`](graph-canvas.md), and flags where implementation has already diverged from older mock language.

**Use this when:** exploring typography, spacing, glass vs opaque, panel shape, iconography, or full-home composition.

**Do not treat as canon for:** schema, agent write policy, or roadmap sequencing — see companion docs linked at the bottom.

---

## What Acta is (30 seconds)

**Acta** is a personal evidence graph: capture life material over time, structure it into endeavors and stories, and later generate grounded artifacts (resume bullets, interview answers, etc.) as *views* over one graph — not separate documents.

**Home = the graph.** The canvas is the app background. Everything else is overlay chrome or a floating panel. The product should feel like **Obsidian's graph view** with calm, modern controls on top — living, minimal, fluid, personal — **not** a dashboard, notification center, or daily planner.

**Canvas nodes = Endeavors only** (jobs, projects, roles, events, education, hobbies, etc.). Skills, people, and orgs exist as **data and filters**, not as dots on the plane.

---

## Feel — what “right” should read as

| Aim for | Avoid |
| --- | --- |
| Full-bleed graph; substance on **hover** and in **panels/modals** | Content cards permanently glued to the canvas (Heptabase-style) |
| Small constellation of dots; captions gated on zoom | Large diagram circles; half-labelled graph |
| Warm paper light + neutral graphite dark | Warm brown dark; rainbow kind colors; AI purple glow |
| Monochrome neutrals + **one teal accent**, used sparingly | Coral brand, enterprise chrome, notification-center energy |
| Shared control language; elevation/blur/fill — **no hairline borders** on overlay panels | Inconsistent button shapes; thin 1px frames everywhere |
| Medium-to-full rounding on controls (current lab leans **pill** on buttons/ask bar; panels slightly softer) | Mix of stadium pills and sharp boxes in the same cluster |
| Typical readable icons (Lucide-style: sun/moon, gear, inbox, +) | Custom glyphs that need a legend |

Personality: **living · minimal · fluid · personal · interactive**.

Reference mood (non-binding archive): [`archive/mockup-synthesis.md`](archive/mockup-synthesis.md), [`archive/brand-decision-comparisons.html`](archive/brand-decision-comparisons.html).

---

## Three layers — don’t confuse them

| Layer | Status | Where to look |
| --- | --- | --- |
| **Product IA & flows** | Locked at contract level | [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| **Canvas engine** | Built and tuned; founder-signed physics/hover/selection | [`graph-canvas.md`](graph-canvas.md), `/` and `/lab/graph` |
| **Home chrome visuals** | **In exploration** — `/lab/design` mocks full homepage chrome over live graph; design systems `opaque` vs `liquid-glass` | `src/features/design-lab/`, `src/styles/tokens.css` |

**Important:** The first full-home chrome build was scrapped (2026-07-26). IA in surfaces-and-flows is still the target; pixels are being rediscovered one slice at a time. Prefer **what works on screen** over archived mock HTML.

---

## Spatial layout — Graph home

One viewport. **Graph = entire background.** No outer app frame.

```
┌──────────────────────────────────────────────────────────────────┐
│  Acta (+ logo TBD)                    [Capture] [Deepen•] [☀] [Profile] │
│  [≡ adapters]                                                     │
│                                                                   │
│                    ·  ·  GRAPH (full-bleed)  ·  ·                  │
│                 ·                              ·    ┌─────────────┐ │
│              ·                                   ·  │ floating    │ │
│                                                    │ right panel │ │
│                                                    │ Explore /   │ │
│                                                    │ diff-skim   │ │
│                                                    └─────────────┘ │
│  ┌─────────────────────┐                                          │
│  │ node detail panel   │     (left, when node selected)           │
│  └─────────────────────┘                                          │
│                                                                   │
│     [opaque / liquid-glass ask bar …]    [filter] [graph settings] │
└──────────────────────────────────────────────────────────────────┘
```

**Z-order (back → front):** canvas → hover card → floating panels (Explore, diff-skim, detail) → persistent chrome (brand, top-right, bottom ask cluster) → lab instrumentation (dev only).

**When a right panel opens:** graph **center of gravity shifts left** so nodes stay visible beside the panel (camera nudge, not re-layout).

**When the left detail panel opens:** graph nudges **right** (~150px screen offset) so the selected neighborhood isn’t hidden behind the panel.

---

## Graph canvas — interaction contract (built today)

These behaviors are **real on `/` and `/lab/design`** and should not be designed away accidentally.

### Pan & zoom

| Input | Behavior |
| --- | --- |
| Trackpad / mouse wheel (no modifier) | **Pan** the canvas (Figma-style) |
| Pinch, or ⌘/Ctrl + wheel | **Zoom** toward cursor |
| Double-click fit, keyboard zoom | **Not built** |

### Nodes & edges

| Action | Behavior |
| --- | --- |
| **Hover** (nothing selected) | Hovered node + its **link neighbours** stay bright; rest of graph **dims** (~16%). Hovered node’s **links turn accent**. Exactly **one caption** — the node under the pointer (neighbours stay dots only). Compact **hover card** follows pointer. Fade ~130ms in / ~90ms out. |
| **Hover** (node already selected) | **No hover card.** Hovering a **different** node **previews it in the left detail panel** and temporarily gives that node the green accent on canvas. Revert panel + accent when hover clears. |
| **Click node** | **Selects** node: sustained highlight, opens **left detail panel** (opaque, no scrim). Background dim stays pinned while selected. |
| **Click empty canvas** | Deselects; panel closes; camera offset eases back. |
| **Drag node** | Node sticks to pointer; neighbours respond **locally**; far side of graph should **not shimmer**. Release → eases back toward rest (may take a moment — OK). |
| **Click node** | Does **not** move other nodes. |

### Captions

- Below zoom threshold: **no captions at all**.
- Above threshold: **all** captions that fit — never a random subset.
- Threshold crossing: **fade**, not pop.

### Visual settings vs physics

- **Node size slider** (lab HUD on `/lab/graph` only): changes **draw size only**, moves nothing.
- Physics forces (gravity, repulsion, link distance/strength) are separate tunables.

### Surfaces over the graph

- **Product rule (R7):** text over a **moving** graph must sit on **opaque** surfaces until basics read well. Translucent “liquid glass” over live canvas was shelved on `/` for legibility.
- **Design lab exception:** `/lab/design` deliberately tests `liquid-glass` frost on chrome to compare against `opaque`. That’s experimentation, not shipped product policy yet.

---

## Chrome inventory — what each control is for

### Top-left — brand + adapters

| Control | Behavior |
| --- | --- |
| **Logo + “Acta” wordmark** | Brand anchor. Logo **unset** — three-point star and stylistic A were candidates; current builds use wordmark only. |
| **Hamburger (under brand)** | Opens **adapter menu** (Resume, LinkedIn bio, cover letter, brag doc, …). **Hover:** open while pointer in menu zone; leave → close. **Click:** pin open until dismiss or pick. Choosing an adapter **navigates away** from graph to that adapter route (not built as real nav in lab — labels only). |

### Top-right — capture, deepen, theme, account

| Control | Behavior |
| --- | --- |
| **Capture** | Primary CTA — distinct filled accent. Opens capture → extract → **diff-skim** flow (not wired in lab). **Mic** attached for future voice; type is MVP. |
| **Deepen** | Inbox-like icon + **badge** (count of thin endeavors). Opens **pull backlog** panel — “stuff to fill,” **not** a Today inbox or push notification center. |
| **Theme** | Sun/moon toggles light/dark. Both themes first-class; must actually repaint canvas + chrome. |
| **Profile** | Avatar + name → menu: profile, account settings, app settings, logout (menu not fully mocked). |

### Bottom — ask / filter / graph settings

| Control | Behavior |
| --- | --- |
| **Ask bar** | Persistent NL query (“what have I done with Redis?”). Chat-like prompt affordance. Submit → **Explore results** in floating **right panel** + **canvas highlight** on matching endeavors. **Not** a separate Explore app/route. |
| **Send / arrow** | Submits ask (lab: decorative). Should stay visually **subordinate** — not a second glass pill inside the field. |
| **Filter button** | Opens filter **menu** (not always-visible chips). User picks **kind** and/or **specific** skill/person/org **values** → highlights matching **endeavors** on canvas (same accent language as NL). Active filters → removable pills. Does **not** add skill/person/org nodes to canvas. |
| **Graph settings (gear)** | Physics, display, sizing — highly tunable; defaults calm/Obsidian-like. Opens panel (not built on home yet; exists in lab HUD on `/lab/graph`). |

### Floating right panel — Explore & diff-skim (same family)

| Mode | Opens when | Contents | Canvas |
| --- | --- | --- | --- |
| **Explore** | Ask bar query | Ranked hits list; click row → detail panel or focus | Matching endeavors **highlighted**; CoG shifts **left** |
| **Diff-skim** | Capture / import confirm | **Changelog** summary at top; expand rows for field edits | **Pending** endeavor nodes (dashed/ghost — not built); animate in; Confirm/Discard |

Close panel → graph reframes to normal.

### Left detail panel — selected node (built; supersedes old “centered modal”)

**Do not design a centered modal with scrim** for the primary node read — that was tried, rejected before on-screen review, and rebuilt.

| Aspect | Contract |
| --- | --- |
| **Position** | Fixed **left**, vertically centered, opaque |
| **Scrim** | **None** — graph stays fully visible beside it |
| **Open** | Click node on canvas |
| **Close** | Escape, close button, click background, select different node |
| **Content today** | Kind, status, timeframe, title, summary, tags, skill/people/org chips — read-only from graph data |
| **Content later** | Header image, editable tags, deepen prompts, achievements, evidence, Generate CTA, archive — **not in current build** |
| **Header image + straddling title** | Was in early IA/mock language; **no image field exists yet** — treat as future, not current layout target |

### Hover card (built)

| Aspect | Contract |
| --- | --- |
| **When** | Pointer over node, **only if nothing selected** |
| **Placement** | Near cursor; flips above pointer when near bottom edge |
| **Content** | Kind, timeframe, title, summary snippet, up to 3 facet tokens |
| **Look** | Compact peek — **not** the full detail panel |

---

## Navigation model (high level)

```
Graph home (/)
  hover node        → hover card (if none selected)
  click node        → left detail panel + selection highlight
  ask bar           → Explore right panel + highlights
  Capture           → diff-skim right panel + pending nodes (future)
  Deepen badge      → backlog panel → detail panel
  hamburger         → adapter menu → /adapters/[kind] routes
  profile           → /settings, logout

Adapter pages       → own routes; expandable mini-graph peek (future)
```

Most graph-adjacent UI is **overlays on `/`**, not separate pages. No `/explore` or `/capture` routes.

---

## Flows designers should respect

| User goal | Primary path | Graph writes? |
| --- | --- | --- |
| Add material | Capture → diff-skim → confirm | Yes, after confirm |
| Find past work | Ask bar or filters → Explore panel | No (read-only) |
| Understand one endeavor | Hover (peek) → click (detail) | No |
| Fill in thin entries | Deepen backlog → detail + prompts | Yes, user/agent guided |
| Generate artifact | Hamburger → adapter page | Draft stories maybe; no invented facts |
| Onboarding | Connector panel + live graph build | Same diff-skim language |

**Deepen** is always **pull**, never blocking capture/explore/generate.

**Agents** propose; user confirms before graph writes (except explicit auto paths — not home chrome concern).

---

## Visual system constraints (engineering)

- **Tokens:** single source `src/styles/tokens.css` — warm paper light, neutral dark, teal accent.
- **No hairline borders** on overlay panels — separate with elevation, shadow, fill, blur.
- **Backdrop-filter order:** in CSS, write `-webkit-backdrop-filter` **first**, unprefixed `backdrop-filter` **last** (identical values). Next’s CSS pipeline drops blur otherwise on Chrome 150+.
- **Scrollbars:** always styled to match app — never browser default.
- **Icons:** Lucide set in current code.
- **Typography:** UI sans + display serif for “Acta” wordmark (Charis SIL in brand archive).
- **Liquid glass:** frost via backdrop blur + translucent fill + rim highlights — **not** SVG lens/refraction (experiment removed; invisible on this sparse canvas anyway).

---

## Explicitly out of scope for home IA

- “Today” / daily inbox / notification center home
- Separate Explore app
- Skills/people/orgs as canvas physics nodes
- Full resume structured editor on home (adapter pages / U-F)
- Translucent text panels over moving graph on shipped `/` until legibility proven

---

## What exists in code today (quick map)

| Surface | `/` (product) | `/lab/design` (chrome mock) |
| --- | --- | --- |
| Live graph + hover + selection | Yes | Yes |
| Left detail panel | Yes | Yes (mock styling) |
| Hover card | Yes | Yes |
| Theme toggle | Yes (top-right) | Yes (styled per design system) |
| Ask bar, filter, settings | **No** | Mocked |
| Explore / diff-skim panels | **No** | Explore mocked via lab toggle |
| Capture / deepen / profile menus | **No** | Mocked (mostly inert) |
| Adapter hamburger menu | **No** | Mocked (toggle menu) |
| Design system switcher | **No** | `opaque` / `liquid-glass` |

Dev routes: `/lab/graph` (physics HUD), `/lab/design` (full chrome + design systems). Both 404 in production.

---

## Open visual decisions (safe to explore in design)

- Logo mark (star vs A vs other) — wordmark-only for now
- Exact pill vs panel corner radii (lab currently: pill controls, ~24px panels)
- Liquid glass vs opaque on chrome when graph is visible behind it
- Deepen icon exact shape (inbox-like + badge is the lean)
- Hover/detail header image treatment when image field exists
- Density of Explore/diff-skim panel typography
- Light-mode node/edge contrast floors

---

## Canon docs (read if you need depth)

| Doc | Owns |
| --- | --- |
| [`surfaces-and-flows.md`](surfaces-and-flows.md) | IA, surfaces, flows, route map |
| [`graph-canvas.md`](graph-canvas.md) | Canvas requirements, built behavior, physics feel |
| [`personal-evidence-graph.md`](personal-evidence-graph.md) | Product vision, wedge, scope |
| [`data-model.md`](data-model.md) | Entities, endeavors, facets |
| [`agent-interaction-model.md`](agent-interaction-model.md) | Confirm vs auto writes |
| [`building-plan.md`](building-plan.md) | Roadmap units U-A…U-J |

**Archive (reasoning only, not implementation canon):** `docs/archive/mockup-synthesis.md`, `docs/archive/brand-design-system.md`, `docs/archive/brand-mockups.html`, `docs/archive/brand-decision-comparisons.html`.

---

## Changelog

- **2026-07-29:** Initial design-session handoff — synthesizes surfaces-and-flows IA, graph-canvas live behavior, post-scrap chrome rebuild status, left-panel pivot, opaque-over-graph rule, and `/lab/design` scope.
