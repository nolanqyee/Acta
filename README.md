# Stilva

Personal evidence graph — capture life material, structure it into endeavors + edges, explore in natural language, draft grounded artifacts.

## Specs

- [`personal-evidence-graph.md`](personal-evidence-graph.md) — product
- [`data-model.md`](data-model.md) — schema

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
