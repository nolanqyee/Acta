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
    <div className="mt-acta-4">
      <h3 className="acta-label m-0 mb-acta-2">{label}</h3>
      <ul className="m-0 flex list-none flex-wrap gap-acta-2 p-0">
        {values.map((value) => (
          <li key={value} className="acta-chip">
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
 *   background also deselects, one layer up in `graph-home.tsx` — there's no scrim
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
    <div className="fixed left-acta-5 top-1/2 z-20 -translate-y-1/2">
      <div
        ref={panelRef}
        className="acta-panel relative max-h-[min(32rem,80dvh)] w-panel-max overflow-y-auto p-acta-4 font-ui text-ink"
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

        <div className="flex items-center gap-acta-2 pr-[var(--panel-close-gutter)]">
          <span className="text-label font-medium uppercase tracking-widest text-accent-text">
            {humanize(node.kind)}
          </span>
          {node.status !== "active" ? (
            <span className="rounded-ctl bg-canvas px-2 py-0.5 text-label capitalize text-muted">
              {humanize(node.status)}
            </span>
          ) : null}
        </div>

        <h2 className="mt-acta-2 font-display text-h-lg font-semibold leading-tight">
          {node.title}
        </h2>
        {timeframe ? (
          <p className="mt-acta-1 text-ui text-muted">{timeframe}</p>
        ) : null}

        {node.summary ? (
          <p className="mt-acta-4 whitespace-pre-wrap text-body leading-relaxed">
            {node.summary}
          </p>
        ) : (
          <p className="mt-acta-4 text-body italic text-muted">
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
