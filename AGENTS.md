# Acta — Repo Conventions (humans + coding agents)

This is the **single repo** for Acta — one **Next.js (App Router) app** plus planning docs:

```
docs/                 Planning SoT (product, data-model, surfaces, agents, brand, graph-physics, building-plan, tech plan)
src/app/              App Router: pages, root layout, and /api route handlers (the API)
src/lib/contracts/    Shared Zod schemas + types (import via @/lib/contracts)
src/features/         Graph canvas, capture composer + skim (client components)
src/server/           Server-only domain logic (GraphRepository, extract, merge) — guarded by `import "server-only"`
src/styles/tokens.css Design tokens — single source of truth (imported in the root layout)
```

Read [`docs/building-plan.md`](docs/building-plan.md) for the roadmap (units **U-A…U-J**) and
[`docs/technical-implementation-plan.md`](docs/technical-implementation-plan.md) for the HOW
(stack, milestones U1–U6). Companion specs live under `docs/`.

## Structure rules

- **One Next.js app, one deploy.** UI (client components) and the API (route handlers +
  server actions) live together at the repo root under `src/`. `docs/` stays at root.
- **The secret boundary is the server/client split, not a host.** Provider keys and the
  Supabase service role are used only in server code and env vars **without** a
  `NEXT_PUBLIC_` prefix; they must never be imported into a client component or committed.
  Server-only modules (`src/server/*`, `src/lib/supabase/server.ts`) must `import "server-only"`
  so an accidental client import fails the build.
- **Contracts are an internal module** (`src/lib/contracts`), imported via the `@/lib/contracts`
  alias by both client and server. They hold no secrets and are safe to import anywhere.
- **Design tokens** live only at `src/styles/tokens.css` (SoT), imported once in the root layout.
- **Long-running work** (bulk imports, embeddings backfill) must be kept off the request
  path — offload to Vercel Cron / a queue / a worker rather than blocking a route handler.

## Code documentation style (required)

All code must be readable top-to-bottom. A reader should understand exactly what a function
does from its doc comment alone, without reverse-engineering the body.

- **Every file** starts with a `@fileoverview` block: what the file is, its role in the
  system, and how it fits Acta (FE canvas, BE extract, contracts, etc.).
- **Every function / method / hook / component** gets a JSDoc block:
  - one-line plain-language summary (not a restatement of the signature)
  - `@param` for each parameter (what it is + meaningful constraints)
  - `@returns` what it produces (shape/status if non-obvious)
  - `@throws` when and why it can fail
- **Exported types / Zod schemas** get a JSDoc line explaining the concept they model.
- Explain **intent and non-obvious behavior**, not syntax. No narration comments inside
  bodies (e.g. `// increment counter`); body comments only for non-obvious intent,
  trade-offs, or constraints.

### Example

```typescript
/**
 * @fileoverview Extract agent — turns a Capture's raw text into a streamed
 * ExtractProposal (proposal-only writes; never mutates the live graph).
 */

/**
 * Streams structured endeavor previews for a capture and persists partials
 * so the proposal survives refresh / JWT expiry mid-stream.
 *
 * @param captureId - ID of the committed Capture to extract from.
 * @param userId - Auth subject; used for service-role scoped writes.
 * @returns Async iterator of SSE-shaped proposal patch events.
 * @throws {ExtractError} When the model returns empty output (status → failed/empty).
 */
export async function* streamExtract(captureId: string, userId: string) { /* ... */ }
```
