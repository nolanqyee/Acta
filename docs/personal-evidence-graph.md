# Personal Evidence Graph — Planning Context

Last updated: 2026-07-14 Update whenever planning decisions, scope, or open questions change.

**Active ideation thread:** working brand = **Acta**. **U-A** visual system → [`brand-design-system.md`](brand-design-system.md).

**Doc altitude:** this is a **product spec** (what / why / scope). Detailed UI, UX, and user flows come later — capture product intent and capabilities here, not screen-level design.

---

## One-liner

A **personal evidence graph** (working brand **Acta**): capture anything about yourself over time, structure it into reusable entities/stories, score relevance for a given ask + life stage, and compile grounded artifacts. Not a resume tool. Not a college essay writer.

---

## Core insight

Most recruiting products start at the artifact:

```
Job posting → Generate resume
```

This starts at the person:

```
Life → Capture → Organize → Understand → Generate anything (as a view)
```

The repository compounds. Outputs (resume, interview answers, LinkedIn, site, promo packet) are **views** over the same graph, not separate source-of-truth documents.

---



## What goes in the corpus

Anything that makes you *you* — not just work wins:

- Jobs / internships
- Personal projects
- Classes / coursework
- Leadership roles (college, clubs, orgs)
- Hobbies
- Articles / writing
- Research
- Volunteering
- Art / music / poetry / creative products
- Failures, lessons, values
- People, relationships, context
- Metrics, evidence artifacts (PRs, commits, docs)

Performance reviews / brag docs are one relevant use case, not the center of gravity.

---



## Target users / life stages

**Wedge (locked for now):** college students recruiting for **tech internships** — founder is in this process; deepest domain knowledge.

**Why this wedge (backfill):** the older you are, the harder it is to port a full life into a graph. College internship recruiting is where backfill is still tractable and value is immediate — don’t treat “make mid-career full-life import solvable” as a product goal. Later stages inherit a graph that *grew with the user*, not a heroic one-shot backfill product.

Near-term adjacency (same graph, later or light support — not the wedge promise):

- New grads recruiting for full-time roles (similar artifacts; different relevance/recency)

Long-term vision (same corpus, different adapters/relevance policies):

- High school → college applications (later; not essay-writing as a product)
- Employed ICs → performance reviews, promo packets, rec letters, speaker bios, etc.

Multi-stage is a feature of the **graph + relevance layer**, not a reason to ship every adapter at once. Stickiness thesis: onboard once into a durable self-graph → keep using across life stages as adapters change.

---



## Explicitly out of scope (for now)

- Full **college essay writer** — too out of scope
- Acceptable later/narrow: **essay ideas** grounded in the corpus (prompts, story matches), not drafted essays as a core promise
- Being “just” a performance-review / brag-doc tool
- Solving **large mid-career / full-life backfill** as a primary problem — wedge assumes a still-manageable past; don’t design MVP around making decades of history easy to port

---



## Example capture → graph → ask

**Capture (yap / type):**

> Today I implemented Redis caching. Had to debug a race condition. Lock wasn’t scoped correctly. Reduced latency ~60%.

**Extracted (no manual tagging as the goal; confirm/edit loop likely needed):**


| Field             | Value                               |
| ----------------- | ----------------------------------- |
| Project           | Bubble CRM App                      |
| Skills / tech     | Redis, caching, concurrency         |
| Competencies      | Debugging, performance optimization |
| Evidence / metric | ~60% latency reduction              |
| Story             | STAR-ready narrative                |


**Later asks against the same graph:**

- Resume emphasizing backend engineering
- “Tell me about a time I disagreed with a teammate”
- Three stories showing ownership
- LinkedIn post from today’s work
- Personal site Projects page
- (Later) essay *ideas* for a prompt — not a full essay product

---



## Data model direction

**Status:** provisional lean only. Data model is load-bearing enough to warrant its **own spec** — see `data-model.md`. Do not treat the list below as final schema.

### Mental model (provisional)

Freeform captures are **not** a parallel source of truth competing with entities. They are **intake text** (yap, paste, import chunk). The pipeline **extracts structured entities from them and/or links entities back to the source capture** (provenance).

```
Capture (freeform text / import)
        ↓
Extract + link
        ↓
Entities + edges  ← what adapters query
        ↑
Source capture kept for provenance / re-extract
```

**Provisional lean:** hybrid coexistence — imports and yaps land as captures; entities are what resume/stories/app-question adapters query; captures remain linked as evidence/provenance. **Confirm or revise in `data-model.md`.**

### Candidate entity types (rough, not final)

- Projects
- Experiences / Roles
- Achievements
- Skills / Technologies
- People
- Companies / Orgs
- Stories
- Metrics
- Failures / Lessons
- Goals / Values
- Evidence / provenance (commits, PRs, Slack, docs, screenshots, captures, etc.)
- Application tags (on nodes)

Example node:

```
Built Redis cache
  → Project: Bubble
  → Skills: Redis, Supabase, Node
  → Traits: Ownership, Initiative
  → Outcome: 60% latency reduction
  → People: Amir
  → Evidence: git commit, PR, source capture
```

Retrieval becomes: “leadership stories ordered by strongest evidence,” not keyword search over a journal.

---



## Relevance (key product insight)

Relevance is **contextual**, not just chronological.

A high-school robotics captaincy might be:


| Ask                                                     | Relevance  |
| ------------------------------------------------------- | ---------- |
| College essay / blog about how you got into engineering | High       |
| New-grad SWE resume                                     | Low / omit |
| Interview “tell me about leadership” early in career    | Maybe      |
| Teaching / mentorship narrative years later             | High again |


Needed concept (not finalized):

```
relevance(experience, audience, artifact_type, career_stage, claim_being_made)
```

Not crude “last 5 years only.” Resumes skew recent/professional; essays/stories skew thematic fit; interviews skew evidence strength + defensibility.

### Intake-time application tags (proposed)

On ingest / deepen, an LLM suggests **which applications this node is good for**, e.g.:

- `internship_resume`
- `interview_story`
- `app_question`
- `linkedin`
- `personal_site`
- `portfolio`
- `keep_personal` (in graph, but not for recruiting surfaces)

Example: high-school robotics captaincy → strong for `interview_story` / narrative surfaces, weak or absent for `internship_resume` unless exceptional + user override.

**Why this helps:** relevance work happens when context is richest (just captured), not only at generate time.

### What “JD / prompt matching” means

Separate from tags:

- **Tags** answer: “Is this generally useful for *resumes* / *interviews* / …?”
- **JD/prompt matching** answers: “Given *this* Stripe backend internship posting (or *this* app question), which of my nodes fit *best*?”

Example: both Project A (Redis caching) and Project B (iOS habit app) might be tagged `internship_resume`. For a backend infra JD, matching boosts A; for a mobile JD, boosts B. Tags alone can’t do that.

### Runtime relevance options

| Approach | How it works | Cost / latency | Quality for “tailored” |
| --- | --- | --- | --- |
| **Tags only** | Generate from nodes tagged for that surface | Cheap | Good baseline resume; weak per-JD targeting |
| **At-query AI** | LLM scores candidates against JD/question every generate | Heavier each run | Strong tailoring |
| **Hybrid** | Tags (or stage) narrow candidates → AI ranks for this ask | Middle | Usually best tradeoff |

**Not too heavy if scoped:** don’t score the whole graph every time — tag-filter to a shortlist (e.g. resume-tagged projects/roles), then LLM ranks top N for the JD. That’s one small call, not a full-graph audit.

**Settled:** **hybrid** — tags narrow candidates → AI ranks for this job description / app question. Not tags-only; not full-graph scoring every time.

### Explainability / graph view (product intent)

- Drafts cite source nodes (link back into the graph).
- **Aspirational capability:** Obsidian-style **graph view** (force-directed); when you tailor a resume/answer, relevant **endeavor** nodes **highlight**; inspect a node to see why it was chosen for that artifact. Skills / people / orgs are not canvas nodes (see [`surfaces-and-flows.md`](surfaces-and-flows.md)).
- Spec-level for now — layout/interaction details deferred to UX work.

---



## Artifact = view


| Artifact         | Rough query                                         | MVP? |
| ---------------- | --------------------------------------------------- | ---- |
| Resume           | Backend projects WITH metrics FOR Stripe internship | Yes  |
| Interview        | Leadership stories ORDER BY evidence strength       | Yes  |
| App question     | Answer this written prompt FROM graph (internship apps) | Yes |
| Essay ideas      | Growth-mindset stories MATCHING prompt (ideas only) | Parked |
| LinkedIn         | Turn today’s work into a post                       | Later |
| Personal website | Generate Projects page (maybe via MCP later)        | Post-MVP experiment |
| Promo / review   | Wins + metrics in review cycle                      | Later |


---



## Capture UX (hardest product problem)

**MVP: type-only.** Voice (Wispr-like or similar) comes after MVP.

### Cold start (settled direction): hybrid, non-blocking

```
Import resume / LinkedIn / GitHub / docs
        ↓
Extract skeleton graph (roles, projects, skills, orgs)
        ↓
Broad / light confirm pass  ← enough to enter the product
        ↓
User is unblocked (can generate views, browse graph)
        ↓
Deepen over time (not a gate): project + role deep-dives first
```

**Key insight:** people will upload the already-simplified artifacts. A resume bullet is a *distillation* of real work. The product is not “store the resume better” — it’s rebuild the **detailed evidence behind** it (what you actually built, tradeoffs, metrics, collaborators, failures, stories) so later views can re-distill for each ask.

**Onboarding must not block on depth.** One broad pass gets them in. They shore up gaps as they go (prompted, not forced). Detail is progressive, not a wall.

**Deepen nudges (settled):** always-on soft **Deepen backlog** (“stuff to fill” — thin projects/roles) pulled from Graph + just-in-time prompt when generating an adapter. JIT is skippable — never block export/draft on deepening. Not a notification center or Today home.

Imports = skeleton. Broad pass = usable entry. Deep-dives = muscle over time. Ongoing capture = compounding.

**MVP import sources:** resume + LinkedIn + GitHub.  
**Later:** full kitchen sink (docs, transcripts, READMEs, activity lists, Slack, calendar, email, etc.) **+ agent connectors** (Claude / other coding agents → **chat histories** so Acta can recover what the agent did for **specific features / projects** into capture → extract).

**Deepening priority (settled):** **project deep-dives + role deep-dives first.** Interview/STAR stories can often be extrapolated from rich project/role nodes; the reverse is weaker (a canned STAR rarely reconstructs the full project graph).

Directionally after MVP:

- Voice (Wispr-like or similar) — dump on the drive home
- Later: screenshots, git commits, calendar, Slack, email, meeting transcripts, GitHub — auto-linked
- Later: **agent chat-history connectors** (Claude / Cursor / etc.) for feature-level work threads

Pipeline sketch:

```
Capture → Chunk → Extract entities → Deduplicate → Build graph
      → Embeddings → Store provenance → Artifact generation
```

Richer than “RAG over journal entries.”

**Tension:** fully automatic extraction will be wrong often enough that a lightweight confirm/edit loop is probably required. “No manual tagging” is the goal, not a day-one guarantee.

---



## Competitive landscape (approximate)


| Slice                  | Examples                                 | Gap vs this                               |
| ---------------------- | ---------------------------------------- | ----------------------------------------- |
| Career corpus → resume | Praxis, Job Journal, Starry, career-hub  | Too work-shaped                           |
| Brag / performance     | Bragduck, LeveliU                        | Review-centric                            |
| College story → essays | Jengo                                    | Admissions-narrow; essay-writing focus    |
| HS activities trackers | AdmitPath, Extracurrify                  | Tracking/counseling, weak lifelong graph  |
| Personal wiki          | Memoral, PersonaVault, LLM-wiki patterns | Capture/organize; weak apply-to-ask layer |
| Job hunt ops           | Teal, Huntr                              | Thin personal memory                      |


**Open space:** ingest broad life material → durable self-graph → stage/purpose-aware relevance → grounded adapters (recruiting first).

---



## Moat hypothesis

The repository compounds. Six months in, the system knows projects, metrics, failures, lessons, interview stories. A competitor starting empty has none of that.

**Stronger framing (under discussion):** the moat is less “AI features” and more **switching cost of a filled, trusted self-graph**. Onboarding all info well is the critical path into that moat. Once the graph is rich, the product stays sticky because the *same* corpus applies across life stages (internship → new grad → promo → site → networking) via new adapters — you don’t re-enter your life into the next tool.

**Caveat / activation risk:** cold start is the flip side. Day-one empty vault kills activation. Import + guided capture quality determines whether the compounding moat ever starts.

**Backfill vs grow-with-you:** denser lives get more recombination value, but the strategic bet is *start when the past is still portably small* and compound forward — not “we’ll make importing a 15-year career feel easy.”

### “Not impressive enough” objection

Common pushback: “Does this have value if I don’t feel accomplished?” That’s usually **self-perception**, not an empty life.

**Settled framing:** both, sequenced —

- **Messaging for everyone:** you can extract more value from your experiences than you think (experiences ≠ only trophy wins).
- **Product reality:** denser, better-captured graphs get more recombination value. Acta doesn’t require feeling accomplished to start; it rewards building a real graph.

**Not a separate product feature:** “undersell detection” is **mostly messaging**. Deepen + relevance + broad corpus already surface what’s usable — no dedicated undersell-flagging system needed.

---



## Longer-term uses (same graph, later adapters)

- Annual self reviews / promo packets / performance reviews
- Recommendation letter drafts
- Personal website updates
- Networking follow-ups / “how do I know this person?”
- Scholarship / grant / fellowship applications (ideas → drafts carefully)
- Conference speaker bios / award nominations

Recruiting is the **wedge**, not the ceiling.

---



## Open questions



### Product / wedge

- [x] Exact first wedge: **college internship recruiting** (tech); new-grad is adjacency, not the wedge promise
- [x] First adapters: **tailored resume + interview stories + “answer this application question”** (grounded in graph; not a freeform essay product)
- [x] HS/college-app adjacency: **GTM silent** (internship recruiting only); **long-term vision** can say “built to grow with you” — never promise an essay product
- [x] Who pays: student vs parent is a weak distinction (same seat). Freemium lean settled in direction (see Monetization)
- [x] B2B: **maybe later** — don’t design for it now; keep multi-tenant / coach-share *lightly* in mind (don’t paint into a single-user corner)
- [x] Age / backfill: wedge justified partly because **porting gets harder with age** — don’t make large mid-career backfill a product goal
- [x] “Not impressive enough”: **messaging** = extract more value than you think; product already deepens/relevances — no dedicated undersell feature



### Relevance

- [x] **Intake-time LLM tagging** of likely applications / surfaces for each node
- [x] Runtime: **hybrid** — tags narrow the candidate set → AI ranks for this JD / app question
- [x] Users can **edit/override application tags** on node view / diff-skim; user overrides win
- [x] Explainability: **inline citations** linking draft bits back to graph nodes; aspiration = **graph view** (Obsidian-like) that highlights nodes used in a tailored artifact, with hover/detail for why chosen
- [x] Lifecycle: **soft archive / demote** (gray out, lower relevance — can resurface); **hard delete** available but rare (didn’t happen / don’t want association). “Stops being useful” is subjective — don’t auto-purge



### Trust / provenance

- [~] Claim gating modes (**medium** / **hard**): intentional later — don’t overbuild verification UX in MVP; still prefer graph-grounded generation, avoid inventing facts
- [x] Data home: **cloud** (web app primary; desktop possible later). Graph/files in **Supabase (Postgres)** — see `data-model.md`. Export still desirable.
- [x] Privacy: **private-by-design messaging** — encrypted in transit/at rest; **never train on your graph / never sell data**; export anytime. AI **does** read the graph to power the product (be honest about that). Not E2E for MVP (would block server-side AI).
- [x] Parent/counselor roles: **out of scope for now** — solo user; revisit with B2B/coach-share later



### Capture / cold start *(priority — gates the moat)*

- [x] Onboarding shape: **hybrid** — import → broad light pass → enter product; deepen over time (not a gate)
- [x] Core insight: resume/LinkedIn/GitHub are **distilled/simplified** views; product builds the richer evidence layer behind them
- [x] First deepening pass: **project + role deep-dives** (before dedicated interview-story mining); stories extrapolate from rich project/role nodes better than vice versa
- [x] Import priority — **MVP:** resume + LinkedIn + GitHub; **later:** kitchen sink + **agent chat-history connectors** (Claude / other agents → feature-level work) — **after classic MVP**, not parallel with capture+render
- [x] Agent connector timing — **after classic MVP only** (see [`surfaces-and-flows.md`](surfaces-and-flows.md))
- [x] 10-minute path ≈ import + **diff-skim confirm** (deep-dives post-entry)
- [x] Confirm/edit UX: **diff skim** — “Here’s what we found (roles/projects/skills). Looks right? → Enter” with inline fix; not per-entity accept theater
- [x] Deepen prompts: soft **Deepen backlog** (pull queue of thin items) + **just-in-time at generate** — JIT **skippable**, never a hard gate; not notifications/Today
- [x] Voice: **post-MVP** — type-only for MVP; voice (Wispr-like / dictation pipeline) after
- [x] Stickiness signal: **mix** — coverage skeleton (resume lines backed by deepened project/role nodes) **+** at least one real-world used artifact (tailored resume / app answer they actually submitted or reused)



### Data model

- [~] Provisional lean: **hybrid** — freeform = intake/provenance; entities extracted/linked from captures; adapters query entities. **Needs dedicated spec** (`data-model.md`) before locking
- [ ] Minimal entity schema for v1? → own spec
- [ ] Evidence linking: manual attach vs automatic from integrations? → own spec



### Generators / surfaces

- [x] Resume MVP: **in-app structured editor + PDF** (one solid template). Later: Jake’s LaTeX export, Markdown export, optional DOCX download
- [x] App-question adapter: **full paste-ready draft** (what people want); still graph-grounded — not unmoored generation
- [x] Personal site via MCP: **post-MVP experiment** — listed future adapter, not near-term commit
- [x] Essay ideas adapter: **park entirely** — don’t specify until/unless expanding beyond internship GTM



### Positioning / naming

- [x] Brand: **Acta** (Latin *acta* — deeds / record of what was done). Supersedes **Stilva** / **Stiva** (see Naming)
- [x] Category language (internal): **personal evidence graph**
- [ ] Domain / ccTLD — working name Acta; domain still TBD (naked `acta.*` crowded)

---



## Working decisions (settled so far)

1. This is a **personal evidence graph**, not one tool for one application type.
2. Scope includes **full personal history**, not only work performance.
3. **Wedge:** college **internship** tech recruiting (founder knowledge). New-grad = adjacency.
4. **Not** building a college essay writer; essay *ideas* may be okay later/narrow.
5. Relevance must be **ask- and stage-aware**, not only recency-based.
6. Artifacts are **views** over the graph.
7. Capture habit + provenance + relevance are more core than pretty generators.
8. Product should be useful for the founder **and** productizable for others.
9. **Moat thesis:** filled trusted graph + cross-stage reuse; onboarding quality is the on-ramp to stickiness.
10. **Cold start:** hybrid import → broad light pass → unblocked entry; deepen over time (not gated).
11. **Deepen first:** project + role deep-dives; interview stories derived/extrapolated from those when possible.
12. **MVP imports:** resume + LinkedIn + GitHub. Kitchen-sink ingest is the destination, not day-one scope.
13. **MVP adapters:** tailored resume + interview stories + answer-this-app-question (graph-grounded).
14. **Resume MVP surface:** in-app structured editor + PDF; Jake’s / MD / DOCX as later exports.
15. **App questions:** full paste-ready drafts (graph-grounded). Build what people want; provenance/grounding is the quality bar, not withholding the draft.
16. **Claim gating modes (medium/hard):** later — MVP stays graph-grounded without a full verification-mode system.
17. **Platform:** cloud-hosted graph; **web app** primary (desktop optional later). Backend: **Supabase (Postgres)** — see `data-model.md`.
18. **Monetization:** freemium mix — capture free / outputs paid + AI caps + integrations gated. Student/parent = same seat. Don’t gate basic graph capture.
19. **Free taste:** small bundle (≈1 resume + 2 app answers + 1 story pack); numbers tunable post-dogfood.
20. **MVP capture:** type-only; voice post-MVP.
21. **Deepen UX:** soft **Deepen backlog** (pull queue) + skippable JIT at generate; never hard-gate; not a notification center.
22. **Import confirm:** diff-skim of extracted skeleton + inline fix → enter product.
23. **Relevance:** intake application-tags + hybrid runtime (tag filter → rank for this JD/question).
24. **Tag overrides:** user-editable on node view / diff-skim; user wins over LLM tags.
25. **Explainability:** citations back to graph; graph-view highlight-on-tailor is a desired capability (UX later).
26. **Doc altitude:** product spec now; UI/UX/flows afterward.
27. **Lifecycle:** soft archive/demote by default (can resurface); hard delete rare/opt-in; no auto-purge for “outdated.”
28. **Data model:** provisional hybrid (captures → extract/link entities); **full schema TBD in `data-model.md`** — do not overfit product spec.
29. **Privacy:** market secure/private (no train/sell; export); AI reads graph by design; not E2E MVP.
30. **Positioning adjacency:** GTM = internship recruiting only; long-term vision = soft “grows with you”; never an essay-product promise.
31. **B2B:** maybe later; light multi-tenant/coach-share awareness only — not a current design driver.
32. **Stickiness:** coverage skeleton + ≥1 real-world used artifact.
33. **Sharing:** solo user for now; parent/counselor out of scope until later.
34. **Personal site / MCP:** post-MVP experiment / future adapter — not a near-term commit.
35. **Essay ideas:** parked — unspecified until post-internship expansion (if ever).
36. **Brand:** **Acta** (Latin *acta* — deeds / record of what was done). Working lock 2026-07-14; domain/trademark still TBD. **Stilva** / **Stiva** superseded.
37. **Wedge / backfill:** college internship stage partly because past is still portably small; **not** solving large mid-career full-life backfill as the point.
38. **“Not impressive enough”:** messaging = you can extract more value from experiences than you think; denser graphs still get more value underneath. Undersell handling = existing deepen/relevance/corpus — **not** a separate feature.

---



## Naming

Internal category: **personal evidence graph**.

**Working brand (locked for now): Acta** — Latin *acta* (deeds / acts / the record of what was done). Pronunciation: **AK-tuh**. Passes “update my Acta” / “look at my Acta.” Practical, evidence-shaped; not life-root or dreamy distill branding. Tagline deferred (audience-specific).

**Why Acta (2026-07-14):**  
- Meaning fit: record of deeds ↔ personal evidence graph  
- Mouthfeel: short, clean, college-peer sayable  
- Tradeoff accepted: mid-high name crowding (academic *Acta …* journals; several SaaS Actas including [acta.ai](https://acta.ai/) meeting notes) — better than naked **Atlas**, clearer than **Stele** pronunciation, stronger meaning than **Ariadne**  
- Domain: naked `acta.*` largely taken; qualifier / compound domain TBD  
- **Not a legal clearance** — trademark/domain counsel before shipping

**Finalist compare (U-A naming pass):**

| Name | Meaning | Sayability | Crowd | Notes |
| --- | --- | --- | --- | --- |
| **Acta** | Excellent (deeds/record) | Excellent | Mid-high | **Working lock** |
| **Atlas** | Best metaphor (map + titan) | Excellent | Worst | Loved; cut on Atlassian/Mongo/SEO |
| **Stele** | Excellent (inscribed record) | Weak (steel/steal) | Mid | Cool meaning; pronunciation tax |
| **Ariadne** | Weak (thread/maze) | Mid (long) | Mid | Sound-liked; thin product tie |
| **Stilva** | Forced blend | Awkward | Low | Cut — mouthfeel + unclear vita |

### Superseded: Stilva / Stiva (“distill a life”)

Earlier working brand **Stilva** (still × vita) and soft candidate **Stiva** — locked 2026-07-09, cut 2026-07-14. Research (Stiva vs Stilva collisions, stevia/silva traps) kept only as history in the changelog. Project folder may still be `Stilva/` until renamed.

### Brand taste (carry forward into U-A visual)

- Oblique-iconic names were tried (Slack/Obsidian pattern); nothing stuck — product-adjacent Latin/Greek won  
- Prefer practical tool energy over wellness / “life” poetry  
- Visual system (**U-A** remainder) still open

---

## Monetization (under discussion)

**Payer:** student vs parent doesn’t matter much — one seat, whoever pays. B2B (career services) is later.

**Model lean:** freemium. Free must still deliver the compounding graph (that’s the moat on-ramp). Premium sells leverage on top of a filled graph — not hostage-taking of basic capture.

### Candidate free vs premium axes

| Axis | Free (possible) | Premium (possible) | Risk |
| --- | --- | --- | --- |
| **Capture / graph** | Import + broad pass + ongoing type capture; limited nodes or depth prompts | Unlimited graph, deeper interview passes, voice | Gating the graph kills the moat |
| **Adapters / outputs** | 1 baseline resume; limited app-question drafts / mo | Unlimited tailored resumes, stories packs, app answers | Classic SaaS; easy to understand |
| **Tailoring depth** | Generic resume from graph | JD-specific tailoring (paste posting → targeted view) | JD-tailoring is core wedge value — maybe don’t bury it |
| **Exports** | PDF from in-app editor | Jake’s LaTeX, MD, DOCX, bulk export | Weak alone; good add-on |
| **Integrations** | Manual import only | GitHub sync, LinkedIn refresh, kitchen-sink ingest | Aligns with “kitchen sink later” |
| **AI volume** | Soft caps on generations | Higher limits / priority | Commodity; race to bottom |
| **Season pass** | Free year-round light use | “Recruiting season” unlock (Aug–Mar) | Matches internship calendar |
| **Collaboration** | Solo | Share graph slice with mentor/career coach | Nice later; not MVP |

**Design tension:** free needs enough graph + one “holy shit” output or nobody stays; premium needs a reason to pay that isn’t “we held your life hostage.”

**Settled freemium spine (mix):**

1. **Capture free / output paid** — unlimited (or generous) graph building on free; adapters are where money lives  
2. **Outputs** — free gets limited baseline outputs; premium unlocks fuller adapter suite / more tailored artifacts  
3. **AI caps** — soft generation limits on free; higher/unlimited on premium  
4. **Integrations** — manual import on free; sync / kitchen-sink / richer ingest on premium  

**Free taste (settled direction):** small free bundle so users feel the product before paying — e.g. **1 tailored resume + 2 app-question drafts + 1 interview story pack**, then paywall. Exact numbers tunable after dogfooding.

| Layer | Free | Premium |
| --- | --- | --- |
| Graph / capture | Build & deepen freely (type, broad pass, deep-dives) | Same + voice / richer capture later |
| Outputs | Small bundle (≈1 resume + 2 app answers + 1 story pack) | Full adapter suite, unlimited / high caps |
| AI volume | Soft generation caps (aligned with bundle) | Higher / unlimited |
| Integrations | Manual resume + LinkedIn + GitHub upload | Sync / refresh / kitchen-sink ingest |

---

## Resume surfaces (under discussion)

**Mental model:** source of truth is the **graph**, not a .tex / .md / .docx file. Those are export/edit views.

| Surface | What it is | Pros for internship wedge | Cons |
| --- | --- | --- | --- |
| Structured in-app editor | Edit sections/bullets in UI; graph stays canonical | Best “editable doc” feel without fighting Word; enforces grounding | Need to build the editor |
| DOCX | WYSIWYG Word-like file | Familiar final tweak/submit path | Different paradigm; round-trip sync to graph is hard |
| Markdown | Source → render (simple) | Easy, portable, agent-friendly | Weak classic 1-page resume layout unless templated carefully |
| LaTeX (e.g. Jake's Resume) | Source → render (layout-powerful) | Huge among SWE students; looks “real” | Brittle compile; scarier raw edit UX |

**MD vs LaTeX:** same *category* (code-ish source that renders), very different *power and culture*. Markdown is content-first; Jake’s LaTeX is layout/ATS-aesthetic-first and a known template people already use. DOCX is not in that category — it’s direct visual editing.

**Likely architecture:** graph → structured resume model → exporters (PDF via MD and/or Jake’s LaTeX; optional DOCX download). Prefer editing the structured model in-app over making users live in raw .tex.

**Settled MVP:** in-app structured editor + PDF (one solid template). Graph stays canonical; user edits sections/bullets in product.

**Later exports:** Jake’s LaTeX, Markdown, optional DOCX download for final tweak/submit.

---

## Next thinking threads

- ~~Pressure-test / lock wedge~~ → college internship recruiting
- ~~Backfill / “not impressive enough”~~ → wedge justification + messaging (not separate features)
- ~~Dedicated data-model spec~~ → `data-model.md` v1 draft
- ~~IA + core flows~~ → [`surfaces-and-flows.md`](surfaces-and-flows.md) locked
- ~~Agent write policy (**U-D**)~~ → [`agent-interaction-model.md`](agent-interaction-model.md) locked
- **Next:** brand visual system (**U-A**) in [`brand-design-system.md`](brand-design-system.md) → technical implementation plan (**U-J**) → **capture + render** → **U-E** — see [`building-plan.md`](building-plan.md)
- Remaining light product Qs: domain for **Acta**

---

## Changelog

- **2026-07-14:** Working brand → **Acta** (Latin *acta* — deeds/record). Cut **Stilva**. Finalists: Atlas, Stele, Ariadne. Domain TBD. **U-A** scaffold → [`brand-design-system.md`](brand-design-system.md).
- **2026-07-13:** **U-D locked.** **U-J** (technical implementation plan) added to roadmap. Next = **U-A**.
- **2026-07-13:** Building-plan units = **U-A…U-J**. Deepen backlog.
- **2026-07-13:** Deepen UX = **backlog panel** (“stuff to fill”), not notifications/Today — see [`surfaces-and-flows.md`](surfaces-and-flows.md).
- **2026-07-13:** Agent interaction model (**U-D**) drafted for co-design in [`agent-interaction-model.md`](agent-interaction-model.md).
- **2026-07-13:** Agent connectors locked to **after classic MVP** (resume/LinkedIn/GitHub first). Surfaces IA open questions for Graph home resolved.
- **2026-07-10:** Build roadmap spun out to `building-plan.md` (brand/IA/flows/agents/auth next; adapter polish later).
- **2026-07-10:** Platform storage settled as **Supabase/Postgres** (data-model implementation).
- **2026-07-10:** Wedge partly justified by backfill tractability (don’t solve mid-career full-life port as a goal). “Not impressive enough” → messaging (extract more than you think) + existing deepen/relevance; no dedicated undersell feature.
- **2026-07-09:** Initial capture from ideation conversation (vision, graph model, relevance, landscape, open questions, out-of-scope essay writer).
- **2026-07-09:** Locked wedge to college internship recruiting; elevated onboarding as moat on-ramp; started open-question ideation.
- **2026-07-09:** Settled hybrid cold start; resume/LinkedIn as distilled views — product deepens the evidence behind them.
- **2026-07-09:** Deepening is post-onboarding / progressive; prioritize project+role deep-dives over STAR mining.
- **2026-07-09:** MVP imports = resume + LinkedIn + GitHub; kitchen sink later.
- **2026-07-09:** MVP adapters = tailored resume + interview stories + answer-this-app-question.
- **2026-07-09:** Clarified resume surfaces: graph canonical; MD≈LaTeX category but different power; DOCX separate; Jake’s as target export.
- **2026-07-09:** Resume MVP = in-app structured editor + PDF; Jake’s/MD/DOCX later.
- **2026-07-09:** App-question MVP = full paste-ready draft, graph-grounded.
- **2026-07-09:** Claim gating medium/hard modes deferred to later; MVP = grounded generation without mode system.
- **2026-07-09:** Platform = cloud graph + web app (Firebase-class); desktop optional later.
- **2026-07-09:** Monetization: freemium lean; student/parent weak distinction; free/premium axes listed, unsettled.
- **2026-07-09:** Freemium spine = capture free / outputs paid + AI caps + integrations gated.
- **2026-07-09:** Free taste = small bundle (≈1 resume + 2 app answers + 1 story pack).
- **2026-07-09:** MVP capture = type-only; voice after.
- **2026-07-09:** Deepen nudges = soft checklist + skippable JIT; never hard-gate.
- **2026-07-09:** Import confirm = diff-skim + inline fix → enter.
- **2026-07-09:** Relevance direction: LLM application-tags at intake; clarified JD/prompt matching vs tags; runtime combo still open.
- **2026-07-09:** Relevance runtime = hybrid (tags narrow → AI ranks for JD/question).
- **2026-07-09:** Application tags user-editable; overrides win.
- **2026-07-09:** Explainability = citations + aspirational graph-view highlight; doc is product-spec altitude (UX later).
- **2026-07-09:** Lifecycle = soft archive/demote (can resurface); hard delete rare; no auto-purge.
- **2026-07-09:** Data model = provisional hybrid (captures → entities); spun out `data-model.md` for real schema work.
- **2026-07-09:** Privacy = private-by-design messaging; AI reads graph; no E2E MVP.
- **2026-07-09:** HS/college adjacency = GTM silent (internship only); vision soft “grows with you”; no essay product.
- **2026-07-09:** B2B = maybe later; light coach-share awareness only.
- **2026-07-09:** Stickiness = coverage skeleton + ≥1 used artifact.
- **2026-07-09:** Parent/counselor sharing = out of scope for now (solo).
- **2026-07-09:** Personal site/MCP = post-MVP experiment, not near-term.
- **2026-07-09:** Essay ideas adapter = parked entirely for now.
- **2026-07-09:** Brand name locked as **Stiva** (still × vita); domain TBD.
- **2026-07-09:** Stiva softened — meaning stays “distill a life”; vita under-signaled; iterating blends.
- **2026-07-09:** Marketability scan Stiva vs Stilva — Stilva edges on collisions/meaning; Stiva wins mouthfeel but crowded (`stiva.app`, etc.).
- **2026-07-09:** Working brand locked as **Stilva** (still × vita / distill a life). Stiva was soft candidate; Stilva chosen for marketability + meaning. Project folder renamed to Stilva. Domain still TBD.

