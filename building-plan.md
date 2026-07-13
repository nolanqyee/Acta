# Stilva — Building Plan

Last updated: 2026-07-10

Overarching **build** roadmap (not business/GTM). Companion to:

| Doc | Owns |
| --- | --- |
| [`personal-evidence-graph.md`](personal-evidence-graph.md) | Product vision, wedge, adapters, monetization |
| [`data-model.md`](data-model.md) | Schema, edges, extract/provenance contracts |
| [`surfaces-and-flows.md`](surfaces-and-flows.md) | IA / surfaces + core interaction flows |
| [`HANDOFF.md`](HANDOFF.md) | Session orientation / where we are |
| **This doc** | What to harden next for shipping software: brand, IA, flows, agents, auth |

Scaffold code exists (Next.js + in-memory graph). **Pause feature sprawl** until the items below in **Now** are solid enough to build against.

---

## Priority stack (locked 2026-07-10)

### Now — harden before more product code

| # | Workstream | Why |
| --- | --- | --- |
| **A** | **Brand & visual system** | Name is Stilva; no voice/type/color/motion/components yet — every screen invents itself |
| **B** | **IA & primary surfaces** | Which screens exist and what job each has (not pixel polish) |
| **C** | **Core interaction flows** | Ordered happy paths + empty/error/skip at flow level (contracts for builders) |
| **D** | **Agent / system interaction model** | How extract, deepen, explore, synth, adapters read/write the graph; confirm vs auto |
| **E** | **Persistence & auth** | Real signed-in user + Supabase graph that survives refresh (replace demo user / memory default) |

### After core product is solid

| # | Workstream | Notes |
| --- | --- | --- |
| **F** | **Adapter view design** (resume / interview / app-question editors) | Smoke-and-mirrors on familiar editing UX — design after core loop works; not blocking brand/IA/flows/agents/auth |

### Later — “make it good”

| # | Workstream | Notes |
| --- | --- | --- |
| **G** | **Trust & provenance UX** | Citations, why-this-node, stamp/stale affordances — after how-it-works is clear |
| **H** | **Empty / thin / cold-start polish** | Activation states beyond bare flow contracts |
| **I** | **In-product copy system** | Onboarding/deepen/empty copy matched to brand — after brand + flows |

### Explicitly out of this doc’s near scope

Monetization, GTM, domain/legal, B2B/coach-share, essay adapters, voice, kitchen-sink integrations, Jake’s/DOCX exports.

---

## Now — detail & exit criteria

### A. Brand & visual system

**Deliverable:** short brand + UI foundation (tokens, type, color, motion principles, do/don’t). Enough that new screens don’t look like a different product.

**Exit when:** one composition language + CSS variables (or design tokens) exist; dogfood UI can be restyled to match without redesigning IA.

### B. IA & primary surfaces

**Deliverable:** surface map — e.g. home/inbox, capture, graph (list and/or canvas), endeavor detail, deepen, explore, adapter workspace, settings/export. One job per surface.

**Exit when:** every Now flow (#C) maps to named surfaces; no orphan capabilities floating only in nav experiments.

### C. Core interaction flows

**Deliverable:** written end-to-end flows (not full UI mockups):

1. Import → diff-skim → enter  
2. Yap → extract → merge  
3. Deepen (checklist + skippable JIT)  
4. Explore NL → open node  
5. Generate adapter → cite → edit → export (thin; full editor design is **F**)  
6. Soft archive / tag override  

**Exit when:** each flow has steps, actor (user/agent), graph mutations, and failure/skip behavior at contract level.

### D. Agent / system interaction model

**Deliverable:** which agents/tools exist; read vs write; when confirm/diff-skim is required; what they must not invent; how proposals become graph state (ties to `data-model.md` extract + stamp rules).

**Exit when:** implementers can add an agent without inventing write policy in chat.

### E. Persistence & auth

**Deliverable:** Supabase Auth + Postgres graph (migrations already sketched) as default; RLS; demo/memory only as fallback or gone.

**Exit when:** refresh keeps the user’s graph; `user_id` = auth subject.

---

## Suggested sequence

```
A Brand ──┬──► B Surfaces ──► C Flows ──► D Agents
          │                                    │
          └──────────── E Auth/DB ◄────────────┘
                         (can parallelize early with A–D once surfaces known)
```

Practical order: **B+C surfaces/flows (drafted)** → **D Agents** and/or **A Brand** → **E Auth** as soon as surface list is stable.

**F → G → H → I** only after the core capture→graph→explore→thin-generate loop works on real persistence.

---

## Status

| Workstream | Status |
| --- | --- |
| A Brand & visual | Queued |
| B IA & surfaces | **Drafted** — see [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| C Core flows | **Drafted** — see [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| D Agent model | **Next** (after review of surfaces/flows) |
| E Persistence & auth | Queued |
| F Adapter editors | Deferred (after core) |
| G Provenance UX | Later (make it good) |
| H Empty/thin polish | Later (make it good) |
| I Copy system | Later (make it good) |

Data model: **v1 draft locked** in `data-model.md`.  
Code scaffold: exists; treat as prototype until A–E land.

---

## Changelog

- **2026-07-10:** B+C drafted in `surfaces-and-flows.md` (Graph home canvas-first; no Today). Next lean: D agents and/or A brand.
- **2026-07-10:** Created. Locked Now = brand, IA, flows, agents, auth/persistence. Deferred adapter editor design until core solid. Later = provenance UX, empty-state polish, copy system.
