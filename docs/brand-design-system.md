# Acta — Brand & Design System

Last updated: 2026-07-14

**Owns:** brand foundation + UI visual system for building-plan **U-A** — name lore, personality, tokens (color/type/space/motion), composition principles, graph-chrome language, do/don’t. Enough that Graph home (and later surfaces) share one look without inventing a new aesthetic per screen.

**Does not own:** IA/flows ([`surfaces-and-flows.md`](surfaces-and-flows.md)), agent write policy ([`agent-interaction-model.md`](agent-interaction-model.md)), full in-product copy ([`building-plan.md`](building-plan.md) **U-I**), adapter editor polish (**U-F**), rich provenance chrome (**U-G**), empty-state copy polish (**U-H**).

Companions: [`personal-evidence-graph.md`](personal-evidence-graph.md) (product + Naming), [`surfaces-and-flows.md`](surfaces-and-flows.md) (what to style), [`building-plan.md`](building-plan.md) (**U-A**).

Status: **scaffold** — name locked; visual sections open. Fill collaboratively; lock section-by-section.

---

## Exit criteria (from U-A)

- [x] Working brand name (+ pronunciation **AK-tuh**; tagline deferred)
- [x] Personality / mood locked (paragraph + adjectives + theme + kind-hover pattern)
- [ ] Color tokens (CSS variables) + usage rules
- [ ] Type stack + scale
- [ ] Spacing / radius / elevation primitives
- [ ] Motion principles (2–3 intentional patterns; not decoration spam)
- [ ] Graph-home visual language (canvas, nodes, pending, sidebars, hover cards)
- [ ] Do / don’t list
- [ ] Dogfood UI can be restyled to match without redesigning IA

---

## Suggested fill order

1. Personality / mood (drives everything else)
2. Color + type (highest leverage tokens)
3. Composition + graph chrome (product-specific)
4. Motion + states
5. Logo / wordmark (can trail if mark is just wordmark-first)
6. Token implementation map → hand off to code / **U-J**

Ask one decision cluster at a time; prefer locking over speculative completeness.

---

## 1. Name & verbal brand

| Item | Status | Decision |
| --- | --- | --- |
| Working name | **Locked** | **Acta** |
| Etymology / lore | **Locked** | Latin *acta* — deeds / acts / the record of what was done |
| Internal category | **Locked** | personal evidence graph |
| Conversational test | **Locked** | “update my Acta” / “look at my Acta” |
| Domain / trademark | **Open** | Naked `acta.*` crowded; qualifier TBD. Not legal clearance. |
| Tagline | **Deferred** | Audience-specific; expect to change often — not a U-A lock |
| Name pronunciation | **Locked** | **AK-tuh** |
| Superseded names | History | Stilva, Stiva; finalists Atlas / Stele / Ariadne — see product Naming |

**Open**

- [x] Pronunciation — **AK-tuh**
- [ ] Tagline — deferred (per-audience; iterate later)

---

## 2. Personality & mood

*What Acta should feel like in the room — before pixels.*

| Item | Status | Notes |
| --- | --- | --- |
| Center of gravity | **Locked (draft)** | **Living canvas** — graph is the hero; interactive physics; clean/sleek chrome |
| Core adjectives (3–5) | **Locked** | **living · minimal · fluid · personal · interactive** |
| One-paragraph personality | **Draft** | See below |
| Reference brands (like / unlike) | **Locked** | **Graph = Obsidian-class** (nodes + edges; content on hover). **Not Heptabase-class** (visible cards on the canvas). Chrome sleekness may still nod at Notion/Linear — canvas itself does not. |
| Light / dark | **Locked** | **Both required** (first-class). Default = **system / OS**. User override TBD (settings later OK). |
| Myth / Latin in visuals | **Locked** | **Name only** — no stone tablets, titans, Roman kitsch in UI |
| Kind visual language | **Locked** | **Shared base node** at rest. **Kind skin on hover** (node) + **kind skin on hover card**. Fuller per-kind “always-on” skins = later if ever. Detail in §9 / §10. |
| Avoid list | **Draft** | See below |

**Personality (draft)**

Acta is a **personal PKM-shaped tool** whose home is a **living graph**: **minimal** chrome when you land; the canvas feels **fluid** and **interactive** through physics — not through map/library theming. It should feel like *your* workspace — dorm-laptop personal, not enterprise dashboard. Latin/mythology stops at the name; the product reads as a modern knowledge tool. Canvas nodes share one **base** look at rest; **kind personality shows on hover** (node + hover card) so the graph stays calm until you engage.

**Adjectives:** living · minimal · fluid · personal · interactive

**Like / unlike (locked)**

| More like | Less like |
| --- | --- |
| **Obsidian graph** — nodes + edges; labels lean; **content surfaces on hover** | **Heptabase** — cards visible on the canvas |
| Clean personal tool chrome (Notion/Linear *sleekness* for sidebars/modals) | Enterprise admin / Salesforce density |
| Interactive force canvas | Literal map / atlas / library skins; static org-chart; “AI purple glow” |

Canvas rule of thumb: **structure on the plane, substance on hover** (hover card + kind skin).

**Avoid**

- Don’t put Heptabase-style **content cards on the canvas** — nodes/edges only; substance on hover / modal
- Map / atlas / cartography skins
- Library / archive / stone / Latin visual motifs
- Enterprise dashboard chrome
- Soft wellness / “life coach” aesthetics
- Mythology illustration tied to the name

**Open**

- [x] Adjectives: living · minimal · fluid · personal · interactive
- [x] Light + dark both required; default = system / OS
- [x] Kind skin: shared base at rest; kind on node hover + hover card
- [x] Graph reference: Obsidian-class nodes/edges (not Heptabase cards-on-canvas)

**§2 status: locked** — proceed to color (§5) / type (§6).

---

## 3. Voice & tone (lite)

*Full copy system = **U-I**. Here: only enough for UI chrome and brand lines.*

| Item | Status | Notes |
| --- | --- | --- |
| Tone keywords | **Open** | e.g. direct, confident, non-hype |
| We say / we don’t say | **Open** | Short table |
| Error / empty / pending voice | **Open** | One example each — or defer to U-I |
| Mythology / Latin in UI copy | **Locked** | **Name only** — no lore voice in product chrome |

**Open**

- [ ] Tone keywords (≤5)
- [ ] We say / don’t say (≤8 rows)
- [ ] Defer rest → **U-I**

---

## 4. Logo & wordmark

| Item | Status | Notes |
| --- | --- | --- |
| Primary mark | **Open** | Wordmark-only vs wordmark + symbol |
| Symbol concept | **Open** | If any: inscribed/record? graph? abstract? Avoid Atlas titan cliché unless intentional |
| Clear space / min size | **Open** | |
| Favicon / app icon | **Open** | |
| Lockups | **Open** | Horizontal / stacked / icon-only |

**Open**

- [ ] Wordmark-first vs mark+word
- [ ] Symbol yes/no + direction
- [ ] Temporary: typeset “Acta” in chosen type as interim identity

---

## 5. Color

| Item | Status | Token (proposed) | Value | Usage |
| --- | --- | --- | --- | --- |
| Background (canvas) | **Open** | `--bg-canvas` | TBD | Force-graph plane |
| Background (chrome) | **Open** | `--bg-chrome` | TBD | Sidebars, modals |
| Surface / elevated | **Open** | `--bg-elevated` | TBD | Cards, hover panels |
| Text primary | **Open** | `--text-primary` | TBD | |
| Text secondary | **Open** | `--text-secondary` | TBD | |
| Accent | **Open** | `--accent` | TBD | CTA, focus, key highlights |
| Accent muted | **Open** | `--accent-muted` | TBD | |
| Border / hairline | **Open** | `--border` | TBD | |
| Pending / proposal | **Open** | `--state-pending` | TBD | Diff-skim ghosts |
| Success / confirm | **Open** | `--state-success` | TBD | Merge |
| Danger / discard | **Open** | `--state-danger` | TBD | |
| Endeavor node fill | **Open** | `--node-endeavor` | TBD | Canvas nodes |
| Edge / link | **Open** | `--edge` | TBD | Graph edges |
| Selection / explore highlight | **Open** | `--highlight` | TBD | Ask/explore hits |

**Rules (TBD)**

- Accent budget: …
- When not to use accent: …
- Graph vs chrome contrast: …

**Open**

- [ ] Palette direction (mood → 1–2 accents max)
- [ ] Fill token table with concrete values
- [ ] Pending vs committed visual distinction rule
- [ ] Accessibility: contrast targets (AA for text?)

---

## 6. Typography

| Item | Status | Notes |
| --- | --- | --- |
| Display / brand | **Open** | Wordmark + rare headlines — avoid default stacks (Inter/Roboto/Arial/system as *brand*) |
| UI / body | **Open** | Sidebars, modals, forms |
| Mono (if any) | **Open** | Metrics? diffs? code-ish evidence? |
| Scale | **Open** | e.g. `xs` … `2xl` with rem values |
| Weights in use | **Open** | Limit the set |
| Line length / leading | **Open** | Especially modal + sidebar |

**Open**

- [ ] Pair: display + UI
- [ ] Type scale table
- [ ] Where display is allowed (hero/brand only vs in-app)

---

## 7. Layout, space, shape

| Item | Status | Token / rule |
| --- | --- | --- |
| Spacing scale | **Open** | `--space-1` … |
| Radius | **Open** | `--radius-sm/md/lg` — card policy: cards only when they earn interaction |
| Elevation / shadow | **Open** | Prefer sparse; avoid multi-layer glow |
| Chrome widths | **Open** | Left Generate sidebar, right Explore/diff-skim — align with surfaces |
| Modal (node) | **Open** | Centered Notion-like — padding, max-width |
| Density | **Open** | Graph calm vs sidebar information density |

**Composition principles (TBD — aim for 4–6 bullets)**

1. …
2. …
3. …

**Open**

- [ ] Spacing + radius tokens
- [ ] Composition principles locked
- [ ] Card policy confirmed for this product

---

## 8. Motion

*Ship a few intentional motions; no noise.*

| Pattern | Status | Where | Feel |
| --- | --- | --- | --- |
| Pending node appear | **Open** | Diff-skim → canvas | … |
| Node select / modal open | **Open** | Graph → node | … |
| Explore highlight | **Open** | Ask / filter | … |
| Sidebar enter/leave | **Open** | Right/left chrome | … |
| Reduced motion | **Open** | System preference | Respect; static fallbacks |

**Principles (TBD)**

- Duration / easing defaults: …
- What never animates: …

**Open**

- [ ] 2–3 must-have motions for Graph home
- [ ] Reduced-motion rule

---

## 9. Iconography & imagery

| Item | Status | Notes |
| --- | --- | --- |
| Icon set | **Open** | Lucide / custom / mixed — weight must match type |
| Illustration | **Open** | None for MVP? Spot only? |
| Photography | **Open** | Likely none in-app |
| Node glyphs | **Partial** | Kind identity via **hover skin + hover card**, not always-on glyph clutter at rest |

**Open**

- [ ] Icon library choice
- [ ] Kind differentiation strategy (color / icon / both)

---

## 10. Graph & product chrome (Acta-specific)

*Map visual language → locked IA in [`surfaces-and-flows.md`](surfaces-and-flows.md). Do not re-litigate IA here.*

| Surface / element | Status | Visual notes |
| --- | --- | --- |
| Graph canvas (home) | **Partial** | Obsidian-class void + nodes/edges; no card tiles on plane |
| Endeavor nodes | **Partial** | Shared **base** at rest (node, not card); **kind skin on hover**. Size/label/selected TBD |
| Edges | **Open** | Weight, dimming when filtered |
| Pending / proposal nodes | **Open** | Ghost, dashed, accent — distinct from committed |
| Right sidebar (Explore / diff-skim) | **Open** | Changelog, list density |
| Left sidebar (Generate) | **Open** | Adapter list + mini-graph peek |
| Ask bar + filter chips | **Open** | Browser-like bar; chips separate |
| Node modal | **Open** | Notion-like center — full content lives here / hover, not as canvas cards |
| Hover cards | **Partial** | Where content surfaces; kind-rich + **kind skin required** |
| Deepen backlog panel | **Open** | Pull queue, not notification toast storm |
| Thin citations (Generate) | **Open** | Inline + click-to-node — chrome only; rich provenance = **U-G** |

**Open**

- [ ] Pending vs committed recipe (the most important graph-specific lock)
- [ ] Selected / highlighted / dimmed triad
- [ ] Sidebar + canvas contrast so chrome doesn’t fight the graph

---

## 11. Interactive & feedback states

| State | Status | Spec |
| --- | --- | --- |
| Default / hover / active / focus | **Open** | Focus ring = accent? |
| Disabled | **Open** | |
| Loading / streaming extract | **Open** | Incremental pending appear |
| Empty graph | **Open** | Visual only; copy polish may wait **U-H** / **U-I** |
| Thin graph | **Open** | |
| Error | **Open** | |
| Success (merged) | **Open** | |

**Open**

- [ ] Focus visibility rule
- [ ] Streaming extract visual behavior (ties to motion §8)

---

## 12. Do / don’t

*Fill as decisions land. Seed with known product taste; edit freely.*

### Do

- [ ] …
- One composition language across Graph + sidebars + modal
- Make pending proposals obviously *not* committed
- **Structure on the plane, substance on hover** (Obsidian-class)
- Prefer atmosphere over flat pure-white void *or* generic purple-glow AI look — pick a deliberate direction in §5

### Don’t

- [ ] …
- Invent a new aesthetic per surface
- **Content cards on the canvas** (Heptabase-class)
- Cards everywhere in chrome (only when interaction needs a container)
- Default “AI slop” clusters: purple-on-white gradients, cream+serif+terracotta cliché, broadsheet hairline newspaper layouts — unless we *consciously* choose and own one
- Notification-center energy for Deepen
- Map / library / Latin-myth visual theming

---

## 13. Token implementation map

*Bridge to code. Concrete names can adjust in **U-J** / implementation.*

| Token group | CSS variables | Where applied first |
| --- | --- | --- |
| Color | `--bg-*`, `--text-*`, `--accent`, `--state-*`, `--node-*`, `--edge`, `--highlight` (+ light/dark pairs) | Graph home + shell; both themes first-class |
| Type | `--font-display`, `--font-ui`, `--text-*` sizes | Shell + modal |
| Space | `--space-*`, `--radius-*` | Sidebars, modal |
| Motion | `--ease-*`, `--duration-*` | Pending appear, modal |

**Open**

- [ ] Canonical token list (after §§5–8 lock)
- [ ] Theme file location in repo (TBD in **U-J**)

---

## 14. Marketing / out-of-app (deferrable)

*Not required to exit U-A for dogfood Graph home — park here.*

| Item | Status | Notes |
| --- | --- | --- |
| Landing first viewport | **Deferred** | Brand-first; see frontend taste rules when we build it |
| Social OG / share card | **Deferred** | |
| README / GitHub presence | **Deferred** | |

---

## 15. Decision log (short)

| Date | Decision |
| --- | --- |
| 2026-07-14 | Working name **Acta**; Stilva cut |
| 2026-07-14 | This scaffold created for **U-A** |
| 2026-07-14 | Pronunciation **AK-tuh**; tagline deferred (audience-specific) |
| 2026-07-14 | §2 mood: living canvas + clean PKM sleek; no map/library/myth visuals; personal not enterprise; kind-differentiated nodes intent |
| 2026-07-14 | Themes: light + dark both required; default = system / OS |
| 2026-07-14 | Adjectives: living · minimal · fluid · personal · interactive |
| 2026-07-14 | Kind skin: shared base node at rest; kind on hover + hover card |
| 2026-07-14 | Graph look: Obsidian-class nodes/edges; content on hover — not Heptabase cards-on-canvas. §2 locked. |

---

## 16. Open questions (backlog)

### Must answer to exit U-A

1. ~~Personality adjectives + theme default~~ → locked (living·minimal·fluid·personal·interactive; light+dark, system default)
2. Color direction + accent?
3. Type pair?
4. Pending-node recipe?
5. Motion shortlist (2–3)?
6. Do/don’t v1?

### Can trail U-A exit

7. Custom logo symbol?
8. Full voice table (→ **U-I**)?
9. Domain / legal name clearance?
10. Marketing landing system?

---

## Changelog

- **2026-07-14:** §2 locked — Obsidian-class graph (nodes/edges; content on hover), not Heptabase cards-on-canvas.
- **2026-07-14:** Kind skin — shared base at rest; kind on node hover + hover card.
- **2026-07-14:** Adjectives locked — living · minimal · fluid · personal · interactive.
- **2026-07-14:** Themes — light + dark both required; default system/OS.
- **2026-07-14:** §2 draft — living canvas, clean/sleek PKM energy, personal not enterprise; myth/Latin name-only; kind-differentiated nodes intent.
- **2026-07-14:** Pronunciation locked **AK-tuh**; tagline deferred. Starting §2 personality.
- **2026-07-14:** Scaffold created for **U-A**. Name **Acta** carried from product Naming. Visual sections open.
