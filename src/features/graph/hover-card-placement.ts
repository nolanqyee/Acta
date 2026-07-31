/**
 * @fileoverview Viewport-aware hover card placement. Vertical flip follows the pointer:
 * when the card would extend past the viewport bottom from the cursor position, it
 * grows upward (`translateY(-100%)`) with a fixed gap — same rule as the original
 * hover card before measured-fit logic replaced it.
 */

/** Gap between the pointer and the card edge, in CSS px. */
export const HOVER_CARD_OFFSET_PX = 16;

/** Default card width when nothing has been measured yet. */
export const HOVER_CARD_WIDTH_PX = 260;

/** Fallback height before the first measure pass. */
export const HOVER_CARD_ESTIMATE_HEIGHT_PX = 120;

/** Inline placement for a hover card. */
export interface HoverCardPlacement {
  /** Fixed `left` in CSS px. */
  left: number;
  /** Anchor `top` in CSS px; pair with `flipY` + `translateY(-100%)`. */
  top: number;
  /** When true, the card grows upward from `top`. */
  flipY: boolean;
}

/**
 * Cheap first guess before the card has been measured.
 *
 * @param x - Pointer x in viewport CSS px.
 * @param y - Pointer y in viewport CSS px.
 * @param cardWidth - Assumed card width in CSS px.
 * @returns Initial placement; refined once height is measured.
 */
export function initialHoverCardPlacement(
  x: number,
  y: number,
  cardWidth = HOVER_CARD_WIDTH_PX,
): HoverCardPlacement {
  return resolveHoverCardPlacement(
    x,
    y,
    cardWidth,
    HOVER_CARD_ESTIMATE_HEIGHT_PX,
  );
}

/**
 * Picks horizontal side and whether to flip above the pointer.
 *
 * Vertical rule (original behaviour): flip when `y + offset + cardHeight` would pass
 * the viewport bottom — cursor-relative, not a separate "fits below" packing pass.
 *
 * @param x - Pointer x in viewport CSS px.
 * @param y - Pointer y in viewport CSS px.
 * @param cardWidth - Measured card width in CSS px.
 * @param cardHeight - Measured card height in CSS px.
 * @param offsetPx - Gap between pointer and card.
 * @param viewport - Optional viewport size for tests; defaults to `window`.
 * @returns Placement; when `flipY`, apply `transform: translateY(-100%)`.
 */
export function resolveHoverCardPlacement(
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
  offsetPx = HOVER_CARD_OFFSET_PX,
  viewport?: { width: number; height: number },
): HoverCardPlacement {
  const vw =
    viewport?.width ??
    (typeof window === "undefined" ? Infinity : window.innerWidth);
  const vh =
    viewport?.height ??
    (typeof window === "undefined" ? Infinity : window.innerHeight);
  const margin = 8;

  let left =
    x + offsetPx + cardWidth > vw - margin
      ? x - offsetPx - cardWidth
      : x + offsetPx;
  left = Math.max(margin, Math.min(left, vw - margin - cardWidth));

  const flipY = y + offsetPx + cardHeight > vh - margin;
  const top = flipY ? y - offsetPx : y + offsetPx;

  return {
    left,
    top: Math.max(margin, top),
    flipY,
  };
}
