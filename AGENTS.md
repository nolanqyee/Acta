# Acta — Repo Conventions (humans + coding agents)

This is the **single repo** for Acta — one **Next.js (App Router) app** plus planning docs:

```
docs/                 Planning SoT (product, data-model, surfaces, agents, graph-canvas, building-plan, tech plan, design-handoff)
docs/archive/         Superseded design docs — reasoning worth reading, specifics not canon
src/app/              App Router: pages, root layout, and /api route handlers (the API)
src/lib/contracts/    Shared Zod schemas + types (import via @/lib/contracts)
src/features/         Graph canvas, design lab, landing, capture composer + skim (client components)
src/server/           Server-only domain logic (GraphRepository, extract, merge) — guarded by `import "server-only"`
src/styles/tokens.css Design tokens — single source of truth (imported in the root layout)
```

Read [`docs/building-plan.md`](docs/building-plan.md) for the roadmap (units **U-A…U-J**) and
[`docs/technical-implementation-plan.md`](docs/technical-implementation-plan.md) for the HOW
(stack, milestones U1–U6). Companion specs live under `docs/`. For how to *land*
changes (branches, commits, PRs, Definition of Done), see [`CONTRIBUTING.md`](CONTRIBUTING.md) —
**all changes go through a branch + PR; never push to `main`.**

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
- **Design tokens** live only at `src/styles/tokens.css` (SoT), imported once in the root layout. Current visual direction is **Neubrutalism** (opaque surfaces, ink borders) — see [`docs/design-handoff.md`](docs/design-handoff.md). Do not implement from archived liquid-glass specs.
- **Dev-only surfaces** (`/lab/graph`, `/lab/design`, `/landing`) return 404 in production; use them to iterate chrome and marketing before promoting to `/`.
- **Long-running work** (bulk imports, embeddings backfill) must be kept off the request
 path — offload to Vercel Cron / a queue / a worker rather than blocking a route handler.
- **`backdrop-filter` must be written last.** When a rule declares both
 `-webkit-backdrop-filter` and `backdrop-filter`, Lightning CSS (Next's CSS pipeline)
 collapses them into a single declaration and keeps whichever comes **first**. Chrome 150
 removed support for `-webkit-backdrop-filter`, so writing the unprefixed property first
 silently ships a build with no blur at all. Always put the `-webkit-` copy first and the
 unprefixed copy last, with identical values. Browserslist targets do not change this.

## Front-end working agreement (added 2026-07-26)

The first graph canvas was scrapped, and the lesson is recorded here so it isn't
repeated: it was specified exhaustively before anything rendered, built in a single
pass (canvas + chrome + cards + modal + panels + theming at once), and verified with
headless assertions instead of by looking at it.

- **Build one slice at a time and look at it** before starting the next. A slice is
  small enough to judge from a screenshot.
- **Do not specify visuals in advance of building them.** Write the requirement in
  terms you can check on screen; let the doc follow the working screen, not lead it.
- **Own the loop for anything interactive.** Wrappers that hide the animation loop,
  input handling, or transforms make the important qualities untunable.
- **Numbers are a regression guard, never the verdict.** A layout test that passes
  while the screen looks wrong is worse than no test.
- **No translucent surfaces over live content** until the basics read well; text over
  a moving graph must sit on an opaque surface.
- **A test that guards the property you designed for is not verification.** Locality
  freezing passed its own locality test while the near field visibly buzzed. Check the
  thing the founder reported, on screen, not the thing you built.

## Delegating implementation (added 2026-07-26)

**Once a plan is settled to implementation-level detail, hand the implementation to a
Sonnet subagent rather than doing it on Opus.** This is a cost rule, and it is not
optional when the condition is met.

- Opus keeps the parts that need judgement: diagnosis, design, the plan, reviewing the
  diff, and **looking at the result on screen**. Sonnet writes the code.
- "Implementation-level detail" means the brief names the files, the functions to add
  or delete, the constants and their starting values, and how to verify. If it doesn't,
  the plan isn't settled yet — finish it, then delegate.
- Give the subagent this file and the doc for the surface it's touching. Docs are the
  memory system (see `docs/`); Opus owns updating them after verifying, so the subagent
  should be told not to.
- Exploratory work, debugging without a hypothesis, and anything where the next step
  depends on what the screen looks like stay on Opus.

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
