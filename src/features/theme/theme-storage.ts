/**
 * @fileoverview Shared theme vocabulary: the mode types, the `localStorage` key, and
 * the parse helper.
 *
 * These deliberately live outside `use-theme.ts`. That module carries the
 * `"use client"` directive, and a `"use client"` module imported from server code
 * resolves to a client *reference* — its plain value exports read as `undefined`.
 * Since the boot script is rendered on the server and needs the same key the hook
 * writes, the key has to sit in a directive-free module both sides can import.
 */

/** What the user picked. `system` follows the OS. */
export type ThemeMode = "system" | "light" | "dark";

/** The theme actually being painted right now. */
export type ResolvedTheme = "light" | "dark";

/** Where the preference is persisted. Shared by the hook and the boot script. */
export const THEME_STORAGE_KEY = "acta.theme";

/**
 * Narrows an arbitrary stored string to an explicit theme choice.
 *
 * @param value - Raw `localStorage` value, possibly null or stale.
 * @returns The explicit mode, or null when the value means "follow the OS".
 */
export function parseStoredMode(value: string | null): ResolvedTheme | null {
  return value === "light" || value === "dark" ? value : null;
}
