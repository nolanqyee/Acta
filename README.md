# Acta

Personal evidence graph — capture life material, structure it into endeavors + edges, explore in natural language, draft grounded artifacts.

**Pronunciation:** AK-tuh. This repo is a **single Next.js (App Router) app** — UI + route-handler API in one deploy, with planning docs at `docs/` — see [`docs/technical-implementation-plan.md`](docs/technical-implementation-plan.md).

## Specs

Planning docs live in [`docs/`](docs/). Building-plan units are **U-A…U-J** (see [`docs/building-plan.md`](docs/building-plan.md)).

| Doc | Owns |
| --- | --- |
| [`docs/personal-evidence-graph.md`](docs/personal-evidence-graph.md) | Product |
| [`docs/data-model.md`](docs/data-model.md) | Schema |
| [`docs/surfaces-and-flows.md`](docs/surfaces-and-flows.md) | IA & flows (**U-B** / **U-C**) |
| [`docs/agent-interaction-model.md`](docs/agent-interaction-model.md) | Agents & write policy (**U-D**) |
| [`docs/brand-design-system.md`](docs/brand-design-system.md) | Brand + visual (**U-A**) |
| [`docs/mockup-synthesis.md`](docs/mockup-synthesis.md) | Graph-home vision brief |
| [`docs/graph-physics.md`](docs/graph-physics.md) | Canvas simulation doctrine |
| [`docs/building-plan.md`](docs/building-plan.md) | Build roadmap |
| [`docs/technical-implementation-plan.md`](docs/technical-implementation-plan.md) | **HOW** (**U-J** — locked) |

**Design tokens (source of truth):** [`src/styles/tokens.css`](src/styles/tokens.css)

**Where we are:** product + data model + Graph IA (**U-B/U-C**) + agent model (**U-D**) + brand look/tokens (**U-A**) + tech plan (**U-J**) locked. **U-J U1 shipped** as a single Next.js app (health shell + `/api/health` + `/api/meta`, shared contracts in `src/lib/contracts`). **Next: U2** — Supabase Auth + schema + RLS toward capture + render with thin Supabase + real LLM Extract.

## Getting started

```bash
npm install
npm run dev     # Next dev server (UI + /api/* on one origin)
npm run check   # lint + typecheck + tests
```

## Layout

```
docs/                 Planning specs + HTML mock/decision tools
AGENTS.md             Repo conventions for humans + coding agents
src/app/              App Router: pages, root layout, and /api route handlers
src/lib/contracts/    Shared Zod schemas + types (import via @/lib/contracts)
src/features/         Graph canvas, capture composer + skim (client)
src/server/           Server-only domain logic (GraphRepository, extract, merge)
src/styles/tokens.css Design tokens — source of truth
.cursor/              Agent rules (local; not committed)
```
