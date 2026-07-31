/**
 * @fileoverview The hover card — a compact, opaque peek that follows the pointer over a
 * node. Shown only when nothing is selected (the left detail panel takes over once a
 * node is clicked). Independent of selection.
 *
 * Placement tracks the pointer every frame; card height is measured so wrapped chips
 * flip above the cursor when the pointer is low on the viewport.
 */

"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animateFadeIn } from "@/features/motion/enter";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import {
  HOVER_CARD_ESTIMATE_HEIGHT_PX,
  HOVER_CARD_OFFSET_PX,
  HOVER_CARD_WIDTH_PX,
  resolveHoverCardPlacement,
} from "./hover-card-placement";
import type { PositionedNode } from "./types";
import { formatTimeframe, humanize } from "./format-endeavor";
import styles from "./hover-card.module.css";

interface HoverCardProps {
  node: PositionedNode;
  /** Pointer position in CSS px, relative to the graph surface. */
  x: number;
  y: number;
}

/** Longest summary snippet shown before an ellipsis. */
const MAX_SNIPPET_CHARS = 140;

/** Max facet chips shown on the peek card. */
const MAX_FACET_CHIPS = 6;

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
  const [size, setSize] = useState({
    width: HOVER_CARD_WIDTH_PX,
    height: HOVER_CARD_ESTIMATE_HEIGHT_PX,
  });
  const timeframe = formatTimeframe(node.timeframe);
  const summary = snippet(node.summary);
  const facets = useMemo(
    () =>
      [
        ...node.facets.skills,
        ...node.facets.people,
        ...node.facets.orgs,
      ].slice(0, MAX_FACET_CHIPS),
    [node.facets.orgs, node.facets.people, node.facets.skills],
  );

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setSize((prev) =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  }, [node.id, x, y, summary, facets.length]);

  const placement = useMemo(
    () =>
      resolveHoverCardPlacement(
        x,
        y,
        size.width,
        size.height,
        HOVER_CARD_OFFSET_PX,
      ),
    [size.height, size.width, x, y],
  );

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const anim = animateFadeIn(el, reducedMotion);
    return () => {
      anim?.revert();
    };
  }, [node.id, reducedMotion]);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        left: placement.left,
        top: placement.top,
        transform: placement.flipY ? "translateY(-100%)" : undefined,
      }}
      role="status"
      aria-live="polite"
    >
      <div className={styles.kicker}>
        <span className={styles.kind}>{humanize(node.kind)}</span>
        {node.state === "pending" ? (
          <span className={styles.pending}>Pending</span>
        ) : null}
        {timeframe ? (
          <span className={styles.timeframe}>{timeframe}</span>
        ) : null}
      </div>
      <div className={styles.title}>{node.title}</div>
      {summary ? <p className={styles.summary}>{summary}</p> : null}
      {facets.length > 0 ? (
        <ul className={styles.chips}>
          {facets.map((facet) => (
            <li key={facet} className={styles.chip}>
              {facet}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
