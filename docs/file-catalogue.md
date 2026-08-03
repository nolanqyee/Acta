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
| `archive/*` | Superseded reasoning — do not implement | — | archive |

---

## App routes (`src/app/`)

| Path | Role | Unit | Status |
| --- | --- | --- | --- |
| `layout.tsx` | Root shell, fonts, tokens import, `data-mode="light"` | U1 | shipped |
| `page.tsx` | `/` — graph home | U3 | shipped |
| `(auth)/login/page.tsx` | Magic-link sign-in | U2 | shipped |
| `auth/callback/route.ts` | Supabase code exchange | U2 | shipped |
| `api/health/route.ts` | Health check | U1 | shipped |
| `api/meta/route.ts` | Build/meta probe | U1 | shipped |
| `api/graph/route.ts` | `GET` graph snapshot (RLS) | U3 | shipped |
| `lab/graph/page.tsx` | Physics workbench (404 prod) | U3 | lab |
| `lab/design/page.tsx` | Chrome mock on live graph (404 prod) | U-A | lab |
| `landing/page.tsx` | Waitlist marketing (404 prod) | U-A | lab |
| `settings/page.tsx` | Placeholder route name | U-E | placeholder |
| `generate/page.tsx` | Adapter picker placeholder | U6 | placeholder |
| `adapters/[kind]/page.tsx` | Adapter workspace placeholder | U-F | placeholder |

---

## Features (`src/features/`)

### Graph canvas — **core product surface**

| Path | Role | Status |
| --- | --- | --- |
| `graph/graph-canvas.tsx` | `<canvas>` + RAF loop + input | shipped |
| `graph/simulation.ts` | `d3-force`, one tick per frame | shipped |
| `graph/camera.ts` | Pan/zoom/fit, screen↔world | shipped |
| `graph/render.ts` | Edges, dots, captions, hover dim | shipped |
| `graph/seed.ts` | Deterministic starting positions | shipped |
| `graph/palette.ts` | Resolve `tokens.css` → canvas colours | shipped |
| `graph/tunables.ts` | Force defaults + slider ranges | shipped |
| `graph/types.ts` | Positioned node types | shipped |
| `graph/graph-view.tsx` | `/` loader + hover/selection wiring | shipped |
| `graph/node-detail.tsx` | Left detail panel | shipped |
| `graph/hover-card.tsx` | Cursor peek card | shipped |
| `graph/hover-card-placement.ts` | Flip card above/below cursor | shipped |
| `graph/node-visual.ts` | Node fill/stroke by state | shipped |
| `graph/format-endeavor.ts` | Shared field formatting | shipped |
| `graph/graph-lab.tsx` | `/lab/graph` workbench | lab |
| `graph/dev-hud.tsx` | Force sliders (lab only) | lab |
| `graph/lab-fixture.ts` | Synthetic graph generator | lab |
| `graph/*.module.css` | Layout for graph chrome (3 files) | shipped |

### Design lab — **U-A chrome mock**

| Path | Role | Status |
| --- | --- | --- |
| `design-lab/design-lab.tsx` | Full chrome overlay on graph | lab |
| `design-lab/design-lab.module.css` | ~740 lines Neubrutalism chrome | lab |

### Landing — **marketing / waitlist**

| Path | Role | Status |
| --- | --- | --- |
| `landing/landing-page.tsx` | Slide-scroll marketing page | lab |
| `landing/landing-scroll.ts` | Wheel/touch slide navigation | lab |
| `landing/landing-slide-enters.ts` | Per-slide enter animations | lab |
| `landing/use-landing-scroll.ts` | React hook for scroll | lab |
| `landing/hero-graph-canvas.tsx` | Hero live graph embed | lab |
| `landing/*.module.css` | ~1.5k lines marketing layout | lab |

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
| `tokens.css` | **Design tokens SoT** — Neubrutalism, light only | shipped |
| `base.css` | Global resets, scrollbars, `.acta-*` recipes | shipped |

### Why CSS modules instead of Tailwind (today)

- **Tailwind is not installed.** Styling is `tokens.css` (variables + utility recipes) + co-located `*.module.css` per feature.
- **~2.5k lines of CSS** live in modules (design-lab ~740, landing ~1.5k, graph ~200). Canvas colours are resolved at runtime via `palette.ts` because `<canvas>` cannot use `var()`.
- **Repo canon** ([`AGENTS.md`](../AGENTS.md)): `tokens.css` is the single token source of truth.

### Planned: Tailwind migration (separate effort — not started)

When we migrate, treat it as its own slice — not part of U4 capture:

1. Add Tailwind v4 + map `@theme` to existing `--*` tokens in `tokens.css` (keep tokens as SoT).
2. Migrate **new** surfaces first (U4 capture composer).
3. Port graph chrome modules incrementally; **do not** touch canvas `render.ts` token resolution until tokens stabilize.
4. Delete module CSS files only after each surface is verified on screen.

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
| `vitest.config.ts` | Test runner |

---

## Removed 2026-08-03 (cleanup)

| Path | Why removed |
| --- | --- |
| `.design-import/*` | Claude Design reference HTML — already ported to code |
| `scripts/fetch-claude-design.mjs` | Fetch script for above |
| `src/features/design-lab/systems.ts` | Unused design-system registry (single system hardcoded) |
| `src/features/theme/*` | Dark mode removed — light only |
| `playwright` devDependency | `shoot-graph.mjs` removed; no scripts used it |

---

## Changelog

- **2026-08-03:** Initial catalogue; cleanup of design-import, dead code, playwright; Tailwind migration noted as future work.
