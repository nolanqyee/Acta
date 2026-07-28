/**
 * @fileoverview Sun/moon control for light/dark on the graph home.
 *
 * Wires into `useTheme` and `html[data-mode]` (see `theme-boot-script.tsx`). The canvas
 * receives `resolvedTheme` from the parent so it repaints when this flips.
 */

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./use-theme";
import styles from "./theme-toggle.module.css";

/**
 * Toggles between light and dark. Shows sun in dark mode (switch to light) and moon in
 * light mode (switch to dark), per brand §11 metaphors.
 *
 * @returns The theme toggle button for top-right chrome.
 */
export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
