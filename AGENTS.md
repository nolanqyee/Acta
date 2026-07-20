# Acta — Repo Conventions (humans + coding agents)

This is the **single repo** for Acta. It holds planning docs and (soon) code:

```
docs/            Planning SoT (product, data-model, surfaces, agents, brand, graph-physics, building-plan, tech plan)
acta-contracts/  @acta/contracts — shared Zod schemas + types
acta-web/        Vite React SPA — Graph canvas + chrome; design tokens SoT at acta-web/src/styles/tokens.css
acta-api/        Hono API — capture/extract/graph + Supabase (all secrets)
```

Read [`docs/building-plan.md`](docs/building-plan.md) for the roadmap (units **U-A…U-J**) and
[`docs/technical-implementation-plan.md`](docs/technical-implementation-plan.md) for the HOW
(stack, milestones U1–U6). Companion specs live under `docs/`.

## Structure rules

- **One repo, workspace subfolders.** `acta-web`, `acta-api`, `acta-contracts` are npm/pnpm
  workspaces under a root `package.json`. `docs/` and `styles/` stay at root.
- **FE/BE deploy separately.** Even though they share a repo, `acta-web` and `acta-api` are
  independent deploy targets. **Secrets (Supabase service role, LLM keys) live only in the
  backend deploy env** and must never be bundled into the FE build or committed.
- `@acta/contracts` is resolved via workspaces (no registry publish while in-repo).
- **Design tokens** live only at `acta-web/src/styles/tokens.css` (SoT). There is no
  repo-root `styles/` folder.

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
