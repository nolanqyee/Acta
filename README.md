# Acta

Personal evidence graph — capture life material, structure it into endeavors + edges, explore in natural language, draft grounded artifacts.

**Pronunciation:** AK-tuh. Planning-first repo right now (no app scaffold yet). Code will land as `acta-web` / `acta-api` / `acta-contracts` workspace subfolders in **this** repo (docs stay at root) — see [`docs/technical-implementation-plan.md`](docs/technical-implementation-plan.md).

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

**Design tokens (code reference):** [`styles/tokens.css`](styles/tokens.css)

**Where we are:** product + data model + Graph IA (**U-B/U-C**) + agent model (**U-D**) + brand look/tokens (**U-A**) + tech plan (**U-J**) locked. **Next: scaffold `acta-web` + `acta-api` + `acta-contracts` subfolders** in this repo (workspaces; FE/BE deploy to separate hosts, secrets backend-only) — capture + render with thin Supabase + real LLM Extract.

The old Next.js prototype was removed so planning isn’t fighting dead UI. App code will live in workspace subfolders of this repo per **U-J**, not the revived prototype.

## Layout

```
docs/                 Planning specs + HTML mock/decision tools
styles/tokens.css     Acta design tokens (imported by acta-web once bootstrapped)
AGENTS.md             Repo conventions for humans + coding agents
acta-contracts/       @acta/contracts — shared Zod + types   (created at U-J U1)
acta-web/             Vite React SPA — Graph canvas + chrome  (created at U-J U1)
acta-api/             Hono API — capture/extract/graph + DB   (created at U-J U1)
.cursor/              Agent rules (local; not committed)
```
