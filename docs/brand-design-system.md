# Acta — Brand & Design System

Last updated: 2026-07-15

**Owns:** brand foundation + UI visual system for building-plan **U-A** — name lore, personality, tokens (color/type/space/motion), composition principles, graph-chrome language, do/don’t. Enough that Graph home (and later surfaces) share one look without inventing a new aesthetic per screen.

**Does not own:** IA/flows ([`surfaces-and-flows.md`](surfaces-and-flows.md)), agent write policy ([`agent-interaction-model.md`](agent-interaction-model.md)), full in-product copy ([`building-plan.md`](building-plan.md) **U-I**), adapter editor polish (**U-F**), rich provenance chrome (**U-G**), empty-state copy polish (**U-H**).

Companions: [`personal-evidence-graph.md`](personal-evidence-graph.md) (product + Naming), [`surfaces-and-flows.md`](surfaces-and-flows.md) (what to style), [`mockup-synthesis.md`](mockup-synthesis.md) (Graph-home vision brief), [`building-plan.md`](building-plan.md) (**U-A**). **Code:** [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css).

Status: **U-A look locked** — tokens in `acta-web/src/styles/tokens.css`. Motion / full a11y / app restyle deferred until greenfield build after **U-J**. Keep growing §12 Do/don’t.

---

## Exit criteria (from U-A)

- [x] Working brand name (+ pronunciation **AK-tuh**; tagline deferred)
- [x] Personality / mood locked (paragraph + adjectives + theme + kind-hover pattern)
- [x] Color tokens lean (warm paper / neutral dark / `#2aa77d`) + no panel borders
- [x] Type stack + **compact** scale + weights 400–700
- [x] Composition principles + card policy (§7); radius/elevation leans
- [x] Graph-home look locks from decision comparisons (nodes, kind, glass, icons, focus, confirm, empty, panel)
- [x] Spacing / radius / panel+modal widths + semantic hex in [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css)
- [x] Do / don’t seeded (§12) — **keep updating** as taste issues appear
- [~] Motion principles — **deferred** to greenfield build
- [~] App consumes tokens — **deferred** (prototype removed; bootstrap after **U-J**)
- [~] Full a11y contrast audit — **deferred** until chrome exists

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
| Etymology / lore | **Locked + lore** | Latin *acta* — deeds / acts / the record of what was done. **Secondary reading (liked):** backronym **A Call To Action** — product inspires you to keep doing things worth capturing into Acta |
| Internal category | **Locked** | personal evidence graph |
| Conversational test | **Locked** | “update my Acta” / “look at my Acta” |
| Domain / trademark | **Open** | Naked `acta.*` crowded; qualifier TBD. Not legal clearance. |
| Tagline | **Deferred** | Audience-specific; expect to change often — not a U-A lock. “Call to action” lore may feed future lines without being the only tagline |
| Name pronunciation | **Locked** | **AK-tuh** |
| Superseded names | History | Stilva, Stiva; finalists Atlas / Stele / Ariadne — see product Naming |

**Open**

- [x] Pronunciation — **AK-tuh**
- [x] Secondary lore — **A Call To Action** (inspiring continued deeds → capture)
- [ ] Tagline — deferred (per-audience; iterate later; may borrow CTA energy)

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
| Primary mark | **Parked** | **Wordmark-only for now** — mark dropped from the mock. Prior lean (kept for when we revisit): **filled three-point star** (solid concave, **no ring** — not line rays), rotated **180°** tip-down, from founder's reference SVG |
| Wordmark | **Lean** | **Acta** in Charis SIL — currently *is* the logo (mark parked) |
| Symbol concept | **Parked** | Filled star lean retained but not in use; revisit optical balance later |
| Clear space / min size | **Open** | |
| Favicon / app icon | **Open** | Likely same mark |
| Lockups | **Partial** | Top-left: mark + wordmark; hamburger under brand for adapters |

**Open**

- [x] Wordmark-first vs mark+word → **wordmark-only for now** (mark parked)
- [~] Symbol direction: **filled** three-point star (concave, no ring — not line rays), tip-down via 180° rotate; from founder reference SVG — **parked**, not in use
- [ ] Stroke weight / optical balance at small sizes

---

## 5. Color

| Item | Status | Notes |
| --- | --- | --- |
| Palette architecture | **Locked (lean)** | Monochrome neutrals + one accent family (`#2aa77d`) |
| Accent / ground lean | **Locked (lean)** | **Warm paper (light, slightly warm)** · **neutral graphite dark** (not warm, not cool) · accent **`#2aa77d`**. Coral cut. |
| Panel chrome | **Locked** | **No visible hairline borders** between panels — separate by subtle bg shift / soft elevation only |
| Kind colors | **Locked (implication)** | Kinds do **not** each get a unique brand hue; use glyph / shape / accent intensity on hover |

| Item | Status | Token (proposed) | Value | Usage |
| --- | --- | --- | --- | --- |
| Background (canvas) | **Lean** | `--bg-canvas` | light `#f5f0e4` / dark `#141414` | Force-graph plane |
| Background (chrome) | **Lean** | `--bg-chrome` | light `#f8f3e9` / dark `#1a1a1a` | Sidebars, top bar |
| Surface / elevated | **Lean** | `--bg-elevated` | light `#fffdf8` / dark `#222222` | Hover cards, ask field |
| Text primary | **Lean** | `--text` | light `#1e1c18` / dark `#ececec` | |
| Text secondary | **Lean** | `--text-muted` | light `#6e695f` / dark `#949494` | |
| Accent | **Lean** | `--accent` | `#2aa77d` | Capture CTA, focus ring, highlight, kind-hover — **not** Confirm |
| Accent soft | **Lean** | `--accent-soft` | mix ~16% | Washes, active chips |
| Accent text | **Lean** | `--accent-text` | light `#1e8a66` / dark `#5ed4a8` | |
| Border / hairline | **Locked** | — | **Avoid** between panels | Prefer bg shift; hairlines only if needed for a11y on controls |
| Pending / proposal | **Locked (lean)** | `--state-pending` | structural, **not** accent | Dashed outline + lower opacity (+ optional pulse); same neutral ink family as committed |
| Success / confirm | **Locked** | `--state-success` | light `#2f9e6a` · dark `#3db87a` | Diff-skim **Confirm** — semantic, not `#2aa77d` |
| Danger / discard | **Locked** | `--state-danger` | light `#c4473a` · dark `#e07070` | Diff-skim **Discard** — semantic pair |
| Endeavor node fill | **Locked** | `--node` | light `#6b6560` · dark `#c8c8c8` | Canvas nodes at rest |
| Edge / link | **Locked** | `--edge` | light ~12% text · dark ~9% white | Subtle |
| Explore / filter highlight | **Locked** | `--highlight` | accent family | Matching endeavors |
| Glass fill (heavy) | **Locked** | `--glass` + `--glass-blur: 30px` | ~55% elevated + heavy blur | Ask, controls, hover, modal, floating panel |
| Focus ring | **Locked** | `--focus-ring` | accent | Keyboard focus |

**Code reference:** [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css). Prefer these variables over inventing values when the app is bootstrapped.

**Rules**

- Neutrals carry almost all UI chrome and the graph at rest
- Brand accent (`#2aa77d`) is scarce: Capture CTA, **focus ring**, ask/filter **highlight**, kind-hover — **not** pending, **not** Confirm
- Diff-skim Confirm/Discard = **semantic pair** outside brand teal
- Light-mode nodes are **`#6b6560`**, not black

**A11y (lean notes — not a full audit)**

- Body text on canvas/elevated: dark `#1e1c18` on `#f5f0e4` / `#fffdf8` and light `#ececec` on `#141414` / `#222` — aim AA for body.
- Accent `#2aa77d` on white/paper for large CTA text is OK; small accent-on-paper text use `--accent-text`.
- Confirm/Discard: use `--state-*-text` for labels on soft washes; filled buttons use white on success/danger fills.
- Full WCAG pass still open when chrome is restyled.

**Open**

- [x] Palette architecture + accent `#2aa77d`
- [x] Warm paper light / neutral dark values
- [x] No panel hairlines
- [x] Pending ≠ accent — structural ghost (see §10)
- [x] Node / edge / glass / semantic / focus tokens in [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css)
- [ ] Full contrast audit after Graph chrome restyle

**Mockups:** [`brand-mockups.html`](brand-mockups.html) — Graph-home experimental preview. [`brand-decision-comparisons.html`](brand-decision-comparisons.html) — side-by-side locks for open look decisions. Vision target: [`mockup-synthesis.md`](mockup-synthesis.md).

---

## 6. Typography

| Item | Status | Notes |
| --- | --- | --- |
| Display / brand | **Locked** | **Charis SIL** — logo, branding, headings. Instrument Serif on back burner. |
| UI / body | **Locked** | **Figtree** — app chrome, sidebars, forms, hover-card body |
| Mono (if any) | **Open** | Metrics? diffs? code-ish evidence? |
| Scale | **Locked (lean)** | **Compact PKM** — see table |
| Weights in use | **Locked** | **400 / 500 / 600 / 700** only |
| Line length / leading | **Open** | Especially modal + sidebar — refine in build |
| Where serif appears | **Locked (direction)** | Wordmark + headings / brand moments — **not** dense UI body |

| Token | Rem (lean) | Use |
| --- | --- | --- |
| `--text-label` | ~0.75–0.8125rem (12–13px) | Uppercase section labels, meta |
| `--text-ui` | ~0.875–1rem (14–16px) | Chrome, buttons, forms |
| `--text-body` | ~0.875rem (14px) | Hover/panel body |
| `--text-h` | ~1.25–1.75rem (20–28px) | Charis headings / node titles |

**Open**

- [x] Pair: **Charis SIL** + **Figtree**
- [x] Compact type scale + weight set
- [x] Where serif appears: wordmark + headings / brand moments — not dense UI body
- [ ] Modal/sidebar measure (ch) at implement

---

## 7. Layout, space, shape

| Item | Status | Token / rule |
| --- | --- | --- |
| Spacing scale | **Locked** | `--space-1`…`--space-8` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px |
| Radius | **Locked** | `--radius-soft` 10 · `--radius-ctl` 12 · `--radius-panel` 14 |
| Elevation / shadow | **Locked** | `--shadow-soft` / `--shadow` — sparse; no multi-layer glow |
| Chrome widths | **Locked (lean)** | `--panel-width` 320px; `--modal-max-width` 520px; `--hover-card-width` 248px |
| Modal (node) | **Locked (lean)** | Glass; max-width 520; padding `--space-4` |
| Density | **Lean** | **Canvas calm**; floating panels may be denser (changelog, facets) |
| Card policy | **Locked** | Cards only when interaction needs a container |
| Glass recipe | **Locked** | Heavy liquid — `--glass` ~55% + `--glass-blur: 30px` |

**Composition principles (locked)**

1. **Canvas is the room** — Graph fills the viewport. Chrome floats on top; nothing frames the graph outside it.
2. **Structure on the plane, substance on hover** — Nodes/edges only at rest. Content lives in hover cards and the centered modal — not cards glued to the canvas.
3. **One control language** — Same height, radius family, icon weight, and glass treatment across top/bottom chrome. No one-off button styles per corner.
4. **Separate without lines** — Panels and glass use soft fill / blur / light shadow — not hairline borders between chrome and canvas.
5. **Accent is scarce** — Teal for Capture, focus ring, ask·filter highlight, kind-hover. Neutrals do the rest. Pending stays structural. Confirm/Discard are **semantic** (not brand teal).
6. **Cards earn their keep** — Card chrome only when you’re interacting with a container (hover peek, modal, floating panel rows). Don’t card-wrap the whole UI.
7. **Liquid glass family** — Ask, controls, hover, modal, and floating panels share the **heavier liquid** glass recipe (not solid paper cards for those surfaces).

**Open**

- [x] Composition principles locked
- [x] Card policy confirmed
- [x] Elevation / radius / spacing / panel+modal widths in `tokens.css`
- [x] Heavy liquid glass + glass hover/modal/panel
- [ ] Line-length (ch) polish in real modal copy

---

## 8. Motion

*Ship a few intentional motions; no noise.*

| Pattern | Status | Where | Feel |
| --- | --- | --- | --- |
| Pending node appear | **Lean** | Diff-skim → canvas | Fade/settle in; **soft pulse** on pending (opacity or dash) while proposal open — calm, not alarm |
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
| Icon set | **Locked (lean)** | **Lucide** (or Lucide-equivalent stroke set) for UI chrome; weight matches Figtree |
| Metaphors | **Locked** | **gear** = graph settings · **sun/moon** = theme · **inbox** ≈ deepen · **+** = capture · filter = filter control |
| Custom mark | **Parked** | Brand mark custom SVG only if/when unparked — not from Lucide |
| Illustration | **Locked (lean)** | **None** for empty/MVP chrome — no mascots / illustration spam |
| Photography | **Locked (lean)** | None in-app (header images on nodes are kind presets / AI — product imagery, not stock chrome) |
| Node glyphs | **Locked (lean)** | Kind identity **card-first** on hover — see §10; not always-on glyph clutter at rest |

**Open**

- [x] Icon library: Lucide-style
- [x] Kind differentiation: card-first (glyph/label/tint on hover card; node at most slight accent ring)
- [x] No empty-state illustration

---

## 10. Graph & product chrome (Acta-specific)

*Map visual language → locked IA in [`surfaces-and-flows.md`](surfaces-and-flows.md). Canvas simulation behavior (forces, settling, edge/label rendering, crossing handling) → [`graph-physics.md`](graph-physics.md). Do not re-litigate IA or physics here.*

| Surface / element | Status | Visual notes |
| --- | --- | --- |
| Graph canvas (home) | **Locked** | **Full-bleed** background of the app; all chrome overlays |
| Endeavor nodes | **Locked (lean)** | Shared base at rest; `#6b6560` / `#c8c8c8`; kind on hover per recipe below; circular settle |
| Edges | **Locked (lean)** | Subtle (~12% / ~9%); optional dim later — not v1 |
| Pending / proposal nodes | **Locked (lean)** | See recipe below — structural, not color |
| Bottom ask | **Locked** | **Heavy liquid glass** prompt bar |
| Filter + graph settings | **Locked** | Filter **button** (menu) + gear settings — Lucide metaphors |
| Top-left | **Locked** | Brand + wordmark; hamburger → adapters (hover expand / click pin) |
| Top-right | **Locked** | Capture + (+ mic), deepen (inbox-like + badge), theme sun/moon, profile |
| Floating right panel | **Locked (lean)** | Diff-skim / Explore — **full / heavy liquid glass** (more transparent than soft glass); under top-right; CoG left; **not** docked; shadow, no border |
| Node modal | **Locked (lean)** | **Glass** surface; header image; title straddles image/body with shadow |
| Hover cards | **Locked (lean)** | **Glass** peek; kind-rich **card-first** (see below) |
| Empty graph | **Locked (lean)** | Quiet canvas + soft centered **Capture** prompt; **no** illustration / ghost nodes |
| Deepen backlog panel | **Open** | Pull queue, not notification toast storm — same glass family when built |
| Thin citations (Generate) | **Open** | Inline + click-to-node — chrome only; rich provenance = **U-G** |

**Kind hover skin (locked lean)**

| Surface | Spec |
| --- | --- |
| Node at rest | Shared base — no kind color / glyph clutter |
| Node on hover | At most a **slight accent ring** (optional) — plane stays calm |
| Hover card | Kind shows here: glyph and/or label and/or soft header tint |

**Pending vs committed (locked lean)**

Diff-skim / import proposals may show endeavor **ghosts** on the canvas until Confirm / Discard. They must read as *not yet in the graph* without stealing the accent.

| Cue | Spec |
| --- | --- |
| Outline | **Dashed** ring / stroke (committed = solid or no ring) |
| Opacity | **More transparent** than committed (same neutral ink family — not teal wash) |
| Motion | Optional **soft pulse** (opacity or dash phase) while the proposal is open — living, not alarming |
| Color | **Do not** encode pending via accent / kind color |
| Edges | Pending edges (if drawn) match: subtler / dashed / lower opacity |
| On confirm | Pulse stops; dash → solid; opacity → committed |
| On discard | Ghost removes (short fade OK) |

Accent stays free for Capture CTA, **focus ring**, ask/filter **highlight**, and kind-hover — not “this is a proposal,” not Confirm.

**Canvas node states (locked lean)**

| State | v1? | Spec |
| --- | --- | --- |
| **Default** | Yes | Shared base; neutral committed (`#6b6560` / `#c8c8c8`) |
| **Highlighted** | Yes | Ask / filter matches — **accent** (fill and/or soft ring). Distinct from pending dashes |
| **Pending** | Yes | Dashed + transparent (+ optional pulse) — see above |
| **Dimmed** | **Defer** | Fade non-matches while a slice is active. Nice on a dense graph; not required if highlight alone reads. Revisit when real data proves need |
| **Selected** | **Defer** | Extra canvas cue for “this node.” Modal open *is* selection for v1; optional focus-after-close later |

Shared language: ask bar and filter menu both drive **highlight** the same way.

**Open**

- [x] Pending vs committed recipe
- [x] Highlight = accent; dimmed + selected deferred
- [x] Kind hover = card-first
- [x] Glass hover + modal + full-glass floating panel
- [x] Empty = quiet + Capture
- [ ] Pulse timing / reduced-motion: static dashed + opacity only (defer to build)

---

## 11. Interactive & feedback states

| State | Status | Spec |
| --- | --- | --- |
| Default / hover / active / focus | **Locked (lean)** | Focus = **accent ring**; hover = slight bg wash; active = stronger wash |
| Disabled | **Open** | Muted opacity — refine in build |
| Loading / streaming extract | **Open** | Incremental pending appear (IA); motion at build |
| Empty graph | **Locked (lean)** | Quiet canvas + centered Capture CTA; no illustration |
| Thin graph | **Open** | Same chrome; fewer nodes — no special “thin” skin |
| Confirm / Discard | **Locked (lean)** | **Semantic pair** — functional green Confirm, red/muted Discard (not brand teal) |
| Error | **Open** | May share danger family — polish later |
| Success (merged) | **Open** | Pending → committed; optional brief settle — motion later |

**Open**

- [x] Focus visibility = accent ring
- [x] Empty graph visual
- [x] Confirm/Discard semantic
- [ ] Streaming extract visual polish (ties to motion — build-time)
- [ ] Disabled recipe numbers

---

## 12. Do / don’t

*Fill as decisions land. Seed with known product taste; edit freely.*

### Do

- Follow §7 composition principles (canvas room, one control language, scarce accent, cards earn keep, liquid glass family)
- Make pending proposals obviously *not* committed — **dashed + transparent (+ soft pulse)**
- **Structure on the plane, substance on hover** (Obsidian-class); kind **card-first**
- Separate panels with **liquid glass / soft elevation**, not hairlines
- Warm paper light + neutral dark + teal accent `#2aa77d`
- Light-mode nodes: **`#6b6560`**, not black
- Confirm/Discard = **semantic green/red** (outside brand teal)
- Empty graph = quiet + Capture — no illustration carnival
- Lucide-style icons; deepen ≈ inbox

### Don’t

- Invent a new aesthetic per surface
- **Content cards on the canvas** (Heptabase-class)
- Visible borders between Graph chrome panels
- Cards everywhere in chrome (only when interaction needs a container)
- Encode **pending via accent/color** (teal wash / kind color) — use structure + opacity
- **Black / near-black nodes in light mode**
- Use brand teal for Confirm (steal from Capture/highlight) — use semantic success
- Coral/red accents for **brand** (collides with semantic discard/error)
- Notification-center energy for Deepen
- Map / library / Latin-myth visual theming
- Multi-layer glow shadows on chrome
- Solid-only hover/modal if the liquid glass lock is in force (glass family for those surfaces)

---

## 13. Token implementation map

*Code reference:* [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css).

| Token group | CSS variables | Where applied first |
| --- | --- | --- |
| Color | `--bg-*`, `--text*`, `--accent*`, `--state-*`, `--node`, `--edge`, `--highlight*`, `--glass*` | Graph home + shell; `html[data-mode]` + `prefers-color-scheme` |
| Type | `--font-display`, `--font-ui`, `--text-*`, `--font-weight-*` | Shell + modal (load Charis + Figtree at bootstrap) |
| Space / shape | `--space-*`, `--radius-*`, `--ctl-size`, `--panel-width`, `--modal-max-width` | Overlays, modal |
| Motion | `--duration*`, `--ease-out` | Placeholders — feel deferred to build |
| Helpers | `.acta-glass`, `.acta-focus-ring`, `.acta-node-pending` | Optional class hooks |

**Open**

- [x] Canonical token file checked in
- [~] Wire fonts + import tokens in greenfield app — after **U-J**

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
| 2026-07-15 | Type direction: serif logo/headings + sans UI. Color exploring via `brand-mockups.html` (mono+accent not locked). |
| 2026-07-15 | Type locked: **Charis SIL** + **Figtree**. Ground: warm paper light + **neutral graphite dark** (warm dark cut). Accent lean **`#2aa77d`**; coral cut. |
| 2026-07-15 | Graph-home mock rebuilt to match IA; light paper slightly warmer; dark stays neutral; **no panel hairlines**. |
| 2026-07-15 | Name lore: secondary reading **A Call To Action** (inspire deeds → capture into Acta). |
| 2026-07-15 | Pending nodes: **dashed outline + lower opacity + optional soft pulse**; **not** accent/color-coded |
| 2026-07-15 | Canvas states: **highlight = accent**; **dimmed** + **selected** deferred (modal = selection; highlight alone for slices) |
| 2026-07-15 | §7 composition principles locked (6); card policy + elevation/density leans; light nodes ≠ black |
| 2026-07-15 | Spacing 4→64; radius 10/12/14; panel 320 / modal 520; semantic `#2f9e6a` / `#c4473a` (+ dark); code ref [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css) |
| 2026-07-15 | Prototype Next app removed; tokens live at `acta-web/src/styles/tokens.css`. U-A look locked; trailers deferred |

---

## 16. Open questions (backlog)

### Deferred (not blocking U-A → U-J)

1. Motion choreography — greenfield build
2. App bootstrap consuming tokens + fonts — after **U-J**
3. Full contrast audit — when chrome exists
4. Do/don’t — keep updating (§12)

### Can trail further

5. Custom logo mark (parked — wordmark-only)
6. Full voice table (→ **U-I**)
7. Domain / legal name clearance
8. Marketing landing system

---

## Changelog

- **2026-07-20:** Token code reference now lives **only** at [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css) — the repo-root `styles/` folder was removed when U-J U1 scaffolded the frontend. All token references repointed there.
- **2026-07-15:** Removed Next.js prototype scaffold; tokens moved to [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css). U-A look locked; motion/a11y/app wire deferred.
- **2026-07-15:** Locked spacing/radius/chrome widths + semantic Confirm/Discard hex; code reference [`acta-web/src/styles/tokens.css`](../acta-web/src/styles/tokens.css).
- **2026-07-15:** Mark **dropped for now** — wordmark **Acta** (Charis SIL) is the logo. Added [`graph-physics.md`](graph-physics.md) synthesizing canvas simulation behavior + the "minimize crossings, then render them gracefully" doctrine.
- **2026-07-15:** Mark = **filled** three-point star (concave, no ring, thin arms) from founder reference SVG, rotated 180° tip-down — replaces the earlier line-ray version. Graph physics: cluster-seeded layout + collision force to cut edge crossings and stop node/label overlap.
- **2026-07-15:** Rebuilt [`brand-mockups.html`](brand-mockups.html) as a Graph-home visual per [`mockup-synthesis.md`](mockup-synthesis.md): real force simulation (draggable nodes, pre-warmed radial settle, live physics/label sliders in the gear menu), denser Endeavors-only graph with edges meeting node centers, CoG shifts left when the floating diff panel is open, hover card + node modal with kind-preset header image and straddling title, pending diff-skim state (dashed neutral outline + lower opacity + soft pulse per locked recipe), ask + filter sharing one highlight/dim language.
- **2026-07-15:** Locked look decisions from [`brand-decision-comparisons.html`](brand-decision-comparisons.html): compact type; node/edge hex leans; kind card-first; Lucide; glass hover+modal; heavy liquid glass; accent focus; semantic Confirm/Discard; quiet empty; full-glass floating panel.
- **2026-07-15:** Added [`brand-decision-comparisons.html`](brand-decision-comparisons.html) — scrollable side-by-side previews for 10 open look decisions (type, nodes, kind hover, icons, modal/glass, focus, confirm, empty, panel).
- **2026-07-15:** §7 composition principles locked (6); elevation/density/card leans; light-mode nodes = mid warm gray, **not black**.
- **2026-07-15:** Canvas states — **highlight = accent**; dimmed + selected **deferred** (modal is selection; slice via highlight alone until density needs dim).
- **2026-07-15:** Pending canvas recipe locked — dashed outline, lower opacity, optional soft pulse; **not** accent/color. Accent reserved for CTA/highlight/kind-hover.
- **2026-07-15:** Added [`mockup-synthesis.md`](mockup-synthesis.md) — vision brief for Graph home (stop chasing HTML accidents).
- **2026-07-15:** Mock polish — sun/moon theme (CSS toggle) + gear; Mercedes star (no ring) + rotate; radius middle ground (~12–14, not pills / not 8px).
- **2026-07-15:** Mock refine — 3-point star lean; edge-aligned denser graph; shared control language (no hairline glass borders); Capture + as icon; hover card header + title straddle; filter = specific facets.
- **2026-07-15:** Graph chrome from sketch — full-bleed canvas overlays; bottom liquid ask; floating panels; hamburger adapters; modal header image + straddling title. Mark open (A vs star).
- **2026-07-15:** Name lore — secondary **A Call To Action** reading (inspire continued deeds → capture).
- **2026-07-15:** Graph-home mock = IA surfaces; warmer paper light; neutral dark; no panel borders; exploration controls removed.
- **2026-07-15:** Accent lean `#2aa77d` (teal between blue/green); coral cut. Paper dark → neutral graphite (warm brown dark cut).
- **2026-07-15:** Locked Charis SIL + Figtree; warm paper; warm dark (no blue tint). Accent still open — coral `#fb786f` lean vs aqua vs gold.
- **2026-07-15:** Mockups — accent color picker; ground presets (warm/cool/studio); sans options (Plex/Source/Figtree/Public). DM Sans out.
- **2026-07-15:** Mockups — try Charis SIL (Instrument back burner); explore paper + aquamarine (F).
- **2026-07-15:** Type direction — serif brand/headings + sans UI. Color mockups → [`brand-mockups.html`](brand-mockups.html).
- **2026-07-14:** §2 locked — Obsidian-class graph (nodes/edges; content on hover), not Heptabase cards-on-canvas.
- **2026-07-14:** Kind skin — shared base at rest; kind on node hover + hover card.
- **2026-07-14:** Adjectives locked — living · minimal · fluid · personal · interactive.
- **2026-07-14:** Themes — light + dark both required; default system/OS.
- **2026-07-14:** §2 draft — living canvas, clean/sleek PKM energy, personal not enterprise; myth/Latin name-only; kind-differentiated nodes intent.
- **2026-07-14:** Pronunciation locked **AK-tuh**; tagline deferred. Starting §2 personality.
- **2026-07-14:** Scaffold created for **U-A**. Name **Acta** carried from product Naming. Visual sections open.
