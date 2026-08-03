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
import { useLandingScroll } from "./use-landing-scroll";

/** Shared button recipes — acta-* chrome + Tailwind layout. */
const BTN = "acta-button acta-button-secondary";
const BTN_PRIMARY = "acta-button acta-button-accent acta-button-primary";
const BTN_LG = "acta-button-accent-lg";

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
    let wait: number;
    if (!deleting) {
      wait = charLen < word.length ? 90 : 2000;
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
    <span className="inline-block leading-inherit bg-accent shadow-[12px_0_0_var(--brand-primary),-12px_0_0_var(--brand-primary)]">
      {display}
      <span
        className="motion-reduce:opacity-100 inline-block w-1.5 h-[0.7em] ml-1.5 align-[-0.08em] bg-ink animate-caret-blink"
        aria-hidden="true"
      />
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
    <div className="acta-row flex items-stretch overflow-hidden">
      <div
        className={
          op === "NEW"
            ? "flex-none w-[46px] flex items-center justify-center border-r-2 border-ink font-mono text-label font-bold bg-accent text-[var(--brand-primary-ink)]"
            : "flex-none w-[46px] flex items-center justify-center border-r-2 border-ink font-mono text-label font-bold bg-brand-secondary-wash text-brand-secondary-text"
        }
      >
        {op}
      </div>
      <div className="flex-1 min-w-0 py-2 px-3">
        <div className="font-display font-bold text-[15px] whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </div>
        <div className="text-[11px] text-[var(--ink-soft)]">{detail}</div>
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
          ? "flex items-center justify-center bg-panel text-muted font-mono text-[9px] tracking-[0.08em] uppercase text-center overflow-hidden w-[38px] h-[38px] rounded-pill border-2 border-ink"
          : "flex items-center justify-center bg-panel text-muted font-mono text-[9px] tracking-[0.08em] uppercase text-center overflow-hidden w-full h-full min-h-[156px]"
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
      className="overflow-hidden py-1"
      data-enter={reverse ? "stream-right" : "stream-left"}
      data-enter-delay={reverse ? "1" : "0"}
    >
      <div
        className={
          reverse
            ? "motion-reduce:animate-none flex items-center gap-acta-3 whitespace-nowrap w-max animate-stream-reverse"
            : "motion-reduce:animate-none flex items-center gap-acta-3 whitespace-nowrap w-max animate-stream-forward"
        }
      >
        {items.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="acta-row flex-none flex items-center gap-acta-3 py-2 pl-2 pr-4 rounded-pill bg-card"
          >
            <DropSlot label="logo" variant="circle" />
            <span className="font-display font-bold text-[15px] leading-none">
              {name}
            </span>
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
    <div className="acta-row h-[132px] overflow-hidden bg-card" aria-hidden="true">
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-1.5 py-2 px-3 border-b-2 border-ink bg-panel">
          <span className="w-2 h-2 rounded-full border-[1.5px] border-ink bg-card" />
          <span className="w-2 h-2 rounded-full border-[1.5px] border-ink bg-card" />
          <span className="w-2 h-2 rounded-full border-[1.5px] border-ink bg-card" />
          <span className="ml-2 font-mono text-label tracking-[0.08em] uppercase text-muted">
            Résumé_final_v7.docx
          </span>
        </div>
        <div className="flex-1 py-3.5 px-4 flex flex-col gap-2">
          <div className="h-2 rounded-full bg-ink" style={{ width: "42%" }} />
          <div className="h-2 rounded-full bg-ink" style={{ width: "68%" }} />
          <div className="h-2 rounded-full bg-ink opacity-[0.16]" style={{ width: "88%" }} />
          <div className="h-2 rounded-full bg-ink opacity-[0.16]" style={{ width: "76%" }} />
          <div className="h-2 rounded-full bg-ink opacity-[0.16]" style={{ width: "82%" }} />
          <div className="h-2 rounded-full bg-ink opacity-[0.16]" style={{ width: "54%" }} />
          <p className="mt-auto mb-0 font-mono text-label tracking-[0.06em] uppercase text-brand-secondary-text">
            …side projects cut for space
          </p>
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
    <div
      className="acta-row relative h-[132px] overflow-hidden bg-card bg-[linear-gradient(var(--ink-wash)_1px,transparent_1px),linear-gradient(90deg,var(--ink-wash)_1px,transparent_1px),var(--bg-card)] bg-size-[28px_28px]"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full stroke-ink stroke-2 opacity-45"
        viewBox="0 0 280 160"
        preserveAspectRatio="none"
      >
        <line x1="72" y1="48" x2="148" y2="36" />
        <line x1="148" y1="36" x2="214" y2="72" />
        <line x1="72" y1="48" x2="96" y2="112" />
        <line x1="96" y1="112" x2="188" y2="124" />
        <line x1="214" y1="72" x2="188" y2="124" />
        <line x1="148" y1="36" x2="188" y2="124" />
      </svg>
      <span className="absolute grid place-items-center min-w-[52px] h-[52px] px-2.5 rounded-full border-[2.5px] border-ink shadow-[3px_3px_0_var(--ink)] font-mono text-[9px] tracking-[0.08em] uppercase bg-accent left-[8%] top-[18%]">
        Role
      </span>
      <span className="absolute grid place-items-center min-w-[52px] h-[52px] px-2.5 rounded-full border-[2.5px] border-ink shadow-[3px_3px_0_var(--ink)] font-mono text-[9px] tracking-[0.08em] uppercase bg-canvas left-[42%] top-[8%]">
        Project
      </span>
      <span className="absolute grid place-items-center min-w-[52px] h-[52px] px-2.5 rounded-full border-[2.5px] border-ink shadow-[3px_3px_0_var(--ink)] font-mono text-[9px] tracking-[0.08em] uppercase bg-panel right-[8%] top-[28%]">
        Course
      </span>
      <span className="absolute grid place-items-center min-w-[52px] h-[52px] px-2.5 rounded-full border-[2.5px] border-ink shadow-[3px_3px_0_var(--ink)] font-mono text-[9px] tracking-[0.08em] uppercase bg-canvas left-[22%] bottom-[12%]">
        Event
      </span>
      <span className="absolute grid place-items-center min-w-[52px] h-[52px] px-2.5 rounded-full border-[2.5px] border-ink shadow-[3px_3px_0_var(--ink)] font-mono text-[9px] tracking-[0.08em] uppercase bg-accent right-[16%] bottom-[8%]">
        Outcome
      </span>
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
    <div
      className="acta-landing-page w-full bg-canvas font-ui text-ink"
      data-slide-mode={slideMode || undefined}
    >
      {slideMode ? (
        <div
          className="fixed right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-acta-2 pointer-events-none"
          aria-hidden="true"
        >
          {LANDING_SLIDE_IDS.map((id, index) => (
            <span
              key={id}
              className={
                index === activeIndex
                  ? "w-2 h-2 rounded-full border-2 border-ink bg-ink opacity-100"
                  : "w-2 h-2 rounded-full border-2 border-ink bg-transparent opacity-35"
              }
            />
          ))}
        </div>
      ) : null}

      <div className="acta-landing-viewport h-full">
        <div ref={trackRef} className="acta-landing-track">
          <div
            ref={setSlideRef(0)}
            id="top"
            className="acta-landing-slide acta-landing-slide-hero"
          >
            <div
              className="acta-landing-slide-inner acta-landing-slide-inner-hero"
              data-slide-scroll
              data-slide-scroll-lock
            >
              {/* Hero */}
              <header className="acta-landing-hero relative min-h-svh max-h-[900px] overflow-hidden bg-canvas bg-[linear-gradient(var(--ink-wash)_1px,transparent_1px),linear-gradient(90deg,var(--ink-wash)_1px,transparent_1px)] bg-size-[36px_36px] border-b-[3px] border-ink max-[900px]:block max-[900px]:min-h-svh max-[900px]:pb-6">
                <HeroGraphCanvas />

                <nav className="absolute inset-x-0 top-0 z-2 flex items-center gap-acta-6 py-6 px-14 max-[900px]:py-4 max-[900px]:px-6 max-[900px]:flex-wrap">
                  <a
                    href="#"
                    className="font-display font-bold text-[30px] leading-none text-ink no-underline"
                  >
                    Acta
                  </a>
                  <div className="flex items-center gap-acta-6 ml-6 max-[900px]:hidden">
                    <a
                      href="#how"
                      className="text-body font-semibold text-ink no-underline hover:opacity-70"
                      onClick={onNavClick("how")}
                    >
                      How it works
                    </a>
                    <a
                      href="#importers"
                      className="text-body font-semibold text-ink no-underline hover:opacity-70"
                      onClick={onNavClick("importers")}
                    >
                      Importers
                    </a>
                    <a
                      href="#outputs"
                      className="text-body font-semibold text-ink no-underline hover:opacity-70"
                      onClick={onNavClick("outputs")}
                    >
                      Outputs
                    </a>
                  </div>
                  <div className="ml-auto flex items-center gap-acta-3">
                    <a
                      href="/login?next=/home"
                      className="text-body font-semibold text-ink no-underline hover:opacity-70 max-[900px]:hidden"
                    >
                      Sign in
                    </a>
                    <span className={BTN_PRIMARY}>Join the waitlist</span>
                  </div>
                </nav>

                <div className="absolute left-14 top-1/2 z-2 w-[min(812px,calc(100%-112px))] -translate-y-[calc(50%-var(--hero-copy-nudge-y))] max-[900px]:left-6 max-[900px]:w-[calc(100%-48px)]">
                  <p
                    className="acta-label mb-3"
                    data-enter="rise"
                    data-enter-delay="0"
                  >
                    Waitlist open · your work, kept whole
                  </p>
                  <h1
                    className="m-0 font-display font-bold text-[clamp(44px,5.8vw,88px)] leading-[0.96] tracking-[-0.02em]"
                    data-enter="rise"
                    data-enter-delay="1"
                  >
                    Everything you&apos;ve
                    <br />
                    ever done, and
                    <br />
                    <span className="block whitespace-nowrap">
                      how it <CycleWord />
                    </span>
                  </h1>
                  <p
                    className="mt-6 mb-0 text-ui-lg leading-[1.6] text-[var(--ink-soft)] max-w-[480px] text-pretty"
                    data-enter="rise"
                    data-enter-delay="2"
                  >
                    Acta is a graph of your projects, roles, courses and side things. Say
                    what you did in one sentence. It files itself into the graph, and
                    nothing is written until you approve it.
                  </p>
                  <div
                    className="mt-5 flex flex-wrap items-center gap-acta-3"
                    data-enter="rise"
                    data-enter-delay="3"
                  >
                    <span className={`${BTN_PRIMARY} ${BTN_LG}`}>
                      Join the waitlist
                      <span className="text-[15px] leading-none">→</span>
                    </span>
                    <a
                      href="#how"
                      className={`${BTN} ${BTN_LG}`}
                      onClick={onNavClick("how")}
                    >
                      See how it works
                    </a>
                  </div>
                </div>
              </header>

              {/* Marquee */}
              <div
                className="acta-landing-marquee bg-ink py-4 overflow-hidden"
                aria-hidden="true"
              >
                <div className="motion-reduce:animate-none flex items-center gap-acta-6 whitespace-nowrap font-mono text-ui-lg tracking-[0.16em] uppercase text-canvas w-max animate-marquee">
                  {marqueeItems.map((word, i) => (
                    <span key={`${word}-${i}`} className="inline-flex items-center gap-acta-6">
                      {word}
                      <span>◆</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div ref={setSlideRef(1)} id="how" className="acta-landing-slide">
            <div className="acta-landing-slide-inner" data-slide-scroll>
              {/* How it works */}
              <section className="flex flex-col gap-acta-6 p-14 max-[900px]:py-10 max-[900px]:px-6">
                <div className="flex items-end gap-acta-6 flex-wrap" data-enter="fade">
                  <h2 className="m-0 font-display font-bold text-[clamp(40px,5vw,72px)] leading-none tracking-[-0.01em] max-w-[780px]">
                    Three moves. Nothing to learn.
                  </h2>
                  <p className="m-0 flex-1 min-w-[280px] text-ui-lg leading-[1.65] text-[var(--ink-soft)] text-pretty">
                    No forms. No fields. No tagging taxonomy to invent before you can
                    write anything down.
                  </p>
                </div>

                <div className="flex gap-acta-6 items-stretch flex-wrap">
                  {/* Step 01 */}
                  <article
                    className="acta-panel flex flex-col flex-1 min-w-[min(100%,320px)] overflow-hidden bg-panel"
                    data-enter="panel-up"
                    data-enter-delay="0"
                  >
                    <div className="p-5 flex items-center gap-acta-3 border-b-[3px] border-ink">
                      <span className="flex-none font-display font-bold text-[clamp(40px,5vw,56px)] leading-none text-ink">
                        01
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <span className="acta-label">Capture and import</span>
                        <h3 className="font-display font-bold text-[30px] leading-[1.08] text-ink">
                          Say it, or point at where it already lives.
                        </h3>
                        <p className="text-body leading-[1.55] text-[var(--ink-soft)]">
                          One sentence out loud, or a folder, a repo, an inbox. Both paths
                          land in the same place.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col gap-2.5 bg-canvas">
                      <div className="acta-row p-3 text-body leading-normal text-[var(--ink-soft)]">
                        &ldquo;Shipped the billing webhook refactor at Bubble last week. No
                        duplicate charges since.&rdquo;
                      </div>
                      <div className="flex flex-col gap-2">
                        <a
                          href="#importers"
                          className="inline-flex items-center gap-2 w-fit p-0 border-0 bg-transparent no-underline text-inherit cursor-pointer transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:opacity-[0.72]"
                          onClick={onNavClick("importers")}
                        >
                          <span className="acta-label">Or import from …</span>
                          <span className="text-body font-bold text-ink" aria-hidden>
                            →
                          </span>
                        </a>
                        <div className="flex flex-wrap gap-1.5">
                          {captureSources.map((c) => (
                            <span
                              key={c.label}
                              className={
                                c.accent
                                  ? "acta-chip acta-chip-accent"
                                  : "acta-chip text-ink"
                              }
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
                    className="acta-panel flex flex-col flex-1 min-w-[min(100%,320px)] overflow-hidden bg-card"
                    data-enter="panel-up"
                    data-enter-delay="1"
                  >
                    <div className="p-5 flex items-center gap-acta-3 border-b-[3px] border-ink">
                      <span className="flex-none font-display font-bold text-[clamp(40px,5vw,56px)] leading-none text-ink">
                        02
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <span className="acta-label">Review</span>
                        <h3 className="font-display font-bold text-[30px] leading-[1.08] text-ink">
                          Approve the diff.
                        </h3>
                        <p className="text-body leading-[1.55] text-[var(--ink-soft)]">
                          Acta proposes endeavors, facets and links. You see exactly what it
                          wants to write before it writes it.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col gap-2.5 bg-panel">
                      {reviewDiff.map((d) => (
                        <DiffRow key={d.title} {...d} />
                      ))}
                    </div>
                  </article>

                  {/* Step 03 */}
                  <article
                    className="acta-panel flex flex-col flex-1 min-w-[min(100%,320px)] overflow-hidden bg-panel"
                    data-enter="panel-up"
                    data-enter-delay="2"
                  >
                    <div className="p-5 flex items-center gap-acta-3 border-b-[3px] border-ink">
                      <span className="flex-none font-display font-bold text-[clamp(40px,5vw,56px)] leading-none text-ink">
                        03
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <span className="acta-label">Ask</span>
                        <h3 className="font-display font-bold text-[30px] leading-[1.08] text-ink">
                          Query your own history.
                        </h3>
                        <p className="text-body leading-[1.55] text-[var(--ink-soft)]">
                          Plain language in, ranked endeavors out, lit up on the graph with
                          the thread between them.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col gap-2.5 bg-canvas">
                      <div className="acta-row h-[38px] flex items-center gap-acta-3 px-4 rounded-pill bg-card">
                        <span className="flex-1 text-body">
                          what have I done with Redis?
                        </span>
                        <span className="text-body text-accent-text">↑</span>
                      </div>
                      {askHits.map((h) => (
                        <div
                          key={h.title}
                          className="flex items-center gap-acta-3 py-2 border-b border-[var(--ink-faint)]"
                        >
                          <span className="flex-1 min-w-0 text-body whitespace-nowrap overflow-hidden text-ellipsis">
                            {h.title}
                          </span>
                          <span className="font-mono text-[11px] text-accent-text">
                            {h.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              </section>
            </div>
          </div>

          <div ref={setSlideRef(2)} id="importers" className="acta-landing-slide">
            <div className="acta-landing-slide-inner" data-slide-scroll>
              {/* Importers */}
              <section className="flex flex-col gap-acta-6 p-14 border-t-[3px] border-ink max-[900px]:py-10 max-[900px]:px-6">
                <div className="flex items-end gap-acta-6 flex-wrap" data-enter="fade">
                  <h2 className="m-0 font-display font-bold text-[clamp(40px,5vw,72px)] leading-none tracking-[-0.01em] max-w-[780px]">
                    Most of it is already written down.
                  </h2>
                  <p className="m-0 flex-1 min-w-[280px] text-ui-lg leading-[1.65] text-[var(--ink-soft)] text-pretty">
                    Point Acta at the places your work already lives. It proposes
                    endeavors from what it finds, and every proposal goes through the same
                    review step before anything is written.
                  </p>
                </div>

                <div className="flex flex-col gap-3 -mx-14 max-[900px]:-mx-6 overflow-hidden">
                  <ImporterStream names={STREAM_ROW_A} />
                  <ImporterStream names={STREAM_ROW_B} reverse />
                </div>

                <div
                  className="acta-panel flex items-center gap-acta-6 p-5 flex-wrap bg-card"
                  data-enter="panel-up"
                  data-enter-delay="2"
                >
                  <span className="acta-label acta-chip-accent inline-flex items-center whitespace-nowrap px-2 py-1 rounded-pill">
                    READ ONLY
                  </span>
                  <p className="flex-1 min-w-[240px] text-body leading-[1.55] text-[var(--ink-soft)]">
                    Or point at a folder: PDF, DOCX, PPTX, Markdown, notebooks. A repo
                    becomes a dated project, an offer email becomes a role, a recurring
                    block becomes a standing commitment. Importers read and never write
                    back.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div ref={setSlideRef(3)} id="kinds" className="acta-landing-slide">
            <div className="acta-landing-slide-inner" data-slide-scroll>
              <section className="flex flex-col gap-acta-6 p-14 border-t-[3px] border-ink bg-card max-[900px]:py-10 max-[900px]:px-6">
                <div className="flex items-end gap-acta-6 flex-wrap" data-enter="fade">
                  <h2 className="m-0 font-display font-bold text-[clamp(40px,5vw,72px)] leading-none tracking-[-0.01em] max-w-[780px]">
                    The parts a résumé cannot hold.
                  </h2>
                  <p className="m-0 flex-1 min-w-[280px] text-ui-lg leading-[1.65] text-[var(--ink-soft)] text-pretty">
                    A degree is not a bullet, it is four years of coursework that produced
                    things. A project is an outcome you measured. A weekend can be the
                    reason two other things exist.
                  </p>
                </div>

                <div className="flex gap-acta-6 items-start py-6 flex-wrap">
                  {/* Credential */}
                  <article className="acta-panel flex-1 min-w-[min(100%,300px)] overflow-hidden bg-panel -rotate-[1.5deg]">
                    <div className="flex flex-col h-full" data-enter="deal-in" data-enter-delay="0">
                      <div className="h-[156px] bg-card border-b-[3px] border-ink">
                        <DropSlot label="campus or diploma" variant="rect" />
                      </div>
                      <div className="p-5 bg-card border-b-[3px] border-ink flex flex-col items-center gap-2 text-center">
                        <div className="w-full h-1 border-t-2 border-b border-ink" />
                        <span className="acta-label">Conferred</span>
                        <div className="font-display font-bold text-[20px] leading-[1.15]">
                          B.S. Computer Science
                        </div>
                        <span className="acta-label">2023–2027</span>
                        <div className="w-full h-1 border-t border-b-2 border-ink" />
                      </div>
                      <div className="p-5 flex flex-col gap-2">
                        <span className="acta-label">Your degree</span>
                        <p className="text-body leading-[1.55] text-[var(--ink-soft)]">
                          Six endeavors trace back to this one node. The courses that
                          produced something are listed under it, with what came out of each.
                        </p>
                      </div>
                    </div>
                  </article>

                  {/* Project */}
                  <article className="acta-panel flex-1 min-w-[min(100%,300px)] overflow-hidden bg-panel rotate-1 translate-y-5">
                    <div className="flex flex-col h-full" data-enter="deal-in" data-enter-delay="1">
                      <div className="h-[156px] bg-card border-b-[3px] border-ink">
                        <DropSlot label="the thing you built" variant="rect" />
                      </div>
                      <div className="pt-4 px-5 pb-3 flex flex-col gap-1.5">
                        <span className="acta-label">Project · sheet 11</span>
                        <div className="font-display font-bold text-[30px] leading-[1.08]">
                          Trailmap
                        </div>
                      </div>
                      <div className="flex border-t-2 border-b-2 border-ink bg-card">
                        {readout.map((r) => (
                          <div
                            key={r.k}
                            className="flex-1 min-w-0 p-3 border-r border-[var(--ink-faint)] last:border-r-0 flex flex-col gap-1"
                          >
                            <span className="acta-label whitespace-nowrap overflow-hidden text-ellipsis">
                              {r.k}
                            </span>
                            <span className="font-display font-bold text-[15px] leading-[1.2]">
                              {r.v}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="p-5 flex flex-col gap-2">
                        <span className="acta-label">Something you built</span>
                        <p className="text-body leading-[1.55] text-[var(--ink-soft)]">
                          Recorded when it was fresh, so the outcome is a real number instead
                          of a sentence you invent two years later.
                        </p>
                      </div>
                    </div>
                  </article>

                  {/* Event */}
                  <article className="acta-panel flex-1 min-w-[min(100%,300px)] overflow-hidden bg-panel -rotate-[0.75deg] translate-y-1">
                    <div className="flex flex-col h-full" data-enter="deal-in" data-enter-delay="2">
                      <div className="flex items-stretch bg-card border-b-[3px] border-ink">
                        <div className="flex-none w-[104px] py-5 px-3 border-r-2 border-dashed border-ink flex flex-col items-center justify-center gap-1">
                          <span className="acta-label">Feb</span>
                          <span className="font-display font-bold text-[30px] leading-none">
                            2025
                          </span>
                          <span className="acta-label">Evanston</span>
                        </div>
                        <div className="flex-1 min-w-0 py-5 px-4 flex flex-col gap-2 justify-center">
                          <span className="acta-label">Admit one · event</span>
                          <div className="font-display font-bold text-[20px] leading-[1.15]">
                            HackNU 2025
                          </div>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col gap-2">
                        <div className="flex items-stretch acta-row overflow-hidden bg-card">
                          {registrar.map((r) => (
                            <div
                              key={r.k}
                              className="flex-1 min-w-0 py-2 px-3 border-r border-[var(--ink-faint)] last:border-r-0 flex flex-col gap-1"
                            >
                              <span className="acta-label">{r.k}</span>
                              <span className="font-mono text-ui-lg">{r.v}</span>
                            </div>
                          ))}
                        </div>
                        <span className="acta-label">A weekend, and the course behind it</span>
                        <p className="text-body leading-[1.55] text-[var(--ink-soft)]">
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

          <div
            ref={setSlideRef(4)}
            id="compare"
            className="acta-landing-slide acta-landing-slide-compact"
          >
            <div
              className="acta-landing-slide-inner acta-landing-slide-inner-compact"
              data-slide-scroll
              data-slide-scroll-lock
            >
              <section className="acta-landing-section-compact flex flex-col gap-5">
                <h2
                  className="m-0 font-display font-bold text-[clamp(32px,4vw,56px)] leading-[1.05] tracking-[-0.01em] text-center"
                  data-enter="fade"
                >
                  One record beats a rewrite.
                </h2>
                <div className="flex gap-5 items-stretch flex-wrap">
                  <article
                    className="acta-panel flex-1 min-w-[min(100%,280px)] p-[18px] flex flex-col gap-3 bg-panel"
                    data-enter="slide-left"
                    data-enter-delay="0"
                  >
                    <CompareResumeVisual />
                    <span className="acta-label">The old way</span>
                    <h3 className="font-display font-bold text-[22px] leading-[1.12]">
                      A document you rewrite every time.
                    </h3>
                    {oldWay.map((item) => (
                      <div
                        key={item}
                        className="flex items-baseline gap-2.5 pb-2 border-b border-[var(--ink-faint)]"
                      >
                        <span className="flex-none font-mono text-body text-muted">×</span>
                        <span className="flex-1 text-body leading-[1.55] text-[var(--ink-soft)]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </article>
                  <article
                    className="acta-panel acta-panel-accent flex-1 min-w-[min(100%,280px)] p-[18px] flex flex-col gap-3"
                    data-enter="slide-right"
                    data-enter-delay="0"
                  >
                    <CompareGraphVisual />
                    <span className="acta-label text-[var(--brand-primary-ink)] opacity-70">
                      With a graph
                    </span>
                    <h3 className="font-display font-bold text-[22px] leading-[1.12] text-[var(--brand-primary-ink)]">
                      One record. Many views of it.
                    </h3>
                    {newWay.map((item) => (
                      <div
                        key={item}
                        className="flex items-baseline gap-2.5 pb-2 border-b border-[var(--ink-faint)]"
                      >
                        <span className="flex-none font-mono text-body text-[var(--brand-primary-ink)]">
                          →
                        </span>
                        <span className="flex-1 text-body leading-[1.55] text-[var(--brand-primary-ink)]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </article>
                </div>
              </section>
            </div>
          </div>

          <div
            ref={setSlideRef(5)}
            id="outputs"
            className="acta-landing-slide acta-landing-slide-outputs"
          >
            <div
              className="acta-landing-slide-inner acta-landing-slide-inner-fill"
              data-slide-scroll
              data-slide-scroll-lock
            >
              <section className="acta-landing-section-outputs flex flex-col">
                <div className="flex flex-col gap-10 w-[min(960px,100%)] mx-auto">
                  <div
                    className="w-full flex flex-col gap-4 text-center items-center"
                    data-enter="fade"
                  >
                    <h2 className="m-0 font-display font-bold text-[clamp(40px,5vw,72px)] leading-none tracking-[-0.01em] max-w-[780px]">
                      Write once. Shape it however you are asked.
                    </h2>
                    <p className="m-0 text-ui-lg leading-[1.65] text-[var(--ink-soft)] text-pretty max-w-[560px]">
                      Every output is a view of the graph — résumé, bio, cover letter,
                      brag doc — pulled from endeavors you actually recorded.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-4 w-full">
                    {adapters.map((a, index) => (
                      <div
                        key={a.n}
                        className="acta-panel flex flex-col items-start justify-between gap-3 min-h-[132px] p-[22px] bg-panel"
                        data-enter="menu-right"
                        data-enter-delay={String(index)}
                      >
                        <span className="acta-label">{a.n}</span>
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <div className="font-display font-bold text-[24px] leading-[1.12]">
                            {a.title}
                          </div>
                          <div className="text-body leading-normal text-[var(--ink-soft)]">
                            {a.body}
                          </div>
                        </div>
                        <span className="self-end text-[15px]">→</span>
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
            className="acta-landing-slide acta-landing-slide-footer"
          >
            <div
              className="acta-landing-slide-inner acta-landing-slide-inner-bleed"
              data-slide-scroll
              data-slide-scroll-lock
            >
              <section className="acta-landing-footer-cta border-t-[3px] border-ink bg-ink p-14 flex items-center justify-center flex-wrap max-[900px]:py-10 max-[900px]:px-6">
                <div className="w-[min(1200px,100%)] flex items-center gap-14 flex-wrap">
                  <div
                    className="flex-1 min-w-[min(100%,320px)] flex flex-col gap-5"
                    data-enter="fade"
                  >
                    <h2 className="m-0 font-display font-bold text-[clamp(40px,5vw,72px)] leading-none tracking-[-0.01em] text-canvas">
                      Get an invite when we open.
                    </h2>
                    <p className="m-0 text-ui-lg leading-[1.65] text-[color-mix(in_oklab,var(--bg-paper)_72%,transparent)] max-w-[560px]">
                      We are letting people in a few at a time while the importers settle.
                      One email when your invite is ready, nothing else.
                    </p>
                  </div>
                  <div
                    className="flex-none w-[min(420px,100%)] flex flex-col gap-3"
                    data-enter="form-up"
                    data-enter-delay="1"
                  >
                    <div className="h-[var(--ask-height-brutal)] flex items-center px-5 rounded-pill border-[3px] border-canvas shadow-[3px_3px_0_var(--bg-paper)] bg-panel">
                      <span className="flex-1 text-body text-muted">you@work.com</span>
                    </div>
                    <span className="acta-button acta-button-waitlist">
                      Join the waitlist
                      <span className="text-[15px] leading-none">→</span>
                    </span>
                    <span className="acta-label text-[color-mix(in_oklab,var(--bg-paper)_52%,transparent)]">
                      No spam · leave any time
                    </span>
                  </div>
                </div>
              </section>

              <footer className="bg-ink border-t border-[color-mix(in_oklab,var(--bg-paper)_18%,transparent)] py-6 px-14 pb-14 flex items-center gap-acta-6 flex-wrap max-[900px]:p-6">
                <span className="font-display font-bold text-[20px] text-canvas">
                  Acta
                </span>
                <span className="acta-label text-[color-mix(in_oklab,var(--bg-paper)_52%,transparent)]">
                  Your work, kept whole
                </span>
                <nav className="ml-auto flex items-center gap-acta-6 flex-wrap max-[900px]:ml-0">
                  <a
                    href="#how"
                    className="text-body text-canvas no-underline hover:opacity-70"
                    onClick={onNavClick("how")}
                  >
                    How it works
                  </a>
                  <a
                    href="#importers"
                    className="text-body text-canvas no-underline hover:opacity-70"
                    onClick={onNavClick("importers")}
                  >
                    Importers
                  </a>
                  <a
                    href="#outputs"
                    className="text-body text-canvas no-underline hover:opacity-70"
                    onClick={onNavClick("outputs")}
                  >
                    Outputs
                  </a>
                  <a
                    href="#outputs"
                    className="text-body text-canvas no-underline hover:opacity-70"
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
