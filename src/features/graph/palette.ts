/**
 * @fileoverview Design tokens, resolved into values a canvas can actually draw with.
 *
 * `src/styles/tokens.css` stays the single source of truth for colour, but a canvas
 * context cannot consume `var(--edge)` or a `color-mix()` expression — it silently
 * draws black instead. So we let the browser resolve them: apply the custom property
 * to an offscreen probe, read the computed value back, and cache the result.
 */

/** Everything the renderer needs to draw a frame. */
export interface Palette {
  background: string;
  node: string;
  nodeStrong: string;
  edge: string;
  accent: string;
  label: string;
  /** Resolved font family (a canvas `font` string can't contain `var()`). */
  fontFamily: string;
}

/** Which token backs each colour slot. */
const COLOR_TOKENS: Record<Exclude<keyof Palette, "fontFamily">, string> = {
  background: "--bg-canvas",
  node: "--node",
  nodeStrong: "--text",
  edge: "--edge",
  accent: "--accent",
  label: "--text-muted",
};

/** Used when there is no document to measure (SSR, tests). */
const FALLBACK: Palette = {
  background: "#0f0f10",
  node: "#d6d2ca",
  nodeStrong: "#f2efe9",
  edge: "rgba(242, 239, 233, 0.14)",
  accent: "#2aa77d",
  label: "#9c968c",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

let cached: { key: string; palette: Palette } | null = null;

/**
 * Resolves the palette for the theme currently applied to the document.
 *
 * @param themeKey - Anything that changes when the theme changes; used as the cache
 *   key so flipping themes re-resolves instead of keeping stale colours.
 * @returns Canvas-ready colours and font family.
 */
export function getPalette(themeKey: string): Palette {
  if (typeof document === "undefined") return FALLBACK;
  if (cached?.key === themeKey) return cached.palette;

  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);

  try {
    const palette = { ...FALLBACK };
    for (const [slot, token] of Object.entries(COLOR_TOKENS) as [
      Exclude<keyof Palette, "fontFamily">,
      string,
    ][]) {
      probe.style.color = `var(${token})`;
      const value = window.getComputedStyle(probe).color;
      if (value) palette[slot] = value;
    }

    probe.style.fontFamily = "var(--font-ui)";
    const family = window.getComputedStyle(probe).fontFamily;
    if (family) palette.fontFamily = family;

    cached = { key: themeKey, palette };
    return palette;
  } finally {
    probe.remove();
  }
}
