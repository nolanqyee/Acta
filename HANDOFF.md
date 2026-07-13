# Stilva — Handoff

Last updated: 2026-07-13

Where we are, what’s decided, what’s next. Read this before continuing build work.

---

## One-liner

**Stilva** (still × vita / distill a life): personal evidence graph. Capture life material → structured graph → ask/stage-aware relevance → grounded artifacts (resume, interview stories, app answers). Wedge: college tech internship recruiting.

---

## Doc map (source of truth)

| Doc | Owns | Status |
| --- | --- | --- |
| [`personal-evidence-graph.md`](personal-evidence-graph.md) | Product vision, wedge, adapters, monetization, relevance | Living; many Qs settled |
| [`data-model.md`](data-model.md) | Schema, entities, edges, extract, provenance, consumption | **v1 draft locked** |
| [`surfaces-and-flows.md`](surfaces-and-flows.md) | IA / surfaces + core interaction flows | **v1 draft** (B+C) |
| [`building-plan.md`](building-plan.md) | Build roadmap (what to harden next) | Living |
| **This file** | Session handoff / orientation | Living |

Code under `src/` is a **prototype scaffold** — do not treat UI as product design.

---

## What’s decided (high signal)

### Product
- Category: personal evidence graph; brand **Stilva**
- Wedge: college **internship** tech recruiting (not essay writer; not mid-career backfill product)
- MVP adapters: tailored resume + interview stories + app-question drafts (graph-grounded)
- Cold start: import (resume/LinkedIn/GitHub) → light diff-skim → enter → deepen over time (not gated)
- Relevance: intake application tags + hybrid runtime (tag filter → rank for JD/question)
- Platform: cloud web app; **Supabase/Postgres** (not Firebase, not graph DB for v1)

### Data model
- Guideline-first typed graph (suggest, don’t hard-reject atypical evidence)
- Polymorphic **`Endeavor`** with kinds: `role` | `leadership` | `project` | `creative_work` | `course` | `education` | `event` | `volunteer` | `hobby`
- Nesting DAG via stored **`part_of`** only (multi-parent OK); children 0..n
- Primary: Achievement, Skill, Person, Org, Metric, Evidence, Capture
- Secondary: Story / Lesson with **hybrid stamp** (draft → stamped; sensitive staleness)
- Values/Goals entities: **out of scope**
- NL explore is a first-class consumer (nodes + citations, not inventing)

### Surfaces & flows
- **Home = Graph** (no “Today” inbox — nothing day-ritual enough)
- **Canvas-first** (Obsidian-like) for product + marketing; **list secondary**; **docs-style node pages**
- Persistent **ask bar** + **filters** share one **highlight-on-nodes** language
- **Quick-add capture** from Graph → diff-skim → merge
- Generate is an **outcome** action, not home; full adapter editor design deferred
- Core flows documented: import, yap, deepen, NL explore, filter, thin generate, archive/tags, story stamp

---

## Build priority (from `building-plan.md`)

### Now (harden before more feature sprawl)

| | Workstream | Status |
| --- | --- | --- |
| A | Brand & visual system | Queued |
| B | IA & surfaces | **Drafted** → `surfaces-and-flows.md` |
| C | Core flows | **Drafted** → `surfaces-and-flows.md` |
| D | Agent / system interaction model | **Next lean** (with or after brand) |
| E | Persistence & auth (Supabase) | Queued — start once surfaces feel stable |

### After core loop works
- **F** Adapter view design (resume/interview editors — familiar editing UX)

### Later (“make it good”)
- **G** Provenance UX polish · **H** Empty/thin states · **I** In-product copy

Suggested sequence: review/lock B+C → **D agents** and/or **A brand** → **E auth/DB** → then real extract/adapters on persisted graph.

---

## Code scaffold (honest state)

**Stack:** Next.js 15 + TypeScript + Zod + Supabase client wiring + Postgres migration sketched.

**What works locally (`npm run dev`):**
- In-memory `GraphRepository` (demo user; **resets on server restart**)
- Seed dogfood graph, capture → heuristic extract → diff-skim merge
- Graph list + endeavor detail, skills hubs, NL explore (bag-of-words embeddings)
- Story propose/stamp, thin app-question draft

**What’s stubbed / not production:**
- Extract = keyword heuristics, not LLM
- Stories/adapters = templates over graph, not full model calls
- Supabase Auth + real Postgres **not** default path yet (migration + `.env.example` exist)
- UI is scaffold — **not** the Graph canvas IA in `surfaces-and-flows.md`

```bash
npm install && npm run dev   # http://localhost:3000
npm test && npm run build
```

Apply SQL when ready: `supabase/migrations/20260710120000_init_graph.sql`

---

## Open questions to resolve soon

From `surfaces-and-flows.md`:
- [ ] Canvas default: force-directed vs containment tree
- [ ] Ask bar vs filter chips: one control or separate
- [ ] Quick-add chrome: floating / panel / full step
- [ ] Which node types on canvas in v1 (endeavors only vs skills/people too)

Then write **agent interaction model (D)** before expanding LLM extract.

---

## Do / don’t for the next session

**Do**
- Treat markdown specs as SoT; update them when decisions change
- Prefer hardening A/D/E over new prototype screens that fight the IA
- Keep adapter editor polish in **F**, not Now

**Don’t**
- Invent Values/Goals entities
- Build a Today/inbox home
- Hard-gate generate on deepen
- Assume Firebase or Neo4j
- Ship canvas UI without aligning to `surfaces-and-flows.md`

---

## Changelog

- **2026-07-13:** Handoff created for commit/push — product + data model + surfaces/flows + scaffold honesty + next priorities.
