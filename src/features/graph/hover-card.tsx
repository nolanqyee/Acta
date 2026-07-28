/**
 * @fileoverview The hover card — the "card surface" R9's dim-and-name treatment was
 * missing (docs/graph-canvas.md § Deliberately deferred used to list it). Follows the
 * pointer while it's over a node and disappears the instant it isn't; it never touches
 * selection or the node detail panel.
 *
 * Positioned in plain CSS px near the pointer rather than measured after mount — the
 * card's own max size is fixed (see {@link CARD_WIDTH_PX}/{@link CARD_MAX_HEIGHT_PX},
 * which must track the CSS module's `max-width`/`max-height`), so a cheap arithmetic
 * flip away from whichever viewport edge is close keeps it on screen without a
 * measure-then-reposition flash.
 */

"use client";

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

/** Rough ceiling on card height, for the same edge-flip arithmetic as width. */
const CARD_MAX_HEIGHT_PX = 220;

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
 * @returns Inline `left`/`top` for the card.
 */
function placement(x: number, y: number): { left: number; top: number } {
  const vw = typeof window === "undefined" ? Infinity : window.innerWidth;
  const vh = typeof window === "undefined" ? Infinity : window.innerHeight;

  const left =
    x + OFFSET_PX + CARD_WIDTH_PX > vw
      ? x - OFFSET_PX - CARD_WIDTH_PX
      : x + OFFSET_PX;
  const top =
    y + OFFSET_PX + CARD_MAX_HEIGHT_PX > vh
      ? y - OFFSET_PX - CARD_MAX_HEIGHT_PX
      : y + OFFSET_PX;

  return { left: Math.max(8, left), top: Math.max(8, top) };
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
  const { left, top } = placement(x, y);
  const timeframe = formatTimeframe(node.timeframe);
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
      className={styles.card}
      style={{ left, top }}
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
