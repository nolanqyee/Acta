/**
 * @fileoverview The mutable shapes the canvas simulation works with.
 *
 * These are distinct from the `GraphSnapshot` contract on purpose: a snapshot is
 * immutable data fetched from the server, while these carry the position and
 * velocity that `d3-force` mutates in place every tick. Keeping them separate is
 * what lets a snapshot refresh reuse existing bodies instead of restarting the
 * layout.
 */

import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import type { GraphNode } from "@/lib/contracts";

/**
 * A node as the simulation sees it: the snapshot's fields plus live physics state
 * and the connection count we use for visual weight.
 *
 * `anchorX`/`anchorY` back the soft-anchor scheme that replaced hard drag-freezing:
 * `d3-force`'s alpha is global, so any energy injected anywhere (e.g. a drag) unfreezes
 * residual tension across the whole layout. Pinning distant nodes with `fx`/`fy` used
 * to contain that, but a pinned node is infinitely massive, so a free node squeezed
 * between it and a drag gets a force correction discarded every tick and buzzes
 * forever. Instead, once the layout is at rest every node records its settled position
 * here and gets a weak spring back to it — enough to cancel a far node's near-zero
 * residual drift, but easily overpowered by the real forces near an active drag.
 */
export interface CanvasNode extends SimulationNodeDatum, GraphNode {
  /** How many links touch this node; drives dot size and label priority. */
  degree: number;
  /**
   * How strongly this node is currently held to its anchor, 0–1.
   *
   * 1 is fully held (undisturbed); 0 is completely free. A drag drives this down
   * smoothly with distance, which is what makes the graph part like a fluid around the
   * pointer instead of switching nodes between "frozen" and "loose".
   */
  anchorHold?: number;
  /** Where this node settled at the last rest; a weak spring pulls it back here. */
  anchorX?: number;
  anchorY?: number;
}

/**
 * A link as the simulation sees it. `source`/`target` start as ids and are replaced
 * by node references once `forceLink` initialises — hence the union.
 */
export interface CanvasLink extends SimulationLinkDatum<CanvasNode> {
  id: string;
  /** Relation weight (0–1); scales spring length and stiffness. */
  weight: number;
}

/** A node that has been through at least one tick, so its position is known. */
export type PositionedNode = CanvasNode & { x: number; y: number };

/** A link whose endpoints have been resolved to positioned nodes. */
export type PositionedLink = CanvasLink & {
  source: PositionedNode;
  target: PositionedNode;
};
