/**
 * @fileoverview Theme state for the app shell. Brand §2 locks light and dark as
 * equally first-class with the OS preference as the default, so the stored value is
 * tri-state (`system` | `light` | `dark`) rather than a boolean: choosing "system" is
 * a real choice, not the absence of one.
 *
 * The token file keys off `html[data-mode]` and falls back to `prefers-color-scheme`
 * when the attribute is absent — so "system" is expressed by *removing* the
 * attribute.
 *
 * The preference lives in `localStorage`, which React can't observe on its own, so
 * this module is a tiny external store: writes apply the attribute and notify
 * subscribers, and components read it through `useSyncExternalStore`. That keeps the
 * DOM (the real owner of the theme) authoritative instead of mirroring it into state.
 */

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import {
  parseStoredMode,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemeMode,
} from "./theme-storage";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const listeners = new Set<() => void>();

/**
 * Reads the persisted preference, tolerating a missing or junk value.
 *
 * @returns The stored mode, or `system` when unset/invalid.
 */
function readStoredMode(): ThemeMode {
  try {
    return (
      parseStoredMode(window.localStorage.getItem(THEME_STORAGE_KEY)) ??
      "system"
    );
  } catch {
    // Private-mode / blocked storage: fall back to following the OS.
    return "system";
  }
}

/**
 * Subscribes to theme changes from this tab (our own writes) and from others (the
 * browser's `storage` event).
 *
 * @param onStoreChange - Callback React uses to schedule a re-read.
 * @returns An unsubscribe function.
 */
function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/**
 * Persists a mode, applies it to the document, and notifies subscribers.
 *
 * @param mode - The mode to store and apply.
 */
function writeMode(mode: ThemeMode): void {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-mode");
  else root.setAttribute("data-mode", mode);

  try {
    if (mode === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Preference just won't survive a reload; the session still themes correctly.
  }

  listeners.forEach((listener) => listener());
}

/**
 * Owns the theme preference: exposes the stored choice, the theme actually being
 * painted (which the canvas needs to resolve token colours), and setters.
 *
 * @returns The chosen `mode`, the `resolvedTheme`, a `setMode` setter, and `toggle`
 *   for the sun/moon control.
 */
export function useTheme(): {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
} {
  const mode = useSyncExternalStore<ThemeMode>(
    subscribe,
    readStoredMode,
    () => "system",
  );
  const systemPrefersDark = useMediaQuery(DARK_QUERY);

  const resolvedTheme: ResolvedTheme =
    mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

  const setMode = useCallback((next: ThemeMode) => writeMode(next), []);
  const toggle = useCallback(
    () => writeMode(resolvedTheme === "dark" ? "light" : "dark"),
    [resolvedTheme],
  );

  return { mode, resolvedTheme, setMode, toggle };
}
