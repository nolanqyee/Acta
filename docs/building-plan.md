# Acta — Building Plan

Last updated: 2026-07-26

Overarching **build** roadmap (not business/GTM). Companion to:

| Doc | Owns |
| --- | --- |
| [`personal-evidence-graph.md`](personal-evidence-graph.md) | Product vision, wedge, adapters, monetization |
| [`data-model.md`](data-model.md) | Schema, edges, extract/provenance contracts |
| [`surfaces-and-flows.md`](surfaces-and-flows.md) | IA / surfaces + core interaction flows |
| [`agent-interaction-model.md`](agent-interaction-model.md) | Agents, confirm vs auto, pending proposals, write policy |
| [`graph-canvas.md`](graph-canvas.md) | The live canvas spec (requirements + how we work on the graph) |
| [`archive/`](archive/) | Superseded design docs — reasoning kept, specifics not canon |
| [`technical-implementation-plan.md`](technical-implementation-plan.md) | **HOW** to implement locked plan docs (**U-J** — locked) |
| **This doc** | What to harden next: brand, IA, flows, agents, tech plan, auth |

**App scaffold: U-J U1 shipped as a single Next.js app** at the repo root (`src/*`, route-handler API, contracts in `src/lib/contracts`, tokens at [`src/styles/tokens.css`](../src/styles/tokens.css); `docs/` stays at root). One Vercel deploy; secrets server-only. (Stack reversed 2026-07-20 from the interim Vite SPA + Hono API to Next — see technical-implementation-plan KTD2.)

---

## Doc conventions (for humans + coding agents)

**Building-plan units** are always referenced as **`U-<Letter>`** (not bare A/B/C):

| Unit | Name |
| --- | --- |
| **U-A** | Brand & visual system |
| **U-B** | IA & primary surfaces |
| **U-C** | Core interaction flows |
| **U-D** | Agent / system interaction model |
| **U-E** | Persistence & auth |
| **U-F** | Adapter view design |
| **U-G** | Trust & provenance UX (rich citation chrome, why-this-node, stamp/stale polish) |
| **U-H** | Empty / thin / cold-start polish |
| **U-I** | In-product copy system |
| **U-J** | Technical implementation plan (HOW across locked plan docs) |

**Rules:**
- In docs and agent chat, say **U-D**, not “D” or “workstream D,” when meaning this roadmap.
- Do not reuse bare letters for other checklists in a way that collides (e.g. data-model worked examples may still use A/B/C locally — those are *examples*, not building-plan units).
- New roadmap items continue **U-K**, **U-L**, …

---

## Where we are (2026-07-15)

| Layer | Status |
| --- | --- |
| Product vision / wedge | Locked — **Acta**; college tech internship recruiting |
| Data model | **v1 draft locked** — [`data-model.md`](data-model.md) |
| IA + core flows (**U-B** + **U-C**) | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| Agent write policy (**U-D**) | **Locked** — [`agent-interaction-model.md`](agent-interaction-model.md) |
| Brand / visual (**U-A**) | **Unlocked again (2026-07-26)** — the up-front visual system was archived to [`archive/brand-design-system.md`](archive/brand-design-system.md); tokens stay in [`src/styles/tokens.css`](../src/styles/tokens.css) and the system gets rebuilt from working screens |
| Tech implementation plan (**U-J**) | **Locked** — [`technical-implementation-plan.md`](technical-implementation-plan.md) |
| Persistence / auth (**U-E**) | **In first build wave** — thin Supabase Auth/Postgres + proposals from U-J U2; extras (export, connectors) still queued |
| Code | **U-J U3 rebuilt, canvas-first** — own `d3-force` + `<canvas>` render loop (see [`graph-canvas.md`](graph-canvas.md)). Node selection + detail (now a left-side opaque panel with a camera focus-offset, after founder feedback moved it off the originally-planned centered modal) + a hover card just landed on top of it, **not yet verified in a browser** (see that doc's changelog + known rough edges). Next = look at the new slice on screen, then U4 (Capture + LLM Extract stream) |

**Docs layout:** planning specs under `docs/`; tokens under `styles/`. Building-plan units **U-A…U-J**.

**First product loop to ship in code:** **capture + render** (force-directed endeavors, floating-panel incremental diff-skim, pending nodes) — after **U-J**.

### Locked IA highlights (build against these)

- Home = Graph; **full-bleed** force-directed canvas (Endeavors only); chrome **overlays** canvas
- Bottom liquid-glass ask + **filter button** (menu) + **graph settings** (physics/display); Explore = floating right panel + highlight
- Diff-skim = floating right panel + changelog + **incremental** pending nodes (proposals **stored until confirm/discard**)
- Node = centered modal with **header image** + title straddling image/body; kind-rich hover cards
- Deepen = top-right inbox-like control + badge → backlog panel (pull queue)
- Generate = top-left **hamburger** → adapter pages + expandable mini-graph peek; adapters are a **family** with thin citation UX
- Agent chat-history connectors = **after** classic MVP imports

---

## Priority stack

### Now — harden before more feature sprawl

| Unit | Workstream | Why | Status |
| --- | --- | --- | --- |
| **U-B** | **IA & primary surfaces** | Screens + jobs | **Done (locked)** |
| **U-C** | **Core interaction flows** | Flow contracts | **Done (locked)** |
| **U-D** | **Agent / system interaction model** | Extract/deepen/explore/synth write policy; confirm vs auto; pending | **Done (locked)** |
| **U-A** | **Brand & visual system** | Force-graph WOW needs one composition language | **Done (look locked)** — trailers deferred |
| **U-J** | **Technical implementation plan** | Turn locked what/why docs into a concrete HOW (stack choices, modules, sequencing, risks) | **Done (locked)** |
| **U-E** | **Persistence & auth** | Real user + Supabase graph survives refresh | **Started via U-J** — thin Auth/DB/proposals in first slice; remaining polish queued |

### After core loop works on real graph

| Unit | Workstream | Notes |
| --- | --- | --- |
| **U-F** | **Adapter view design** | Resume / interview / app-question editors; formats/fork later |

### Later — “make it good”

| Unit | Workstream | Notes |
| --- | --- | --- |
| **U-G** | **Trust & provenance UX** | Rich citation chrome beyond U-D thin citations |
| **U-H** | **Empty / thin / cold-start polish** | Beyond bare flow contracts |
| **U-I** | **In-product copy system** | After brand + flows |

### Explicitly out of near scope

Monetization, GTM, domain/legal, B2B/coach-share, essay adapters, voice, kitchen-sink / **agent chat-history** connectors (post classic MVP), Jake’s/DOCX exports.

---

## Now — detail & exit criteria

### U-A. Brand & visual system — **done (look locked)**

**Deliverable:** [`archive/brand-design-system.md`](archive/brand-design-system.md) (archived) + [`src/styles/tokens.css`](../src/styles/tokens.css) — brand + UI foundation (tokens, type, color, graph chrome, do/don’t). HTML decision/mock tools under `docs/`.

**Name (locked for now):** **Acta** — Latin *acta* (deeds / record of what was done). Supersedes Stilva. Domain TBD.

**Deferred trailers:** motion choreography, full a11y audit, deeper app restyle. (The Next app now imports the token file in its root layout as of U-J U1.) Keep updating §12 Do/don’t.

**Exit met for planning:** composition language + token file exist; agents should not invent look. Greenfield UI after **U-J** imports `src/styles/tokens.css`.

### U-B. IA & primary surfaces — **complete**

**Deliverable:** surface map in [`surfaces-and-flows.md`](surfaces-and-flows.md).

**Exit:** every Now flow maps to named surfaces — **met**.

### U-C. Core interaction flows — **complete**

**Deliverable:** flows 1–8 in [`surfaces-and-flows.md`](surfaces-and-flows.md).

**Exit:** steps, actors, mutations, fail/skip at contract level — **met**.

### U-D. Agent / system interaction model — **complete**

**Deliverable:** [`agent-interaction-model.md`](agent-interaction-model.md) — pipeline vs agents, confirm vs auto, pending/incremental extract, must-not-invent, adapter family + thin citation UX, logical tools.

**Exit:** implementers can add an agent without inventing write policy in chat — **met** (locked 2026-07-13).

### U-J. Technical implementation plan — **done (locked)**

**Deliverable:** [`technical-implementation-plan.md`](technical-implementation-plan.md) — the **HOW** for implementing what the locked plan docs already specify (product, data model, surfaces/flows, agent model), without re-litigating product IA.

**Locked highlights:** one **Next.js (App Router) app** at repo root (UI + route-handler API, one Vercel deploy, secrets server-only); Supabase + `react-force-graph-2d` + fetch-SSE + AI SDK/Zod; contracts in `src/lib/contracts`; real LLM Extract in first slice; thin Supabase Auth/Postgres/proposals from day one (not memory-first); defaults with escape hatches. (FE framework reversed 2026-07-20 from the interim Vite SPA + Hono API — see KTD2.)

**Exit met:** a builder can implement capture+render (and see the path to Explore / thin Generate / **U-E** extras) without inventing architecture in chat; remaining forks are named open questions / escape hatches.

**Altitude:** engineering plan — not brand pixels (**U-A**) and not full adapter editors (**U-F**).

### U-E. Persistence & auth

**Deliverable:** Supabase Auth + Postgres graph + RLS + persisted ExtractProposals. **Thin path is in U-J milestones U2–U5** (not a later memory→DB swap). Remaining: export, hard-delete UX, connector OAuth, proposal archive polish.

**Exit when:** refresh keeps the user’s graph (and mid-skim proposals); `user_id` = auth subject — targeted by first dogfood gate in U-J.

---

## Suggested sequence

```
U-B Surfaces ──► U-C Flows ──► U-D Agents     ✅ locked
                                    │
                                    ▼
                               U-A Brand          ✅ look locked
                                    │
                                    ▼
                               U-J Tech plan      ✅ locked
                                    │
                                    ▼
         Capture + render (single Next.js app)
         + thin Supabase Auth/DB/proposals (U-E core)
                                    │
                                    ▼
         Explore / thin Generate / U-E extras → U-F…
```

Practical order: **implement U-J milestones U1–U5** → Explore polish / thin Generate → **U-F**.

**U-F → U-G → U-H → U-I** only after capture→graph→explore→thin-generate works on real persistence.

---

## Status

| Unit | Status |
| --- | --- |
| U-A Brand & visual | **Done (look locked)** — tokens [`src/styles/tokens.css`](../src/styles/tokens.css) |
| U-B IA & surfaces | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| U-C Core flows | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| U-D Agent model | **Locked** — [`agent-interaction-model.md`](agent-interaction-model.md) |
| U-E Persistence & auth | **Thin path in U-J U2–U5**; extras queued |
| U-F Adapter editors | Deferred (after core) |
| U-G Provenance UX | Later |
| U-H Empty/thin polish | Later |
| U-I Copy system | Later |
| U-J Technical implementation plan | **Locked** — [`technical-implementation-plan.md`](technical-implementation-plan.md) |

Data model: **v1 draft locked** in `data-model.md`.  
Code: **U-J U3 rebuilt, canvas-first** — the graph now runs on our own `d3-force` + `<canvas>` + `requestAnimationFrame` loop (see [`graph-canvas.md`](graph-canvas.md)); the first attempt's chrome was deleted and returns one reviewed slice at a time. Node selection + detail (a left-side opaque panel, not the originally-planned centered modal — see below) + a hover card just landed (2026-07-26) but have not been looked at in a browser yet. Next: verify that slice on screen, then U-J U4 (Capture + Extract stream).

---

## Changelog

- **2026-07-26 (even later):** **Hover card + detail panel redesign.** Built the hover
  card the previous pass deferred, and — on founder feedback — replaced the centered
  modal + scrim from that pass with an opaque **left-side panel** and a camera-level
  offset that nudges the graph right while it's open, rather than covering the graph
  behind a dark overlay. Also fixed a real gap the hover card exposed: hover had no
  pointer-leave handling, so it could stick to the last node forever once the mouse left
  the canvas. `docs/surfaces-and-flows.md` gained a changelog note: this deviates from
  its centered-modal checkbox, which should now be read as superseded on placement
  (header image/straddling title were already out of scope regardless — no image field
  exists). Full detail in [`graph-canvas.md`](graph-canvas.md)'s tenth pass. **Still not
  verified on screen** — same caveat as the previous entry, carried forward.

- **2026-07-26 (later still):** **Node selection + detail slice** — a click persists a
  highlight (same dim/lit/accent treatment as hover, full strength, no fade) and opens a
  centered, opaque node detail modal reading the fields `GraphNode` already carries
  (title, kind, status, timeframe, summary, tags, facets). Full details in
  [`graph-canvas.md`](graph-canvas.md)'s changelog. **Built and typechecked/tested but
  not yet verified on screen** — no browser was available in the session that wrote it,
  which breaks this repo's front-end working agreement (see
  [`AGENTS.md`](../AGENTS.md) § Front-end working agreement). Look at it before
  starting U4.

- **2026-07-26 (later):** **U-J U3 graph scrapped and rebuilt — and the way we build front end changed with it.** The retuned canvas measured well and still looked wrong on screen, which was the tell: the physics ran inside `react-force-graph-2d`, so the simulation loop, zoom transform, drag handling and redraw scheduling — the four things every requirement actually depends on — were not ours to shape. The wrapper is gone; simulation, camera, renderer and input are now our own modules, and the whole first-attempt UI (chrome, hover cards, node modal, floating panels) was deleted rather than carried forward. Three durable changes: (1) **captions are gated on measured clear space**, so overview views are quiet and zooming in reveals names, instead of a zoom threshold guessing at it; (2) **the canvas is reviewed by looking at it** — a dev-only `/lab/graph` workbench with URL-settable forces plus two Playwright scripts (`npm run shots`, `npm run shots:compare`) that shoot fit/zoom/drag states and stitch candidate settings into contact sheets; (3) **the shape test measures the real engine** rather than a re-implementation, so it can no longer pass while the screen is wrong. Measured: aspect ratio 1.00–1.06 from 19 to 400 nodes, 109–127 fps including mid-drag. The up-front visual system and physics doctrine moved to [`archive/`](archive/) — front-end intent is now written as checkable requirements and built in slices (see [`AGENTS.md`](../AGENTS.md) § Front-end working agreement). Data model, surfaces/flows and the agent model were unaffected and remain canon.
- **2026-07-26:** **U-J U3 layout corrected — the graph reads calm now.** The first U3 canvas violated the two things the physics doc exists to protect (circular settle, few crossings): it had **no cohesion force at all** (d3's `forceCenter` only recentres a centroid), unbounded repulsion that inflated the graph into strings, shared facets wired as arbitrarily ordered **chains**, and cluster centres seeded around the ring alphabetically so every cross-cluster link cut through the middle. All four are fixed, defaults retuned, and — the durable part — the qualities are now **measured** in a headless simulation test rather than judged by screenshot, on the sample graph plus a denser synthetic one. The sample graph settles with **zero crossings** in a square-ish frame. Link derivation is now one isomorphic rule shared by the server projection and the sample fixture. See graph-physics + data-model + technical-implementation-plan changelogs. Next = **U-J U4** (Capture + Extract stream).
- **2026-07-25:** **U-J U3 shipped — Graph home is real.** Confirmed endeavors render on a full-bleed `react-force-graph-2d` canvas fed by `GET /api/graph`; cluster-seeded pre-warm lands the layout settled; the locked chrome (bottom ask + filter menu + graph settings, top-left adapters hamburger, top-right capture/deepen/theme/profile, hover cards, centered node modal, floating right panels, quiet empty state) is built against U-A tokens. This is the first unit where **U-A, U-B and the graph-physics doctrine are exercised in code** — three docs gained interim answers rather than new locks: highlight-only (no dim), drag-release rejoins the simulation, and a containment root clusters with its own children. Facets (skills/people/orgs) stay data: they project into weighted endeavor↔endeavor links instead of becoming nodes. NL ask ranking, the real deepen signal, and the capture composer are labelled in-product as pending their own units. See technical-implementation-plan U3 + brand-design-system §13 + graph-physics changelogs. Next = **U-J U4** (Capture + Extract stream).
- **2026-07-21:** **U-J U2 shipped** — thin Supabase Auth (magic link) + graph/proposals migrations + RLS on all user tables + Next 16 `proxy.ts` session gate (`getClaims()` local JWKS verify) + dual clients + in-process rate limiting. Migrations deploy to `acta-dev` via the Supabase GitHub integration on merge to `main`. See technical-implementation-plan U2 + changelog. Next = **U-J U3** (graph bootstrap + force canvas).
- **2026-07-20:** **FE stack reversed to Next.js; U1 re-shipped as one app.** Dropped the interim Vite SPA + Hono API for a single Next.js (App Router) app at repo root (UI + route-handler API, one Vercel deploy). `acta-web`/`acta-api` retired; `@acta/contracts` folded into `src/lib/contracts`; tokens SoT → `src/styles/tokens.css`. See technical-implementation-plan KTD1/KTD2 + changelog for full rationale (founder velocity on Next/Vercel, httpOnly-cookie auth, integrated deploy).
- **2026-07-20:** **U-J U1 scaffold shipped** — npm workspaces + `@acta/contracts` (ported Zod domain) + Hono/Vite health shells. Design-token SoT moved into `src/styles/tokens.css`; repo-root `styles/` folder removed.
- **2026-07-17:** **Repo structure decision** — build in **one repo** (this `Acta` repo) with `acta-web` / `acta-api` / `acta-contracts` workspace subfolders and `docs/` at root, instead of separate FE/BE repos. FE/BE still deploy to separate hosts (secrets backend-only). U-J updated to match; JSDoc doc-comment convention added (mirrored into code subfolders at U1).
- **2026-07-15:** **U-J locked** — [`technical-implementation-plan.md`](technical-implementation-plan.md). Polyrepo FE/BE; thin Supabase + real LLM in first slice. Next = implement capture+render.
- **2026-07-15:** **U-A look locked**; Next prototype removed; tokens at `src/styles/tokens.css`. **Next = U-J**.
- **2026-07-15:** Graph-home chrome aligned to founder sketch (full-bleed canvas, bottom ask, floating panels, hamburger adapters). See [`surfaces-and-flows.md`](surfaces-and-flows.md).
- **2026-07-14:** Working brand → **Acta**. U-A scaffold → [`archive/brand-design-system.md`](archive/brand-design-system.md). Name locked; visual sections open. Then U-J → capture+render → U-E.
- **2026-07-13:** **U-D locked.** Added **U-J** technical implementation plan (HOW for locked plan docs). Next = **U-A**, then U-J, then capture+render → U-E.
- **2026-07-13:** Status snapshot — U-B/U-C locked; U-D co-design; units **U-A…U-I**.
- **2026-07-13:** Building-plan units renamed to **U-A…U-I** (doc/agent convention). Thin adapter citation UX owned by U-D; rich provenance remains U-G.
- **2026-07-13:** **U-D** drafted for co-design — [`agent-interaction-model.md`](agent-interaction-model.md).
- **2026-07-13:** U-B+U-C marked **locked**. First impl unit = capture+render. Agent connectors deferred post classic MVP.
- **2026-07-13:** Moved with other planning docs under `docs/`. Removed session `HANDOFF.md`.
- **2026-07-10:** B+C drafted in `surfaces-and-flows.md`. Next lean: D agents and/or A brand.
- **2026-07-10:** Created. Locked Now = brand, IA, flows, agents, auth/persistence.
