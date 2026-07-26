/**
 * @fileoverview A regression guard on the settled layout's *shape*.
 *
 * Two rules about this file, learned the hard way (docs/graph-canvas.md § Why the
 * first attempt failed):
 *
 *  1. **It measures the real engine.** It constructs the same `GraphSimulation` the
 *     canvas runs, with the same defaults. The previous version of this test
 *     re-implemented the forces, so it could pass while the canvas looked wrong.
 *  2. **It is not the verdict.** Passing means "the layout is still roughly round and
 *     not overlapping", which is the thing that silently regresses when forces are
 *     retuned. Whether the canvas looks *good* is decided by looking at it
 *     (`scripts/shoot-graph.mjs`), never here.
 *
 * Thresholds are loose on purpose: they should catch a collapse or a sprawl, not
 * ordinary variation between graphs.
 */

import { describe, expect, it } from "vitest";
import { buildSampleGraph } from "@/lib/graph/sample-graph";
import { buildLabFixture } from "@/features/graph/lab-fixture";
import { GraphSimulation } from "@/features/graph/simulation";
import { collisionRadius, DEFAULT_TUNABLES } from "@/features/graph/tunables";

/** Hard ceiling on settle loops, so a bug can't hang the suite. */
const SETTLE_TICKS = 20000;

/**
 * Ticks until the simulation reports it has come to rest.
 *
 * A fixed tick count is not good enough any more: the layout now keeps itself warm
 * until motion actually stops (`RESOLVE_ALPHA`), so a fixed budget samples it
 * mid-settle and the measurements move from run to run.
 *
 * @param simulation - The simulation to run.
 * @returns Ticks actually spent.
 */
function runToRest(simulation: GraphSimulation): number {
  let ticks = 0;
  while (ticks < SETTLE_TICKS && simulation.tick()) ticks++;
  return ticks;
}

/**
 * Half-width of the settled cloud, used to express "far away" as a share of the graph
 * rather than as a number of world units.
 *
 * Absolute distances do not survive retuning: raising centre gravity from 0.18 to 0.5
 * shrank this graph's outer radius from ~215 to ~154, and the locality tests below —
 * which looked for nodes more than 200 units from the drag — silently found none and
 * asserted over an empty set. Anything scale-dependent in this file goes through here.
 *
 * @param nodes - Settled nodes.
 * @returns Median distance from the origin.
 */
function medianRadius(nodes: { x: number; y: number }[]): number {
  const radii = nodes
    .map((node) => Math.hypot(node.x, node.y))
    .sort((a, b) => a - b);
  return radii[Math.floor(radii.length / 2)] ?? 1;
}

/** How far from the gesture, as a share of the median radius, counts as "far". */
const FAR_RADIUS_FRACTION = 1.15;

/**
 * Settles a graph with production defaults.
 *
 * @param snapshot - Graph to lay out.
 * @returns The settled node positions.
 */
function settle(
  snapshot: Parameters<typeof GraphSimulation.prototype.setSnapshot>[0],
) {
  const simulation = new GraphSimulation(snapshot, DEFAULT_TUNABLES);
  runToRest(simulation);
  return simulation.getNodes();
}

/**
 * Ratio of the bounding box's longer side to its shorter side.
 *
 * @param nodes - Settled nodes.
 * @returns 1 for a square silhouette, larger for an elongated one.
 */
function aspectRatio(nodes: { x: number; y: number }[]): number {
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return Math.max(width, height) / Math.max(1, Math.min(width, height));
}

/**
 * How far the furthest node sits from the centroid, relative to the typical node.
 *
 * A disc has a modest ratio; a graph with arms or a flung-out straggler has a large
 * one. This is the measurement that would have caught the first canvas' sprawl.
 *
 * @param nodes - Settled nodes.
 * @returns Maximum radius divided by median radius.
 */
function spikiness(nodes: { x: number; y: number }[]): number {
  const centroidX = nodes.reduce((sum, node) => sum + node.x, 0) / nodes.length;
  const centroidY = nodes.reduce((sum, node) => sum + node.y, 0) / nodes.length;
  const radii = nodes
    .map((node) => Math.hypot(node.x - centroidX, node.y - centroidY))
    .sort((a, b) => a - b);
  const median = radii[Math.floor(radii.length / 2)] ?? 1;
  return (radii.at(-1) ?? 0) / Math.max(1, median);
}

/**
 * Counts pairs of nodes closer than their collision radii allow.
 *
 * @param nodes - Settled nodes.
 * @returns Number of overlapping pairs.
 */
function overlaps(nodes: { x: number; y: number; degree: number }[]): number {
  let count = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!;
      const b = nodes[j]!;
      const minimum =
        (collisionRadius(a.degree, DEFAULT_TUNABLES) +
          collisionRadius(b.degree, DEFAULT_TUNABLES)) *
        0.55;
      if (Math.hypot(a.x - b.x, a.y - b.y) < minimum) count++;
    }
  }
  return count;
}

describe("settled layout shape", () => {
  it.each([
    ["sample graph", buildSampleGraph()],
    ["26-node fixture", buildLabFixture(26)],
    ["140-node fixture", buildLabFixture(140)],
  ])("settles %s into a round, non-overlapping cloud", (_name, snapshot) => {
    const nodes = settle(snapshot);

    expect(
      nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y)),
    ).toBe(true);
    expect(aspectRatio(nodes)).toBeLessThan(1.75);
    expect(spikiness(nodes)).toBeLessThan(2.6);
    expect(overlaps(nodes)).toBe(0);
  });

  it("keeps a dragged node exactly where the pointer puts it", () => {
    const simulation = new GraphSimulation(
      buildLabFixture(40),
      DEFAULT_TUNABLES,
    );
    const node = simulation.getNodes()[5]!;

    simulation.startDrag(node);
    simulation.dragTo(500, -250);
    for (let tick = 0; tick < 30; tick++) simulation.tick();

    expect(node.x).toBeCloseTo(500, 6);
    expect(node.y).toBeCloseTo(-250, 6);

    simulation.endDrag();
    runToRest(simulation);

    // Released, it rejoins the layout instead of staying pinned out in the margin.
    expect(Math.hypot(node.x, node.y)).toBeLessThan(400);
  });

  it("keeps a drag local instead of shaking the whole graph", () => {
    const simulation = new GraphSimulation(
      buildLabFixture(140),
      DEFAULT_TUNABLES,
    );
    runToRest(simulation);

    const before = new Map(
      simulation.getNodes().map((node) => [node.id, { x: node.x, y: node.y }]),
    );
    const node = simulation.getNodes()[70]!;
    const origin = { x: node.x, y: node.y };

    simulation.startDrag(node);
    for (let step = 1; step <= 60; step++) {
      simulation.dragTo(origin.x + step * 2, origin.y - step * 1.5);
      simulation.tick();
    }
    simulation.endDrag();
    runToRest(simulation);

    // Nodes that were never near the gesture — in the graph or on the plane — should
    // be where they were. Alpha is global, so without something holding them, touching
    // one node resumes every node's interrupted fall toward the centre. Anchors hold
    // them; nothing is frozen (an earlier hard freeze with `fx`/`fy` passed this same
    // assertion while the near field buzzed, which is why the jitter guard below
    // exists too).
    const radius = medianRadius([...before.values()]);
    const away = radius * FAR_RADIUS_FRACTION;
    const far = simulation.getNodes().filter((other) => {
      const start = before.get(other.id)!;
      return (
        Math.hypot(start.x - origin.x, start.y - origin.y) > away &&
        Math.hypot(start.x - node.x, start.y - node.y) > away
      );
    });

    expect(far.length).toBeGreaterThan(10);
    for (const other of far) {
      const start = before.get(other.id)!;
      // A few percent of the graph's own radius. Repulsion has no distance cutoff (see
      // tunables.ts — truncating it made the layout shiver forever), so moving one node
      // genuinely does shift every other node's equilibrium slightly. That far-field
      // response is physics; the leak this guards against moved far nodes by more than
      // half the graph's radius, so the bound still has plenty of signal.
      expect(Math.hypot(other.x - start.x, other.y - start.y)).toBeLessThan(
        radius * 0.09,
      );
    }
  });

  it("does not shimmer distant nodes while a node is dragged", () => {
    const simulation = new GraphSimulation(
      buildLabFixture(140),
      DEFAULT_TUNABLES,
    );
    const nodes = simulation.getNodes();
    const hub = nodes.reduce((a, b) => (b.degree > a.degree ? b : a));
    const start = nodes.map((node) => ({ x: node.x, y: node.y }));
    const origin = { x: hub.x, y: hub.y };
    const path: { x: number; y: number }[] = [];
    const travelled = nodes.map(() => 0);

    const TICKS = 40;
    simulation.startDrag(hub);
    for (let step = 1; step <= TICKS; step++) {
      const to = { x: origin.x + step * 4, y: origin.y - step * 3 };
      path.push(to);
      simulation.dragTo(to.x, to.y);
      const previous = nodes.map((node) => ({ x: node.x, y: node.y }));
      simulation.tick();
      nodes.forEach((node, i) => {
        travelled[i] =
          travelled[i]! +
          Math.hypot(node.x - previous[i]!.x, node.y - previous[i]!.y);
      });
    }
    simulation.endDrag();

    // Distance travelled per tick, not net displacement: a shimmering node ends up
    // roughly where it began, so only the path length reveals it. This is the metric
    // the founder was actually reporting, and net-displacement assertions were blind
    // to it — twice.
    const away = medianRadius(start) * FAR_RADIUS_FRACTION;
    const far = nodes
      .map((_, i) => i)
      .filter((i) =>
        [origin, ...path].every(
          (point) =>
            Math.hypot(start[i]!.x - point.x, start[i]!.y - point.y) > away,
        ),
      );

    expect(far.length).toBeGreaterThan(10);
    const perTick =
      far.reduce((total, i) => total + travelled[i]! / TICKS, 0) / far.length;
    expect(perTick).toBeLessThan(0.25);
  });

  it("treats node size as a visual setting, not a physics one", () => {
    const simulation = new GraphSimulation(
      buildLabFixture(60),
      DEFAULT_TUNABLES,
    );
    runToRest(simulation);

    const before = new Map(
      simulation.getNodes().map((node) => [node.id, { x: node.x, y: node.y }]),
    );

    simulation.setTunables({ ...DEFAULT_TUNABLES, nodeRadius: 5 });
    runToRest(simulation);

    for (const node of simulation.getNodes()) {
      const start = before.get(node.id)!;
      expect(node.x).toBe(start.x);
      expect(node.y).toBe(start.y);
    }
  });
});
