/**
 * @fileoverview Regression tests for hover card viewport placement.
 */

import { describe, expect, it } from "vitest";
import {
  HOVER_CARD_OFFSET_PX,
  HOVER_CARD_WIDTH_PX,
  resolveHoverCardPlacement,
} from "@/features/graph/surfaces/hover-card-placement";

const VIEWPORT = { width: 1000, height: 800 };

describe("resolveHoverCardPlacement", () => {
  const cardWidth = HOVER_CARD_WIDTH_PX;
  const cardHeight = 120;

  it("places the card below the pointer when there is room", () => {
    const y = 200;
    const placement = resolveHoverCardPlacement(
      300,
      y,
      cardWidth,
      cardHeight,
      HOVER_CARD_OFFSET_PX,
      VIEWPORT,
    );
    expect(placement.flipY).toBe(false);
    expect(placement.top).toBe(y + HOVER_CARD_OFFSET_PX);
  });

  it("flips above the pointer when the card would pass the viewport bottom", () => {
    const y = 760;
    const placement = resolveHoverCardPlacement(
      300,
      y,
      cardWidth,
      cardHeight,
      HOVER_CARD_OFFSET_PX,
      VIEWPORT,
    );
    expect(placement.flipY).toBe(true);
    expect(placement.top).toBe(y - HOVER_CARD_OFFSET_PX);
  });

  it("flips horizontally when the card would pass the right edge", () => {
    const placement = resolveHoverCardPlacement(
      900,
      200,
      cardWidth,
      cardHeight,
      HOVER_CARD_OFFSET_PX,
      VIEWPORT,
    );
    expect(placement.left).toBeLessThan(900);
  });
});
