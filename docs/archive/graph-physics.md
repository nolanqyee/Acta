# Acta — Graph physics & canvas behavior

Last updated: 2026-07-26

**Owns:** how the force-directed graph on **Graph home** is *supposed* to behave — the simulation model, the forces, how it settles, how you interact with it, and (crucially) how edges and labels are rendered so the canvas always reads **calm, living, and legible** — never messy. Plain-language spec for whoever builds the real canvas.

**Does not own:** token values ([`brand-design-system.md`](brand-design-system.md)), IA/surface contracts ([`surfaces-and-flows.md`](surfaces-and-flows.md)), the overall home vision ([`mockup-synthesis.md`](mockup-synthesis.md)), or what a node/edge *means* semantically ([`data-model.md`](data-model.md)).

Status: **working synthesis** — distilled from the HTML mock experiment ([`brand-mockups.html`](brand-mockups.html)) and founder feedback. Refine as the real canvas is built.

---

## One-sentence intent

**An Obsidian-class force graph that settles into a calm, balanced, low-crossing layout on its own, feels alive and draggable, and stays visually quiet — so even when edges do cross, the plane reads as a soft lattice, not spaghetti.**

Personality it must serve: **living · minimal · fluid · personal · interactive**.

---

## Mental model

- **Obsidian-class**, not Heptabase-class: nodes + edges on the plane; **structure on the plane, substance on hover/modal**. No content cards glued to the canvas.
- The graph is the **full-bleed background** of the app; all chrome overlays it.
- **Nodes = Endeavors only.** Skills / people / orgs are data + filters + modals, **not** physics bodies. (See [`data-model.md`](data-model.md).)
- **Edges = relationships** between endeavors (shared skill/person/org/time, or explicit links). They are *quiet connective tissue*, never the loudest thing on screen.
- At rest it should feel **settled and balanced** (radial/circular spirit), like it *wants* to be calm.

---

## The simulation (forces)

A standard force-directed model. Each node has a position + velocity; each tick applies forces, integrates, and cools.

| Force | Purpose | Feel / lean |
| --- | --- | --- |
| **Charge / repulsion** | Push all nodes apart so the graph fills space | Dominant force; gives the airy Obsidian spread. Falls off with distance (∝ 1/d²). **Range-limited** (U-J U3: ~4× link distance) — unbounded repulsion inflates the whole graph into strings instead of separating neighbours. |
| **Link spring** | Pull connected nodes toward a target distance | Related endeavors cluster; keeps edges a readable length. Soft, not rigid. Target length and stiffness both scale with relation weight, so containment reads tighter than a coincidental shared skill. |
| **Centering (gravity)** | Pull every node toward the canvas focal point | **Weak but real** — it is what makes the resting silhouette round. Must not overpower repulsion (that collapses everything into a ball). **Implementation note (U-J U3):** this has to be a per-node positional force (`forceX`/`forceY`). d3's `forceCenter` only *translates* the graph so its centroid lands on target and supplies **no cohesion at all**; shipping with `forceCenter` alone is how the first U3 build ended up as a stringy sprawl drifting off-centre. |
| **Collision / min-separation** | Enforce a minimum gap between nodes | Nodes never stack; also buys **label breathing room**. Slightly larger than the visual node so labels don't pile. |
| **Damping / velocity decay** | Bleed off energy each tick | Motion settles instead of oscillating forever. |
| **Alpha cooling** | Global “temperature” that decays to rest | Simulation quiets down after landing; **reheats** on drag / resize / structural change. |

**Balance rule of thumb:** repulsion + collision spread it; springs cluster it; gravity decides how compact the whole mass is. If it looks like a tight ball → gravity too strong or repulsion too weak. If it looks like scattered dust or long strings → repulsion reaching too far, gravity too weak, or springs too soft.

**Don't balance it by eye alone.** All four qualities this doc asks for are measurable — bounding-box aspect ratio, radial fill, crossing count, node overlaps, edge length — and the tuning that produced the shipped defaults was done against those numbers in [`layout-quality.test.ts`](../src/features/graph/layout-quality.test.ts), with the same headless `d3-force` the canvas runs. A setting that "looks fine" on one graph routinely fails on a denser one.

---

## Settling & seeding (the anti-crossing foundation)

Most “messy graph” problems are really **bad initial conditions** — random seeding lets edges tangle and the sim can’t fully untangle. So:

1. **Cluster-seeded start.** Seed each endeavor near its primary cluster (its hub / dominant facet), not at a random point. Clusters start already grouped, so the settled layout has **far fewer crossings**.
2. **Order the cluster ring by affinity, not alphabetically** (added U-J U3). Cluster centres sit around a ring; *which* neighbours they get decides whether cross-cluster links stay short arcs around the rim or become chords straight through the middle. Walking the most-connected-neighbour chain (greedy seriation) is the single cheapest crossing win after seeding itself — on the denser test fixture it roughly halves crossings, and on the sample graph with uncapped bridges it took 16 crossings down to 5.
3. **Pre-warm before first paint.** Run the simulation “headless” for a few hundred cooling ticks, *then* show it. The user lands on a **calm, already-settled** graph — no distracting scramble on load. (Respect reduced-motion by always doing this.)
4. **Settle toward radial/circular balance.** Defaults tuned so the resting state is spacious and roughly radial (Obsidian spirit), with related nodes visibly clustered.
5. **Prefer few cross-cluster bridges.** Keep the relationship set mostly intra-cluster; allow a small number of intentional bridges. Every extra long bridge is a future crossing — so derived facet links are **capped per endeavor** (see [`data-model.md`](data-model.md) § Canvas snapshot).
6. **Fit the view only once it has settled.** Framing computed from still-moving positions leaves the graph parked off to one side — the visible half of the original U3 bug. Fit after the engine stops, then leave the framing alone so a drag doesn't yank the view.

---

## Interaction

| Action | Behavior |
| --- | --- |
| **Drag a node** | Node follows the pointer and is **pinned** (fixed) while held; the sim **reheats** so neighbors react fluidly. On release it rejoins the simulation (optionally stays pinned — TBD). |
| **Hover a node** | Compact **kind-rich hover card** at the cursor (header image + straddling title). Node + its edges lift/emphasize; this is the main tool for reading a crossed area — focus, not untangle. |
| **Click a node** | Centered **node modal**. |
| **Floating panel open** (diff-skim / Explore) | **Center of gravity shifts left** so nodes stay visible beside the panel. Implement by moving the **centering target**, not by CSS-translating the canvas — keeps pointer/coordinate math honest. Reheat on open/close. |
| **Resize** | Rescale positions to the new viewport and reheat briefly. |
| **Ask / filter** | Apply the **shared highlight/dim language** (below) — the primary way clutter is tamed. |

---

## Edge crossings — minimize first, then render gracefully

The founder’s ask: **ideally no crossing edges; but if they cross, they must be handled gracefully — never messy.** Two layers:

### A. Minimize crossings (layout)

- Cluster-seed + pre-warm (above) — biggest lever.
- Enough repulsion + link distance that clusters physically separate.
- Collision/min-separation so nodes don’t pile (piled nodes = crossing storms).
- Limit long cross-cluster bridges. Two rules do this in code (U-J U3): a shared facet radiates from **one hub** rather than forming a clique *or* a chain — spokes of a star share an endpoint, so they can never cross each other — and each endeavor keeps at most **two** derived facet links. Measured on the sample graph: uncapped ≈ 5 crossings, capped at two ≈ 0.
- Let the force settle toward a planar-ish, radial balance.

You will **not** eliminate all crossings — a force graph over real relationships isn’t planar. That’s fine. The point is the layout does the easy 80%, and rendering handles the rest.

### B. Render crossings so they never look messy

The goal: a crossing should read as a **calm lattice intersection**, not visual noise. **Edges stay straight** (no curvature) — the main lever is simply making them **really thin and quiet**.

- **Really thin, quiet edges — the primary mechanism.** Hairline-thin, **low-opacity neutral**, no arrowheads. Thin threads can overlap and cross freely and still read as a soft lattice, not spaghetti. Edge color derives from the neutral text color at low alpha — never a loud hue. This alone handles the large majority of crossings.
- **Straight edges, always.** No curvature, no arcs — Obsidian-straight. Thin-ness, not bending, keeps crossings calm.
- **Edges meet node centers exactly.** They must terminate cleanly at the node (center or rim), never float short or overshoot. Broken/floating edges are the #1 “messy” tell. (Anti-pattern from mock feedback.)
- **Strict draw order / depth.** Edges beneath nodes; nodes beneath labels; the **hovered/active** node, its edges, and its label lift **above** everything. Depth makes a crossing read as “one thin thread passing behind another.”
- **Focus beats untangle.** On hover / select / ask / filter, **highlight the relevant subgraph and dim the rest** (shared language below). Background crossings recede; the path you care about is unambiguous.
- **Protect labels from edges.** Labels get a background **halo / text-shadow** in the canvas color so a thin edge passing behind stays legible. Edges never appear to slice through text.

**Never:** curved edges, thick/high-contrast edges, arrowhead clutter, edges that miss or overshoot nodes, edges drawn *over* nodes or labels, two edges stacked along the exact same path.

---

## Labels

Lower priority than edges, but same spirit: **calm and legible**.

- **Not every node is labeled at rest.** Show labels for hubs / high-degree / pending nodes; a **label-density** control reveals more. Hover always labels the node.
- **Collision spacing helps.** The min-separation force keeps labeled nodes from stacking their text. Full label de-overlap is a harder problem and is acceptable to leave imperfect (founder: labels are lesser importance).
- **Halo for legibility.** Canvas-colored text-shadow so labels survive over edges and dim states.
- **Placement.** Centered **directly under the node** (not beside/right of it); keep it clear of the node’s tap target.

---

## States on the canvas

| State | Behavior |
| --- | --- |
| **At rest** | Calm. Shared base node look; quiet edges; scarce accent. Nothing pulses loudly. |
| **Hover** | Node + edges + label lift; hover card appears; the rest stays as-is (or softly recedes). |
| **Pending (diff-skim)** | **Dashed neutral outline + lower opacity + soft pulse — not accent/color** (accent is reserved for CTA / highlight / kind-hover). Pending nodes animate in on capture; clear/normalize on confirm; removed on discard. |
| **Highlight / dim (ask + filter)** | **One shared language:** matched endeavors lit + their edges emphasized; everything else dimmed (not hidden). This is how NL ask *and* facet filters both surface results, and how crossed regions are tamed. **Shipped in U-J U3 as highlight-only** — brand §10 defers dimming until real density proves lighting alone isn't enough, so the dim half of this row is still pending. |
| **Selected / focused** | (Triad still open) — selected vs highlighted vs dimmed should be visually distinct. **U-J U3 interim:** selection *is* the modal (no third canvas treatment), and hover lifts the node plus its immediate neighbours by radius + an accent ring. |

---

## Tunability (graph settings)

Physics is **highly customizable** via the gear menu; **defaults are calm and Obsidian-like** so most people never touch it.

| Control | What it does | Shipped default / range (U-J U3) |
| --- | --- | --- |
| **Center gravity** | Cohesion — how hard every node is pulled to the focal point. Low, but not zero. | `0.09` (0–0.4) |
| **Link distance** | Base spring length; each link scales it by relation weight, so larger = more separated clusters. | `40` (20–160) |
| **Repel force** | Charge strength; larger = airier spread. Reach is capped at ~4× link distance. | `320` (40–900) |
| **Node size** | Visual scale (also scales collision separation). | `5` (2–12) |
| **Label density** | How many labels show at rest. | `0.4` (0–1) |

Defaults, ranges, and the derived numbers (charge reach, per-link spring length and
stiffness, collision radius) all live in
[`src/features/graph/physics.ts`](../src/features/graph/physics.ts) — not canon, but
**tuned against measurements** rather than by eye: at these values the sample graph
settles with zero crossings and a bounding box within a few percent of square. Settings
are **session-only** so far; persistence is still open.

Later (open): physics presets, per-user persistence, pinning behavior. (No edge-curvature control — edges are always straight.)

---

## Performance & scaling

- **Small graphs (mock/dogfood):** naive O(n²) repulsion is fine.
- **Real graphs:** switch to a spatial approximation (**quadtree / Barnes–Hut**) for repulsion; cap ticks per frame; freeze the sim when settled and only redraw on interaction.
- **Pre-warm** amortizes the “settle” cost off the visible frame.
- Consider offscreen/virtualization and canvas/WebGL rendering if node counts get large; SVG/DOM is fine for the mock.
- Freeze physics when the tab is hidden or the graph is at rest; reheat on interaction only.

---

## Motion & accessibility

- **Intentional motion only:** settle-in (pre-warmed so it’s subtle), drag response, pending appear, highlight transitions. No idle jitter.
- **Reduced motion:** honor the system preference — land fully settled with no animated settle, no pulsing pending (use a static distinct treatment), instant highlight changes.
- **Focus / keyboard:** nodes should be reachable and openable without a pointer (TBD detail); focus ring in accent.
- **Contrast:** labels + edges must stay legible in both warm-paper light and neutral-graphite dark; halo helps.

---

## Anti-patterns (do not repeat)

1. Edges that miss / overshoot nodes, or float in space.
2. Loud, thick, or high-contrast edges; arrowheads everywhere.
3. Centering so strong the graph collapses into a ball; or so weak it drifts off-screen. Worse: a "centering" force that recentres the centroid but never pulls nodes inward, which is no cohesion at all.
4. Random seeding that tangles and never untangles.
5. Animated scramble on load (didn’t pre-warm).
6. Nodes/labels stacking (no collision separation).
7. Edges drawn over nodes/labels, or cutting through label text.
8. Using accent color for pending (accent is reserved).
9. Trying to “hide” clutter by removing edges instead of **focusing** (highlight/dim).
10. Treating the mock’s exact numbers as canon — retune against this spec, and against the layout measurements rather than a single screenshot.
11. Wiring a shared facet as a clique (crossing storm) or as an arbitrarily ordered chain (a snake across the plane) instead of a star.
12. Fitting the viewport while the simulation is still moving — the graph lands off-centre.

---

## Still open

- Selected vs highlighted vs dimmed triad (visual recipe) — U-J U3 shipped highlight + hover only; dim and a distinct selected state still undecided.
- Pin-on-release behavior after drag — **U-J U3 interim: release rejoins the simulation** (drag pins, drop unpins + reheats), so the graph stays "living". Pinning as a deliberate user act is still open.
- Keyboard/focus traversal of the graph.
- Physics presets + per-user persistence.
- Real-scale renderer (SVG vs canvas vs WebGL) and Barnes–Hut cutover point.

---

## Changelog

- **2026-07-26:** **Layout rebuilt after the first build failed the doctrine.** The U3 canvas settled as a stringy sprawl parked off-centre — the opposite of "circular, few crossings". Four causes, all now fixed and all now covered by measurements in [`layout-quality.test.ts`](../src/features/graph/layout-quality.test.ts): (1) there was **no gravity** — `forceCenter` only translates the centroid, so `forceX`/`forceY` now supply real cohesion and own the round silhouette; (2) charge reached across the whole graph and inflated it, so its **range is capped** at ~4× link distance; (3) shared facets were wired as **arbitrarily ordered chains**, replaced by **hub-and-spoke stars** (spokes of a star can't cross each other) with at most **two derived links per endeavor**; (4) cluster centres were placed around the ring **alphabetically**, now ordered by link affinity. Framing is also fitted **after** the engine stops rather than mid-settle. Retuned defaults recorded above (gravity `0.09`, link distance `40`, repel `320`); sample graph now settles with **zero crossings** and a square-ish bounding box. Link derivation is shared by the server projection and the sample fixture ([`derive-endeavor-links.ts`](../src/lib/graph/derive-endeavor-links.ts)) so the fixture can't flatter the layout.
- **2026-07-25:** **First code implementation (U-J U3).** The doctrine now has a home: cluster-seed + pre-warm in [`cluster-seed.ts`](../src/features/graph/cluster-seed.ts) / [`physics.ts`](../src/features/graph/physics.ts), rendering rules in [`canvas-paint.ts`](../src/features/graph/canvas-paint.ts), simulation wiring in [`force-canvas.tsx`](../src/features/graph/force-canvas.tsx). Recorded shipped defaults/ranges above. Interim answers to two open items: **release after drag rejoins the simulation**, and **highlight-only (no dim)**. Added the seeding precedence detail the doc left implicit — a containment root clusters *with its own children* rather than with same-kind strangers. Redraw is paused when the graph is at rest and only runs continuously while a pending ghost pulses; with reduced motion the whole tick budget is spent headless and the pulse is static.
- **2026-07-15:** Edges locked **straight (no curvature)**; graceful crossing handling is primarily just **really thin, quiet edges** (plus draw-order depth, focus/dim, label halos). Dropped curvature + edge-bundling from the plan.
- **2026-07-15:** Initial synthesis — simulation model, cluster-seed + pre-warm anti-crossing foundation, and the “minimize crossings, then render them gracefully” doctrine. Distilled from the HTML mock + founder feedback (no messy crossings; labels lesser priority).
