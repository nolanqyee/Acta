# Acta — Product Handoff

**Temporary copy doc.** Synthesized from planning specs (`docs/personal-evidence-graph.md`, `docs/surfaces-and-flows.md`, `docs/data-model.md`, `docs/agent-interaction-model.md`). Describes what Acta is **planned to be**, not what is built today.

**Brand:** Acta (Latin *acta*, pronounced AK-tuh: the record of what was done).  
**Category (internal):** personal evidence graph.

---

## One-liner

One connected record of everything you've done. Add as you go. When someone asks what you've accomplished, the stories are ready to tell.

---

## What Acta is

Acta is a personal record that grows with you. You capture what you have done over time: jobs, projects, classes, leadership, creative work, volunteering, side quests, failures, lessons, the details that fade. Acta organizes that material into a connected graph you can explore, deepen, and draw on whenever you need to show who you are and what you have built.

Outputs like résumés, interview answers, and application responses are **views** over the same record. They are not separate documents you rewrite from scratch every time. The record compounds. The more you add, the more useful it gets.

Acta is **not** a résumé builder. It is **not** a college essay writer. It is the durable layer underneath those asks.

---

## The core insight

Most career tools start at the artifact:

> Job posting, then generate a résumé.

Acta starts at the person:

> Life, then capture, then organize, then understand, then generate whatever you are asked for next.

Your résumé, LinkedIn, and old application answers are already **distillations** of real work. They leave out the evidence: what you actually built, the tradeoffs, the metrics, the collaborators, the stories behind a bullet. Acta rebuilds that richer layer so you can re-distill for each new ask instead of guessing from memory.

---

## Who it is for

**Go-to-market wedge:** college students recruiting for tech internships. The founder is in that process. The past is still small enough to backfill, and the value is immediate.

**Near-term adjacency:** new grads recruiting for full-time roles (same graph, different relevance rules).

**Long-term vision:** the same record grows with you across life stages. High school and college applications, performance reviews, promo packets, speaker bios, personal sites. Different outputs, one corpus. The product does not promise to solve importing decades of mid-career history in one heroic session. The bet is: start when the past is still portably small, then compound forward.

**Who pays:** one seat per user. Student vs parent is not a meaningful product split.

---

## What goes in the record

Anything that makes you *you*, not just trophy wins:

- Jobs and internships
- Personal and course projects
- Classes and degrees
- Leadership roles (clubs, teams, orgs)
- Hackathons, competitions, fellowships
- Creative work (art, music, writing, film)
- Research and publications
- Volunteering and service
- Hobbies and crafts
- Failures, lessons, values
- People, teams, organizations
- Metrics and proof (links, docs, commits, screenshots)

Performance reviews and brag docs are one use case among many, not the center of gravity.

---

## How it works

### 1. Capture

You add material in plain language or by pointing at where it already lives.

- **Type a note:** "Shipped the billing webhook refactor at Bubble last week. No duplicate charges since."
- **Import:** résumé, LinkedIn, GitHub (MVP). Later: docs, calendars, email, Slack, folders, agent chat histories, and more.

MVP capture is **type-only**. Voice comes after MVP.

### 2. Extract and review

Acta reads what you captured and proposes structured entries: roles, projects, achievements, skills, people, metrics, links between them. You see a clear summary of what it wants to add or change. Nothing writes to your record until you confirm. You can fix inline before approving.

This is intentional. Fully automatic extraction will be wrong often enough that you stay in the loop. The goal is no manual tagging taxonomy to invent before you can write anything down, not zero human review.

### 3. Build the graph

Confirmed entries become **endeavors** on a visual graph: roles, projects, courses, degrees, events, leadership positions, creative works, volunteering, hobbies. They connect to each other (a hackathon project under the hackathon event, a course project under your degree, a side project under an internship role).

Skills, people, and organizations live in the data but are not drawn as floating nodes on the canvas. You find them through filters, search, and node detail. The graph stays readable.

You explore the graph by panning, zooming, asking natural-language questions ("what have I done with Redis?"), and filtering by kind or by specific skill, person, or org.

### 4. Deepen over time

Onboarding does **not** block on depth. A broad first pass gets you in. Over time, Acta surfaces thin entries worth filling in: projects and roles first, then the rest. A soft backlog shows what could use more detail. Optional prompts appear when you generate an output and something is thin. You can always skip. Nothing hard-gates export on finishing the backlog.

The insight: rich project and role nodes are the foundation. Interview stories and STAR narratives are often extrapolated from those. The reverse is weaker.

### 5. Tell your story

When you need an output, you pick an adapter: tailored résumé, interview story pack, application question answer. You can paste a job description or the exact question. Acta picks the most relevant material from your record, ranks it for **this** ask, and drafts grounded text with citations back to your entries. You edit, copy, or export.

**Stories** are a first-class concept. They are synthesized narratives (draft, then user-stamped when approved) built from your facts. Adapters prefer stamped stories when they exist.

---

## Why the graph matters

A résumé is a single flattened view. It cannot hold four years of coursework, the seminar that inspired a hackathon project, the metric you recorded when it was fresh, or why two unrelated things connect.

Acta keeps that structure:

- A degree is not one bullet. It is a container for courses and projects that produced things.
- A project is not a line item. It is an outcome you measured, linked to the role or event it came from.
- A weekend hackathon sits one link away from the course that gave you the idea.

When you tailor output for a specific job or question, the relevant entries light up on the graph. You can see **why** something was chosen, not just read the draft.

---

## Relevance: the other key insight

Relevance is **contextual**, not just "most recent."

Example: high-school robotics captaincy might be:

| Ask | Relevance |
| --- | --- |
| College essay about how you got into engineering | High |
| New-grad SWE résumé | Low or omit |
| Interview: tell me about leadership | Maybe |
| Teaching or mentorship narrative years later | High again |

Acta tags entries at intake with which surfaces they are generally good for (internship résumé, interview story, application answer, LinkedIn, personal site, keep personal). You can override any tag.

At generate time, tags narrow the candidate set. A separate ranker matches **this** job description or **this** application question. Both projects might be résumé-worthy; a backend internship posting boosts the caching project over the iOS habit app.

---

## Planned outputs (adapters)

Artifacts are views over the graph, not separate source-of-truth documents.

| Output | What it does | MVP? |
| --- | --- | --- |
| Tailored résumé | Ranked projects and roles with metrics for a specific ask or posting | Yes |
| Interview stories | Leadership and behavioral stories ordered by evidence strength | Yes |
| Application question | Full paste-ready answer grounded in your record | Yes |
| LinkedIn post | Turn recent work into a post | Later |
| Personal site | Generate a projects page | Post-MVP experiment |
| Essay ideas | Story matches for a prompt, ideas only | Parked |
| Promo / review packet | Wins and metrics for a review cycle | Later |

**Résumé MVP:** in-app structured editor plus PDF export. LaTeX (Jake's template), Markdown, and DOCX are later export paths. The graph stays canonical; files are exports.

---

## The app experience (planned)

**Home is the graph.** Full-bleed, force-directed canvas. All controls overlay it. There is no "Today" inbox or notification center.

**Primary surfaces:**

| Surface | Job |
| --- | --- |
| Graph home | See, navigate, and explore your record |
| Node detail | Read and edit one entry |
| Capture | Type a note, review proposed changes |
| Explore | Natural-language search with ranked results |
| Deepen backlog | Pull queue of thin entries worth filling |
| Generate | Pick an output type and draft from your record |
| Settings | Account, connectors, export |

**Core loop:** capture or import, review proposed changes, confirm, see nodes appear on the graph, deepen when you want, generate when you need an output.

**Trust model:** Acta does not silently rewrite your record. Structural changes from AI require your confirm. Explore and search are read-only. Adapters must cite your entries and must not invent facts not in the record. User edits always win.

---

## Cold start (planned onboarding)

1. Import résumé, LinkedIn, and/or GitHub (MVP sources).
2. Acta extracts a skeleton graph: roles, projects, skills, orgs.
3. You skim a summary, fix inline, confirm.
4. You land on the graph with a usable starting point.
5. You deepen over time. Never blocked on finishing depth first.

Partial import is fine. Thin graph is fine. The product rewards building the habit, not perfection on day one.

**Messaging for "I don't have impressive stuff":** you can extract more value from your experiences than you think. Acta does not require feeling accomplished to start. Denser, better-captured records get more recombination value over time.

---

## What Acta is not

- A college essay writer (essay *ideas* grounded in your record may come much later, narrowly)
- "Just" a performance review or brag doc tool
- A tool whose primary job is importing 15 years of mid-career history in one shot
- A separate document store where résumé v7.docx is the source of truth
- A notification-driven daily habit app

---

## Privacy and data

- Cloud-hosted personal graph (web app primary)
- Private by design: encrypted in transit and at rest, never train on your graph, never sell your data, export anytime
- AI reads your graph to power capture, search, and generation. That is the product. End-to-end encryption is not MVP (it would block server-side AI)
- Solo user for now. Parent, counselor, or coach sharing is out of scope until later

---

## Business model (planned)

Freemium. **Capture and graph building stay free.** That is the on-ramp to the moat: a filled, trusted record.

Premium sells leverage on top:

- More outputs and tailored generations
- Higher AI volume
- Richer integrations (sync, refresh, kitchen-sink import)

**Free taste (direction):** roughly one tailored résumé, two application answers, and one interview story pack, then paywall. Exact numbers tunable after dogfooding.

---

## Competitive positioning

| Existing category | Gap Acta fills |
| --- | --- |
| Career corpus to résumé tools | Too work-shaped, thin memory |
| Brag doc / performance tools | Review-centric, not lifelong |
| College essay tools | Admissions-narrow, essay-writing focus |
| Activity trackers for students | Tracking without a durable apply layer |
| Personal wikis | Capture and organize, weak "answer this ask" layer |
| Job hunt ops (Teal, Huntr) | Pipeline tracking, not a personal evidence graph |

**Open space:** ingest broad life material, build a durable self-graph, score relevance by stage and ask, generate grounded outputs. Recruiting is the wedge, not the ceiling.

---

## Moat thesis

The record compounds. Six months in, the system knows your projects, metrics, failures, lessons, and interview stories. A competitor starting empty has none of that.

The moat is less "AI features" and more **switching cost of a filled, trusted personal record**. Onboard well once. Keep using across life stages as the outputs you need change. You do not re-enter your life into the next tool.

Cold start is the flip side. Empty vault kills activation. Import quality and guided capture determine whether compounding ever starts.

---

## Build phases (planned, not current state)

**MVP**

- Type capture
- Import: résumé, LinkedIn, GitHub
- Extract with confirm/review step
- Visual graph of endeavors
- Natural-language explore
- Deepen backlog (soft, skippable)
- Adapters: tailored résumé, interview stories, application question
- In-app résumé editor plus PDF

**After MVP**

- Voice capture
- Kitchen-sink imports (docs, calendar, email, Slack, folders)
- Agent chat-history connectors (recover what you built with Claude, Cursor, etc.)
- LinkedIn post adapter
- Richer citation and provenance UX
- LaTeX, Markdown, DOCX export
- Personal site via MCP (experiment)

**Explicitly parked**

- Full college essay generation
- B2B / coach seats (maybe later)
- Large mid-career backfill as a primary product promise

---

## Example end-to-end

**You capture:**

> Today I implemented Redis caching. Had to debug a race condition. Lock wasn't scoped correctly. Reduced latency about 60%.

**Acta proposes:**

| Field | Value |
| --- | --- |
| Project | Bubble CRM App |
| Skills | Redis, caching, concurrency |
| Competencies | Debugging, performance optimization |
| Evidence | ~60% latency reduction |
| Story | STAR-ready narrative |

**Later you ask:**

- Résumé emphasizing backend engineering for a specific internship posting
- "Tell me about a time I disagreed with a teammate"
- Three stories showing ownership
- A written application question pasted verbatim

Same record. Different views. Grounded in what you actually recorded.

---

## Voice and copy principles

- Lead with **value**, not mechanics (stories ready to tell, not "graph" or "import pipeline")
- **General audience** language on the landing and in onboarding. Dev jargon belongs in docs, not hero copy.
- Acta holds your **full life**, not just employment
- Outputs are **views**, not the product itself. The record is the product.
- No inline arrow glyphs or em dashes in user-facing copy (repo copy-style rule)

---

## Canonical docs (source of truth)

| Doc | Owns |
| --- | --- |
| `docs/personal-evidence-graph.md` | Product vision, wedge, adapters, relevance, monetization |
| `docs/data-model.md` | Schema, entities, edges, provenance |
| `docs/surfaces-and-flows.md` | App IA, surfaces, core flows |
| `docs/agent-interaction-model.md` | AI write policy, confirm vs auto, proposals |
| `docs/building-plan.md` | Build roadmap (units U-A through U-J) |
| `docs/design-handoff.md` | What is on screen today (pixels, not planned behavior) |

---

*Generated 2026-08-04 for temporary external copy handoff. Delete or archive when no longer needed.*
