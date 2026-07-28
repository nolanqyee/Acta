/**
 * @fileoverview Shared enter animations via anime.js — the single place frontend
 * motion is orchestrated so surfaces stay consistent and respect reduced motion.
 */

import { animate, type JSAnimation } from "animejs";

/** Default fade-and-lift enter — subtle pop, not a full slide. */
const DEFAULT_ENTER = {
  opacity: [0, 1],
  scale: [0.97, 1],
  translateY: [8, 0],
  duration: 260,
  ease: "out(3)",
};

/** Quick fade for transient surfaces like the hover card. */
const DEFAULT_FADE = {
  opacity: [0, 1],
  duration: 130,
  ease: "out(2)",
};

/**
 * Runs a short enter animation on an element, or snaps it visible when motion is
 * reduced.
 *
 * @param target - DOM node to animate.
 * @param reducedMotion - When true, skip animation and leave the element visible.
 * @returns The anime.js animation instance, or null when skipped.
 */
export function animateEnter(
  target: Element,
  reducedMotion: boolean,
): JSAnimation | null {
  if (reducedMotion) return null;
  return animate(target, { ...DEFAULT_ENTER });
}

/**
 * Fades an element in — for lightweight surfaces that follow the pointer.
 *
 * @param target - DOM node to animate.
 * @param reducedMotion - When true, skip animation.
 * @returns The anime.js animation instance, or null when skipped.
 */
export function animateFadeIn(
  target: Element,
  reducedMotion: boolean,
): JSAnimation | null {
  if (reducedMotion) return null;
  return animate(target, { ...DEFAULT_FADE });
}
