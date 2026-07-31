/**
 * @fileoverview Slide-style section navigation for the marketing landing page —
 * wheel and touch move between full-width sections with anime.js transitions
 * instead of native scroll. Falls back to normal document flow when disabled.
 */

import { animate, type JSAnimation } from "animejs";
import { animateSlideEnter } from "./landing-slide-enters";

/** Anchor ids for each landing slide, in scroll order. */
export const LANDING_SLIDE_IDS = [
  "top",
  "how",
  "importers",
  "kinds",
  "compare",
  "outputs",
  "footer",
] as const;

export type LandingSlideId = (typeof LANDING_SLIDE_IDS)[number];

const SLIDE_DURATION_MS = 720;
const SLIDE_EASE = "inOut(3)";
const WHEEL_THRESHOLD_PX = 48;
const SWIPE_THRESHOLD_PX = 56;
const WHEEL_COOLDOWN_MS = 900;

/**
 * Sums the pixel height of slides before `index`.
 *
 * @param slides - Slide root elements in order.
 * @param index - Target slide index.
 * @returns Vertical offset for the track transform.
 */
export function slideTrackOffset(
  slides: readonly HTMLElement[],
  index: number,
): number {
  let offset = 0;
  for (let i = 0; i < index && i < slides.length; i += 1) {
    offset += slides[i]?.offsetHeight ?? 0;
  }
  return offset;
}

/**
 * Resolves a slide index from a hash anchor (`#how`, `#importers`, …).
 *
 * @param hash - Location hash including or excluding `#`.
 * @returns Matching slide index, or 0 when unknown.
 */
export function slideIndexFromHash(hash: string): number {
  const id = hash.replace(/^#/, "");
  if (!id) return 0;
  const index = LANDING_SLIDE_IDS.indexOf(id as LandingSlideId);
  return index >= 0 ? index : 0;
}

/**
 * Clears anime.js inline transforms on a slide's enter targets (keeps opacity).
 *
 * @param slide - Slide root element.
 */
export function resetSlideContent(slide: HTMLElement | null): void {
  if (!slide) return;
  slide.querySelectorAll<HTMLElement>("[data-enter]").forEach((el) => {
    el.style.transform = "";
  });
}

/**
 * Marks a slide as not yet entered — children stay hidden off-screen only.
 *
 * @param slide - Slide root element.
 */
export function markSlidePending(slide: HTMLElement | null): void {
  slide?.setAttribute("data-slide-pending", "");
}

/**
 * Marks a slide entered — children render normally between transitions.
 *
 * @param slide - Slide root element.
 */
export function markSlideEntered(slide: HTMLElement | null): void {
  slide?.removeAttribute("data-slide-pending");
}

export interface LandingScrollController {
  /** Current slide index. */
  activeIndex: number;
  /** Animate to a slide by index. */
  goToIndex: (index: number) => void;
  /** Animate to a slide by anchor id. */
  goToId: (id: LandingSlideId) => void;
  /** Wire nav anchors when slide mode is active; no-op when disabled. */
  onNavClick: (
    id: LandingSlideId,
  ) => (event: { preventDefault: () => void }) => void;
}

/**
 * Creates a slide-scroll controller that drives a translated track with anime.js.
 *
 * @param options.track - The moving strip that holds all slides.
 * @param options.slides - Slide roots in scroll order.
 * @param options.disabled - When true, uses native scrolling only.
 * @param options.onIndexChange - Called after the active slide changes.
 * @returns Controller API and a cleanup function for listeners.
 */
export function createLandingScrollController(options: {
  track: HTMLElement;
  slides: HTMLElement[];
  disabled: boolean;
  onIndexChange: (index: number) => void;
}): { controller: LandingScrollController; destroy: () => void } {
  const { track, slides, disabled, onIndexChange } = options;

  let activeIndex = 0;
  let animating = false;
  let wheelAccum = 0;
  let lastWheelAt = 0;
  let touchStartY: number | null = null;
  let currentAnim: JSAnimation | null = null;
  let contentAnim: JSAnimation | null = null;
  let hasLeftHero = false;
  const enteredSlides = new Set<number>([0]);

  slides.forEach((slide, index) => {
    if (index === 0) markSlideEntered(slide);
    else markSlidePending(slide);
  });

  const runContentEnter = (
    index: number,
    direction: 1 | -1,
  ): void => {
    const slide = slides[index];
    if (!slide || disabled) return;

    const shouldAnimate = index !== 0 || hasLeftHero;
    if (index !== 0) hasLeftHero = true;

    markSlideEntered(slide);
    enteredSlides.add(index);

    if (!shouldAnimate) return;

    contentAnim?.pause();
    contentAnim = animateSlideEnter(
      slide,
      LANDING_SLIDE_IDS[index] ?? "top",
      direction,
      false,
    );
  };

  const setTrackOffset = (
    offset: number,
    instant: boolean,
    onDone?: () => void,
  ): void => {
    currentAnim?.pause();
    if (instant || disabled) {
      track.style.transform = `translate3d(0, ${-offset}px, 0)`;
      onDone?.();
      return;
    }
    currentAnim = animate(track, {
      translateY: -offset,
      duration: SLIDE_DURATION_MS,
      ease: SLIDE_EASE,
      onComplete: () => {
        animating = false;
        onDone?.();
      },
    });
  };

  const goToIndex = (index: number): void => {
    if (slides.length === 0) return;
    const next = Math.max(0, Math.min(slides.length - 1, index));
    if (next === activeIndex && !animating) return;

    const previous = activeIndex;
    const direction: 1 | -1 = next > previous ? 1 : -1;

    animating = true;
    activeIndex = next;
    onIndexChange(next);

    const incoming = slides[next];
    incoming
      ?.querySelector<HTMLElement>("[data-slide-scroll]")
      ?.scrollTo(0, 0);

    const offset = slideTrackOffset(slides, next);

    if (disabled) {
      setTrackOffset(offset, true);
      return;
    }

    const needsEnter = !enteredSlides.has(next);

    setTrackOffset(offset, false, () => {
      if (needsEnter) {
        runContentEnter(next, direction);
      }
    });

    const id = LANDING_SLIDE_IDS[next];
    if (id && id !== "top") {
      window.history.replaceState(null, "", `#${id}`);
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const goToId = (id: LandingSlideId): void => {
    const index = LANDING_SLIDE_IDS.indexOf(id);
    if (index >= 0) goToIndex(index);
  };

  const onNavClick =
    (id: LandingSlideId) =>
    (event: { preventDefault: () => void }): void => {
      if (disabled) return;
      event.preventDefault();
      goToId(id);
    };

  const onWheel = (event: WheelEvent): void => {
    if (disabled || animating) {
      event.preventDefault();
      return;
    }

    const now = Date.now();
    if (now - lastWheelAt < WHEEL_COOLDOWN_MS) {
      event.preventDefault();
      return;
    }

    const activeSlide = slides[activeIndex];
    const scroller = activeSlide?.querySelector<HTMLElement>(
      "[data-slide-scroll]",
    );
    if (
      scroller &&
      !scroller.hasAttribute("data-slide-scroll-lock") &&
      scroller.scrollHeight > scroller.clientHeight + 1
    ) {
      const atTop = scroller.scrollTop <= 0;
      const atBottom =
        scroller.scrollTop + scroller.clientHeight >=
        scroller.scrollHeight - 1;
      if (event.deltaY > 0 && !atBottom) return;
      if (event.deltaY < 0 && !atTop) return;
    }

    event.preventDefault();
    wheelAccum += event.deltaY;

    if (Math.abs(wheelAccum) < WHEEL_THRESHOLD_PX) return;

    const direction = wheelAccum > 0 ? 1 : -1;
    wheelAccum = 0;
    lastWheelAt = now;
    goToIndex(activeIndex + direction);
  };

  const onTouchStart = (event: TouchEvent): void => {
    if (disabled || animating) return;
    touchStartY = event.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: TouchEvent): void => {
    if (disabled || animating || touchStartY === null) return;
    const endY = event.changedTouches[0]?.clientY;
    if (endY === undefined) return;
    const delta = touchStartY - endY;
    touchStartY = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    goToIndex(activeIndex + (delta > 0 ? 1 : -1));
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (disabled || animating) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      goToIndex(activeIndex + 1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      goToIndex(activeIndex - 1);
    }
  };

  const onResize = (): void => {
    setTrackOffset(slideTrackOffset(slides, activeIndex), true);
  };

  const syncFromHash = (): void => {
    if (disabled) return;
    const index = slideIndexFromHash(window.location.hash);
    if (index === 0) {
      activeIndex = 0;
      setTrackOffset(0, true);
      return;
    }
    goToIndex(index);
  };

  if (!disabled) {
    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("hashchange", syncFromHash);
    syncFromHash();
    setTrackOffset(0, true);
  }

  const controller: LandingScrollController = {
    get activeIndex() {
      return activeIndex;
    },
    goToIndex,
    goToId,
    onNavClick,
  };

  const destroy = (): void => {
    currentAnim?.pause();
    contentAnim?.pause();
    if (!disabled) {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", syncFromHash);
    }
  };

  return { controller, destroy };
}
