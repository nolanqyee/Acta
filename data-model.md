# Stilva — Data Model Spec

Last updated: 2026-07-09

Product: **Stilva** — personal evidence graph (still × vita / *distill a life*). Companion to `personal-evidence-graph.md` (product spec). **This doc owns schema, entity types, edges, provenance, and extraction contracts.** Product decisions that depend on the model should link here rather than inventing schema in the product doc.

Status: **stub / not locked.** Provisional lean only.

---

## Relationship to product spec

| Doc | Owns |
| --- | --- |
| `personal-evidence-graph.md` | Vision, wedge, adapters, monetization, relevance *behavior*, open product questions |
| `data-model.md` (this) | What exists in the graph, how captures become entities, IDs, edges, versioning, provenance |

When product and model conflict, resolve explicitly and update both.

---

## Provisional lean (from product ideation)

**Freeform captures are intake text**, not a second competing database of truth.

```
Capture (typed yap, import chunk, later: voice transcript, etc.)
        ↓
Extract entities + relationships; link back to source capture
        ↓
Structured graph (entities + edges)  ← adapters query this
```

- **Capture:** raw text (and later multimodal sources) + metadata (time, source type, import origin)
- **Entities:** projects, roles, skills, people, metrics, stories, … (list TBD)
- **Links:** entity↔entity and entity↔capture (provenance / re-extract)
- **Application tags:** on entities (or edges) — which surfaces they’re good for; user-overridable

Adapters (resume, interview stories, app questions) should read **entities + edges**, citing captures/evidence as provenance — not RAG blindly over raw journals as the primary path.

**This lean is provisional** until entity list, cardinality, and identity/dedup rules are specified below.

---

## Open model questions

- [ ] Canonical entity types for v1 (minimal set vs rich set)
- [ ] Identity & dedup: when are two “Bubble” projects the same node?
- [ ] Capture retention: always keep full text? summarize? chunking rules?
- [ ] Re-extraction: if user edits an entity, does the capture stay stale? bidirectional sync?
- [ ] Metrics: first-class nodes vs attributes on achievements?
- [ ] Stories: first-class vs views compiled from project/role nodes at query time?
- [ ] Application tags: vocabulary, multi-tag, confidence scores?
- [ ] Soft archive: flag on entity vs separate edge/state?
- [ ] Evidence objects: commits/PRs/files as entities or attachments?
- [ ] Multi-user later: still single-tenant graph per user for v1?
- [ ] Storage shape in cloud (Firebase-class): documents vs graph DB vs hybrid — implementation, but constraints belong here

---

## Draft sections (to fill)

### Entity catalog

*(TBD — name, required fields, optional fields, examples)*

### Edge catalog

*(TBD — e.g. `worked_on`, `used_skill`, `reports_metric`, `sourced_from_capture`)*

### Capture → extract contract

*(TBD — what the LLM must emit; confirm/edit diff-skim shape)*

### Provenance & citations

*(TBD — how draft citations point at entity IDs / capture spans)*

### Versioning & edits

*(TBD)*

---

## Changelog

- **2026-07-09:** Stub created; provisional capture→entity lean recorded; open model questions listed.
- **2026-07-09:** Product brand updated to **Stilva** (working brand locked in product spec).
