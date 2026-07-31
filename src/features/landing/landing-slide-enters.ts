/**
 * @fileoverview Per-slide enter animations for the marketing landing page — each
 * section gets motion that matches its content (panels rising, streams sliding,
 * adapter rows peeling in, etc.) rather than one generic fade.
 */

import { animate, type JSAnimation } from "animejs";
import type { LandingSlideId } from "./landing-scroll";

/** Enter animation recipe keyed on `data-enter`. */
export type SlideEnterKind =
  | "fade"
  | "rise"
  | "panel-up"
  | "slide-left"
  | "slide-right"
  | "deal-in"
  | "stream-left"
  | "stream-right"
  | "menu-right"
  | "form-up";

const DEFAULT_STAGGER_MS = 65;

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
 * @param direction - Scroll direction (1 down, -1 up).
 */
export function prepareEnterElement(
  el: HTMLElement,
  kind: SlideEnterKind,
  direction: 1 | -1,
): void {
  el.style.opacity = "0";

  switch (kind) {
    case "slide-left":
      el.style.transform = "translateX(-56px) scale(0.94)";
      break;
    case "slide-right":
      el.style.transform = "translateX(56px) scale(0.94)";
      break;
    case "stream-left":
      el.style.transform = "translateX(-120px)";
      break;
    case "stream-right":
      el.style.transform = "translateX(120px)";
      break;
    case "menu-right":
      el.style.transform = "translateX(72px) scale(0.96)";
      break;
    case "panel-up":
      el.style.transform = "translateY(64px) scale(0.9)";
      break;
    case "form-up":
      el.style.transform = `translateY(${direction * 28}px) scale(0.97)`;
      break;
    case "deal-in":
      el.style.transform = "translateY(32px) scale(0.88) rotate(-4deg)";
      break;
    case "rise":
      el.style.transform = `translateY(${direction * 24}px) scale(0.97)`;
      break;
    default:
      el.style.transform = `translateY(${direction * 16}px)`;
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
    case "slide-left":
      return {
        opacity: [0, 1],
        translateX: [-56, 0],
        scale: [0.94, 1],
      };
    case "slide-right":
      return {
        opacity: [0, 1],
        translateX: [56, 0],
        scale: [0.94, 1],
      };
    case "stream-left":
      return { opacity: [0, 1], translateX: [-120, 0] };
    case "stream-right":
      return { opacity: [0, 1], translateX: [120, 0] };
    case "menu-right":
      return {
        opacity: [0, 1],
        translateX: [72, 0],
        scale: [0.96, 1],
      };
    case "panel-up":
      return {
        opacity: [0, 1],
        translateY: [64, 0],
        scale: [0.9, 1],
      };
    case "form-up":
      return {
        opacity: [0, 1],
        translateY: [direction * 28, 0],
        scale: [0.97, 1],
      };
    case "deal-in":
      return {
        opacity: [0, 1],
        translateY: [32, 0],
        scale: [0.88, 1],
        rotate: [-4, 0],
      };
    case "rise":
      return {
        opacity: [0, 1],
        translateY: [direction * 24, 0],
        scale: [0.97, 1],
      };
    default:
      return {
        opacity: [0, 1],
        translateY: [direction * 16, 0],
      };
  }
}

/**
 * Runs the enter animation for every `[data-enter]` element in a slide.
 *
 * @param slide - Slide root.
 * @param slideId - Which slide (used to tune duration/ease per section).
 * @param direction - Scroll direction.
 * @param reducedMotion - Skip animation when true.
 * @returns Combined animation handle, or null when skipped.
 */
export function animateSlideEnter(
  slide: HTMLElement | null,
  slideId: LandingSlideId,
  direction: 1 | -1,
  reducedMotion: boolean,
): JSAnimation | null {
  if (!slide || reducedMotion) return null;

  const targets = slide.querySelectorAll<HTMLElement>("[data-enter]");
  if (targets.length === 0) return null;

  const duration =
    slideId === "how" || slideId === "outputs"
      ? 560
      : slideId === "compare"
        ? 480
        : 520;

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
        duration,
        delay,
        ease: slideId === "importers" ? "out(2)" : "out(3)",
      }),
    );
  });

  return animations[0] ?? null;
}
