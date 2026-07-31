/**
 * @fileoverview Design-system registry for the `/lab/design` workbench. A "design
 * system" here is a named surface treatment applied to chrome primitives via a
 * `[data-design="..."]` attribute on the shell. The lab currently ships one
 * system — Neubrutalism — matching the Claude Design clickthrough.
 */

/** Every design system the lab can render, in display order. */
export const DESIGN_SYSTEMS = ["neubrutalism"] as const;

/** One named surface treatment from {@link DESIGN_SYSTEMS}. */
export type DesignSystem = (typeof DESIGN_SYSTEMS)[number];

/** The system the lab renders when no `?design=` query param is present. */
export const DEFAULT_DESIGN_SYSTEM: DesignSystem = "neubrutalism";

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
