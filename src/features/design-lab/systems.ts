/**
 * @fileoverview Design-system registry for the `/lab/design` workbench. A "design
 * system" here is a named surface treatment (fill, blur, shadow) applied to the
 * three chrome primitives (`.surface`/`.control`/`.field` in
 * `design-lab.module.css`) via a `[data-design="..."]` attribute on the shell.
 * This file is the single place that lists which systems exist, so adding one is
 * a one-line change plus a new CSS block — never a scattered string literal.
 */

/**
 * Every design system the lab can render, in display order for the switcher:
 * flat opaque chrome and frosted glass. Add a system by appending its name here
 * and its `:global([data-design="..."])` block in `design-lab.module.css`.
 */
export const DESIGN_SYSTEMS = ["opaque", "liquid-glass"] as const;

/** One named surface treatment from {@link DESIGN_SYSTEMS}. */
export type DesignSystem = (typeof DESIGN_SYSTEMS)[number];

/** The system the lab renders when no `?design=` query param is present. */
export const DEFAULT_DESIGN_SYSTEM: DesignSystem = "liquid-glass";

/**
 * Narrows an arbitrary string (typically a `?design=` query value) to a known
 * design system, so the lab never sets `data-design` to a value with no CSS
 * behind it.
 *
 * @param value - The raw query string value, or `null` if the param is absent.
 * @returns `value` itself if it names a system in {@link DESIGN_SYSTEMS},
 *   otherwise {@link DEFAULT_DESIGN_SYSTEM}.
 */
export function parseDesignSystem(value: string | null): DesignSystem {
  return (DESIGN_SYSTEMS as readonly string[]).includes(value ?? "")
    ? (value as DesignSystem)
    : DEFAULT_DESIGN_SYSTEM;
}
