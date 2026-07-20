# Contributing

Acta is currently a **solo project built heavily with coding agents**. There's no
team yet — but the workflow below is deliberately standardized so that every
change (whether written by a human or an agent) is small, reviewable, and lands
the same way. Treat these as rules, not suggestions; they're what keeps `main`
releasable and the history readable.

The short version: **work on a branch, land via PR, keep changes scoped, and
never push straight to `main`.**

## Branches

- Branch off the latest `main`. Long-lived branches drift fast — keep them short.
- Name branches `<type>/<short-slug>` — e.g. `feat/supabase-auth`,
  `fix/extract-empty-title`, `chore/eslint-baseline`, `docs/route-map`.
  (If a ticket tracker is added later, prefer `<TICKET>/<slug>`.)
- **Don't push directly to `main`.** `main` is protected; all changes land via PR.
- One concern per branch. A unit of work (a `U-J` unit, a fix, a doc update) is a
  branch — not "everything I did today."

## Commits

Use **Conventional Commits**. (Early history predates this; we standardize from
here.)

```
<type>(<scope>): <imperative summary>

<optional body — what + why, not how>
```

Acta-relevant examples:

```
feat(auth): add Supabase cookie session middleware
fix(contracts): reject empty endeavor title in ExtractProposal
chore(deps): pin typescript to 5.x for eslint compatibility
docs(u-j): reverse FE stack to Next.js (KTD2)
```

- Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`.
- Common scopes: `contracts`, `api`, `graph`, `capture`, `auth`, `deps`, a
  `U-J` unit (`u1`, `u2`, …), or `docs`.
- Keep the subject under ~72 characters. The body is for the **why** — a future
  reader (or git blame) shouldn't have to reconstruct the reason a line changed.

## Definition of Done (every change)

A change isn't done until all of these hold — this mirrors
[`docs/technical-implementation-plan.md`](docs/technical-implementation-plan.md)
§ Definition of Done and [`AGENTS.md`](AGENTS.md):

- **JSDoc doc-comments** on all new/changed code — every file has a
  `@fileoverview`; every function/component/hook has a JSDoc block (summary,
  `@param`, `@returns`, `@throws`); exported types/Zod schemas get a concept
  line. Explain intent, not syntax; no narration comments in bodies.
- **Tests for behavior-bearing code** — new behavior gets new tests, changed
  behavior gets updated tests. Pure config/styling is exempt.
- **`npm run check` is clean** (lint + typecheck + tests) **and `npm run build`
  succeeds**.
- **No secrets in the client bundle** — service-role / LLM keys never under
  `NEXT_PUBLIC_*` or in any client-imported module (see Secrets below).
- **Docs kept in sync** — if a decision changes (stack, schema, scope, a KTD),
  update the relevant `docs/` file **and its changelog in the same PR**. The
  canonical docs under `docs/` are the source of truth, not chat.

## Pull requests

- Open a PR against `main`; keep it scoped to one concern.
- There's no PR template yet, so include in the description:
  - **Summary** — what changed and why.
  - **Test plan** — how you verified it (commands run, what you checked).
  - **Risk + rollout** — anything that could break, migrations involved, how to
    back out.
  - Link any related doc/unit (e.g. "implements U-J U2").
- **Squash-merge by default.** The PR title becomes the squashed commit subject,
  so make it a clean Conventional Commit line.
- **Review before merge.** Solo doesn't mean unreviewed — self-review the diff,
  and for anything nontrivial run an agent review pass (e.g. the `bugbot` /
  `security-review` subagents) before merging.

## CI

Not configured yet. **Until a GitHub Action exists, run `npm run check &&
npm run build` locally before merging any PR.** (First `ci` PR should add a
workflow that runs exactly that on every PR — then "wait for CI green" becomes
the gate.)

## Running it locally

See [`README.md`](README.md) → **Getting started** (`npm install`, `npm run dev`,
`npm run check`).

## Secrets and environment variables

- **Never commit `.env.local`** (or any real env file). Only
  [`.env.example`](.env.example) is committed and is the canonical list.
- The secret boundary is the **server/client split**, not a host: anything the
  browser needs is prefixed `NEXT_PUBLIC_`; everything else (Supabase service
  role, LLM keys) is server-only and must never get that prefix.
- Server-only modules (`src/server/*`, `src/lib/supabase/server.ts`) should
  `import "server-only"` so an accidental client import fails the build.

## Migrations (from U2 onward)

Supabase migrations live in `supabase/migrations/`. Once they exist:

- **Additive-only by default** — new nullable columns, indexes, new tables.
- **Destructive changes** (`DROP`, adding `NOT NULL` to existing data) need a
  two-step plan: ship a migration that tolerates both shapes, deploy the new
  code, then follow up with the destructive step.
- **Apply locally before pushing** (against a local/branch Supabase project);
  never let a migration first run in production.

## For coding agents

- **Read first:** [`AGENTS.md`](AGENTS.md) for conventions and the doc-comment
  rule, plus the relevant `docs/` spec for whatever you're touching.
- **One unit / one concern per branch + PR.** After finishing a `U-J` unit, stop
  and surface it for review rather than rolling into the next unit.
- **Meet the Definition of Done above** before opening the PR, and update
  `docs/` + changelog in the same PR when a decision changes.
- **Never push to `main`.** Always go through a branch + PR.
