# Acta — Design session handoff

Last updated: 2026-08-03

**Purpose:** Give a visual/design session enough product context to judge surfaces, flows, and chrome **without** reading the whole repo. This doc synthesizes the locked IA from [`surfaces-and-flows.md`](surfaces-and-flows.md) and the **live canvas behavior** from [`graph-canvas.md`](graph-canvas.md), and records **what is on screen today** in tokens, `/home` (graph app), and `/` (waitlist landing).

**Use this when:** exploring typography, spacing, panel shape, iconography, marketing composition, or graph-home chrome.

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
| Warm paper light only (dark mode deferred) | Warm brown dark; rainbow kind colors; AI purple glow |
| **Neubrutalism:** hard **3px ink** borders, **offset shadows** (8px panels / 3px controls), opaque surfaces | Hairline 1px frames; soft elevation-only panels; liquid glass over live graph |
| **Blue primary** (`#6fb3e8`) for settled/accent; **pink secondary** (`#ff2861`) for pending/unresolved | Teal-only accent lock; coral brand; enterprise chrome |
| Pill controls + ask bar; ~18px panel radius; display serif + UI sans + mono caps labels | Mix of stadium pills and sharp boxes in the same cluster |
| Typical readable icons (Lucide-style: gear, inbox, +) | Custom glyphs that need a legend |

Personality: **living · minimal · fluid · personal · interactive**.

Reference mood (non-binding): the feel table above and early HTML mocks — not canon.

---

## Three layers — don’t confuse them

| Layer | Status | Where to look |
| --- | --- | --- |
| **Product IA & flows** | Locked at contract level | [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| **Canvas engine** | Built and tuned; founder-signed physics/hover/selection | [`graph-canvas.md`](graph-canvas.md), `/home` and `/lab/graph` |
| **Visual system (tokens + recipes)** | **Neubrutalism in `tokens.css`** — Claude Design import; replaces archived liquid-glass look | [`src/styles/tokens.css`](../src/styles/tokens.css) |
| **Graph-home chrome** | **Shipped on `/home`** — full Neubrutalism overlay (`surfaces/graph-home.tsx`) | `src/features/graph/surfaces/` |
| **Marketing / waitlist** | **Shipped at `/`** — slide-scroll waitlist landing (public) | `src/features/landing/` |

**Important:** The first full-home chrome build was scrapped (2026-07-26). IA in surfaces-and-flows is still the target; pixels are rediscovered one slice at a time. The up-front teal + liquid-glass direction was scrapped with it — **do not resurrect.** Prefer **what works on screen** and `tokens.css`.

---

## Spatial layout — Graph home

One viewport. **Graph = entire background.** No outer app frame.

```
┌──────────────────────────────────────────────────────────────────┐
│  [≡] Acta          (adapter menu drops below hamburger)           │
│                      [Capture] [Deepen•] [☀] [Profile]          │
│                                                                   │
│                    ·  ·  GRAPH (full-bleed)  ·  ·                  │
│                 ·                              ·    ┌─────────────┐ │
│              ·                                   ·  │ Explore     │ │
│                                                    │ right panel │ │
│                                                    └─────────────┘ │
│  ┌─────────────────────┐                                          │
│  │ node detail panel   │     (left, opaque, × top-right)          │
│  └─────────────────────┘                                          │
│                                                                   │
│     [ask bar …]  [Explore] [Filter] [settings]                    │
└──────────────────────────────────────────────────────────────────┘
```

**Z-order (back → front):** canvas → hover card → floating panels (Explore, diff-skim, detail) → persistent chrome (brand, top-right, bottom ask cluster) → lab instrumentation (dev only).

**When a right panel opens:** graph **center of gravity shifts left** so nodes stay visible beside the panel (camera nudge, not re-layout).

**When the left detail panel opens:** graph nudges **right** (~150px screen offset) so the selected neighborhood isn’t hidden behind the panel.

---

## Graph canvas — interaction contract (built today)

These behaviors are **real on `/home`** and should not be designed away accidentally.

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

- **Product rule (R7):** text over a **moving** graph must sit on **opaque** surfaces. No backdrop blur, no scrims, no liquid glass on `/home`.
- **Neubrutalism chrome:** hard ink border + offset shadow on panels and controls (`acta-panel`, `acta-control` in `tokens.css`).
- **Dismiss control:** `.acta-panel-close` — bare **×**, always **top-right**; first row uses `--panel-close-gutter`.
- **Chrome bands:** `--chrome-top` / `--chrome-bottom` keep floating panels off the ask row on graph home.

---

## Marketing landing (`/` — public)

Waitlist surface from the Claude Design import — **not** signed-in graph home. `/landing` redirects here.

| Aspect | Current build |
| --- | --- |
| **Funnel** | Waitlist only (no Sign in) |
| **Hero** | Live graph ~⅔ width; cycling headline verb |
| **Scroll** | Slide mode via anime.js (wheel between viewport slides) when motion allowed |
| **Enter motion** | Per-slide `data-enter` recipes in `landing-slide-enters.ts` |
| **Slides** | Hero → Three moves → Importers → Kinds → Compare → Outputs → Full-bleed waitlist CTA |

Public — no session required. Sign in from the landing page goes to `/home`.

---

## Visual system — Neubrutalism (`tokens.css`)

SoT: [`src/styles/tokens.css`](../src/styles/tokens.css). Superseded liquid-glass direction — do not resurrect.

| Family | Notes |
| --- | --- |
| Surfaces | `--bg-paper`, `--bg-panel`, `--bg-card` — opaque |
| Ink + borders | `--ink`, `--border-ink` (3px), `--border-ink-soft` (2px) |
| Brand | Blue primary (settled/accent); pink secondary (pending) |
| Elevation | `--shadow-panel` 8px; `--shadow-control` 3px |
| Type | Charis SIL + Figtree + Space Mono; `.acta-button` for CTAs |
| Motion | `motion/enter.ts` (graph); `landing-slide-enters.ts` (marketing) |

**Layout rule:** controls must not change width when toggled (e.g. Explore label stays “Explore”).

---

## Chrome inventory — what each control is for

### Top-left — brand + adapters

| Control | Behavior |
| --- | --- |
| **Logo + “Acta” wordmark** | Brand anchor — **horizontal row:** hamburger, then wordmark. Logo mark **unset**. |
| **Hamburger** | Beside wordmark (not stacked below). Opens **adapter menu** dropping **below** the hamburger. Hover: open in menu zone; click: pin until dismiss or pick. Labels only in lab — no real adapter routes yet. |

### Top-right — capture, deepen, theme, account

| Control | Behavior |
| --- | --- |
| **Capture** | Primary CTA — distinct filled accent. Opens capture → extract → **diff-skim** flow (not wired in lab). **Mic** attached for future voice; type is MVP. |
| **Deepen** | Inbox-like icon + **badge** (count of thin endeavors). Opens **pull backlog** panel — “stuff to fill,” **not** a Today inbox or push notification center. |
| **Profile** | Avatar + name → menu: profile, account settings, app settings, logout (menu not fully mocked). |

### Bottom — ask / filter / graph settings

| Control | Behavior |
| --- | --- |
| **Ask bar** | Persistent NL query. Submit → Explore right panel + canvas highlight (future on `/home`). |
| **Explore** | Lab: **toggle in ask row** (fixed “Explore” label; does not resize chrome). Opens mocked Explore panel. |
| **Filter button** | Opens filter menu (lab: inert). |
| **Graph settings (gear)** | Physics/display — lab HUD on `/lab/graph` only. |

### Floating right panel — Explore & diff-skim (same family)

| Mode | Opens when | Contents | Canvas |
| --- | --- | --- | --- |
| **Explore** | Ask bar query | Ranked hits list; click row → detail panel or focus | Matching endeavors **highlighted**; CoG shifts **left** |
| **Diff-skim** | Capture / import confirm | **Changelog** summary at top; expand rows for field edits | **Pending** endeavor nodes (dashed/ghost — not built); animate in; Confirm/Discard |

Close panel → graph reframes to normal. Panel **×** uses `.acta-panel-close` (top-right).

### Left detail panel — selected node (built; supersedes old “centered modal”)

**Do not design a centered modal with scrim** for the primary node read — that was tried, rejected before on-screen review, and rebuilt.

| Aspect | Contract |
| --- | --- |
| **Position** | Fixed **left**, vertically centered, opaque |
| **Scrim** | **None** — graph stays fully visible beside it |
| **Open** | Click node on canvas |
| **Close** | Escape, **×** (top-right), click background, select different node |
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
Graph home (/home)
  hover node        → hover card (if none selected)
  click node        → left detail panel + selection highlight
  ask bar           → Explore right panel + highlights
  Capture           → diff-skim right panel + pending nodes (future)
  Deepen badge      → backlog panel → detail panel
  hamburger         → adapter menu → /adapters/[kind] routes
  profile           → /settings, logout

Marketing (/)       → waitlist; Sign in → /home
Adapter pages       → own routes; expandable mini-graph peek (future)
```

Most graph-adjacent UI is **overlays on `/home`**, not separate pages. No `/explore` or `/capture` routes.

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

- **Tokens:** single source [`src/styles/tokens.css`](../src/styles/tokens.css) — Neubrutalism (see above).
- **Panels and controls:** opaque; separated by **ink border + offset shadow**, not hairline elevation-only chrome.
- **Panel dismiss:** `.acta-panel-close` — top-right ×; `--panel-close-gutter` on first row.
- **Scrollbars:** ink thumb, track-less — global in `base.css`.
- **Icons:** Lucide in graph code; lab uses simple glyphs where icons are not wired yet.
- **Typography:** Charis SIL (display), Figtree (UI), Space Mono (labels) via `next/font` → `--font-*-loaded`.
- **Motion:** anime.js for graph enter (`motion/enter.ts`) and landing slide enters (`landing-slide-enters.ts`). Respect `prefers-reduced-motion`.

---

## Explicitly out of scope for home IA

- “Today” / daily inbox / notification center home
- Separate Explore app
- Skills/people/orgs as canvas physics nodes
- Full resume structured editor on home (adapter pages / U-F)
- Translucent text panels over moving graph on shipped `/home` until legibility proven

---

## What exists in code today (quick map)

| Surface | `/home` (graph app) | `/` (landing) |
| --- | --- | --- |
| Live graph + hover + selection | Yes | Hero only |
| Left detail panel | Yes | — |
| Hover peek card | Yes | — |
| Ask bar, filter, settings, Explore toggle | Mocked (inert except hamburger / Explore / deepen) | — |
| Explore panel | Mocked | — |
| Capture / deepen / profile | Mocked (inert) | — |
| Adapter hamburger menu | Mocked | — |
| Waitlist marketing + slide scroll | **No** | Yes |
| Neubrutalism tokens + recipes | Yes | Yes |

Dev route: `/lab/graph` (physics HUD; 404 in production). `/landing` redirects to `/`.

Implementation map:

| Area | Path |
| --- | --- |
| Tokens + global recipes | `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/tailwind.css` |
| Graph canvas + home chrome | `src/features/graph/` — `engine/` (physics), `surfaces/` (UI), `lab/` (dev workbench) |
| Landing page | `src/features/landing/` (incl. `landing-scroll.ts`, `landing-slide-enters.ts`) |
| Shared motion | `src/features/motion/` |

---

## Open visual decisions (safe to explore in design)

- Logo mark (star vs A vs other) — wordmark-only for now
- Exact density of Explore/diff-skim panel typography when wired for real
- Deepen icon exact shape (inbox-like + badge is the lean)
- Detail panel header image when image field exists (superseded centered-modal language in surfaces-and-flows)
- Light-mode node/edge contrast floors on `/home`
- Landing slide timing / per-section motion polish (structure in place)
- Wire Capture / ask / profile to real flows (U4+)

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

---

## Changelog

- **2026-08-03:** **Light mode only** — removed dark theme CSS, theme toggle, and `localStorage` preference. `html[data-mode="light"]` is set in the root layout.

- **2026-08-03:** **`/` = public waitlist; `/home` = graph app.** Removed stale `/lab/design` references — chrome ships on `/home` only. `/landing` redirects to `/`. Deleted `docs/archive/` — superseded specs removed; lessons stay in this doc and `graph-canvas.md`.

- **2026-07-31:** Neubrutalism tokens + recipes documented; liquid-glass / design-system switcher removed; waitlist landing (slide scroll, per-slide `data-enter` motion); chrome layout updates (horizontal brand row, Explore in ask row, panel close rule, chrome bands); compare/outputs landing slide layout notes.
- **2026-07-29:** Initial design-session handoff — synthesizes surfaces-and-flows IA, graph-canvas live behavior, post-scrap chrome rebuild status, left-panel pivot, opaque-over-graph rule.
