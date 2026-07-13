# Stilva

Personal evidence graph — capture life material, structure it into endeavors + edges, explore in natural language, draft grounded artifacts.

## Specs

Planning docs live in [`docs/`](docs/). Building-plan units are **U-A…U-I** (see [`docs/building-plan.md`](docs/building-plan.md)).

- [`docs/personal-evidence-graph.md`](docs/personal-evidence-graph.md) — product
- [`docs/data-model.md`](docs/data-model.md) — schema
- [`docs/surfaces-and-flows.md`](docs/surfaces-and-flows.md) — IA & flows (**U-B** / **U-C** locked)
- [`docs/agent-interaction-model.md`](docs/agent-interaction-model.md) — agents & write policy (**U-D** co-design)
- [`docs/building-plan.md`](docs/building-plan.md) — build roadmap

**Where we are:** product + data model locked enough to build; Graph IA locked; agent model drafted (open Qs cleared, await lock); next is brand (**U-A**) then **capture + render**. Code is still a prototype scaffold.

## Stack

- **Next.js** (App Router) + TypeScript + Zod
- **Supabase / Postgres** for production (migrations in `supabase/migrations/`)
- **In-memory GraphRepository** for local dogfood without credentials

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):

1. **Seed dogfood graph**
2. Browse **Graph** / **Skills**
3. **Capture** a yap → diff-skim → merge
4. **Explore** (“Redis”, “startups”)
5. Propose a **Story** from an endeavor → stamp → **App question** draft

```bash
npm test
npm run build
```

## Supabase

1. Create a Supabase project
2. Copy `.env.example` → `.env.local` and fill keys
3. Apply `supabase/migrations/20260710120000_init_graph.sql` in the SQL editor (or `supabase db push`)
4. Swap `getGraphRepository()` to a Supabase-backed implementation when ready (interface is in `src/server/graph/types.ts`; local default remains in-memory)

## Layout

```
src/domain/           Zod schemas (code SoT for shapes)
src/server/graph/     GraphRepository + seed + embeddings
src/server/extract/   Capture → ExtractProposal
src/server/stories/   Story propose + app-question draft
src/app/              UI routes
supabase/migrations/  Postgres DDL + RLS
```
