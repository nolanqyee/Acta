# Stilva — Building Plan

Last updated: 2026-07-13

Overarching **build** roadmap (not business/GTM). Companion to:

| Doc | Owns |
| --- | --- |
| [`personal-evidence-graph.md`](personal-evidence-graph.md) | Product vision, wedge, adapters, monetization |
| [`data-model.md`](data-model.md) | Schema, edges, extract/provenance contracts |
| [`surfaces-and-flows.md`](surfaces-and-flows.md) | IA / surfaces + core interaction flows |
| [`agent-interaction-model.md`](agent-interaction-model.md) | Agents, confirm vs auto, pending proposals, write policy |
| [`technical-implementation-plan.md`](technical-implementation-plan.md) | **HOW** to implement locked plan docs (created in **U-J**) |
| **This doc** | What to harden next: brand, IA, flows, agents, tech plan, auth |

Scaffold code exists (Next.js + in-memory graph). Treat UI as prototype until **U-A–U-E** (+ **U-J**) land against the locked IA.

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

## Where we are (2026-07-13)

| Layer | Status |
| --- | --- |
| Product vision / wedge | Locked — Stilva; college tech internship recruiting |
| Data model | **v1 draft locked** — [`data-model.md`](data-model.md) |
| IA + core flows (**U-B** + **U-C**) | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| Agent write policy (**U-D**) | **Locked** — [`agent-interaction-model.md`](agent-interaction-model.md) |
| Brand / visual (**U-A**) | Not started — **next** |
| Tech implementation plan (**U-J**) | Queued — after U-A (before heavy capture+render coding) |
| Persistence / auth (**U-E**) | Sketched (migration + clients); not default path |
| Code | Prototype scaffold — list/heuristic extract; **not** the locked Graph canvas IA |

**Docs layout:** planning specs under `docs/`. Building-plan units **U-A…U-J**.

**First product loop to ship in code:** **capture + render** (force-directed endeavors, right-sidebar incremental diff-skim, pending nodes) — after **U-A** + **U-J**.

### Locked IA highlights (build against these)

- Home = Graph; force-directed; **Endeavors only** on canvas (no skill/person/org physics nodes)
- Browser-like ask bar + **separate** filter chips; Explore = right sidebar + highlight
- Diff-skim = right sidebar + changelog + **incremental** pending nodes (proposals **stored until confirm/discard**)
- Node = centered Notion-like modal; kind-rich compact hover cards
- Deepen = **backlog** panel (pull queue), not notifications
- Generate = left sidebar → adapter pages + expandable mini-graph peek; adapters are a **family** with thin citation UX
- Agent chat-history connectors = **after** classic MVP imports

---

## Priority stack

### Now — harden before more feature sprawl

| Unit | Workstream | Why | Status |
| --- | --- | --- | --- |
| **U-B** | **IA & primary surfaces** | Screens + jobs | **Done (locked)** |
| **U-C** | **Core interaction flows** | Flow contracts | **Done (locked)** |
| **U-D** | **Agent / system interaction model** | Extract/deepen/explore/synth write policy; confirm vs auto; pending | **Done (locked)** |
| **U-A** | **Brand & visual system** | Force-graph WOW needs one composition language | **Next** |
| **U-J** | **Technical implementation plan** | Turn locked what/why docs into a concrete HOW (stack choices, modules, sequencing, risks) | Queued — after U-A |
| **U-E** | **Persistence & auth** | Real user + Supabase graph survives refresh | Queued — with/after first capture+render slice per U-J |

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

### U-A. Brand & visual system — **next**

**Deliverable:** short brand + UI foundation (tokens, type, color, motion principles, do/don’t). Enough that Graph home (force canvas, sidebars, hover cards, pending states) doesn’t invent a new look per screen.

**Exit when:** one composition language + CSS variables (or design tokens) exist; dogfood UI can be restyled to match without redesigning IA.

### U-B. IA & primary surfaces — **complete**

**Deliverable:** surface map in [`surfaces-and-flows.md`](surfaces-and-flows.md).

**Exit:** every Now flow maps to named surfaces — **met**.

### U-C. Core interaction flows — **complete**

**Deliverable:** flows 1–8 in [`surfaces-and-flows.md`](surfaces-and-flows.md).

**Exit:** steps, actors, mutations, fail/skip at contract level — **met**.

### U-D. Agent / system interaction model — **complete**

**Deliverable:** [`agent-interaction-model.md`](agent-interaction-model.md) — pipeline vs agents, confirm vs auto, pending/incremental extract, must-not-invent, adapter family + thin citation UX, logical tools.

**Exit:** implementers can add an agent without inventing write policy in chat — **met** (locked 2026-07-13).

### U-J. Technical implementation plan

**Deliverable:** [`technical-implementation-plan.md`](technical-implementation-plan.md) — the **HOW** for implementing what the locked plan docs already specify (product, data model, surfaces/flows, agent model), without re-litigating product IA.

Should cover, at minimum:

1. **System map** — packages/modules vs docs (domain, graph repo, extract pipeline, UI surfaces).
2. **Capture + render slice** — force canvas library/approach, pending proposal store, right-sidebar diff-skim, incremental emit.
3. **Data & persistence path** — Zod ↔ Postgres/Supabase mapping; when memory repo yields to **U-E**.
4. **Agent/runtime approach** — where LLMs plug in vs heuristics; tool boundaries from U-D.
5. **Sequenced build milestones** — ordered PRs/milestones from scaffold → dogfoodable Graph home → auth.
6. **Risks / open tech choices** — explicitly listed (graph lib, streaming transport, proposal schema, etc.).

**Exit when:** a builder can implement capture+render (and see the path to U-E / Explore / thin Generate) without inventing architecture in chat; remaining tech forks are listed as decisions, not vague TBD.

**Altitude:** engineering plan — not brand pixels (**U-A**) and not full adapter editors (**U-F**).

### U-E. Persistence & auth

**Deliverable:** Supabase Auth + Postgres graph (migrations already sketched) as default; RLS; demo/memory only as fallback or gone. Includes persisted ExtractProposals until confirm/discard.

**Exit when:** refresh keeps the user’s graph (and mid-skim proposals); `user_id` = auth subject.

---

## Suggested sequence

```
U-B Surfaces ──► U-C Flows ──► U-D Agents     ✅ locked
                                    │
                                    ▼
                               U-A Brand          ← next
                                    │
                                    ▼
                               U-J Tech plan      (HOW for locked docs)
                                    │
                                    ▼
         Capture + render implementation
         (force canvas + right diff-skim + pending)
                                    │
                                    ▼
                               U-E Auth/DB
```

Practical order: **U-A** → **U-J** → **implement capture+render** → **U-E** → Explore polish / thin Generate → **U-F**.

**U-F → U-G → U-H → U-I** only after capture→graph→explore→thin-generate works on real persistence.

---

## Status

| Unit | Status |
| --- | --- |
| U-A Brand & visual | **Next** |
| U-B IA & surfaces | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| U-C Core flows | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| U-D Agent model | **Locked** — [`agent-interaction-model.md`](agent-interaction-model.md) |
| U-E Persistence & auth | Queued |
| U-F Adapter editors | Deferred (after core) |
| U-G Provenance UX | Later |
| U-H Empty/thin polish | Later |
| U-I Copy system | Later |
| U-J Technical implementation plan | Queued — after U-A; doc TBD |

Data model: **v1 draft locked** in `data-model.md`.  
Code scaffold: exists; align to locked IA via **capture + render** after **U-A** + **U-J**.

---

## Changelog

- **2026-07-13:** **U-D locked.** Added **U-J** technical implementation plan (HOW for locked plan docs). Next = **U-A**, then U-J, then capture+render → U-E.
- **2026-07-13:** Status snapshot — U-B/U-C locked; U-D co-design; units **U-A…U-I**.
- **2026-07-13:** Building-plan units renamed to **U-A…U-I** (doc/agent convention). Thin adapter citation UX owned by U-D; rich provenance remains U-G.
- **2026-07-13:** **U-D** drafted for co-design — [`agent-interaction-model.md`](agent-interaction-model.md).
- **2026-07-13:** U-B+U-C marked **locked**. First impl unit = capture+render. Agent connectors deferred post classic MVP.
- **2026-07-13:** Moved with other planning docs under `docs/`. Removed session `HANDOFF.md`.
- **2026-07-10:** B+C drafted in `surfaces-and-flows.md`. Next lean: D agents and/or A brand.
- **2026-07-10:** Created. Locked Now = brand, IA, flows, agents, auth/persistence.
