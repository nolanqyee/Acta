# Acta — Graph-home mockup synthesis

Last updated: 2026-07-15

**Owns:** a single, plain-language picture of what Graph home is *supposed* to look and feel like — synthesized from founder sketch, verbal UI description, mock feedback, and locked IA/brand leans.

**Does not own:** formal IA contracts ([`surfaces-and-flows.md`](surfaces-and-flows.md)), token tables ([`brand-design-system.md`](brand-design-system.md)), or the living HTML experiment ([`brand-mockups.html`](brand-mockups.html)). Those stay sources of truth for their domains; this doc is the **vision brief** for when a mock (or later UI) is rebuilt.

Status: **working synthesis** — use this to judge mocks. Pen sketch may still refine.

---

## Why this exists

The HTML mock was a start, but iterating pixels without a crisp “supposed to” kept drifting (wrong mark, wrong icons, over-rounded chrome, filter semantics off). This file captures the intended product surface so the next mock can aim at *one* target.

Companions: [`surfaces-and-flows.md`](surfaces-and-flows.md) (what / where), [`brand-design-system.md`](brand-design-system.md) (tokens / mood), [`graph-physics.md`](graph-physics.md) (how the canvas simulation behaves), product Naming in [`personal-evidence-graph.md`](personal-evidence-graph.md).

---

## One-sentence vision

**A full-bleed Obsidian-like life graph fills the whole app; calm liquid-glass controls float on top; substance appears on hover and in a centered modal — not as cards glued to the canvas.**

---

## Feel (what “right” feels like)

| Want | Not |
| --- | --- |
| Living, minimal, fluid, personal, interactive | Enterprise dashboard, notification-center energy |
| Obsidian graph: nodes + subtle edges; content on hover | Heptabase: content cards always visible on the plane |
| Clean PKM / Notion–Linear *sleekness* for chrome | Map, library, stone, Latin-myth kitsch (name only) |
| Monochrome neutrals + one teal accent, scarce | Rainbow kind colors, coral brand, AI purple glow |
| Warm paper light · **neutral** graphite dark | Warm brown dark, cool/blue dark |
| Shared control language; no hairline panel borders | Inconsistent buttons, thin light borders everywhere |
| Medium rounding — soft, not stadium, not sharp boxes | Heavy pill chrome *or* cramped ~8px everything |
| Typical, readable icons (sun/moon, gear, inbox, +) | Clever custom glyphs that read wrong |
| Light-mode nodes mid warm gray | Black / near-black nodes on paper |

Personality locked elsewhere: **living · minimal · fluid · personal · interactive**.

---

## Spatial composition (Graph home)

Imagine one full viewport. The **graph is the background**. Nothing “frames” the graph outside it.

```
┌─────────────────────────────────────────────────────────────┐
│  [★ Acta]                              [Capture ⊕|🎤] [📥•] [☀︎] [👤 Name] │
│  [≡]  ← adapters (hover expand / click pin)                              │
│                                                                         │
│                         ·  ·   ·                                        │
│                      ·    GRAPH CANVAS    ·     ┌──────────────┐        │
│                         ·  (full-bleed)  ·      │ floating     │        │
│                      ·         ·    ·           │ right panel  │        │
│                                                 │ (diff/explore│        │
│                                                 │  when open)  │        │
│                                                 └──────────────┘        │
│                                                                         │
│              ┌──────────────────────────┐ [☰ filter] [⚙ settings]       │
│              │  liquid-glass ask bar    │                               │
│              └──────────────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

Rules of the layout:

1. **Canvas = entire app background.** All chrome overlays it.
2. **Bottom center:** ask bar (prompt-like, liquid-glass). Beside it: **filter button** + **graph settings (gear)** — not always-on chips.
3. **Top-left:** mark + wordmark; **hamburger under brand** → adapter menu → navigates away.
4. **Top-right (L→R):** Capture cluster (label + **inline + icon** + connected mic) → deepen (inbox-like + badge) → theme (sun/moon) → profile (avatar + name).
5. **Floating right panel** (diff-skim / Explore): under top-right controls, right-aligned — **not** a docked sidebar. When open, **graph center of gravity shifts left** so nodes stay visible.
6. **No visible hairline borders** between panels and canvas — separate by blur, soft elevated fill, shadow.

---

## Chrome inventory (intended behavior + look)

### Bottom — ask / filter / graph settings

| Control | Intent |
| --- | --- |
| **Ask bar** | Liquid-glass, familiar AI-chat prompt affordance. NL search (“what have I done related to Redis?”). Results → Explore floating panel + canvas highlight — not a separate Explore app. |
| **Filter button** | Three-line / filter icon. Opens a menu — **not** always-visible chips. |
| **Filters (semantics)** | Facet **values** that **slice endeavors**, not “turn entity types into canvas nodes.” Kind include/exclude; pick **specific** skills / people / orgs (e.g. skill=`Redis`, person=`Alex`, org=`Bubble`); searchable lists; active filters as **removable pills**. Same highlight language as NL. Canvas stays Endeavors-only. |
| **Graph settings** | **Gear** icon (not sun). Physics / forces, display, sizing — highly customizable; defaults calm and Obsidian-like. |

### Top-left — brand + adapters

| Control | Intent |
| --- | --- |
| **Mark** | **Mercedes three-pointed star without the outer circle** — three rays from center — then **rotate ~190°** so a tip sits at the bottom. Not an arrow, not a filled weird polygon, not a ringed badge. Stroke weight still open; direction is clear. Stylistic **A** is back burner. |
| **Wordmark** | **Acta** in **Charis SIL** (serif brand). |
| **Hamburger** | Under brand. **Hover:** menu open while pointer stays in expansion; leave → closes. **Click:** pins open until dismiss / navigate. Contents = **adapters**; choosing one **leaves Graph**. Controls must match the rest of the control language. |

### Top-right — capture, deepen, theme, account

| Control | Intent |
| --- | --- |
| **Capture** | Distinct CTA. Word **“Capture”** + **inline + icon** (not “Capture +” as plain text). **Connected mic** for eventual voice; type is MVP. Opens capture → extract → diff-skim. |
| **Deepen** | Inbox-like icon + **badge** count. Pull backlog of thin items — **not** a Today / notification center. Copy can stay “to deepen” / backlog even if icon reads inbox. |
| **Theme** | **Typical sun / moon** icons. Light + dark both first-class; default follows OS; toggle must actually flip theme. |
| **Profile** | Avatar + **name**; menu: profile, account, app settings, logout. |

### Floating right panel

Used for **diff-skim** and **Explore** (same family):

- Changelog / ranked hits at top; detail below.
- Diff-skim: pending endeavor nodes on canvas; hover pending for change detail; Confirm / Discard.
- Explore: dual highlight (panel + canvas); CoG left.
- Glass / elevated surface, **no hairline frame**; sits under top-right cluster.

---

## Graph canvas (what you see on the plane)

| Element | Intent |
| --- | --- |
| **Node set** | **Endeavors only.** Skills / people / orgs are data + filters + modals — **not** physics nodes. |
| **Look at rest** | Shared base node (calm dots); lean labels; **subtle** edges that **actually meet node centers**. |
| **Density** | Mock should feel like a **real filled graph**, not a sparse demo of 6 nodes. |
| **Physics** | Draggable; simulation **settles toward circular / radial balance** (Obsidian spirit); related nodes still cluster via edges. Tunable in graph settings. |
| **Hover** | Compact **kind-rich hover card** at cursor — **includes header image** + **title straddling image/body** (same idea as modal, smaller). Kind skin on node + card. Pending: distinct state; hover shows proposed change. |
| **Click** | Centered **node modal** (see below). |
| **Pending** | **Dashed outline + more transparent** (same neutral family, **not** teal/color-coded); optional soft pulse; animate in; clear on confirm. |
| **Highlight** | Ask / filter matches = **accent**. Shared language. Dim non-matches + selected-on-canvas deferred. |

**Rule of thumb:** structure on the plane, substance on hover / modal.

---

## Node modal & hover card

Shared visual idea:

1. **Header image** — AI from content *or* curated **kind presets** (implementation open; visual required).
2. **Title straddles** image and body (half on image, half on content) with **drop shadow** so it stays legible.
3. Body: kind, summary, timeframe, status, tags, relations, achievements, etc. (IA detail in surfaces doc).
4. Hover = peek; click = full centered modal. Escape closes; optional focus retained on node.

---

## Visual system (for mocks)

| Token | Lock |
| --- | --- |
| Light ground | Warm paper ≈ `#f5f0e4` / elevated ≈ `#fffdf8` |
| Dark ground | Neutral graphite ≈ `#141414` / elevated ≈ `#222222` — **not warm, not cool** |
| Accent | `#2aa77d` — Capture, focus ring, highlight, kind-hover (not Confirm) |
| Nodes | Light `#6b6560` · dark `#c8c8c8` — not black |
| Edges | Subtle (~12% text / ~9% white) |
| Type | **Charis SIL** headings · **Figtree** UI — **compact** scale; weights 400–700 |
| Glass | **Heavy liquid** — ask, controls, hover, modal, floating panel |
| Hover / modal | Glass + header image + straddling title; kind **card-first** |
| Floating panel | Full / heavy glass; CoG left; no border |
| Confirm / Discard | **Semantic** `#2f9e6a` / `#c4473a` (dark variants in tokens) |
| Empty | Quiet canvas + Capture CTA; no illustration |
| Icons | Lucide-style; gear / sun·moon / inbox / + |
| Radius | 10 / 12 / 14 |
| Space | 4–64px scale |
| Panel / modal | 320px panel · 520px modal max |
| Focus | Accent ring; hover/active washes |
| **Code** | [`styles/tokens.css`](../styles/tokens.css) |

Avoid AI-slop tells the founder already flagged: overbearing accents, vibe-coded paper that feels generic, inconsistent chrome, heavy rounding, “clever” marks that aren’t the parked star recipe.

---

## Mark (lock the recipe, not the final SVG)

**Recipe:** a **filled** three-point star (solid, concave sides, thin-ish arms — **not** three separate line rays), **no enclosing circle**, rotated **180°** so **one tip points down** (two tips up). Sourced from the founder's reference SVG.

Success test: at favicon size and at ~24px next to “Acta”, it should still read as that star — not an arrow, not a Mercedes badge-with-ring, not a decorative asterisk.

---

## Anti-patterns (from mock feedback — do not repeat)

1. Logo as arrow / filled wedge / anything that isn’t “Mercedes rays, no ring, tip down.”
2. Edges that miss nodes; edges too loud; graph too empty.
3. Inconsistent button/menu styling; thin light borders on glass chrome.
4. “Capture +” as text without an inline + icon.
5. Hover card without header image / broken title straddle.
6. Filters that only “show types” instead of **selecting specific facet values** to slice endeavors.
7. Theme control as a weird crescent circle; settings as a sun.
8. Stadium / over-pill rounding; then overcorrecting to harsh ~8px.
9. Broken theme toggle (icons or colors don’t flip).
10. Treating the mock as finished UI — it should capture vision, then solidify.

---

## Still open (don’t invent)

- Mark parked (wordmark-only); optical balance when unparked
- Dimmed / selected-on-canvas if dense graph needs them
- Motion feel (duration tokens exist; defer choreography to build)
- Full a11y contrast audit after chrome restyle
- Header image system (AI vs kind presets) — show *that there is one*
- Domain / trademark for Acta

---

## How to use this doc

1. **Before redrawing** `brand-mockups.html` (or Figma / real UI): re-read this + surfaces § Graph home + [`styles/tokens.css`](../styles/tokens.css).
2. **Judge a mock** against the anti-patterns list and the spatial diagram — not against the previous HTML’s accidents.
3. When vision changes, **edit this file** (and sync IA/brand docs if contracts or tokens change). Don’t leave the “supposed to” only in chat.

---

## Changelog

- **2026-07-15:** Pointed visual locks at code reference `styles/tokens.css` (spacing, semantic hex, panel/modal widths).
- **2026-07-15:** Synced visual locks from decision comparisons (glass family, semantic confirm, compact type, node hex, etc.).
- **2026-07-15:** Initial synthesis from founder UI description, pencil-sketch IA, mock critique rounds, and locked brand/IA leans.
