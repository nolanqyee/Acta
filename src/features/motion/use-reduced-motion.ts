/**
 * @fileoverview Tracks `prefers-reduced-motion` for anime.js enter helpers.
 */

"use client";

import { useMediaQuery } from "@/lib/use-media-query";

/**
 * @returns True when the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
