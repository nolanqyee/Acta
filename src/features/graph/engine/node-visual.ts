/**
 * @fileoverview Design-system node states for the graph canvas (Claude Design
 * `Acta Design System.dc.html` §07). Maps interaction + endeavor metadata to
 * fixed screen-space sizes and colours — physics is unchanged.
 */

import type { GraphNode } from "@/lib/contracts";

/** Diameter in CSS px — design system §07 node states. */
export const NODE_DIAMETER_DEFAULT = 8;
export const NODE_DIAMETER_HOVER = 12;
export const NODE_DIAMETER_SELECTED = 15;

/** Opacity for nodes outside the highlighted neighbourhood. */
export const NODE_DIM_OPACITY = 0.18;

/** Ink stroke on paper, primary fills, and proposal/deepen accents. */
export const NODE_INK_STROKE_WIDTH = 2.5;

/** Edge stroke widths from design system §07 edge states. */
export const EDGE_WIDTH_BASE = 1.5;
export const EDGE_WIDTH_LIT = 2.2;
export const EDGE_OPACITY_BASE = 0.5;
export const EDGE_OPACITY_RECEDED = 0.25;
export const EDGE_OPACITY_LIT = 1;

/** How one node should be painted this frame. */
export interface NodePaint {
  /** Centre-to-edge radius in CSS px. */
  radius: number;
  /** Fill colour; omit fill when hollow. */
  fill: string | null;
  /** Stroke colour. */
  stroke: string;
  /** Stroke width in CSS px. */
  strokeWidth: number;
  /** Alpha multiplier after dimming. */
  alpha: number;
}

/**
 * Whether an endeavor reads as thin on the canvas (deepen backlog candidate).
 * Placeholder heuristic until the Deepen agent owns this — see
 * docs/surfaces-and-flows.md.
 *
 * @param node - Canvas node metadata.
 * @returns True when the node is a deepen backlog candidate (shown only in Deepen mode).
 */
export function isThinEndeavor(
  node: Pick<GraphNode, "summary" | "timeframe" | "facets">,
): boolean {
  if (!node.summary?.trim()) return true;
  const facetCount =
    node.facets.skills.length +
    node.facets.people.length +
    node.facets.orgs.length;
  return facetCount === 0 && !node.timeframe;
}

/**
 * Resolves screen-space paint for one node from design-system states.
 *
 * Priority: selected (15px primary) → hover/match (12px primary) → pending or thin
 * (8px secondary fill, ink border — thin only when deepen mode is on) → default paper dot.
 *
 * @param params.id - Node id.
 * @param params.thin - Whether deepen mode marks this node as thin on canvas.
 * @param params.pending - Whether the node is a proposal ghost awaiting confirm.
 * @param params.lit - Whether the node stays in the lit neighbourhood (1 or dim factor).
 * @param params.primaryId - Selected node id, if any.
 * @param params.primaryAmount - Selection accent strength 0–1.
 * @param params.secondaryId - Hovered node id driving the hover treatment.
 * @param params.secondaryAmount - Hover accent strength 0–1.
 * @param params.dragged - Whether the node is under an active drag.
 * @param params.palette - Resolved canvas colours.
 * @returns Paint instructions for {@link drawNodes}.
 */
export function resolveNodePaint(params: {
  id: string;
  thin: boolean;
  lit: number;
  primaryId: string | null;
  primaryAmount: number;
  secondaryId: string | null;
  secondaryAmount: number;
  dragged: boolean;
  pending: boolean;
  palette: {
    node: string;
    nodeStrong: string;
    accent: string;
    secondary: string;
  };
}): NodePaint {
  const {
    id,
    thin,
    lit,
    primaryId,
    primaryAmount,
    secondaryId,
    secondaryAmount,
    dragged,
    pending,
    palette,
  } = params;

  const alpha = lit;
  const rDefault = NODE_DIAMETER_DEFAULT / 2;
  const rHover = NODE_DIAMETER_HOVER / 2;
  const rSelected = NODE_DIAMETER_SELECTED / 2;

  /** Pending proposals and deepen backlog nodes share the same canvas language. */
  const proposalFill = (): NodePaint => ({
    radius: rDefault,
    fill: palette.secondary,
    stroke: palette.nodeStrong,
    strokeWidth: NODE_INK_STROKE_WIDTH,
    alpha,
  });

  if (dragged || (primaryId === id && primaryAmount > 0)) {
    const t = dragged ? 1 : primaryAmount;
    return {
      radius: rDefault + (rSelected - rDefault) * t,
      fill: palette.accent,
      stroke: palette.nodeStrong,
      strokeWidth: NODE_INK_STROKE_WIDTH,
      alpha,
    };
  }

  if (secondaryId === id && secondaryAmount > 0) {
    return {
      radius: rDefault + (rHover - rDefault) * secondaryAmount,
      fill: palette.accent,
      stroke: palette.nodeStrong,
      strokeWidth: NODE_INK_STROKE_WIDTH,
      alpha,
    };
  }

  if (pending) {
    return proposalFill();
  }

  if (thin) {
    return proposalFill();
  }

  return {
    radius: rDefault,
    fill: palette.node,
    stroke: palette.nodeStrong,
    strokeWidth: NODE_INK_STROKE_WIDTH,
    alpha,
  };
}
