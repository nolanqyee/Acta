/**
 * @fileoverview The four forces, as numbers a human can move.
 *
 * docs/graph-canvas.md R5 asks for centre gravity, node-node repulsion, and a link
 * spring with a link distance — each separately tunable. This module is the only
 * place those numbers live, so the dev HUD, the simulation, and any future settings
 * UI all read the same definitions.
 *
 * Values are starting points chosen to satisfy R1 (circular) and R2 (small nodes) on
 * a graph of a few dozen endeavors, and are expected to move as we look at real
 * graphs. They are not doctrine.
 */

/** The user-facing physics controls. */
export interface Tunables {
  /**
   * Cohesion: how hard every node is pulled toward the focal point, per tick.
   *
   * This is a real per-node force (`forceX`/`forceY`). Do not implement it with
   * `forceCenter`, which merely translates the graph so its average position lands
   * on target and provides no cohesion whatsoever — that mistake is what made the
   * first canvas sprawl (docs/graph-canvas.md § Why the first attempt failed).
   */
  gravity: number;
  /**
   * Node-node repulsion, expressed as a multiple of link distance rather than as a
   * raw `d3-force` charge.
   *
   * A charge in the hundreds is unreadable as a control and only means anything
   * relative to how long a link is: the same 340 is gentle at a link distance of 200
   * and violent at 20. Stating it as "how many link-distances' worth of push" makes
   * the slider a 0–20 dial whose ends both behave, and keeps repulsion proportional
   * when link distance moves. See {@link repulsionCharge}.
   */
  repulsion: number;
  /** Resting length of an average link, in world units. */
  linkDistance: number;
  /** Spring stiffness, 0–1; larger snaps connected nodes together harder. */
  linkStrength: number;
  /** Dot radius in world units at 1× zoom, before degree scaling. */
  nodeRadius: number;
}

/** Slider bounds for the dev HUD, so a control can't produce a broken layout. */
export const TUNABLE_RANGES: Record<
  keyof Tunables,
  { min: number; max: number; step: number }
> = {
  gravity: { min: 0, max: 1, step: 0.01 },
  repulsion: { min: 0, max: 20, step: 0.01 },
  linkDistance: { min: 10, max: 200, step: 1 },
  linkStrength: { min: 0.02, max: 1, step: 0.02 },
  nodeRadius: { min: 0, max: 5, step: 0.01 },
};

/**
 * Softer physics for the marketing hero — same forces, gentler springs and cohesion
 * so nudges feel illustrative rather than app-like.
 */
export const HERO_TUNABLES: Tunables = {
  gravity: 0.36,
  repulsion: 9.5,
  linkDistance: 44,
  linkStrength: 0.48,
  nodeRadius: 1,
};

/**
 * Calm defaults: a round, airy cloud of small dots.
 *
 * Chosen by shooting the same fixture at 26 and 140 nodes under a range of settings
 * and comparing the contact sheets (`scripts/compare-graph.mjs`). Gravity and
 * repulsion have to move together — raising one alone either collapses the cloud or
 * inflates it — and this pair holds a disc at both sizes.
 *
 * `repulsion: 8.5` at `linkDistance: 40` is the same physical push as the raw charge
 * of 340 these defaults used before the dial was rescaled; only the units changed.
 */
export const DEFAULT_TUNABLES: Tunables = {
  gravity: 0.5,
  repulsion: 12,
  linkDistance: 40,
  linkStrength: 1,
  nodeRadius: 1,
};

/**
 * Repulsion has **no** distance cutoff, deliberately.
 *
 * It used to stop at 3× link distance, on the reasoning that unbounded repulsion
 * inflates the graph and capping it keeps repulsion local so gravity owns the shape.
 * That reasoning is sound about shape and wrong about energy: a force that truncates
 * is not conservative. Two nodes drifting either side of the cutoff have repulsion
 * switch on and off between them, and each switch adds energy the layout can never
 * shed — so the graph never reaches equilibrium and shivers forever.
 *
 * Measured on a 140-node graph held at drag alpha: with the cutoff, nodes travelled
 * 17 units apiece over 200 ticks while going nowhere; without it, **zero**. Locality
 * of interaction is now the anchors' job (`anchorHold`), not the cutoff's, so nothing
 * needs it any more. The inflation it was preventing is handled by the gravity and
 * repulsion defaults instead.
 */

/**
 * Converts the 0–20 repulsion dial into the negative charge `forceManyBody` wants.
 *
 * The dial is a multiple of link distance, so a graph keeps its proportions when link
 * distance is retuned and the slider's ends stay usable (0 = collision-only spacing,
 * 20 = as wide as this layout ever wants to be).
 *
 * @param tunables - Current settings.
 * @returns Charge strength (negative — repulsive) for `forceManyBody`.
 */
export function repulsionCharge(tunables: Tunables): number {
  return -tunables.repulsion * tunables.linkDistance * REPULSION_SCALE;
}

/**
 * Converts the dial's "multiples of link distance" into an actual charge.
 *
 * Needed because repulsion is now global (no cutoff — see above), so every node's push
 * accumulates over the whole graph rather than a 3-link-distance neighbourhood, and the
 * same dial number goes much further. This factor is chosen so the dial keeps the
 * meaning it had: `repulsion: 8.5` at `linkDistance: 40` still settles a 140-node graph
 * to a median radius of ~155 world units, exactly as the capped version did.
 */
const REPULSION_SCALE = 0.19;

/**
 * Resting length for one link. Heavier relations sit closer, so a parent and its
 * projects read as a tight group next to a merely coincidental shared skill.
 *
 * @param weight - Relation weight (0–1).
 * @param tunables - Current settings.
 * @returns Target spring length in world units.
 */
export function springLength(weight: number, tunables: Tunables): number {
  return tunables.linkDistance * (1.45 - weight * 0.75);
}

/**
 * Stiffness for one link, scaled by the same weight.
 *
 * @param weight - Relation weight (0–1).
 * @param tunables - Current settings.
 * @returns Strength in d3-force terms (0–1).
 */
export function springStrength(weight: number, tunables: Tunables): number {
  return tunables.linkStrength * (0.55 + weight * 0.45);
}

/**
 * Radius of a node in world units, grown slightly by connection count so hubs read
 * as hubs without any node becoming large (R2).
 *
 * @param degree - Number of links touching the node.
 * @param tunables - Current settings.
 * @returns Radius in world units.
 */
export function nodeRadius(degree: number, tunables: Tunables): number {
  return tunables.nodeRadius * (1 + Math.min(degree, 8) * 0.09);
}

/**
 * Minimum gap between node centres, as a fraction of link distance.
 *
 * Deliberately independent of `nodeRadius`: that dial is how big a dot is *drawn*, and
 * changing how something looks must not move the layout.
 */
const COLLISION_SPACING = 0.25;

/**
 * Minimum gap enforced between node centres, so dots never overlap and labels have
 * somewhere to go.
 *
 * Derived from link distance rather than the visual `nodeRadius`, so the "Node size"
 * slider only changes what's drawn and never re-triggers a relayout.
 *
 * @param degree - Number of links touching the node.
 * @param tunables - Current settings.
 * @returns Collision radius in world units.
 */
export function collisionRadius(degree: number, tunables: Tunables): number {
  return (
    tunables.linkDistance * COLLISION_SPACING * (1 + Math.min(degree, 8) * 0.05)
  );
}
