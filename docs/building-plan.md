# Stilva — Building Plan

Last updated: 2026-07-13

Overarching **build** roadmap (not business/GTM). Companion to:

| Doc | Owns |
| --- | --- |
| [`personal-evidence-graph.md`](personal-evidence-graph.md) | Product vision, wedge, adapters, monetization |
| [`data-model.md`](data-model.md) | Schema, edges, extract/provenance contracts |
| [`surfaces-and-flows.md`](surfaces-and-flows.md) | IA / surfaces + core interaction flows |
| [`agent-interaction-model.md`](agent-interaction-model.md) | Agents, confirm vs auto, pending proposals, write policy |
| **This doc** | What to harden next for shipping software: brand, IA, flows, agents, auth |

Scaffold code exists (Next.js + in-memory graph). Treat UI as prototype until **U-A–U-E** land against the locked IA.

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

**Rules:**
- In docs and agent chat, say **U-D**, not “D” or “workstream D,” when meaning this roadmap.
- Do not reuse bare letters for other checklists in a way that collides (e.g. data-model worked examples may still use A/B/C locally — those are *examples*, not building-plan units).
- New roadmap items continue **U-J**, **U-K**, …

---

## Where we are (2026-07-13)

| Layer | Status |
| --- | --- |
| Product vision / wedge | Locked — Stilva; college tech internship recruiting |
| Data model | **v1 draft locked** — [`data-model.md`](data-model.md) |
| IA + core flows (**U-B** + **U-C**) | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| Agent write policy (**U-D**) | **Co-design draft; open questions cleared** — [`agent-interaction-model.md`](agent-interaction-model.md). Explicit lock still pending your call |
| Brand / visual (**U-A**) | Not started — **next after U-D lock** |
| Persistence / auth (**U-E**) | Sketched (migration + clients); not default path |
| Code | Prototype scaffold — list/heuristic extract; **not** the locked Graph canvas IA |

**Docs layout:** planning specs live under `docs/` (no session handoff file). Building-plan units are **U-A…U-I**.

**First implementation unit:** **capture + render** (force-directed endeavors, right-sidebar incremental diff-skim, pending nodes). Not **U-F** adapter editors.

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
| **U-D** | **Agent / system interaction model** | Extract/deepen/explore/synth write policy; confirm vs auto; pending proposals | **Co-design draft — open Qs cleared; await explicit lock** |
| **U-A** | **Brand & visual system** | Force-graph WOW needs one composition language | **Next after U-D lock** |
| **U-E** | **Persistence & auth** | Real user + Supabase graph survives refresh | Queued — start once capture+render loop is real (or parallel with U-A) |

### After core loop works on real graph

| Unit | Workstream | Notes |
| --- | --- | --- |
| **U-F** | **Adapter view design** | Resume / interview / app-question editors; formats/fork later |

### Later — “make it good”

| Unit | Workstream | Notes |
| --- | --- | --- |
| **U-G** | **Trust & provenance UX** | Rich citation chrome, why-this-node, stamp/stale polish — beyond thin citation UX required by U-D |
| **U-H** | **Empty / thin / cold-start polish** | Beyond bare flow contracts |
| **U-I** | **In-product copy system** | After brand + flows |

### Explicitly out of near scope

Monetization, GTM, domain/legal, B2B/coach-share, essay adapters, voice, kitchen-sink / **agent chat-history** connectors (post classic MVP), Jake’s/DOCX exports.

---

## Now — detail & exit criteria

### U-A. Brand & visual system

**Deliverable:** short brand + UI foundation (tokens, type, color, motion principles, do/don’t). Enough that Graph home (force canvas, sidebars, hover cards, pending states) doesn’t invent a new look per screen.

**Exit when:** one composition language + CSS variables (or design tokens) exist; dogfood UI can be restyled to match without redesigning IA.

### U-B. IA & primary surfaces — **complete**

**Deliverable:** surface map in [`surfaces-and-flows.md`](surfaces-and-flows.md).

**Exit:** every Now flow maps to named surfaces — **met**.

### U-C. Core interaction flows — **complete**

**Deliverable:** flows 1–8 in [`surfaces-and-flows.md`](surfaces-and-flows.md) (import, yap, deepen backlog, explore, filter chips, generate thin, archive/tags, story stamp) including pending-node diff-skim.

**Exit:** steps, actors, mutations, fail/skip at contract level — **met**.

### U-D. Agent / system interaction model — **in review**

**Deliverable:** [`agent-interaction-model.md`](agent-interaction-model.md) — agents, confirm vs auto, pending proposals, must-not-invent, logical tools, thin citation UX.

**Exit when:** we agree the policy together; implementers can add an agent without inventing write policy in chat.

### U-E. Persistence & auth

**Deliverable:** Supabase Auth + Postgres graph (migrations already sketched) as default; RLS; demo/memory only as fallback or gone. Includes persisted ExtractProposals until confirm/discard.

**Exit when:** refresh keeps the user’s graph (and mid-skim proposals); `user_id` = auth subject.

---

## Suggested sequence

```
U-B Surfaces ──► U-C Flows ──► U-D Agents     (U-B/C locked; U-D in co-design)
                                    │
                                    ▼
                               U-A Brand (next)
                                    │
                                    ▼
         Capture + render implementation
         (force canvas + right diff-skim + pending)
                                    │
                                    ▼
                               U-E Auth/DB
```

Practical order: finish **U-D** co-design → **U-A** brand → **implement capture+render** → **U-E** → Explore polish / thin Generate → **U-F**.

**U-F → U-G → U-H → U-I** only after capture→graph→explore→thin-generate works on real persistence.

---

## Status

| Unit | Status |
| --- | --- |
| U-A Brand & visual | **Next after U-D lock** |
| U-B IA & surfaces | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| U-C Core flows | **Locked** — [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| U-D Agent model | **Co-design draft (open Qs cleared)** — [`agent-interaction-model.md`](agent-interaction-model.md) |
| U-E Persistence & auth | Queued |
| U-F Adapter editors | Deferred (after core) |
| U-G Provenance UX | Later (rich chrome; thin citations required earlier by U-D) |
| U-H Empty/thin polish | Later |
| U-I Copy system | Later |

Data model: **v1 draft locked** in `data-model.md`.  
Code scaffold: exists; align to locked IA via **capture + render** first — do not grow list/scaffold screens that fight the canvas home.

---

## Changelog

- **2026-07-13:** Status snapshot — U-B/U-C locked; U-D co-design draft with open questions cleared (await lock); U-A next; then capture+render → U-E. Specs under `docs/`; units **U-A…U-I**.
- **2026-07-13:** Building-plan units renamed to **U-A…U-I** (doc/agent convention). Thin adapter citation UX owned by U-D; rich provenance remains U-G.
- **2026-07-13:** **U-D** drafted for co-design — [`agent-interaction-model.md`](agent-interaction-model.md). Not locked until reviewed together. Next after U-D: **U-A** brand → capture+render → **U-E**.
- **2026-07-13:** U-B+U-C marked **locked** (surfaces open questions resolved). First impl unit = capture+render. Agent connectors deferred post classic MVP.
- **2026-07-13:** Moved with other planning docs under `docs/`. Removed session `HANDOFF.md`.
- **2026-07-10:** B+C drafted in `surfaces-and-flows.md` (Graph home canvas-first; no Today). Next lean: D agents and/or A brand.
- **2026-07-10:** Created. Locked Now = brand, IA, flows, agents, auth/persistence. Deferred adapter editor design until core solid. Later = provenance UX, empty-state polish, copy system.
