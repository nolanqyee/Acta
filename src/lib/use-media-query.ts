/**
 * @fileoverview `useMediaQuery` — reads a CSS media query as React state via
 * `useSyncExternalStore`.
 *
 * Why not `useState` + `useEffect`: a media query is an external, already-observable
 * source. Copying it into state means an extra render pass on mount and a window
 * where React's view disagrees with the browser's. Subscribing directly is both
 * cheaper and the pattern React's own rules push toward.
 *
 * During SSR and hydration the query is reported as unmatched; the real value
 * arrives on the first client read.
 */

"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Tracks whether a media query currently matches.
 *
 * @param query - A CSS media query string, e.g. `(prefers-color-scheme: dark)`.
 * @returns True when the query matches; false during SSR/hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useMemo(
    () => () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
