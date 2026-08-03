/**
 * @fileoverview Design tokens, resolved into values a canvas can actually draw with.
 *
 * `src/styles/tokens.css` stays the single source of truth for colour, but a canvas
 * context cannot consume `var(--edge)` or a `color-mix()` expression — it silently
 * draws black instead. So we let the browser resolve them on the document root.
 */

/** Everything the renderer needs to draw a frame. */
export interface Palette {
  background: string;
  node: string;
  nodeStrong: string;
  edge: string;
  accent: string;
  secondary: string;
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
  secondary: "--brand-secondary",
  label: "--text-muted",
};

/** Used when there is no document to measure (SSR, tests). */
const FALLBACK: Palette = {
  background: "#f4f1e9",
  node: "#f4f1e9",
  nodeStrong: "#10120f",
  edge: "rgba(16, 18, 15, 0.5)",
  accent: "#6fb3e8",
  secondary: "#ff2861",
  label: "rgba(16, 18, 15, 0.52)",
  fontFamily: "Figtree, system-ui, -apple-system, sans-serif",
};

let cached: Palette | null = null;

/**
 * Resolves the light-mode palette by measuring tokens on the document root.
 *
 * @returns Canvas-ready colours and font family.
 */
export function getPalette(): Palette {
  if (typeof document === "undefined") return FALLBACK;
  if (cached) return cached;

  const probe = document.createElement("span");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;top:0;left:0";
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

    cached = palette;
    return palette;
  } finally {
    probe.remove();
  }
}
