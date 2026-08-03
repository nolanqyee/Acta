/**
 * @fileoverview Live physics graph for the marketing hero — same renderer and node
 * states as the app graph, but softer tunables, no zoom/select, and a fit bias that
 * places the lattice centroid ~⅔ across the viewport; gentle intro bounce on load.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GraphCanvas } from "@/features/graph/engine/graph-canvas";
import { HERO_TUNABLES } from "@/features/graph/engine/tunables";
import { buildHeroGraph, HERO_GRAPH_SELECTED_ID } from "@/lib/graph/hero-graph";

/** Graph centroid target as a fraction of viewport width (⅔ from the left). */
const HERO_GRAPH_CENTER_X = 2 / 3;

/** Tight fit + boost — the hero shows a crop of the lattice, not the whole bounding box. */
const HERO_FIT_PADDING = 12;
const HERO_FIT_SCALE_BOOST = 2.4;

/** Nudge the fitted graph down to sit with the headline block (hero copy starts at 208px). */
const HERO_FIT_OFFSET_Y = 96;

/**
 * Renders the landing hero graph with gentle interaction: pan and slow node nudges
 * only. One node stays selected for visual focus; hover still lights neighbours.
 *
 * @returns The hero graph layer (decorative shell around {@link GraphCanvas}).
 */
export function HeroGraphCanvas() {
  const snapshot = useMemo(() => buildHeroGraph(), []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fitScreenOffsetX, setFitScreenOffsetX] = useState(0);

  /**
   * Keeps the fitted graph centroid at {@link HERO_GRAPH_CENTER_X} as the hero
   * resizes — default fit centres at 50%, so shift right by ⅙ of the width.
   */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = (): void => {
      const width = el.clientWidth;
      if (width <= 0) return;
      setFitScreenOffsetX(
        Math.round(width * (HERO_GRAPH_CENTER_X - 0.5)),
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="acta-hero-graph-wrap" aria-hidden="true">
      <GraphCanvas
        snapshot={snapshot}
        tunables={HERO_TUNABLES}
        transparentBackground
        selectedId={HERO_GRAPH_SELECTED_ID}
        interaction={{
          dragThresholdPx: 14,
          allowZoom: false,
          allowSelect: false,
          captureWheel: false,
        }}
        fitPadding={HERO_FIT_PADDING}
        fitScreenOffsetX={fitScreenOffsetX}
        fitScreenOffsetY={HERO_FIT_OFFSET_Y}
        fitScaleBoost={HERO_FIT_SCALE_BOOST}
        layoutIntro="bounce"
        dragAlphaScale={0.55}
      />
    </div>
  );
}
