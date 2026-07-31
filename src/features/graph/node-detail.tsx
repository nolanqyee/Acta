/**
 * @fileoverview The node detail panel — what a click on the canvas opens.
 *
 * Floats on the **left**, opaque, with the graph itself nudged right to clear it
 * (`GraphCanvas`'s focus offset, driven by whether a node is selected) rather than
 * covering the graph behind a centered card + scrim. Deliberately thin: every field
 * here already exists on `GraphNode` (docs/data-model.md § Canvas snapshot), so this is
 * an honest read of what the graph already carries, not a preview of the full Node
 * modal from docs/surfaces-and-flows.md. Header image, deepen prompts, a Generate CTA,
 * and editable tags/archive all depend on features that don't exist yet and are left
 * for their own slices (docs/graph-canvas.md § Deliberately deferred).
 */

"use client";

import { useEffect, useRef } from "react";
import type { GraphNode } from "@/lib/contracts";
import { animateEnter } from "@/features/motion/enter";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import { formatTimeframe, humanize } from "./format-endeavor";
import styles from "./node-detail.module.css";

interface NodeDetailProps {
  node: GraphNode;
  onClose: () => void;
}

/**
 * Renders one labelled chip list, or nothing if it's empty — an empty facet is not
 * worth a heading that just says "none".
 *
 * @param props.label - Section heading.
 * @param props.values - Chip text values.
 */
function ChipSection({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionLabel}>{label}</h3>
      <ul className={styles.chips}>
        {values.map((value) => (
          <li key={value} className={styles.chip}>
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The left-side, opaque detail panel for one selected endeavor node.
 *
 * @param props.node - The selected node, read straight from the canvas snapshot.
 * @param props.onClose - Called on Escape or the close button. A click on the canvas
 *   background also deselects, one layer up in `graph-view.tsx` — there's no scrim
 *   here to catch it.
 * @returns The panel, mounted at the root of the graph surface.
 */
export function NodeDetail({ node, onClose }: NodeDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const anim = animateEnter(el, reducedMotion);
    return () => {
      anim?.revert();
    };
  }, [node.id, reducedMotion]);

  const timeframe = formatTimeframe(node.timeframe);
  const tags = node.applicationTags.map((tag) => humanize(tag.tag));

  return (
    <div className={styles.shell}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="false"
        aria-label={node.title}
      >
      <button
        type="button"
        className="acta-panel-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

      <div className={styles.kicker}>
        <span className={styles.kind}>{humanize(node.kind)}</span>
        {node.state === "pending" ? (
          <span className={styles.pending}>Pending</span>
        ) : null}
        {node.status !== "active" ? (
          <span className={styles.status}>{humanize(node.status)}</span>
        ) : null}
      </div>

      <h2 className={styles.title}>{node.title}</h2>
      {timeframe ? <p className={styles.timeframe}>{timeframe}</p> : null}

      {node.summary ? (
        <p className={styles.summary}>{node.summary}</p>
      ) : (
        <p className={styles.empty}>
          No summary yet — this endeavor hasn&rsquo;t been deepened.
        </p>
      )}

      <ChipSection label="Tags" values={tags} />
      <ChipSection label="Skills" values={node.facets.skills} />
      <ChipSection label="People" values={node.facets.people} />
      <ChipSection label="Organizations" values={node.facets.orgs} />
      </div>
    </div>
  );
}
