/**
 * @fileoverview The hover card — a compact, opaque peek that follows the pointer over a
 * node. Shown only when nothing is selected (the left detail panel takes over once a
 * node is clicked). Independent of selection.
 *
 * Positioned in plain CSS px near the pointer rather than measured after mount — the
 * card's own max size is fixed (see {@link CARD_WIDTH_PX}), so a cheap arithmetic
 * flip away from whichever viewport edge is close keeps it on screen without a
 * measure-then-reposition flash. Vertical placement uses `translateY(-100%)` when
 * flipped above the pointer so the gap matches the below-cursor case.
 */

"use client";

import { useEffect, useRef } from "react";
import { animateFadeIn } from "@/features/motion/enter";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import type { PositionedNode } from "./types";
import { formatTimeframe, humanize } from "./format-endeavor";
import styles from "./hover-card.module.css";

interface HoverCardProps {
  node: PositionedNode;
  /** Pointer position in CSS px, relative to the graph surface. */
  x: number;
  y: number;
}

/** Gap between the pointer and the card, in CSS px. */
const OFFSET_PX = 16;

/** Must match `.card`'s `max-width` in hover-card.module.css. */
const CARD_WIDTH_PX = 260;

/**
 * Height estimate for deciding whether to flip above the pointer — not used for
 * vertical placement (see {@link placement}).
 */
const CARD_FLIP_HEIGHT_PX = 120;

/** Longest summary snippet shown before an ellipsis. */
const MAX_SNIPPET_CHARS = 140;

/**
 * @param summary - Full summary text, if any.
 * @returns A one-line-ish snippet short enough for a peek card.
 */
function snippet(summary: string | undefined): string | null {
  if (!summary) return null;
  return summary.length <= MAX_SNIPPET_CHARS
    ? summary
    : `${summary.slice(0, MAX_SNIPPET_CHARS - 1).trimEnd()}…`;
}

/**
 * Picks a corner to grow from so the card stays on screen, without measuring it.
 *
 * @param x - Pointer x, relative to the graph surface (== viewport, it's full-bleed).
 * @param y - Pointer y, relative to the graph surface.
 * @returns Inline `left`/`top`/`flipY` for the card. When `flipY`, the card grows
 *   upward from `top` via `translateY(-100%)` so the gap above the pointer matches
 *   the gap below.
 */
function placement(x: number, y: number): {
  left: number;
  top: number;
  flipY: boolean;
} {
  const vw = typeof window === "undefined" ? Infinity : window.innerWidth;
  const vh = typeof window === "undefined" ? Infinity : window.innerHeight;

  const left =
    x + OFFSET_PX + CARD_WIDTH_PX > vw
      ? x - OFFSET_PX - CARD_WIDTH_PX
      : x + OFFSET_PX;
  const flipY = y + OFFSET_PX + CARD_FLIP_HEIGHT_PX > vh;
  const top = flipY ? y - OFFSET_PX : y + OFFSET_PX;

  return { left: Math.max(8, left), top: Math.max(8, top), flipY };
}

/**
 * A compact, opaque peek at whatever node is under the pointer.
 *
 * @param props.node - The hovered node (already carries every `GraphNode` field).
 * @param props.x - Pointer x, relative to the graph surface.
 * @param props.y - Pointer y, relative to the graph surface.
 * @returns The card, or nothing worth reading beyond the canvas's own hover treatment.
 */
export function HoverCard({ node, x, y }: HoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { left, top, flipY } = placement(x, y);
  const timeframe = formatTimeframe(node.timeframe);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const anim = animateFadeIn(el, reducedMotion);
    return () => {
      anim?.revert();
    };
  }, [node.id, reducedMotion]);

  const summary = snippet(node.summary);
  const facetLine = [
    ...node.facets.skills,
    ...node.facets.people,
    ...node.facets.orgs,
  ]
    .slice(0, 3)
    .join(" · ");

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        left,
        top,
        transform: flipY ? "translateY(-100%)" : undefined,
      }}
      role="status"
      aria-live="polite"
    >
      <div className={styles.kicker}>
        <span className={styles.kind}>{humanize(node.kind)}</span>
        {timeframe ? (
          <span className={styles.timeframe}>{timeframe}</span>
        ) : null}
      </div>
      <div className={styles.title}>{node.title}</div>
      {summary ? <p className={styles.summary}>{summary}</p> : null}
      {facetLine ? <p className={styles.facets}>{facetLine}</p> : null}
    </div>
  );
}
