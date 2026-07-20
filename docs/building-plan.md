# Acta — Building Plan

Last updated: 2026-07-17

Overarching **build** roadmap (not business/GTM). Companion to:

| Doc | Owns |
| --- | --- |
| [`personal-evidence-graph.md`](personal-evidence-graph.md) | Product vision, wedge, adapters, monetization |
| [`data-model.md`](data-model.md) | Schema, edges, extract/provenance contracts |
| [`surfaces-and-flows.md`](surfaces-and-flows.md) | IA / surfaces + core interaction flows |
| [`agent-interaction-model.md`](agent-interaction-model.md) | Agents, confirm vs auto, pending proposals, write policy |
| [`brand-design-system.md`](brand-design-system.md) | Brand + visual system (**U-A**) |
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
| Brand / visual (**U-A**) | **Look locked** — [`brand-design-system.md`](brand-design-system.md) + [`src/styles/tokens.css`](../src/styles/tokens.css); motion/a11y trail |
| Tech implementation plan (**U-J**) | **Locked** — [`technical-implementation-plan.md`](technical-implementation-plan.md) |
| Persistence / auth (**U-E**) | **In first build wave** — thin Supabase Auth/Postgres + proposals from U-J U2; extras (export, connectors) still queued |
| Code | **U-J U1 shipped** — single Next.js app at repo root (health shell + `/api/health` + `/api/meta`, contracts in `src/lib/contracts`). Next = U2 (Supabase Auth + schema + RLS) |

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

**Deliverable:** [`brand-design-system.md`](brand-design-system.md) + [`src/styles/tokens.css`](../src/styles/tokens.css) — brand + UI foundation (tokens, type, color, graph chrome, do/don’t). HTML decision/mock tools under `docs/`.

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
Code: **U-J U1 shipped** — single Next.js app at repo root. Next = U-J U2 (Supabase Auth + schema + RLS).

---

## Changelog

- **2026-07-20:** **FE stack reversed to Next.js; U1 re-shipped as one app.** Dropped the interim Vite SPA + Hono API for a single Next.js (App Router) app at repo root (UI + route-handler API, one Vercel deploy). `acta-web`/`acta-api` retired; `@acta/contracts` folded into `src/lib/contracts`; tokens SoT → `src/styles/tokens.css`. See technical-implementation-plan KTD1/KTD2 + changelog for full rationale (founder velocity on Next/Vercel, httpOnly-cookie auth, integrated deploy).
- **2026-07-20:** **U-J U1 scaffold shipped** — npm workspaces + `@acta/contracts` (ported Zod domain) + Hono/Vite health shells. Design-token SoT moved into `src/styles/tokens.css`; repo-root `styles/` folder removed.
- **2026-07-17:** **Repo structure decision** — build in **one repo** (this `Acta` repo) with `acta-web` / `acta-api` / `acta-contracts` workspace subfolders and `docs/` at root, instead of separate FE/BE repos. FE/BE still deploy to separate hosts (secrets backend-only). U-J updated to match; JSDoc doc-comment convention added (mirrored into code subfolders at U1).
- **2026-07-15:** **U-J locked** — [`technical-implementation-plan.md`](technical-implementation-plan.md). Polyrepo FE/BE; thin Supabase + real LLM in first slice. Next = implement capture+render.
- **2026-07-15:** **U-A look locked**; Next prototype removed; tokens at `src/styles/tokens.css`. **Next = U-J**.
- **2026-07-15:** Graph-home chrome aligned to founder sketch (full-bleed canvas, bottom ask, floating panels, hamburger adapters). See [`surfaces-and-flows.md`](surfaces-and-flows.md).
- **2026-07-14:** Working brand → **Acta**. U-A scaffold → [`brand-design-system.md`](brand-design-system.md). Name locked; visual sections open. Then U-J → capture+render → U-E.
- **2026-07-13:** **U-D locked.** Added **U-J** technical implementation plan (HOW for locked plan docs). Next = **U-A**, then U-J, then capture+render → U-E.
- **2026-07-13:** Status snapshot — U-B/U-C locked; U-D co-design; units **U-A…U-I**.
- **2026-07-13:** Building-plan units renamed to **U-A…U-I** (doc/agent convention). Thin adapter citation UX owned by U-D; rich provenance remains U-G.
- **2026-07-13:** **U-D** drafted for co-design — [`agent-interaction-model.md`](agent-interaction-model.md).
- **2026-07-13:** U-B+U-C marked **locked**. First impl unit = capture+render. Agent connectors deferred post classic MVP.
- **2026-07-13:** Moved with other planning docs under `docs/`. Removed session `HANDOFF.md`.
- **2026-07-10:** B+C drafted in `surfaces-and-flows.md`. Next lean: D agents and/or A brand.
- **2026-07-10:** Created. Locked Now = brand, IA, flows, agents, auth/persistence.
