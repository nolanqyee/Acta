# Graph canvas — the live spec

Last updated: 2026-08-03

This replaces `archive/graph-physics.md`. That doc specified a canvas in detail before
one existed; this one records only what is **true of the running canvas or required of
it**, in terms you can check by looking at the screen.

**How we work on this:** one slice at a time, verified in a browser before moving on.
The canvas engine comes first and alone — no chrome, no modals, no panels — because
everything else sits on top of how it feels to look at and drag.

---

## Why the first attempt failed

Worth keeping, because the failure was structural, not cosmetic:

1. **The physics ran inside a wrapper** (`react-force-graph-2d`). The simulation loop,
   the zoom transform, drag handling, and redraw scheduling all lived in the library.
   Every requirement below is a property of exactly those four things, so tuning
   parameters from outside could never reach them.
2. **It was verified headlessly.** A test measured crossings and roundness in a
   simulation and passed, while the actual screen looked wrong. Numbers are useful
   *after* the thing looks right, as a regression guard — never as a substitute for
   looking.
3. **The whole UI was built in one pass.** Canvas, chrome, hover cards, modal, panels,
   theming, empty state — all at once, so nothing got the attention it needed and the
   flaws compounded.

---

## Hard requirements

These come from the founder directly. Each is stated so it can be judged from a
screenshot or a screen recording.

| # | Requirement | How we judge it |
| --- | --- | --- |
| R1 | **The graph's overall shape is circular** — as if gravity pulled everything toward the centre. | At rest, the node cloud reads as a rough disc, not a sprawl, a chain, or arms. Nothing drifts off toward a corner. |
| R2 | **Nodes are small.** | A node is a small dot; the graph reads as a constellation of points, not a diagram of circles. |
| R3 | **Captions are all-or-nothing, gated on zoom.** You never see a half-labelled graph. | Below the threshold: no captions. Above it: every caption, none overlapping. Crossing the threshold is a fade, not a pop. A view is either quiet or fully readable — never a scatter of the few names that happened to fit. |
| R4 | **Dragging is extremely smooth**, and neighbours respond. Settling back to rest may take time — that's fine and desirable. | Dragging a node feels stuck to the pointer with no lag or stutter; connected nodes follow with elastic give; on release the graph eases back to rest rather than snapping. |
| R8 | **An interaction is local, and nothing shimmers.** Moving one node disturbs its neighbourhood, not the graph. | Drag a node across the canvas: nodes near it (by link or by proximity) get shoved aside and follow; the far side of the cloud is pixel-identical before and after. **Nothing outside the neighbourhood moves at all — not even a shiver.** Watch the far side during the drag, not just before and after. **Clicking a node moves nothing.** |
| R10 | **Visual settings are not physics settings.** | Moving the node-size slider changes how big the dots are drawn and moves nothing. |
| R9 | **Hover answers "what is this and what does it touch?"** | Pointing at a node names **only that node**, lights its links in the accent colour and keeps its neighbours' dots bright; the rest of the graph fades back but stays visible as context. Works at any zoom, including where captions are off. The whole treatment fades in over ~130ms rather than switching on — check by hovering, not from a still. |
| R5 | **Forces: centre, node-node repulsion, link spring with a link distance.** | All four exist as real, separately tunable forces. Centre gravity must pull every node (a force that only recentres the average position is not gravity — that was the first build's bug). |
| R6 | **Edges may cross, but must stay visually subtle** so they never compete with the nodes. | Hairline, low-contrast, straight. At a glance you see the nodes; the edges are texture. Crossings are acceptable and should be unremarkable. |
| R7 | **No translucent surfaces over live content for now.** | Any panel or card is opaque. Liquid glass and backdrop blur are shelved — translucency over a moving graph made text unreadable. Current chrome direction: Neubrutalism (ink border + offset shadow); see [`tokens.css`](../src/styles/tokens.css) `.acta-*` recipes. |

---

## What exists now

Rebuilt 2026-07-26 on our own render loop. `react-force-graph-2d` is gone.

| Module | Role |
| --- | --- |
| **Engine** (`engine/`) — must not import `surfaces/` or `lab/` | |
| [`tunables.ts`](../src/features/graph/engine/tunables.ts) | The four forces as numbers, with slider ranges. The only place defaults live. |
| [`simulation.ts`](../src/features/graph/engine/simulation.ts) | `GraphSimulation` — a `d3-force` layout with its internal timer disabled, stepped one tick per painted frame. Owns drag pinning and reheat/settle. |
| [`seed.ts`](../src/features/graph/engine/seed.ts) | Deterministic starting positions: containment groups start together, groups spiral out from the centre. |
| [`camera.ts`](../src/features/graph/engine/camera.ts) | Pan/zoom/fit, the exact screen↔world inverse that drag and hit-testing depend on, and a screen-space focus offset (eased by the canvas loop) that nudges the graph clear of the left detail panel. |
| [`render.ts`](../src/features/graph/engine/render.ts) | One frame: hairline edges, small dots, and the captions that have room. |
| [`palette.ts`](../src/features/graph/engine/palette.ts) | Resolves `tokens.css` custom properties into values a canvas can draw with. |
| [`node-visual.ts`](../src/features/graph/engine/node-visual.ts) | Node fill/stroke/hover-dim paint states for the canvas renderer. |
| [`graph-canvas.tsx`](../src/features/graph/engine/graph-canvas.tsx) | The `<canvas>`, the `requestAnimationFrame` loop, pointer/wheel/resize handling. Nothing per-frame goes through React state. |
| **Surfaces** (`surfaces/`) | |
| [`graph-home.tsx`](../src/features/graph/surfaces/graph-home.tsx) | The `/home` surface: fetch `GET /api/graph`, fall back to the sample fixture, Neubrutalism product chrome + canvas + hover/selection/detail (inline panels). |
| [`hover-card-placement.ts`](../src/features/graph/surfaces/hover-card-placement.ts) | Pure geometry — keeps a hover peek card on-screen (flip above/below pointer). |
| [`format-endeavor.ts`](../src/features/graph/surfaces/format-endeavor.ts) | Shared text formatting (kind/status humanizing, fuzzy-date spans) for graph chrome. |
| **Lab** (`lab/`) — dev-only | |
| [`dev-hud.tsx`](../src/features/graph/lab/dev-hud.tsx) | Opaque sliders for the forces plus a frame counter. **Lab only** — it used to render on `/` too, which it never should have. |
| [`graph-lab.tsx`](../src/features/graph/lab/graph-lab.tsx) + [`/lab/graph`](../src/app/lab/graph/page.tsx) | Dev-only workbench (404s in production, open without a session outside it). `?n=140` generates a fixture of that size; `?gravity=0.5&repulsion=12&…` overrides forces. |
| [`lab-fixture.ts`](../src/features/graph/lab/lab-fixture.ts) | Synthetic graph generator for scale testing in the lab. |
| [`../motion/enter.ts`](../src/features/motion/enter.ts) | Shared anime.js enter animations (panel fade/pop; hover card fade). |

**How the requirements are met.** Gravity is a per-node pull toward the origin, so
every node is pulled (R1); repulsion is global, with the disc's size set by the balance
between the two (it used to be capped at 3× link distance — see below for why that had
to go). Dots are world-scaled but clamped to 1.4–9 px
(R2). Captions appear as a set once zoom passes a threshold that is *measured* from the
layout — for each node, the zoom its title would need to clear its nearest neighbour;
the threshold is the 60th percentile of those, with a short fade band below it (R3).
Drag sets the node's fixed position from the pointer and holds a low alpha; release
un-pins it and lets it ease back (R4). Edges are straight hairlines at token `--edge`
opacity, drawn beneath the dots (R6). Every surface here is opaque (R7). Locality (R8)
comes from **anchors** — see below. Hover (R9) dims non-neighbours to 16% and promotes
the hovered node's own links to the accent colour, all of it driven off a single 0–1
`HoverFade` value so dim, accent, dot size and caption arrive together. Node size is
visual only (R10):
collision spacing derives from link distance, and changing only `nodeRadius` skips the
reheat entirely.

### Why the graph shivered — the real cause

Worth reading before touching the physics, because two plausible fixes were tried first
and both made it worse.

`d3-force` stops because **alpha decayed to nothing, not because the forces cancelled**.
A "settled" layout is really frozen mid-fall, with substantial net force still on every
node — gravity especially, since it grows with distance from the centre and is balanced
only approximately by repulsion. Alpha is global; there is no per-node alpha. So raising
it to drag one node *resumes every node's interrupted fall at once*. That is the shiver,
and it is why the graph felt over-responsive to small forces.

Four things fix it together:

1. **Repulsion accuracy.** `forceManyBody` is a Barnes–Hut approximation: distant nodes
   are lumped into quadtree cells, and `theta` sets how coarse that may be. d3's default
   of 0.9 is coarse and the tree is rebuilt every tick, so as nodes move the force on
   them jumps between "use this cell" and "recurse into it" — **frame-to-frame noise
   with no physical cause.** `theta` 0.9 → 0.5 more than halved measured roughness and
   cut the number of drifting nodes by three quarters. A large share of what looked like
   the whole graph reacting was simply this error pushing it around. **Suspect this
   first** when motion looks wrong for no reason.
2. **Converge before declaring rest.** `GraphSimulation.converge()` runs at a fixed
   alpha with heavy damping until peak node speed drops near zero, so there is little
   left to resume. Without the extra damping it never converges at all — `forceCollide`
   is a position constraint that trades pushes with the springs forever, and peak speed
   just oscillates around 1 unit/tick.
3. **Anchors, relaxed by a gradient.** At rest each node records where it settled and
   gets a stiff spring back to that spot, *in addition to* gravity. A drag scales that
   spring down smoothly — to zero at the pointer, back to full about six link distances
   out — and lets a disturbed node's anchor drift toward where it now is, so the wake
   closes behind the pointer instead of re-inflating.
4. **Damping.** Velocity decay 0.35 → 0.65: the viscosity of the medium.

Measured on a 140-node drag: sustained travel of far nodes fell from **1.6 px/frame to
0.07 world units/tick**, net far drift from ~92 to **1.4 world units**, and motion
roughness — frame-to-frame velocity change over speed, i.e. knocking about versus
gliding — from **0.94 to 0.33**.

### The feel dials

Both trade the same way, monotonically, so pick a point rather than hunting an optimum.

| | lower | higher |
| --- | --- | --- |
| `VELOCITY_DECAY` (0.65) | looser, more of the cloud sloshes, rougher | calmer, more local, smoother |
| `ANCHOR_STRENGTH` (6) | graph creeps on every reheat | more locked; past ~8 the spring itself rings |
| `ALPHA_DECAY` (0.03) | longer settle — but the tail is shimmer, not useful motion | snappier; move `REHEAT_ALPHA` with it |

Total rearrangement from a disturbance is proportional to `alpha / ALPHA_DECAY`, so those
two move together: changing one alone changes how *far* the layout settles, not just how
long it takes.

`DRAG_INFLUENCE_RADIUS` (6 link distances) is how wide the wake is; `HOP_HOLD` decides
how much linked nodes follow regardless of distance. **A hard edge anywhere in this
field is what reads as Lego** — the earlier binary free-or-held set put one straight
through the middle of the graph.

**Two approaches that failed, so they are not retried.** *Pinning* distant nodes with
`fx`/`fy` makes them infinitely massive walls: a node squeezed between the pointer and a
frozen neighbour is pushed, has half the correction discarded by the pin, and is pushed
again every frame — it buzzes forever. This passed the net-displacement locality test
while looking far worse, which is why R8 is now judged *during* the drag and guarded by a
travel-per-tick test. *Substituting* the anchor for gravity (rather than adding to it)
inflates the graph by ~90 units, because gravity is also the containment balancing
repulsion.

A drag no longer reheats on start; on release it does, which is safe precisely because
anchors hold everyone else (under two world units of drift across a full reheat) and it
keeps a dropped node from hanging on a stretched link.

**Repulsion is a 0–20 dial, not a raw charge.** It is expressed as a multiple of link
distance (`repulsionCharge`), so the slider's ends both behave and the layout keeps its
proportions when link distance moves. Centre gravity runs 0–1. The defaults are
unchanged in physical terms — `repulsion: 8.5` at `linkDistance: 40` is the old 340.

**How it's verified.** By looking at it, in the workbench:

```bash
npm run dev
open "http://localhost:3100/lab/graph?n=140"   # or ?n=400, plus ?gravity=…&repulsion=…
```

The Playwright screenshot scripts that used to live in `scripts/` were removed once the
physics were signed off. They earned their keep — several of the bugs in the changelog
below were only visible in a captured frame sequence — but they existed to tune a moving
target, and a tool that has to be kept working past its purpose is a liability. If a
future change needs frame-by-frame evidence again, write a throwaway script for that
change and delete it after; the pattern is in this file's history.

[`layout-shape.test.ts`](../src/test/graph/layout-shape.test.ts) settles the *real*
`GraphSimulation` headlessly and guards roundness, non-overlap, drag locality and
shimmer — as a regression net, not a verdict. Anything scale-dependent in it is
expressed as a fraction of the graph's own radius, because absolute world units stop
meaning anything the moment the forces are retuned.

Measured at the finalised defaults across 26/140/400-node graphs: bounding-box aspect
ratio **1.00–1.04**, furthest node **1.26–1.45×** the median radius (a disc, not arms),
and comfortably above 120 fps at 140 nodes including mid-drag.

### Known rough edges

Named rather than hidden, in rough priority order:

- **Small graphs (~20 nodes) read stringier than large ones.** Long derived facet links
  dominate when there are few nodes; the silhouette is still round but the middle has
  long crossing edges. May want facet links suppressed below some graph size.
- **Hover captions can overlap each other.** The hovered node's neighbours are always
  named, whatever the zoom, so in a tight cluster two of those names can collide. The
  zoom-gated captions never overlap; only this deliberate override can.
- **Reduced motion is not honoured yet.** The first frame arrives settled (the
  simulation pre-warms headlessly), but drag and re-settle still animate.
- **No keyboard zoom and no double-click to fit.** Pinch and ctrl/⌘+wheel zoom, a
  plain wheel or two-finger scroll pans (the Figma mapping); nothing else exists.
- **Edges are very faint when zoomed out in the light theme.** Deliberate, but the
  minimum may need a floor.

## Deliberately deferred

Not "later maybe" — actively out of scope until the engine feels right:

- Floating panels for Explore/diff-skim, ask bar, filter menu, adapters menu.
- The node detail modal's eventual full shape: header image (no image field exists on
  an endeavor yet), deepen prompts/chips, a Generate CTA, editable tags/archive, story
  stamp — see docs/surfaces-and-flows.md's Node modal. What's built now is a read-only
  view of the fields `GraphNode` already carries.
- The visual/brand system beyond the existing tokens. (Rebuild from working screens.)
- Pending-proposal ghosts.
- Keyboard traversal, reduced-motion refinements beyond honouring the preference.
- Persisted physics settings and presets.

Kept from the previous build because it worked and is independent of rendering: the
`GraphSnapshot` contract, `GET /api/graph`, the server projection, and the sample
graph fixture (see [`data-model.md`](data-model.md) § Canvas snapshot).

---

## Changelog

- **2026-08-03:** **Canon doc sync (PR 8).** Added [`design-handoff.md`](design-handoff.md) and [`file-catalogue.md`](file-catalogue.md); cross-linked from building-plan, surfaces-and-flows, README, and archive index.

- **2026-08-03:** **Folder split.** `features/graph/` → `engine/` (physics + canvas),
  `surfaces/` (graph-home + formatting/placement), `lab/` (workbench + fixture).
  Removed superseded `graph-view`, `hover-card`, and `node-detail` modules (chrome
  lives inline in `graph-home.tsx`). **Import rule:** `engine/` must not import
  `surfaces/` or `lab/`.

- **2026-08-03:** **Graph app at `/home`.** `graph-home.tsx` ships Neubrutalism product
  chrome (ask row, explore/deepen panels, Capture CTA) on the live canvas. Auth callback
  and magic link default to `/home`; `/` stays the public landing.

- **2026-08-03:** **Neubrutalism tokens.** R7 aligned with opaque ink-border chrome;
  accent colour is now brand blue (`--brand-primary`) via `--accent` alias. Token
  recipes live in [`tokens.css`](../src/styles/tokens.css).

- **2026-08-03:** **Light mode only.** Removed the theme toggle, boot script, and
  `src/features/theme/*`. Root layout sets `html[data-mode="light"]`; dark tokens and
  `prefers-color-scheme` overrides are gone from `tokens.css`. Dark mode is deferred until
  the visual system is rebuilt on screen.

- **2026-07-28 (twelfth pass):** **Verified on screen; interaction polish.** Founder QA
  signed off the hover/selection/detail slice. Behaviour now: hover card follows the
  pointer **only when nothing is selected**; click opens the left detail panel (anime.js
  fade/pop via `motion/enter.ts`); hovering a **different** node while one is selected
  **previews that node in the panel** and temporarily **takes the green accent** on the
  canvas (`SelectionAccentFade` eases selection accent out/in — background dim stays
  pinned while the panel is open). Hover card placement above the cursor uses
  `translateY(-100%)` so the gap matches below-cursor. Caption gate percentile lowered
  to **0.6** (`THRESHOLD_PERCENTILE` in render.ts). **Theme toggle restored** top-right
  on `/` (`theme-toggle.tsx`); canvas receives `resolvedTheme` and repaints on flip.
  Pointer mapping stays Figma-style (scroll pans, pinch/⌘+scroll zooms) — a mouse-wheel
  zoom experiment was reverted after device detection proved unreliable.

- **2026-07-26 (eleventh pass):** **Fixed a background flash during selection ↔ hover
  transitions**, caught by the founder on the tenth pass before it was even looked at in
  a browser (from the description alone) — the composed model below fixes it, but it's
  still unverified on screen along with everything else in § Known rough edges. Root
  cause: `resolveHighlight` treated hover and selection as strict either/or, so the
  moment `hoveredId` became non-null — including re-hovering the *already-selected*
  node, or hovering a different node while one was selected — the background's dim
  strength switched to tracking the incoming hover's fade, which restarts near 0. For a
  couple of frames the whole graph relaxed back toward full brightness before re-dimming
  as the fade caught up: a visible flash every time hover crossed a selection. Hover and
  selection now **compose** instead of replacing each other: the background dim amount
  is `max(selected ? 1 : 0, hoverAmount)`, so it's pinned at full strength for the entire
  time anything is selected, independent of whatever hover is doing on top. The lit set
  is the union of both neighbourhoods, and edges/emphasis are drawn per-target (the
  selected node's accent line at flat full strength, the hovered node's easing in) so a
  node that's both selected and hovered just takes the higher of the two rather than
  restarting. `Highlight` (render.ts) changed shape accordingly: `primaryId`/
  `secondaryId`/`secondaryAmount`/`dimAmount`/`litIds` replace the old single `id`/
  `neighbors`/`amount`.

- **2026-07-26 (tenth pass):** **Hover card, and a design pivot on the detail panel** —
  founder feedback on the ninth pass, given from a description rather than the screen
  (still hasn't been looked at; see § Known rough edges). Two changes: (1) the hover
  card the ninth pass left deferred is built — `hover-card.tsx` follows the pointer with
  a compact, opaque peek (kind, title, timeframe, summary snippet, up to three facets),
  independent of selection, and clears itself the instant the pointer leaves the canvas
  or presses down (previously hover had no leave-handling at all — `hoveredId` could
  stick to the last node forever once the mouse left the canvas without moving inside it
  again; this pass added `onPointerLeave`, a real gap regardless of the hover card).
  (2) The detail panel drops its center+scrim: a dark overlay over a live graph read as
  too heavy, and centering it hid the graph rather than sitting beside it. It now floats
  **left**, opaque, no backdrop — clicking the graph background (already wired for
  deselect) or a different node works right through it. To keep the graph from sitting
  behind the panel, `camera.ts` gained a `focusOffsetX`: a screen-space nudge applied
  inside `toScreen`/`toWorld` on top of the existing centre/scale, eased toward
  `PANEL_FOCUS_OFFSET_PX` (150) while a node is selected and back to 0 when it isn't —
  deliberately a camera-level nudge, not a physics change, so gravity/anchors/fit are
  untouched. `humanize`/`formatTimeframe` moved out of `node-detail.tsx` into
  `format-endeavor.ts` so the hover card and panel read a kind/date/status the same way.

- **2026-07-26 (ninth pass):** **Node selection + detail**, the slice named next after
  hover. A click persists a highlight (render.ts's `resolveHighlight`: hover wins
  outright while active, selection takes over the instant it lets go, both drawn with
  the identical dim/lit/accent treatment — selection just holds at full strength with no
  fade of its own, since a click is a discrete choice rather than a pointer passing
  through) and opens a centered, opaque `node-detail.tsx` modal. The modal is
  deliberately thin: title, kind, status, timeframe, summary, tags, and skill/people/org
  facets are every field `GraphNode` already carries, and nothing else — no header
  image (there's no image field to show), no deepen prompts, no Generate CTA, no
  editable tags. Those depend on features that don't exist yet and stay in § Deliberately
  deferred. Closes on Escape, a scrim click, or the close button; clicking empty canvas
  also deselects. **Not yet looked at on screen** — see § Known rough edges.

- **2026-07-26 (eighth pass):** Hover refinements. It named the hovered node *and* every
  neighbour, which turned a hover over a dense cluster — the common case when zoomed out
  — into a pile of overlapping captions. Now exactly one name: the node under the
  pointer. Neighbours keep their lit dots and accent edges, so the "what does this touch"
  answer survives without the clutter. The treatment also fades in (~130ms) and out
  (~90ms) instead of switching on the frame the pointer arrives; moving between nodes
  fades the first out before the second in. One `HoverFade` value drives dim, accent,
  dot size and caption together, and the render loop stays awake while it animates.

- **2026-07-26 (seventh pass):** Physics signed off; defaults finalised by the founder
  at `gravity: 0.5, repulsion: 12, linkDistance: 40, linkStrength: 1, nodeRadius: 1` —
  a tighter, stiffer graph than the tuning defaults. Housekeeping followed: the physics
  HUD is gone from `/` (lab only), `GraphSimulation.isAtRest()` deleted as dead, and the
  two graph tests moved to `src/test/graph/` (`lab-fixture.ts` stays in `features/`,
  since the lab route depends on it and app code must not import from a test folder).
  The new defaults also exposed brittleness in those tests: they filtered "far" nodes by
  an absolute 200 world units, and the tighter layout's outer radius is only ~154, so
  the filter matched nothing and the assertions ran over an empty set. Distances in
  `layout-shape.test.ts` are now expressed as fractions of the graph's own median
  radius — **anything scale-dependent in a layout test has to be, or retuning silently
  disarms it.**

- **2026-07-26 (sixth pass):** Killed the shivering at its source instead of
  time-boxing it. Attribution by ablation — settle the graph, hold alpha, remove one
  force at a time — showed **100% of the residual came from repulsion**, and with it
  removed the layout was perfectly still. The cause was its **hard `distanceMax`
  cutoff**: a truncated force is not conservative, so pairs either side of the cutoff
  had repulsion switch on and off and pumped in energy the layout could never shed.
  Removing the cutoff drops residual travel from 17 world units per node per 200 ticks
  to **0.02**, and makes the graph rounder besides (aspect 1.00–1.04, spread 1.26–1.45
  across 26/140/400 nodes). Repulsion is global now; `REPULSION_SCALE` keeps the dial's
  meaning so `gravity: 0.18, repulsion: 8.5` still settle to the same size.
  Consequently `ALPHA_DECAY` went back to 0.0115 — the fifth pass had shortened the
  clock, which truncated settles rather than calming them — and rest is now decided by
  **measured motion**, not the alpha clock: `RESOLVE_ALPHA` keeps the layout warm while
  anything is still moving, with stall detection to guarantee termination (an absolute
  speed threshold alone never parked the loop at `gravity: 0.6`). A released drag also
  gives up its anchors, so a node dropped at the edge drifts home instead of being held
  out there by an anchor far stronger than gravity.

- **2026-07-26 (fifth pass):** Fixed a regression from the fourth: a dragged node
  snapped back to where it started on release. `relaxAnchors` skipped the dragged node,
  so it kept a full-strength anchor at its original spot — and a plain drift wouldn't
  have fixed it either, since the pointer outruns the drift and leaves the anchor
  trailing. Its anchor is now set exactly to its position each tick. `endDrag` also
  restored every loosened `anchorHold` to 1 in one frame, which yanked the whole
  neighbourhood; hold now eases back over ~a second. Settle shortened 319 → 142 frames
  (~2.7s → ~1.2s at 120Hz) via `ALPHA_DECAY` 0.0115 → 0.03 with `REHEAT_ALPHA` 0.16 →
  0.3 — the old tail was two thirds shimmer. Release no longer reheats.

- **2026-07-26 (fourth pass):** Dragging still read as "a bin of Lego rather than
  liquid". Three causes, all hard edges rather than physics: Barnes–Hut `theta` at d3's
  coarse default (the big one — numerical noise, see above), the binary released/held
  set putting a discontinuity through the graph, and `forceCollide` at full strength
  resolving contacts in one step. Now a smooth `anchorHold` gradient with anchor drift,
  `theta` 0.5, collide strength 0.2, damping 0.75 → 0.65. Roughness 0.94 → 0.33. Node
  size default confirmed at 1.

- **2026-07-26 (third pass):** The jitter fix above was itself the cause of worse
  jitter, and this pass replaced it. Freezing distant nodes with `fx`/`fy` turned them
  into rigid walls that the near field buzzed against, and the released set grew for the
  whole gesture until most of the graph was responding. Root cause found and recorded in
  *Why the graph shivered*: the layout never reaches equilibrium, it just runs out of
  alpha. Now `converge()` + anchors + heavier damping; added **R10** (visual settings
  aren't physics settings) after node size was found to drive collision spacing. New
  test guards travel-per-tick, the metric the founder was actually reporting — the
  previous net-displacement test passed throughout both regressions.

- **2026-07-26 (later the same day):** Jitter pass. Added **R8 (locality)** and
  **R9 (hover)**; rewrote **R3** from "each caption if it fits" to all-or-nothing on a
  measured zoom threshold. The graph no longer shakes when a node is clicked or
  dragged — see *Why the physics felt jittery* above for the four changes and why alpha
  being global was the root cause. Repulsion became a 0–20 multiple of link distance and
  gravity a 0–1 dial, with the defaults unchanged in physical terms. Trackpad pinch now
  zooms the canvas instead of the browser (React's `onWheel` is passive, so
  `preventDefault` was silently ignored); a plain wheel pans. `layout-shape.test.ts`
  gained a locality guard, and the screenshot script a hover frame (that script has since
  been removed — see *How it.s verified*).
- **2026-07-26:** Created, and the rebuild landed in the same pass. Replaces
  `archive/graph-physics.md` after the first canvas was scrapped. `react-force-graph-2d`
  removed; physics, camera, rendering and input are now ours (`d3-force` + `<canvas>` +
  `requestAnimationFrame`). Captions are gated on measured clear space rather than a
  zoom threshold. A dev-only `/lab/graph` workbench plus two Playwright scripts mean the
  canvas is reviewed by looking at it; the shape test now measures the real engine
  instead of a re-implementation of it. Requirements above are restated as things
  checkable on screen, and the rough edges left over are listed rather than glossed.
