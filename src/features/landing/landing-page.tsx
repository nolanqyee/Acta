/**
 * @fileoverview Marketing landing page for Acta — a two-slide waitlist surface: the
 * hero (live graph canvas, headline, marquee band) and the dark waitlist CTA. The
 * explanatory sections that used to sit between them were scrapped on 2026-08-04.
 * Slide navigation uses anime.js transitions when motion is allowed, otherwise
 * native scroll plus anchors. Hero line 3 runs a typewriter cycle when motion is
 * allowed.
 */

"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import { HeroGraphCanvas } from "./hero-graph-canvas";
import {
  HERO_CYCLE_WORDS,
  HERO_EYEBROW,
  HERO_HEADLINE_LINE1,
  HERO_HEADLINE_LINE2,
  HERO_SUMMARY,
} from "./landing-copy";
import { LANDING_SLIDE_IDS } from "./landing-scroll";
import { useLandingScroll } from "./use-landing-scroll";

/** Shared button recipes — acta-* chrome + Tailwind layout. */
const BTN_PRIMARY = "acta-button acta-button-accent acta-button-primary";
const BTN_LG = "acta-button-accent-lg";

/** Shared waitlist CTA label — one string everywhere on the landing page. */
const WAITLIST_LABEL = "Join the waitlist";

/** Marquee band labels — duplicated at render for the infinite scroll effect. */
const MARQUEE_WORDS = [
  "Projects",
  "Roles",
  "Courses",
  "Credentials",
  "Events",
  "Crafts",
  "Artifacts",
  "Volunteering",
  "Side projects",
  "Research",
  "Gigs",
  "Internships",
  "Teaching",
  "Competitions",
  "Fellowships",
] as const;

/**
 * Animated cycling word on hero h1 line 3. Falls back to the first word when
 * reduced motion is preferred or before hydration completes.
 *
 * @returns Highlight hugging typed text only; caret alone between words when empty.
 */
function CycleWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charLen, setCharLen] = useState(HERO_CYCLE_WORDS[0].length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const word = HERO_CYCLE_WORDS[wordIndex] ?? HERO_CYCLE_WORDS[0];
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
        setWordIndex((i) => (i + 1) % HERO_CYCLE_WORDS.length);
        setDeleting(false);
      }
    }, wait);

    return () => window.clearTimeout(timer);
  }, [wordIndex, charLen, deleting]);

  const display = (HERO_CYCLE_WORDS[wordIndex] ?? HERO_CYCLE_WORDS[0]).slice(0, charLen);

  const caret = (
    <span
      className="motion-reduce:opacity-100 inline-block w-1.5 h-[0.7em] ml-1.5 align-[-0.08em] bg-ink animate-caret-blink"
      aria-hidden="true"
    />
  );

  const highlightClass =
    "inline-block leading-inherit bg-accent shadow-[12px_0_0_var(--brand-primary),-12px_0_0_var(--brand-primary)]";

  if (display.length === 0) {
    return caret;
  }

  return (
    <span className={highlightClass}>
      {display}
      {caret}
    </span>
  );
}

/**
 * Standard waitlist CTA — same label everywhere, no inline arrows.
 *
 * The nav and hero variants navigate to the CTA slide that holds the email field;
 * the footer variant is the submit control sitting next to that field, so it renders
 * as static chrome rather than a link.
 *
 * @param props.variant - `hero` for the large hero CTA, `footer` for the dark-band
 *   form button, `nav` for the header pill.
 * @param props.onNavigate - Click handler that drives the slide transition; ignored
 *   by the footer variant.
 * @returns Waitlist button markup.
 */
function WaitlistButton({
  variant = "nav",
  onNavigate,
}: {
  variant?: "nav" | "hero" | "footer";
  onNavigate?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  if (variant === "footer") {
    return (
      <span className="acta-button acta-button-waitlist">{WAITLIST_LABEL}</span>
    );
  }

  return (
    <a
      href="#footer"
      className={variant === "hero" ? `${BTN_PRIMARY} ${BTN_LG}` : BTN_PRIMARY}
      onClick={onNavigate}
    >
      {WAITLIST_LABEL}
    </a>
  );
}

/**
 * Marketing landing page: hero slide plus waitlist CTA slide.
 *
 * @returns The complete landing page markup.
 */
export function LandingPage() {
  const reducedMotion = useReducedMotion();
  const { trackRef, setSlideRef, activeIndex, slideMode, onNavClick } =
    useLandingScroll(reducedMotion);

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
                    href="#top"
                    className="font-display font-bold text-[30px] leading-none text-ink no-underline"
                    onClick={onNavClick("top")}
                  >
                    Acta
                  </a>
                  <div className="ml-auto flex items-center gap-acta-3">
                    <WaitlistButton onNavigate={onNavClick("footer")} />
                  </div>
                </nav>

                <div className="absolute left-14 top-1/2 z-2 w-[min(812px,calc(100%-112px))] -translate-y-[calc(50%-var(--hero-copy-nudge-y))] max-[900px]:left-6 max-[900px]:w-[calc(100%-48px)]">
                  <p
                    className="acta-label mb-3"
                    data-enter="rise"
                    data-enter-delay="0"
                  >
                    {HERO_EYEBROW}
                  </p>
                  <h1
                    className="m-0 font-display font-bold text-[clamp(44px,5.8vw,88px)] leading-[0.96] tracking-[-0.02em]"
                    data-enter="rise"
                    data-enter-delay="1"
                  >
                    {HERO_HEADLINE_LINE1}
                    <br />
                    {HERO_HEADLINE_LINE2}
                    <br />
                    <span className="whitespace-nowrap">
                      <CycleWord />
                    </span>
                  </h1>
                  <p
                    className="mt-6 mb-0 text-ui-lg leading-[1.6] text-[var(--ink-soft)] max-w-[480px] text-pretty"
                    data-enter="rise"
                    data-enter-delay="2"
                  >
                    {HERO_SUMMARY}
                  </p>
                  <div
                    className="mt-5 flex flex-wrap items-center gap-acta-3"
                    data-enter="rise"
                    data-enter-delay="3"
                  >
                    <WaitlistButton
                      variant="hero"
                      onNavigate={onNavClick("footer")}
                    />
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

          <div
            ref={setSlideRef(1)}
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
                    <WaitlistButton variant="footer" />
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
                    href="#top"
                    className="text-body text-canvas no-underline hover:opacity-70"
                    onClick={onNavClick("top")}
                  >
                    Back to top
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
