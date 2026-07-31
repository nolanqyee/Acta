/**
 * @fileoverview Marketing landing page for Acta — the waitlist surface built from
 * the Claude Design import. Renders hero graph, how-it-works, importers, endeavor
 * kind cards, old-vs-new comparison, output adapters, and footer CTA. Client-side
 * only for the headline word-cycle animation; section navigation uses anime.js
 * slide transitions when motion is allowed, otherwise native scroll + anchors.
 */

"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import { HeroGraphCanvas } from "./hero-graph-canvas";
import { LANDING_SLIDE_IDS } from "./landing-scroll";
import styles from "./landing-page.module.css";
import { useLandingScroll } from "./use-landing-scroll";

/** Cycling headline verbs — first word is the static fallback at rest. */
const CYCLE_WORDS = ["connects", "compounds", "aligns"] as const;

/** Marquee band labels — duplicated at render for optional scroll animation. */
const MARQUEE_WORDS = [
  "Projects",
  "Roles",
  "Courses",
  "Credentials",
  "Events",
  "Crafts",
  "Artifacts",
  "Volunteering",
  "Side things",
  "Research",
  "Gigs",
  "Internships",
  "Teaching",
  "Competitions",
  "Fellowships",
  "Standing commitments",
] as const;

/** Importer chip rows — duplicated per row for bleed-off-edge effect. */
const STREAM_ROW_A = [
  "GitHub", "Google Drive", "Notion", "Gmail", "Google Calendar",
  "Figma", "Slack", "Obsidian",
] as const;

const STREAM_ROW_B = [
  "Linear", "Dropbox", "Overleaf", "Outlook", "Canvas LMS",
  "GitLab", "Google Slides", "Apple Notes",
] as const;

/** One diff row in the review panels. */
interface DiffRowData {
  op: "NEW" | "EDIT";
  title: string;
  detail: string;
}

/**
 * Animated cycling word in the hero headline. Falls back to the first word when
 * reduced motion is preferred or before hydration.
 *
 * @returns The highlighted verb fragment with a blinking caret.
 */
function CycleWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charLen, setCharLen] = useState(CYCLE_WORDS[0].length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const word = CYCLE_WORDS[wordIndex] ?? CYCLE_WORDS[0];
    let wait = 90;

    if (!deleting) {
      if (charLen < word.length) {
        wait = 90;
      } else {
        wait = 2000;
      }
    } else if (charLen > 0) {
      wait = 45;
    } else {
      wait = 260;
    }

    const timer = window.setTimeout(() => {
      if (!deleting) {
        if (charLen < word.length) {
          setCharLen((n) => n + 1);
        } else {
          setDeleting(true);
        }
      } else if (charLen > 0) {
        setCharLen((n) => n - 1);
      } else {
        setWordIndex((i) => (i + 1) % CYCLE_WORDS.length);
        setDeleting(false);
      }
    }, wait);

    return () => window.clearTimeout(timer);
  }, [wordIndex, charLen, deleting]);

  const display = (CYCLE_WORDS[wordIndex] ?? CYCLE_WORDS[0]).slice(0, charLen);

  return (
    <span className={styles.cycleHighlight}>
      {display}
      <span className={styles.caret} aria-hidden="true" />
      .
    </span>
  );
}

/**
 * Renders a proposed-change row (NEW or EDIT) in review panels.
 *
 * @param props.op - Operation stamp shown in the left gutter.
 * @param props.title - Endeavor title.
 * @param props.detail - Secondary line (kind, date, link summary).
 * @returns A bordered diff row card.
 */
function DiffRow({ op, title, detail }: DiffRowData) {
  return (
    <div className={styles.diffRow}>
      <div
        className={
          op === "NEW"
            ? `${styles.diffOp} ${styles.diffOpNew}`
            : `${styles.diffOp} ${styles.diffOpEdit}`
        }
      >
        {op}
      </div>
      <div className={styles.diffContent}>
        <div className={styles.diffTitle}>{title}</div>
        <div className={styles.diffDetail}>{detail}</div>
      </div>
    </div>
  );
}

/**
 * Placeholder drop slot for a third-party logo or photo asset.
 *
 * @param props.label - Short label shown inside the slot.
 * @param props.variant - Circle (importer chip) or rect (kind card photo).
 * @returns A labeled placeholder box.
 */
function DropSlot({
  label,
  variant,
}: {
  label: string;
  variant: "circle" | "rect";
}) {
  return (
    <div
      className={
        variant === "circle"
          ? `${styles.dropSlot} ${styles.dropSlotCircle}`
          : `${styles.dropSlot} ${styles.dropSlotRect}`
      }
      aria-label={`Image slot: ${label}`}
    >
      {label}
    </div>
  );
}

/**
 * Renders one horizontal stream of importer chips with infinite scroll.
 *
 * @param props.names - Importer labels for this row.
 * @param props.reverse - When true, scrolls right instead of left.
 * @returns An infinitely scrolling chip row.
 */
function ImporterStream({
  names,
  reverse = false,
}: {
  names: readonly string[];
  reverse?: boolean;
}) {
  const items = [...names, ...names];

  return (
    <div
      className={styles.streamRow}
      data-enter={reverse ? "stream-right" : "stream-left"}
      data-enter-delay={reverse ? "1" : "0"}
    >
      <div
        className={
          reverse
            ? `${styles.streamTrack} ${styles.streamTrackReverse}`
            : `${styles.streamTrack} ${styles.streamTrackForward}`
        }
      >
        {items.map((name, i) => (
          <div key={`${name}-${i}`} className={styles.streamChip}>
            <DropSlot label="logo" variant="circle" />
            <span className={styles.streamName}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Decorative résumé document — the "old way" visual in the compare slide.
 *
 * @returns A cramped standalone-doc mockup.
 */
function CompareResumeVisual() {
  return (
    <div className={styles.compareVisual} aria-hidden="true">
      <div className={styles.resumeDoc}>
        <div className={styles.resumeToolbar}>
          <span className={styles.resumeToolbarDot} />
          <span className={styles.resumeToolbarDot} />
          <span className={styles.resumeToolbarDot} />
          <span className={styles.resumeFilename}>Résumé_final_v7.docx</span>
        </div>
        <div className={styles.resumeBody}>
          <div className={styles.resumeLine} style={{ width: "42%" }} />
          <div className={styles.resumeLine} style={{ width: "68%" }} />
          <div className={styles.resumeLineMuted} style={{ width: "88%" }} />
          <div className={styles.resumeLineMuted} style={{ width: "76%" }} />
          <div className={styles.resumeLineMuted} style={{ width: "82%" }} />
          <div className={styles.resumeLineMuted} style={{ width: "54%" }} />
          <p className={styles.resumeCut}>…side projects cut for space</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Decorative mini graph — the "new way" visual in the compare slide.
 *
 * @returns A linked node constellation mockup.
 */
function CompareGraphVisual() {
  return (
    <div className={`${styles.compareVisual} ${styles.compareVisualGraph}`} aria-hidden="true">
      <svg className={styles.graphEdges} viewBox="0 0 280 160" preserveAspectRatio="none">
        <line x1="72" y1="48" x2="148" y2="36" />
        <line x1="148" y1="36" x2="214" y2="72" />
        <line x1="72" y1="48" x2="96" y2="112" />
        <line x1="96" y1="112" x2="188" y2="124" />
        <line x1="214" y1="72" x2="188" y2="124" />
        <line x1="148" y1="36" x2="188" y2="124" />
      </svg>
      <span className={`${styles.graphNode} ${styles.graphNodeRole}`}>Role</span>
      <span className={`${styles.graphNode} ${styles.graphNodeProject}`}>Project</span>
      <span className={`${styles.graphNode} ${styles.graphNodeCourse}`}>Course</span>
      <span className={`${styles.graphNode} ${styles.graphNodeEvent}`}>Event</span>
      <span className={`${styles.graphNode} ${styles.graphNodeOutcome}`}>Outcome</span>
    </div>
  );
}

/**
 * Full marketing landing page — all sections from the Claude Design import.
 *
 * @returns The complete landing page markup.
 */
export function LandingPage() {
  const reducedMotion = useReducedMotion();
  const { trackRef, setSlideRef, activeIndex, slideMode, onNavClick } =
    useLandingScroll(reducedMotion);

  const reviewDiff: DiffRowData[] = [
    { op: "NEW", title: "Billing webhook refactor", detail: "Project · Aug 2024" },
    { op: "EDIT", title: "SWE Intern, Bubble", detail: "adds link → refactor" },
    { op: "EDIT", title: "Redis", detail: "facet count 6 → 7" },
  ];

  const captureSources = [
    { label: "Voice note", accent: false },
    { label: "Type it", accent: false },
    { label: "Paste", accent: false },
    { label: "Local folder", accent: true },
    { label: "GitHub", accent: true },
    { label: "Email", accent: true },
    { label: "Calendar", accent: true },
  ] as const;

  const askHits = [
    { title: "Redis caching layer", score: "0.94" },
    { title: "SWE Intern, Bubble", score: "0.81" },
    { title: "Graph embedding study", score: "0.61" },
  ] as const;

  const readout = [
    { k: "Outcome", v: "Transit data prize" },
    { k: "Stack", v: "React · TS · IDB" },
    { k: "Logged since", v: "412 km" },
  ] as const;

  const registrar = [
    { k: "Code", v: "CS 378" },
    { k: "Grade", v: "A" },
    { k: "Produced", v: "Trailmap" },
  ] as const;

  const oldWay = [
    "Rewritten from memory every time you apply.",
    "Side projects get cut for space, then forgotten.",
  ] as const;

  const newWay = [
    "Capture once in the words you'd use out loud.",
    "Every link and outcome stays in the graph.",
  ] as const;

  const adapters = [
    { n: "01", title: "Résumé", body: "Pick the endeavors, get a page that cites real outcomes." },
    { n: "02", title: "LinkedIn bio", body: "Shorter, warmer, same underlying record." },
    { n: "03", title: "Cover letter", body: "Aimed at one posting, drawn from what fits it." },
    { n: "04", title: "Brag doc", body: "For review season. Everything you shipped, dated." },
  ] as const;

  const marqueeItems = [...MARQUEE_WORDS, ...MARQUEE_WORDS];

  return (
    <div className={styles.page} data-slide-mode={slideMode || undefined}>
      {slideMode ? (
        <div className={styles.slideRail} aria-hidden="true">
          {LANDING_SLIDE_IDS.map((id, index) => (
            <span
              key={id}
              className={
                index === activeIndex
                  ? `${styles.slideDot} ${styles.slideDotActive}`
                  : styles.slideDot
              }
            />
          ))}
        </div>
      ) : null}

      <div className={styles.slideViewport}>
        <div ref={trackRef} className={styles.slideTrack}>
          <div
            ref={setSlideRef(0)}
            id="top"
            className={`${styles.slide} ${styles.slideHero}`}
          >
            <div
              className={`${styles.slideInner} ${styles.slideInnerHero}`}
              data-slide-scroll
              data-slide-scroll-lock
            >
              {/* Hero */}
              <header className={styles.hero}>
              <HeroGraphCanvas />

              <nav className={styles.nav}>
                <a href="#" className={styles.wordmark}>
                  Acta
                </a>
                <div className={styles.navLinks}>
                  <a
                    href="#how"
                    className={styles.navLink}
                    onClick={onNavClick("how")}
                  >
                    How it works
                  </a>
                  <a
                    href="#importers"
                    className={styles.navLink}
                    onClick={onNavClick("importers")}
                  >
                    Importers
                  </a>
                  <a
                    href="#outputs"
                    className={styles.navLink}
                    onClick={onNavClick("outputs")}
                  >
                    Outputs
                  </a>
                </div>
                <div className={styles.navActions}>
                  <span className={styles.btnPrimary}>Join the waitlist</span>
                </div>
              </nav>

              <div className={styles.heroCopy}>
                <p className={styles.eyebrow} data-enter="rise" data-enter-delay="0">
                  Waitlist open · your work, kept whole
                </p>
                <h1 className={styles.heroTitle} data-enter="rise" data-enter-delay="1">
                  Everything you&apos;ve
                  <br />
                  ever done, and
                  <br />
                  <span className={styles.cycleLine}>
                    how it <CycleWord />
                  </span>
                </h1>
                <p className={styles.heroLede} data-enter="rise" data-enter-delay="2">
                  Acta is a graph of your projects, roles, courses and side things. Say
                  what you did in one sentence. It files itself into the graph, and
                  nothing is written until you approve it.
                </p>
                <div className={styles.heroCtas} data-enter="rise" data-enter-delay="3">
                  <span className={`${styles.btnPrimary} ${styles.btnLg}`}>
                    Join the waitlist
                    <span className={styles.btnArrow}>→</span>
                  </span>
                  <a
                    href="#how"
                    className={`${styles.btn} ${styles.btnLg}`}
                    onClick={onNavClick("how")}
                  >
                    See how it works
                  </a>
                </div>
              </div>
            </header>

            {/* Marquee */}
            <div className={styles.marqueeBand} aria-hidden="true">
              <div className={`${styles.marqueeTrack} ${styles.marqueeTrackAnimated}`}>
                {marqueeItems.map((word, i) => (
                  <span key={`${word}-${i}`} className={styles.marqueeItem}>
                    {word}
                    <span className={styles.marqueeDot}>◆</span>
                  </span>
                ))}
              </div>
            </div>
            </div>
          </div>

          <div ref={setSlideRef(1)} id="how" className={styles.slide}>
            <div className={styles.slideInner} data-slide-scroll>
              {/* How it works */}
              <section className={styles.section}>
                <div className={styles.sectionHeader} data-enter="fade">
                  <h2 className={styles.sectionTitle}>Three moves. Nothing to learn.</h2>
                  <p className={styles.sectionLede}>
                    No forms. No fields. No tagging taxonomy to invent before you can
                    write anything down.
                  </p>
                </div>

                <div className={styles.stepsRow}>
          {/* Step 01 */}
          <article
            className={`${styles.stepCard} ${styles.stepCardShellLight}`}
            data-enter="panel-up"
            data-enter-delay="0"
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>01</span>
              <div className={styles.stepHeaderText}>
                <span className={styles.label}>Capture and import</span>
                <h3 className={styles.stepTitle}>
                  Say it, or point at where it already lives.
                </h3>
                <p className={styles.stepBody}>
                  One sentence out loud, or a folder, a repo, an inbox. Both paths
                  land in the same place.
                </p>
              </div>
            </div>
            <div className={`${styles.stepWell} ${styles.stepWellPaper}`}>
              <div className={styles.captureQuote}>
                &ldquo;Shipped the billing webhook refactor at Bubble last week. No
                duplicate charges since.&rdquo;
              </div>
              <div className={styles.importBlock}>
                <a
                  href="#importers"
                  className={styles.importFunnel}
                  onClick={onNavClick("importers")}
                >
                  <span className={styles.importFunnelLabel}>Or import from …</span>
                  <span className={styles.importFunnelArrow} aria-hidden>
                    →
                  </span>
                </a>
                <div className={styles.chipRow}>
                  {captureSources.map((c) => (
                    <span
                      key={c.label}
                      className={c.accent ? `${styles.chip} ${styles.chipAccent}` : styles.chip}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Step 02 */}
          <article
            className={`${styles.stepCard} ${styles.stepCardShellWhite}`}
            data-enter="panel-up"
            data-enter-delay="1"
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>02</span>
              <div className={styles.stepHeaderText}>
                <span className={styles.label}>Review</span>
                <h3 className={styles.stepTitle}>Approve the diff.</h3>
                <p className={styles.stepBody}>
                  Acta proposes endeavors, facets and links. You see exactly what it
                  wants to write before it writes it.
                </p>
              </div>
            </div>
            <div className={`${styles.stepWell} ${styles.stepWellPanel}`}>
              {reviewDiff.map((d) => (
                <DiffRow key={d.title} {...d} />
              ))}
            </div>
          </article>

          {/* Step 03 */}
          <article
            className={`${styles.stepCard} ${styles.stepCardShellLight}`}
            data-enter="panel-up"
            data-enter-delay="2"
          >
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>03</span>
              <div className={styles.stepHeaderText}>
                <span className={styles.label}>Ask</span>
                <h3 className={styles.stepTitle}>Query your own history.</h3>
                <p className={styles.stepBody}>
                  Plain language in, ranked endeavors out, lit up on the graph with
                  the thread between them.
                </p>
              </div>
            </div>
            <div className={`${styles.stepWell} ${styles.stepWellPaper}`}>
              <div className={styles.askBar}>
                <span className={styles.askQuery}>what have I done with Redis?</span>
                <span className={styles.askArrow}>↑</span>
              </div>
              {askHits.map((h) => (
                <div key={h.title} className={styles.hitRow}>
                  <span className={styles.hitTitle}>{h.title}</span>
                  <span className={styles.hitScore}>{h.score}</span>
                </div>
              ))}
            </div>
          </article>
                </div>
              </section>
            </div>
          </div>

          <div ref={setSlideRef(2)} id="importers" className={styles.slide}>
            <div className={styles.slideInner} data-slide-scroll>
              {/* Importers */}
              <section className={`${styles.section} ${styles.sectionBorderTop}`}>
                <div className={styles.sectionHeader} data-enter="fade">
                  <h2 className={styles.sectionTitle}>Most of it is already written down.</h2>
                  <p className={styles.sectionLede}>
                    Point Acta at the places your work already lives. It proposes
                    endeavors from what it finds, and every proposal goes through the same
                    review step before anything is written.
                  </p>
                </div>

                <div className={styles.streamsWrap}>
                  <ImporterStream names={STREAM_ROW_A} />
                  <ImporterStream names={STREAM_ROW_B} reverse />
                </div>

                <div className={styles.readOnlyBanner} data-enter="panel-up" data-enter-delay="2">
                  <span className={styles.stamp}>READ ONLY</span>
                  <p className={styles.readOnlyText}>
                    Or point at a folder: PDF, DOCX, PPTX, Markdown, notebooks. A repo
                    becomes a dated project, an offer email becomes a role, a recurring
                    block becomes a standing commitment. Importers read and never write
                    back.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div ref={setSlideRef(3)} id="kinds" className={styles.slide}>
            <div className={styles.slideInner} data-slide-scroll>
              <section
                className={`${styles.section} ${styles.sectionBorderTop} ${styles.sectionWhite}`}
              >
                <div className={styles.sectionHeader} data-enter="fade">
                  <h2 className={styles.sectionTitle}>The parts a résumé cannot hold.</h2>
                  <p className={styles.sectionLede}>
                    A degree is not a bullet, it is four years of coursework that produced
                    things. A project is an outcome you measured. A weekend can be the
                    reason two other things exist.
                  </p>
                </div>

                <div className={styles.kindsRow}>
          {/* Credential */}
          <article className={`${styles.kindCard} ${styles.kindCardTiltLeft}`}>
            <div className={styles.kindCardInner} data-enter="deal-in" data-enter-delay="0">
            <div className={styles.kindPhoto}>
              <DropSlot label="campus or diploma" variant="rect" />
            </div>
            <div className={styles.credentialCrest}>
              <div className={styles.crestRule} />
              <span className={styles.label}>Conferred</span>
              <div className={styles.credentialTitle}>B.S. Computer Science</div>
              <span className={styles.label}>2023–2027</span>
              <div className={`${styles.crestRule} ${styles.crestRuleBottom}`} />
            </div>
            <div className={styles.kindBody}>
              <span className={styles.label}>Your degree</span>
              <p className={styles.kindDesc}>
                Six endeavors trace back to this one node. The courses that
                produced something are listed under it, with what came out of each.
              </p>
            </div>
            </div>
          </article>

          {/* Project */}
          <article className={`${styles.kindCard} ${styles.kindCardTiltRight}`}>
            <div className={styles.kindCardInner} data-enter="deal-in" data-enter-delay="1">
            <div className={styles.kindPhoto}>
              <DropSlot label="the thing you built" variant="rect" />
            </div>
            <div className={styles.projectHeader}>
              <span className={styles.label}>Project · sheet 11</span>
              <div className={styles.projectTitle}>Trailmap</div>
            </div>
            <div className={styles.readoutRow}>
              {readout.map((r) => (
                <div key={r.k} className={styles.readoutCell}>
                  <span className={styles.readoutKey}>{r.k}</span>
                  <span className={styles.readoutVal}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className={styles.kindBody}>
              <span className={styles.label}>Something you built</span>
              <p className={styles.kindDesc}>
                Recorded when it was fresh, so the outcome is a real number instead
                of a sentence you invent two years later.
              </p>
            </div>
            </div>
          </article>

          {/* Event */}
          <article className={`${styles.kindCard} ${styles.kindCardTiltSlight}`}>
            <div className={styles.kindCardInner} data-enter="deal-in" data-enter-delay="2">
            <div className={styles.eventHeader}>
              <div className={styles.eventDate}>
                <span className={styles.label}>Feb</span>
                <span className={styles.eventDateNum}>2025</span>
                <span className={styles.label}>Evanston</span>
              </div>
              <div className={styles.eventInfo}>
                <span className={styles.label}>Admit one · event</span>
                <div className={styles.eventTitle}>HackNU 2025</div>
              </div>
            </div>
            <div className={styles.kindBody}>
              <div className={styles.registrarGrid}>
                {registrar.map((r) => (
                  <div key={r.k} className={styles.registrarCell}>
                    <span className={styles.label}>{r.k}</span>
                    <span className={styles.registrarVal}>{r.v}</span>
                  </div>
                ))}
              </div>
              <span className={styles.label}>A weekend, and the course behind it</span>
              <p className={styles.kindDesc}>
                One hackathon produced Trailmap. The seminar that gave you the idea
                sits one link away, with the grade still attached.
              </p>
            </div>
            </div>
          </article>
                </div>
              </section>
            </div>
          </div>

          <div ref={setSlideRef(4)} id="compare" className={`${styles.slide} ${styles.slideCompact}`}>
            <div className={`${styles.slideInner} ${styles.slideInnerCompact}`} data-slide-scroll data-slide-scroll-lock>
              <section className={`${styles.section} ${styles.sectionCompact}`}>
                <h2 className={styles.compareHeadline} data-enter="fade">
                  One record beats a rewrite.
                </h2>
                <div className={styles.compareRow}>
                  <article
                    className={`${styles.compareCard} ${styles.compareCardLight}`}
                    data-enter="slide-left"
                    data-enter-delay="0"
                  >
                    <CompareResumeVisual />
                    <span className={styles.label}>The old way</span>
                    <h3 className={styles.compareTitle}>A document you rewrite every time.</h3>
                    {oldWay.map((item) => (
                      <div key={item} className={styles.compareItem}>
                        <span className={styles.compareMark}>×</span>
                        <span className={styles.compareText}>{item}</span>
                      </div>
                    ))}
                  </article>
                  <article
                    className={`${styles.compareCard} ${styles.compareCardAccent}`}
                    data-enter="slide-right"
                    data-enter-delay="0"
                  >
                    <CompareGraphVisual />
                    <span className={`${styles.label} ${styles.compareLabelOnAccent}`}>
                      With a graph
                    </span>
                    <h3 className={`${styles.compareTitle} ${styles.compareTitleOnAccent}`}>
                      One record. Many views of it.
                    </h3>
                    {newWay.map((item) => (
                      <div key={item} className={styles.compareItem}>
                        <span className={`${styles.compareMark} ${styles.compareMarkOnAccent}`}>
                          →
                        </span>
                        <span className={`${styles.compareText} ${styles.compareTextOnAccent}`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </article>
                </div>
              </section>
            </div>
          </div>

          <div ref={setSlideRef(5)} id="outputs" className={`${styles.slide} ${styles.slideOutputs}`}>
            <div className={`${styles.slideInner} ${styles.slideInnerFill}`} data-slide-scroll data-slide-scroll-lock>
              <section className={`${styles.section} ${styles.sectionOutputs}`}>
                <div className={styles.outputsSection}>
                  <div className={styles.outputsCopy} data-enter="fade">
                    <h2 className={styles.sectionTitle}>
                      Write once. Shape it however you are asked.
                    </h2>
                    <p className={styles.sectionLede}>
                      Every output is a view of the graph — résumé, bio, cover letter,
                      brag doc — pulled from endeavors you actually recorded.
                    </p>
                  </div>
                  <div className={styles.adapterList}>
                    {adapters.map((a, index) => (
                      <div
                        key={a.n}
                        className={styles.adapterRow}
                        data-enter="menu-right"
                        data-enter-delay={String(index)}
                      >
                <span className={styles.adapterNum}>{a.n}</span>
                <div className={styles.adapterContent}>
                  <div className={styles.adapterTitle}>{a.title}</div>
                  <div className={styles.adapterBody}>{a.body}</div>
                </div>
                <span className={styles.adapterArrow}>→</span>
              </div>
            ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div
            ref={setSlideRef(6)}
            id="footer"
            className={`${styles.slide} ${styles.slideFooter}`}
          >
            <div
              className={`${styles.slideInner} ${styles.slideInnerBleed}`}
              data-slide-scroll
              data-slide-scroll-lock
            >
              <section className={styles.footerCta}>
                <div className={styles.footerCtaInner}>
                  <div className={styles.footerCtaCopy} data-enter="fade">
                    <h2 className={styles.footerCtaTitle}>Get an invite when we open.</h2>
                    <p className={styles.footerCtaLede}>
                      We are letting people in a few at a time while the importers settle.
                      One email when your invite is ready, nothing else.
                    </p>
                  </div>
                  <div className={styles.footerCtaForm} data-enter="form-up" data-enter-delay="1">
                    <div className={styles.emailField}>
                      <span className={styles.emailPlaceholder}>you@work.com</span>
                    </div>
                    <span className={styles.btnOnDark}>
                      Join the waitlist
                      <span className={styles.btnArrow}>→</span>
                    </span>
                    <span className={styles.footerFine}>No spam · leave any time</span>
                  </div>
                </div>
              </section>

              <footer className={`${styles.siteFooter} ${styles.siteFooterOnDark}`}>
                <span className={styles.footerWordmark}>Acta</span>
                <span className={styles.footerTagline}>Your work, kept whole</span>
                <nav className={styles.footerNav}>
                  <a
                    href="#how"
                    className={styles.footerNavLink}
                    onClick={onNavClick("how")}
                  >
                    How it works
                  </a>
                  <a
                    href="#importers"
                    className={styles.footerNavLink}
                    onClick={onNavClick("importers")}
                  >
                    Importers
                  </a>
                  <a
                    href="#outputs"
                    className={styles.footerNavLink}
                    onClick={onNavClick("outputs")}
                  >
                    Outputs
                  </a>
                  <a
                    href="#outputs"
                    className={styles.footerNavLink}
                    onClick={onNavClick("outputs")}
                  >
                    Privacy
                  </a>
                </nav>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
