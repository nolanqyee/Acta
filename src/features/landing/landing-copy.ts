/**
 * @fileoverview Canonical marketing copy for the Acta landing page and other
 * public surfaces. Messaging strategy: docs/marketing-angle.md
 */

/** One sentence for README, OG tags, or anywhere the product must land fast. */
export const MARKETING_ONE_LINER =
  "Everything you've done, resurfaced when it matters.";

/** Short eyebrow above the hero headline. */
export const HERO_EYEBROW = "Waitlist open · remember everything";

/** Hero h1 line 1 — forced break; full phrase continues on lines 2–3. */
export const HERO_HEADLINE_LINE1 = "Everything you";

/** Hero h1 line 2 — forced break before animated line 3. */
export const HERO_HEADLINE_LINE2 = "have ever done,";

/**
 * Cycling hero line 3 — past-participle + period (connected. · compounded. · resurfaced.).
 * First entry is the reduced-motion / SSR fallback.
 */
export const HERO_CYCLE_WORDS = ["connected.", "compounded.", "resurfaced."] as const;

/**
 * Hero subcopy — "when it matters" lives here so the h1 stays typographically short.
 */
export const HERO_SUMMARY =
  "Every year, you build projects, solve hard problems, and collect stories you'll eventually forget. Acta resurfaces them when it matters, so each interview, application, and résumé starts from everything you've already done.";
