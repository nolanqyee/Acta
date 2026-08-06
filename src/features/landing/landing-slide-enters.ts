/**
 * @fileoverview Enter animations for the marketing landing page. Elements marked with
 * `data-enter` are posed off-screen while their slide is pending, then animated in
 * when the slide becomes active. Only the recipes the two remaining slides use are
 * defined here; the richer per-section set was removed with those sections on
 * 2026-08-04.
 */

import { animate, type JSAnimation } from "animejs";

/** Enter animation recipe keyed on `data-enter`. */
export type SlideEnterKind = "fade" | "rise" | "form-up";

const DEFAULT_STAGGER_MS = 40;
const ENTER_DURATION_MS = 420;

/**
 * Reads the enter kind and optional delay index from a marked element.
 *
 * @param el - Element with `data-enter` (and optional `data-enter-delay`).
 * @returns Parsed kind and stagger delay in ms.
 */
function readEnterMeta(el: HTMLElement): { kind: SlideEnterKind; delay: number } {
  const kind = (el.getAttribute("data-enter") ?? "fade") as SlideEnterKind;
  const delayIndex = Number(el.getAttribute("data-enter-delay") ?? "0");
  return { kind, delay: delayIndex * DEFAULT_STAGGER_MS };
}

/**
 * Applies the pre-enter pose for one element.
 *
 * @param el - Target element.
 * @param kind - Animation recipe.
 * @param direction - Scroll direction (1 down, -1 up), so content enters from the
 *   side the reader is travelling from.
 */
export function prepareEnterElement(
  el: HTMLElement,
  kind: SlideEnterKind,
  direction: 1 | -1,
): void {
  el.style.opacity = "0";

  switch (kind) {
    case "form-up":
      el.style.transform = `translateY(${direction * 18}px) scale(0.98)`;
      break;
    case "rise":
      el.style.transform = `translateY(${direction * 16}px) scale(0.98)`;
      break;
    default:
      el.style.transform = `translateY(${direction * 12}px)`;
  }
}

/**
 * Builds anime.js props for one enter kind.
 *
 * @param kind - Animation recipe.
 * @param direction - Scroll direction.
 * @returns Keyframes passed to anime.js.
 */
function enterKeyframes(
  kind: SlideEnterKind,
  direction: 1 | -1,
): Record<string, (string | number)[]> {
  switch (kind) {
    case "form-up":
      return {
        opacity: [0, 1],
        translateY: [direction * 18, 0],
        scale: [0.98, 1],
      };
    case "rise":
      return {
        opacity: [0, 1],
        translateY: [direction * 16, 0],
        scale: [0.98, 1],
      };
    default:
      return {
        opacity: [0, 1],
        translateY: [direction * 12, 0],
      };
  }
}

/**
 * Runs the enter animation for every `[data-enter]` element in a slide.
 *
 * @param slide - Slide root.
 * @param direction - Scroll direction.
 * @param reducedMotion - Skip animation when true.
 * @returns Handle for the first animation (used to interrupt a run in progress), or
 *   null when there was nothing to animate.
 */
export function animateSlideEnter(
  slide: HTMLElement | null,
  direction: 1 | -1,
  reducedMotion: boolean,
): JSAnimation | null {
  if (!slide || reducedMotion) return null;

  const targets = slide.querySelectorAll<HTMLElement>("[data-enter]");
  if (targets.length === 0) return null;

  targets.forEach((el) => {
    const { kind } = readEnterMeta(el);
    prepareEnterElement(el, kind, direction);
  });

  const animations: JSAnimation[] = [];

  targets.forEach((el) => {
    const { kind, delay } = readEnterMeta(el);
    animations.push(
      animate(el, {
        ...enterKeyframes(kind, direction),
        duration: ENTER_DURATION_MS,
        delay,
        ease: "out(2)",
      }),
    );
  });

  return animations[0] ?? null;
}
