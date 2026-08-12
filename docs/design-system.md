# Acta — Design system

Last updated: 2026-08-12

**Purpose:** Human-readable guide to Acta's visual language. **Values and recipes live in code**; this doc explains how to use them and records decisions that are not obvious from token names alone.

**Not for:** product IA, surface flows, canvas physics, or "what is wired today." See companion docs at the bottom.

---

## Source of truth

| Layer | SoT | Role |
| --- | --- | --- |
| **Token values + `.acta-*` recipes** | [`src/styles/tokens.css`](../src/styles/tokens.css) | Colors, type scale, spacing, radii, shadows, control sizes, recipe classes. **Edit here first.** |
| **Layout utilities** | [`src/styles/tailwind.css`](../src/styles/tailwind.css) | Tailwind v4 `@theme inline` maps utilities to `--*` tokens (`bg-canvas`, `p-acta-4`, …). Grid, flex, positioning only. |
| **Global base** | [`src/styles/base.css`](../src/styles/base.css) | Scrollbars, resets shared across surfaces. |
| **Canvas draw colors** | `src/features/graph/engine/palette.ts` | Reads CSS variables for `<canvas>`; do not hardcode hex in engine code. |
| **This doc** | `docs/design-system.md` | Rationale, usage rules, open questions. **Never duplicate token tables here** — link to `tokens.css`. |

**Import rule:** `tokens.css` is imported once in the root layout. Do not add `*.module.css`. Compose UI with `.acta-*` recipes + Tailwind layout utilities.

**Cascade rule:** Chrome colors belong in `.acta-*` recipes, not Tailwind utilities on recipe elements. Unlayered rules in `tokens.css` win over `@layer utilities`, so `bg-accent` on an `.acta-control` will not override the recipe. Add a recipe variant (e.g. `.acta-button-accent`, `.acta-chip-accent`) instead.

---

## Direction

**Neubrutalism:** warm paper surfaces, **3px ink** borders, **offset shadows** (8px panels / 3px controls), opaque chrome. **Light mode only** for now (dark deferred).

| Use | Token / pattern |
| --- | --- |
| Settled / primary actions | `--brand-primary` (`#6fb3e8`) |
| Pending / unresolved | `--brand-secondary` (`#ff2861`) |
| Surfaces (back → front) | `--bg-paper` → `--bg-panel` → `--bg-card` |
| Ink | `--ink` (`#10120f`) |

**Avoid:** liquid glass, backdrop blur, or translucent text panels over a **moving** graph. Text over live canvas content sits on opaque surfaces (**R7** in [`surfaces-and-flows.md`](surfaces-and-flows.md)).

**Superseded:** pre-2026-07-26 teal + liquid-glass direction. Do not resurrect.

**Personality:** living · minimal · fluid · personal · interactive.

---

## Typography

Loaded via `next/font` into `--font-*-loaded`; fallbacks in `tokens.css`.

| Role | Font | Token ladder |
| --- | --- | --- |
| Display / headings | Charis SIL | `--text-title` … `--text-display`, `--text-hero` (marketing) |
| UI / body | Figtree | `--text-body` (13), `--text-lede` (15), `--text-subhead` (20) |
| Labels / meta | Space Mono | `--text-label` (10, caps via `.acta-label`) |

Buttons use `.acta-button` (bold Figtree, `--text-button`, tracked).

---

## Spacing & radius

Spacing: `--space-1` (4px) through `--space-8` (64px). Page margin: `--space-7` (56px).

| Element | Token |
| --- | --- |
| Panels | `--radius-panel-brutal` (18px) |
| Rows / soft corners | `--radius-row` (12px) |
| Pills / controls | `--radius-pill` |

---

## Elevation

| Recipe | Border | Shadow |
| --- | --- | --- |
| `.acta-panel` | `--border-ink` (3px) | `--shadow-panel` (8px offset) |
| `.acta-control`, buttons | `--border-ink` (3px) | `--shadow-control` (3px offset) |
| `.acta-row` | `--border-ink-soft` (2px) | `--shadow-row` (3px offset) |
| `.acta-chip` | `--border-ink-soft` (2px) | none |

**Press feedback:** active state translates `(1px, 1px)` and reduces shadow to `2px 2px 0 var(--ink)`.

**Panel dismiss:** `.acta-panel-close` — bare **×**, always top-right. First content row needs `padding-right: var(--panel-close-gutter)`.

---

## Control heights

Two tiers, both defined in `tokens.css`:

| Tier | Token | Height | Use |
| --- | --- | --- | --- |
| Compact | `--ctl-size-brutal` | 38px | Top chrome: hamburger, Capture, Deepen, Profile |
| Ask row | `--ask-height-brutal` | 48px | Ask bar and inline peers: Explore, Filter, Settings |

**Rule:** same row, same height. Different rows may differ when the control's job differs (compact ambient chrome vs primary query strip).

**Layout rule:** toggled controls must not change width (e.g. Explore label stays "Explore").

---

## Recipe inventory

All defined in `tokens.css`. Common compositions:

| Class | Use |
| --- | --- |
| `.acta-panel` | Floating panels (detail, Explore, adapter menu) |
| `.acta-control` | Ask bar shell, filter/explore pills, icon buttons |
| `.acta-button` | Label typography on pressable controls |
| `.acta-button-accent` | Primary filled CTA (Capture); height `--ctl-size-brutal` |
| `.acta-button-accent-lg` | Taller accent variant (`--ask-height-brutal`) |
| `.acta-button-secondary` | Outline pill on card fill |
| `.acta-button-waitlist` | Landing footer CTA (cream border, paper shadow) |
| `.acta-chip` / `.acta-chip-accent` | Facet tags, selected states |
| `.acta-row` | Diff / deepen list rows inside panels |
| `.acta-label` | Space Mono section labels |
| `.acta-peek` | Hover card (elevated, no ink border) |
| `.acta-focus-ring` | Focus-visible outline |
| `.acta-landing-*` | Landing slide-scroll structural shell |

Landing-specific layout lives under `.acta-landing-*` in `tokens.css`; slide content uses `.acta-*` + Tailwind in JSX.

---

## Icons

**Interim:** [Lucide](https://lucide.dev/) via `lucide-react` on graph chrome (Menu, Plus, Inbox, Filter, Settings, ArrowUp).

**Open:** evaluate a custom icon set or a library that matches Acta branding. Lucide is a stand-in, not the final system.

Icon buttons at compact tier: ~16px glyph. Ask-row tier: ~18px.

---

## Motion

| Surface | Module | Notes |
| --- | --- | --- |
| Graph enter / hover card | `src/features/motion/enter.ts` | Respect `prefers-reduced-motion` |
| Landing slides | `src/features/landing/landing-slide-enters.ts` | Per-slide `data-enter` recipes |

Duration tokens: `--duration-fast` (120ms), `--duration` (200ms), `--duration-slow` (320ms). Easing: `--ease-out`.

---

## Engineering constraints

- **`backdrop-filter`:** when both prefixed and unprefixed are needed, write `-webkit-backdrop-filter` **first**, `backdrop-filter` **last** (Lightning CSS keeps the first declaration).
- **No CSS modules.** Tokens + recipes + Tailwind only.
- **Graph canvas:** engine must not import surfaces or lab. Dev tuning at `/lab/graph` (404 in production).
- **Build slices:** verify on screen before stacking chrome; do not specify exhaustive visuals ahead of a working slice.

---

## Open questions

- Custom icon library vs retained Lucide subset
- Logo mark (wordmark-only for now)
- Dark mode palette (deferred until light system is settled)
- Landing slide motion polish (structure in place)

---

## Companion docs

| Need | Doc |
| --- | --- |
| IA, chrome placement, flows | [`surfaces-and-flows.md`](surfaces-and-flows.md) |
| Canvas physics, hover, selection | [`graph-canvas.md`](graph-canvas.md) |
| What ships where in code | [`file-catalogue.md`](file-catalogue.md) |
| Product vision | [`personal-evidence-graph.md`](personal-evidence-graph.md) |
| Roadmap (U-A visual = this system) | [`building-plan.md`](building-plan.md) |

---

## Changelog

- **2026-08-12:** Renamed from `design-handoff.md`. Stripped IA, flows, canvas behavior, and build status. Declared `tokens.css` as SoT; this file is the guide only.
- **2026-08-11:** Two-tier control heights; Lucide interim icons.
- **2026-08-03:** Light mode only; Neubrutalism replaces liquid glass.
- **2026-07-31:** Initial Neubrutalism token import from Claude Design.
