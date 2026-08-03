# Acta — File catalogue

Last updated: 2026-08-03

**Purpose:** A single inventory of what lives in the repo, what each area does, and what's safe to delete. Update this when files move or slices ship — companion to [`building-plan.md`](building-plan.md) (roadmap) and [`design-handoff.md`](design-handoff.md) (pixels on screen).

**Counts (approx.):** ~80 files under `src/`, ~25 under `docs/`, ~115 total tracked (excluding `node_modules`).

---

## How to read this

| Column | Meaning |
| --- | --- |
| **Role** | Why the file/folder exists |
| **Unit** | Building-plan or U-J milestone it serves |
| **Status** | `shipped` · `lab` · `placeholder` · `planning` · `infra` · `candidate-delete` |

---

## Planning docs (`docs/`)

| Path | Role | Unit | Status |
| --- | --- | --- | --- |
| `personal-evidence-graph.md` | Product vision, wedge, scope | — | planning |
| `data-model.md` | Schema, entities, extract contracts | U-E | planning |
| `surfaces-and-flows.md` | IA + interaction flows (contract) | U-B/C | planning |
| `agent-interaction-model.md` | Confirm vs auto, write policy | U-D | planning |
| `graph-canvas.md` | Live canvas spec (check on screen) | U3 | planning |
| `design-handoff.md` | Pixels on screen today | U-A | planning |
| `building-plan.md` | Roadmap U-A…U-J | — | planning |
| `technical-implementation-plan.md` | HOW, milestones U1–U6 | U-J | planning |
| **`file-catalogue.md`** | **This inventory** | — | planning |

---

## App routes (`src/app/`)

| Path | Role | Unit | Status |
| --- | --- | --- | --- |
| `layout.tsx` | Root shell, fonts, tokens import, `data-mode="light"` | U1 | shipped |
| `page.tsx` | `/` — public waitlist landing | U-A | shipped |
| `home/page.tsx` | `/home` — graph app (auth required) | U3 | shipped |
| `(auth)/login/page.tsx` | Magic-link sign-in | U2 | shipped |
| `auth/callback/route.ts` | Supabase code exchange | U2 | shipped |
| `api/health/route.ts` | Health check | U1 | shipped |
| `api/meta/route.ts` | Build/meta probe | U1 | shipped |
| `api/graph/route.ts` | `GET` graph snapshot (RLS) | U3 | shipped |
| `lab/graph/page.tsx` | Physics workbench (404 prod) | U3 | lab |
| `settings/page.tsx` | Placeholder route name | U-E | placeholder |
| `generate/page.tsx` | Adapter picker placeholder | U6 | placeholder |
| `adapters/[kind]/page.tsx` | Adapter workspace placeholder | U-F | placeholder |

---

## Features (`src/features/`)

### Graph canvas — **core product surface**

Import boundary: **`engine/`** must not import **`surfaces/`** or **`lab/`**. Surfaces and lab import engine only.

| Path | Role | Status |
| --- | --- | --- |
| **Engine** | | |
| `graph/engine/graph-canvas.tsx` | `<canvas>` + RAF loop + input | shipped |
| `graph/engine/simulation.ts` | `d3-force`, one tick per frame | shipped |
| `graph/engine/camera.ts` | Pan/zoom/fit, screen↔world | shipped |
| `graph/engine/render.ts` | Edges, dots, captions, hover dim | shipped |
| `graph/engine/seed.ts` | Deterministic starting positions | shipped |
| `graph/engine/palette.ts` | Resolve `tokens.css` → canvas colours | shipped |
| `graph/engine/tunables.ts` | Force defaults + slider ranges | shipped |
| `graph/engine/types.ts` | Positioned node types | shipped |
| `graph/engine/node-visual.ts` | Node fill/stroke by state | shipped |
| **Surfaces** | | |
| `graph/surfaces/graph-home.tsx` | `/home` — full Neubrutalism chrome + API fetch | shipped |
| `graph/surfaces/hover-card-placement.ts` | Flip hover peek above/below cursor | shipped |
| `graph/surfaces/format-endeavor.ts` | Shared field formatting | shipped |
| **Lab** | | |
| `graph/lab/graph-lab.tsx` | `/lab/graph` workbench | lab |
| `graph/lab/dev-hud.tsx` | Force sliders (lab only) | lab |
| `graph/lab/lab-fixture.ts` | Synthetic graph generator | lab |

### Landing — **marketing / waitlist**

| Path | Role | Status |
| --- | --- | --- |
| `landing/landing-page.tsx` | Slide-scroll marketing page (public `/`) | shipped |
| `landing/landing-scroll.ts` | Wheel/touch slide navigation | lab |
| `landing/landing-slide-enters.ts` | Per-slide enter animations | lab |
| `landing/use-landing-scroll.ts` | React hook for scroll | lab |
| `landing/hero-graph-canvas.tsx` | Hero live graph embed | shipped |

### Motion — **shared animation**

| Path | Role | Status |
| --- | --- | --- |
| `motion/enter.ts` | anime.js panel/card enters | shipped |
| `motion/use-reduced-motion.ts` | `prefers-reduced-motion` hook | shipped |

### Capture — **not built yet**

| Path | Role | Status |
| --- | --- | --- |
| *(none)* | U4: composer + diff-skim | planned |

---

## Server (`src/server/`)

| Path | Role | Unit | Status |
| --- | --- | --- | --- |
| `graph/graph-repository.ts` | RLS-scoped graph reads | U3 | shipped |
| `graph/project-graph.ts` | DB rows → `GraphSnapshot` | U3 | shipped |
| `rate-limit.ts` | In-process rate limiter | U2 | shipped |
| `rls.integration.test.ts` | DB isolation (skips without env) | U2 | shipped |

---

## Shared lib (`src/lib/`)

| Path | Role | Status |
| --- | --- | --- |
| `contracts/*` | Zod schemas (client + server safe) | shipped |
| `supabase/*` | Browser/server clients, auth paths | shipped |
| `graph/sample-graph.ts` | Hand-authored fixture | shipped |
| `graph/hero-graph.ts` | Landing hero fixture | lab |
| `graph/derive-endeavor-links.ts` | Facet → endeavor link rule | shipped |
| `use-media-query.ts` | Media query hook (reduced motion) | shipped |

---

## Components (`src/components/`)

| Path | Role | Status |
| --- | --- | --- |
| `placeholder-surface.tsx` | Stub for settings/generate/adapters routes | placeholder |

---

## Styles (`src/styles/`)

| Path | Role | Status |
| --- | --- | --- |
| `tokens.css` | **SoT:** CSS variables + global `.acta-*` recipe classes | shipped |
| `tailwind.css` | Tailwind v4 `@theme inline` → token vars; layout utilities | shipped |
| `base.css` | Document reset, scrollbars, reduced-motion | shipped |

### Styling model (enforced 2026-08-03)

**No `*.module.css` files.** Three layers:

1. **`tokens.css`** — brand chrome recipes (`.acta-panel`, `.acta-control`, …) and occasional surface recipes when descendant selectors are required (e.g. `.acta-landing-*` slide shell).
2. **`tailwind.css`** — layout, spacing, responsive, positioning via utilities (`flex`, `grid`, `p-acta-4`, `max-[900px]:…`).
3. **JSX** — compose `.acta-*` + Tailwind `className` strings.

**Canvas exception:** `palette.ts` reads `--*` vars for `<canvas>` — CSS classes do not apply inside the canvas.

**Dependencies:** `tailwindcss`, `@tailwindcss/postcss` (see `postcss.config.mjs`). Import order in `layout.tsx`: `tokens.css` → `base.css` → `tailwind.css`.

---

## Tests (`src/test/` + co-located `*.test.ts`)

| Path | Guards |
| --- | --- |
| `test/graph/layout-shape.test.ts` | Real simulation: roundness, locality, shimmer |
| `test/graph/camera.test.ts` | Screen↔world inverse |
| `test/graph/node-visual.test.ts` | Node paint states |
| `test/graph/hover-card-placement.test.ts` | Card flip logic |
| `lib/contracts/schemas.test.ts` | Zod contracts |
| `server/graph/project-graph.test.ts` | Graph projection |
| `server/rate-limit.test.ts` | Rate limiter |
| `app/api/*/route.test.ts` | Health/meta routes |

---

## Infra

| Path | Role |
| --- | --- |
| `supabase/migrations/*` | Postgres schema + RLS |
| `supabase/config.toml` | Local Supabase stack |
| `.github/workflows/ci.yml` | CI: check on PR |
| `proxy.ts` | Session gate + dev `/lab/*` allowance |
| `next.config.ts` | Next config (devIndicators off) |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `vitest.config.ts` | Test runner |

---

## Removed 2026-08-03 (cleanup + styling migration)

| Path | Why removed |
| --- | --- |
| `.design-import/*` | Claude Design reference HTML — already ported to code |
| `app/landing/page.tsx` | Legacy `/landing` redirect — removed (no traffic yet) |
| `docs/archive/*` | Superseded liquid-glass + pre-build physics/mocks — lessons in `graph-canvas.md` + `design-handoff.md` |
| `scripts/fetch-claude-design.mjs` | Fetch script for above |
| `src/features/design-lab/*` | Superseded — chrome lives in `graph/surfaces/graph-home.tsx` |
| `graph/graph-view.tsx`, `hover-card.tsx`, `node-detail.tsx` | Merged into `graph-home.tsx` |
| `src/features/design-lab/systems.ts` | Unused design-system registry |
| `src/features/theme/*` | Dark mode removed — light only |
| `playwright` devDependency | No scripts used it |
| **All `*.module.css`** | Replaced by `tokens.css` + `.acta-*` + Tailwind v4 |

---

## Changelog

- **2026-08-03:** Canon doc sync (PR 8): `design-handoff.md`, `file-catalogue.md`, route map (`/` landing, `/home` graph). Split `features/graph/` into `engine/`, `surfaces/`, `lab/`.

- **2026-08-03:** Graph app at `/home`; public waitlist at `/`. Tailwind v4 + `.acta-*`; deleted `graph-view.tsx`, `hover-card.tsx`, `node-detail.tsx`.

- **2026-08-03:** Tailwind v4 added; all `*.module.css` removed. Styling = `tokens.css` + `.acta-*` + Tailwind layout utilities.

- **2026-08-03:** Initial catalogue; cleanup of design-import, dead code, playwright.
