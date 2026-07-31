# Archive — superseded docs

Nothing in this folder is canon. It is kept because the *reasoning* is often still
useful (why a decision was made, what was rejected), but the specifics have been
superseded and should not be implemented from.

| File | Why it's here |
| --- | --- |
| `graph-physics.md` | Long doctrine written before any canvas existed. Its instincts were right (circular settle, quiet edges, minimize crossings) but its detail outran reality, and a build that satisfied it on paper still looked wrong on screen. Replaced by [`../graph-canvas.md`](../graph-canvas.md), which states only what can be checked against a running canvas. |
| `brand-design-system.md` | Full visual system (tokens, type, colour, "liquid glass" surfaces, motion) locked before anything was rendered. The glass direction in particular produced unreadable translucent modals over live content. **Current rebuild:** Neubrutalism in [`../src/styles/tokens.css`](../../src/styles/tokens.css) — session handoff in [`../design-handoff.md`](../design-handoff.md). Do not implement from this archive file. |
| `mockup-synthesis.md` | Synthesis of the original HTML mocks. Useful as a mood reference. |
| `brand-mockups.html`, `brand-decision-comparisons.html` | The original static mocks. |

**Still canon:** [`../personal-evidence-graph.md`](../personal-evidence-graph.md)
(product), [`../data-model.md`](../data-model.md),
[`../surfaces-and-flows.md`](../surfaces-and-flows.md),
[`../agent-interaction-model.md`](../agent-interaction-model.md),
[`../graph-canvas.md`](../graph-canvas.md),
[`../design-handoff.md`](../design-handoff.md) (current pixels). The idea and the
data model held up; the front-end specification is what didn't.
