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
| [`docs/graph-canvas.md`](docs/graph-canvas.md) | The graph canvas — requirements + how we work on it |
| [`docs/building-plan.md`](docs/building-plan.md) | Build roadmap |
| [`docs/technical-implementation-plan.md`](docs/technical-implementation-plan.md) | **HOW** (**U-J** — locked) |
| [`docs/archive/`](docs/archive/) | Superseded design docs (visual system, physics doctrine, mocks) — reasoning kept, specifics not canon |

**Design tokens (source of truth):** [`src/styles/tokens.css`](src/styles/tokens.css)

**Where we are:** product, data model, Graph IA (**U-B/U-C**), agent model (**U-D**) and tech plan (**U-J**) hold up. **U-J U2 shipped** (Supabase Auth, migrations, RLS, session gate, rate limiting). **U3 is being rebuilt:** the first graph canvas was scrapped — the front end was specified in too much detail up front and built in one pass, and the physics ran inside a wrapper we couldn't control. The canvas is now being built on our own `d3-force` + `<canvas>` render loop, one verified slice at a time, starting with the physics engine alone. See [`docs/graph-canvas.md`](docs/graph-canvas.md).

## Getting started

**Prerequisites:** Node 22+ (`.nvmrc` pins it — run `nvm use`; `@supabase/supabase-js` requires the native `WebSocket` that lands in Node 22), and (for the local database) [Docker](https://docs.docker.com/get-docker/) + the [Supabase CLI](https://supabase.com/docs/guides/local-development).

```bash
npm install
cp .env.example .env.local     # then fill in (see below)

# Local database: start the Supabase Docker stack and apply migrations.
supabase start                 # prints local API URL + anon/service_role keys
supabase db reset              # applies supabase/migrations/* to the local DB

npm run dev                    # Next dev server (UI + /api/* on one origin)
npm run check                  # lint + typecheck + tests
```

Point `.env.local` at the **local** stack for development (`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` + the keys `supabase start` prints). The hosted `acta-dev` project is the deploy target: its migrations are applied by the Supabase GitHub integration on merge to `main`, and its keys live in the deploy platform's env (not `.env.local`).

**Magic-link sign-in locally:** no real email is sent — open the local mail inbox (the URL `supabase start` prints, usually `http://127.0.0.1:54324`), find the email, and click the link to land on `/auth/callback`.

**RLS isolation test (optional):** the DB-level isolation check auto-skips unless you pass the local creds:

```bash
SUPABASE_TEST_URL=http://127.0.0.1:54321 \
SUPABASE_TEST_ANON_KEY=<local anon> \
SUPABASE_TEST_SERVICE_ROLE_KEY=<local service_role> \
npm test
```

All changes land via PR (never push straight to `main`) — see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Layout

```
docs/                 Planning specs + HTML mock/decision tools
AGENTS.md             Repo conventions for humans + coding agents
CONTRIBUTING.md       Branch / commit / PR + Definition-of-Done workflow
src/app/              App Router: pages, root layout, and /api route handlers
src/lib/contracts/    Shared Zod schemas + types (import via @/lib/contracts)
src/features/         Graph canvas, capture composer + skim (client)
src/server/           Server-only domain logic (GraphRepository, extract, merge)
src/lib/supabase/     Supabase clients (browser anon+RLS / server user + service role)
src/proxy.ts          Next Proxy: Supabase session refresh + route gating
src/styles/tokens.css Design tokens — source of truth
supabase/             config.toml + migrations/ (graph schema, RLS, extract_proposals)
.cursor/              Agent rules (local; not committed)
```
