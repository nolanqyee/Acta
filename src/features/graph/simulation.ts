/**
 * @fileoverview The physics engine. Owns a `d3-force` simulation and nothing else —
 * no React, no canvas, no input handling.
 *
 * It is deliberately **not** self-running: `d3-force`'s internal timer is replaced by
 * explicit `tick()` calls from the render loop, so one tick maps to one painted frame
 * (docs/graph-canvas.md R4 — dragging must feel stuck to the pointer). It also means
 * physics can be stepped headlessly for a pre-warm, or in a test, without a browser.
 */

import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Force,
  type Simulation,
} from "d3-force";
import type { GraphSnapshot } from "@/lib/contracts";
import { seedPositions } from "./seed";
import type {
  CanvasLink,
  CanvasNode,
  PositionedLink,
  PositionedNode,
} from "./types";
import {
  collisionRadius,
  DEFAULT_TUNABLES,
  repulsionCharge,
  springLength,
  springStrength,
  type Tunables,
} from "./tunables";

/**
 * How fast motion bleeds away each tick — the viscosity of the medium.
 *
 * **This is the main feel dial.** It trades smoothness against how much of the graph
 * yields to a drag, and the trade is monotonic, so pick the point you like. Measured
 * on a 140-node hub drag (roughness is frame-to-frame velocity change over speed —
 * how much a node knocks about versus glides; lower is more liquid):
 *
 * | decay | roughness | nodes that move | far shimmer |
 * | ----- | --------- | --------------- | ----------- |
 * | 0.40  | 0.63      | 84              | 0.152       |
 * | 0.50  | 0.55      | 64              | 0.123       |
 * | 0.65  | 0.33      | 29              | 0.068       |
 * | 0.75  | 0.26      | 15              | 0.051       |
 *
 * Lower is a looser, more liquid graph where more of the cloud sloshes; higher is
 * calmer and more local. 0.65 keeps a visible neighbourhood swimming without the
 * surroundings shivering.
 */
const VELOCITY_DECAY = 0.65;

/**
 * How fast the simulation cools toward rest — how long the graph keeps moving after a
 * disturbance.
 *
 * Slow, because R4 welcomes a long soft settle and — now that the shimmer is gone at
 * its source — a long tail is genuinely quiet rather than a graph vibrating in place.
 * It was briefly raised to 0.03 to shorten that tail, which was the wrong fix: it
 * shortened the *clock*, so a node dragged far out simply stopped partway home when the
 * budget expired. Cutting animation off is not the same as resolving it.
 *
 * Raise this together with {@link REHEAT_ALPHA}: total rearrangement from a disturbance
 * is proportional to `alpha / ALPHA_DECAY`, so moving one alone changes how *far* the
 * graph settles, not just how long it takes. Either way {@link RESOLVE_ALPHA} keeps the
 * layout warm until motion actually stops, so neither can truncate a settle any more.
 */
const ALPHA_DECAY = 0.0115;

/** Below this alpha, and only once nothing is moving, the layout stops spending frames. */
const REST_ALPHA = 0.004;

/**
 * Node speed (world units per tick) below which the layout is definitely done.
 *
 * Well under anything a person could see move. This is the fast path; {@link
 * STALL_TICKS} is what guarantees termination when a given set of tunables has a
 * residual floor above it.
 */
const RESOLVE_SPEED = 0.02;

/**
 * Ticks of no measurable improvement before the layout is declared finished.
 *
 * An absolute speed threshold alone is not safe to stop on: the residual floor scales
 * with the forces, so at high gravity the graph sits above {@link RESOLVE_SPEED}
 * forever and the render loop never parks — measured, it ran indefinitely at
 * `gravity: 0.6`. Stopping when the peak speed has stopped *falling* adapts to whatever
 * the tunables are and always terminates.
 */
const STALL_TICKS = 90;

/** Fraction of the best speed so far that counts as real improvement. */
const STALL_IMPROVEMENT = 0.98;

/** Alpha floor held while anything is still moving, so a settle always completes. */
const RESOLVE_ALPHA = 0.09;

/**
 * Energy injected when the graph has to re-lay-out — new data, changed forces, or a
 * released drag. Paired with {@link ALPHA_DECAY}: the two together set how far the
 * layout settles, and this one alone sets how briskly it starts.
 *
 * It is safe at this size only because anchors hold every undisturbed node. Before
 * them, a reheat this large unfroze residual tension across the whole graph and the
 * entire cloud lurched.
 */
const REHEAT_ALPHA = 0.16;

/**
 * Alpha held while a node is being dragged.
 *
 * Low on purpose. Neighbours respond because a drag relaxes their anchors (smoothly,
 * by distance — see {@link HOP_HOLD} and `relaxAnchors`), so they feel the full
 * link spring and repulsion; the rest of the graph keeps its anchor and barely moves.
 * Nothing but the dragged node is ever pinned.
 */
const DRAG_ALPHA = 0.13;

/**
 * Cap on the headless ticks run before the first paint.
 *
 * The pre-warm now runs until the layout is genuinely at rest rather than for a fixed
 * count, because the first anchors are captured at the end of it. Stopping early left
 * the graph creeping toward equilibrium for the first few seconds on screen *and*
 * un-anchored for that whole window, so an interaction in those seconds moved the
 * entire cloud. This is only the ceiling; settling normally ends it sooner.
 */
const PREWARM_TICK_LIMIT = 900;

/**
 * Stiffness of a node's spring back to where it last came to rest.
 *
 * Stiff, and that is fine, for two reasons that took a while to see. It is *additive*
 * to gravity rather than a replacement, so it only has to absorb the residual force
 * the layout never quite converged away — nothing has to be out-pulled. And every node
 * scales it by its own `anchorHold`, which a drag drives smoothly to zero nearby, so it
 * never resists a node that is supposed to be following the pointer.
 *
 * Chosen by sweep: reheat drift falls 17 → 1.8 world units between strengths 0.2 and 4
 * and keeps improving, but jitter starts climbing again past ~8 as the spring itself
 * begins to ring. 6 sits in the flat part of both curves.
 */
const ANCHOR_STRENGTH = 6;

/**
 * How much of its anchor a node keeps at each link hop from the dragged node.
 *
 * Index 0 is the dragged node itself. Graduated rather than on/off: a binary
 * free-or-held set puts a hard edge through the middle of the graph, and a node sitting
 * on that edge is shoved by its free neighbour and yanked back by its stiff anchor
 * every frame. That edge is a large part of what read as dragging through a bin of
 * Lego rather than through liquid.
 */
const HOP_HOLD = [0, 0, 0.35, 0.7, 0.9];

/**
 * Below this much remaining hold, a node counts as genuinely disturbed by the drag and
 * gives up its anchor on release rather than keeping a stale one.
 */
const DISTURBED_HOLD = 0.75;

/** Inside this many link distances of the pointer a node is completely free. */
const DRAG_FREE_RADIUS = 1.5;

/**
 * Beyond this many link distances the anchor is at full strength again.
 *
 * The gradient between this and {@link DRAG_FREE_RADIUS} *is* the fluid feel, so it
 * wants to be wide — but not wider than the graph. At 6 it was 240 world units against
 * a 140-node graph whose outermost nodes sit at ~215, so every node was inside the wake
 * and "local" meant nothing: releasing a drag handed the entire layout back to the
 * solver. Keep this comfortably below the graph's radius.
 */
const DRAG_INFLUENCE_RADIUS = 3;

/**
 * How fast a disturbed node's anchor creeps toward where the node actually is, per
 * tick, at full release.
 *
 * Without this the anchor is a memory: shove a node aside and it is pulled back to
 * where it used to live, so the graph behaves like foam that reinflates. Letting the
 * anchor follow means displaced regions simply accept their new shape — the wake
 * closes behind the pointer instead of springing back.
 */
const ANCHOR_FLOW = 0.06;

/**
 * How fast a loosened anchor tightens again once the drag ends, per tick.
 *
 * About a second to recover. Gradual because the alternative — full stiffness the
 * instant the pointer lifts — re-tightens anchors that have not finished drifting and
 * snaps the neighbourhood back.
 */
const ANCHOR_RECOVER = 0.02;

/**
 * How hard `forceCollide` pushes overlapping nodes apart, 0–1.
 *
 * d3's default of 1 resolves every overlap in a single step, which is precisely a
 * rigid-body contact: nodes click off each other instead of easing past. Softened so
 * separation is gradual and repulsion — a smooth field — does most of the spacing.
 */
const COLLIDE_STRENGTH = 0.2;

/** Softening radius for repulsion, in link distances. */
const REPULSION_MIN = 0.025;

/**
 * Barnes–Hut accuracy for repulsion. Lower is more exact — and much smoother.
 *
 * This turned out to be the single biggest source of the graph feeling like a bin of
 * Lego, and it is not physics at all: it is numerical noise. `forceManyBody` groups
 * distant nodes into quadtree cells and treats each as one body, and `theta` is how
 * coarse that grouping may be. d3's default of 0.9 is coarse, and the quadtree is
 * rebuilt every tick, so as nodes move the approximation flips between "use this cell"
 * and "recurse into it" — the force on a moving node jumps frame to frame for no
 * physical reason.
 *
 * Dropping 0.9 → 0.5 more than halved measured roughness (0.67 → 0.26) and halved far
 * shimmer, and the number of nodes drifting around fell by three quarters: much of what
 * looked like the whole graph reacting was the approximation error pushing it. 0.2 is
 * no better and costs more time. There is headroom for this at our graph sizes.
 */
const REPULSION_THETA = 0.5;

/** Damping used only while converging, high enough to kill the collide-vs-spring ringing. */
const CONVERGE_VELOCITY_DECAY = 0.9;

/** Ceiling on the fixed-alpha ticks {@link GraphSimulation.converge} will spend. */
const CONVERGE_TICK_LIMIT = 1200;

/** Peak node speed (world units per tick) below which the layout counts as balanced. */
const CONVERGED_SPEED = 0.02;

/** Shared empty result, so {@link GraphSimulation.getNeighbors} never allocates. */
const EMPTY_NEIGHBORS: ReadonlySet<string> = new Set<string>();

/**
 * Builds the force that pulls every node toward *home* — and decides where home is.
 *
 * Two pulls, combined here because they share a loop over every node:
 *
 *  - **Centre gravity** toward the world origin, for every node. This is the per-node
 *    pull that gives the graph its round silhouette (R1). It replaces `forceX`/`forceY`
 *    only so the anchor can share the traversal; the behaviour is identical.
 *  - **The anchor**, an extra spring back to where the node last settled, for nodes
 *    that have settled and have not been released by a drag.
 *
 * The anchor is what makes an interaction local, and the reason it is needed is worth
 * recording. `d3-force` stops because alpha decayed, not because the forces cancelled,
 * so a "settled" layout is really frozen mid-fall with real net force on every node.
 * Alpha is global — there is no other kind — so raising it to drag one node resumes
 * that interrupted fall *everywhere*, which is the whole cloud creeping and shivering
 * while you move a single dot. The anchor holds each undisturbed node against its own
 * residual, and {@link GraphSimulation.converge} shrinks that residual first so the
 * anchor has little left to do.
 *
 * Two approaches were tried and abandoned before this one, both recorded so they are
 * not re-attempted: pinning distant nodes with `fx`/`fy` (they become infinitely
 * massive walls, and a node squeezed against one buzzes at frame rate forever), and
 * *substituting* the anchor for gravity rather than adding to it (gravity is also the
 * containment that balances repulsion, so removing it let the graph inflate ~90 units).
 *
 * Implemented as a factory rather than a bound method so it always reads the current
 * node list — {@link GraphSimulation.setSnapshot} reassigns that array, and a stale
 * closure would pull nodes that no longer exist.
 *
 * @param getNodes - Returns the live node array at call time.
 * @param getTunables - Returns current settings, for the gravity strength.
 * @param getDragged - Returns the node being dragged, if any; it is pinned by `fx`/`fy`
 *   and must not be pulled anywhere.
 * @returns A `d3-force`-compatible force; `initialize` is a no-op as it needs no
 *   per-node precomputation.
 */
function homeForce(
  getNodes: () => CanvasNode[],
  getTunables: () => Tunables,
  getDragged: () => CanvasNode | null,
): Force<CanvasNode, CanvasLink> {
  const force = (alpha: number): void => {
    const dragged = getDragged();
    const gravity = getTunables().gravity * alpha;
    const anchor = ANCHOR_STRENGTH * alpha;

    for (const node of getNodes()) {
      if (node === dragged) continue;
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      node.vx = (node.vx ?? 0) - x * gravity;
      node.vy = (node.vy ?? 0) - y * gravity;

      if (node.anchorX === undefined || node.anchorY === undefined) continue;
      const hold = node.anchorHold ?? 1;
      if (hold <= 0) continue;
      node.vx += (node.anchorX - x) * anchor * hold;
      node.vy += (node.anchorY - y) * anchor * hold;
    }
  };
  force.initialize = (): void => {};
  return force;
}

/**
 * A force-directed layout of endeavor nodes, driven one tick at a time.
 */
export class GraphSimulation {
  private readonly simulation: Simulation<CanvasNode, CanvasLink>;
  private readonly nodesById = new Map<string, CanvasNode>();
  private readonly neighbors = new Map<string, Set<string>>();
  private nodes: CanvasNode[] = [];
  private links: CanvasLink[] = [];
  private tunables: Tunables;
  private dragged: CanvasNode | null = null;
  /**
   * How much anchor each node keeps for the current drag purely on graph distance —
   * see {@link HOP_HOLD}. Combined with a distance falloff in `applyDragInfluence`.
   */
  private readonly hopHold = new Map<string, number>();
  /**
   * True when every node's anchor needs to be recaptured at the next rest — set
   * whenever something legitimately invalidates the settled layout (new data, a
   * physics-affecting tunable change, or a completed drag).
   */
  private anchorsStale = true;
  /** Lowest peak speed seen since the last disturbance; drives stall detection. */
  private bestSpeed = Number.POSITIVE_INFINITY;
  /** Consecutive ticks without a meaningful improvement on {@link bestSpeed}. */
  private stalledFor = 0;

  /**
   * Builds a simulation for a snapshot and pre-warms it.
   *
   * @param snapshot - Nodes and links to lay out.
   * @param tunables - Force settings; defaults to the calm preset.
   */
  constructor(snapshot: GraphSnapshot, tunables: Tunables = DEFAULT_TUNABLES) {
    this.tunables = tunables;
    this.simulation = forceSimulation<CanvasNode, CanvasLink>()
      .velocityDecay(VELOCITY_DECAY)
      .alphaDecay(ALPHA_DECAY)
      .alphaMin(0)
      .stop();

    this.setSnapshot(snapshot);
    this.prewarm();
  }

  /**
   * Replaces the graph's contents, reusing any node that is still present so its
   * position and velocity survive — a refresh nudges the layout rather than
   * restarting it.
   *
   * @param snapshot - The new nodes and links.
   */
  setSnapshot(snapshot: GraphSnapshot): void {
    const degree = new Map<string, number>();
    for (const link of snapshot.links) {
      degree.set(link.source, (degree.get(link.source) ?? 0) + 1);
      degree.set(link.target, (degree.get(link.target) ?? 0) + 1);
    }

    const seeds = seedPositions(snapshot, this.tunables.linkDistance);
    const present = new Set<string>();
    let changed = snapshot.links.length !== this.links.length;

    this.nodes = snapshot.nodes.map((node) => {
      present.add(node.id);
      const existing = this.nodesById.get(node.id);
      if (existing) {
        // Copy the snapshot's fields over, but never the physics state.
        Object.assign(existing, node, { degree: degree.get(node.id) ?? 0 });
        return existing;
      }

      changed = true;
      const seed = seeds.get(node.id);
      const created: CanvasNode = {
        ...node,
        degree: degree.get(node.id) ?? 0,
        x: seed?.x ?? 0,
        y: seed?.y ?? 0,
      };
      this.nodesById.set(node.id, created);
      return created;
    });

    for (const id of [...this.nodesById.keys()]) {
      if (present.has(id)) continue;
      this.nodesById.delete(id);
      changed = true;
    }

    this.links = snapshot.links.map((link) => ({
      id: link.id,
      weight: link.weight,
      source: link.source,
      target: link.target,
    }));

    this.neighbors.clear();
    for (const link of snapshot.links) {
      this.neighborsOf(link.source).add(link.target);
      this.neighborsOf(link.target).add(link.source);
    }

    this.simulation.nodes(this.nodes);
    this.applyForces();

    // Only a change in *membership* invalidates the settled layout. Re-fetching the
    // same graph (or a re-render handing back an equal snapshot) must not throw away
    // the anchors and re-settle everything, which read on screen as the graph
    // spontaneously reflowing seconds after load.
    if (changed) {
      this.clearAnchors();
      this.reheat();
    }
  }

  /**
   * Swaps in new force settings, reheating so the change is visible immediately —
   * unless the only thing that changed is `nodeRadius`.
   *
   * `nodeRadius` controls how big a dot is *drawn* and nothing about the physics
   * (`collisionRadius` derives spacing from `linkDistance`, not from it — see
   * tunables.ts). Reheating and re-anchoring on every keystroke of that slider would
   * make "make the dots bigger" silently relayout the graph, which is exactly the
   * visual/physics coupling this scheme is meant to avoid.
   *
   * @param tunables - The new settings.
   */
  setTunables(tunables: Tunables): void {
    const previous = this.tunables;
    this.tunables = tunables;

    const onlyRadiusChanged = (
      Object.keys(tunables) as (keyof Tunables)[]
    ).every((key) => key === "nodeRadius" || tunables[key] === previous[key]);
    if (onlyRadiusChanged) return;

    this.clearAnchors();
    this.applyForces();
    this.reheat();
  }

  /** @returns The current force settings. */
  getTunables(): Tunables {
    return this.tunables;
  }

  /**
   * The adjacency entry for a node id, creating it on first use.
   *
   * @param id - Node id.
   * @returns The mutable set of ids linked to it.
   */
  private neighborsOf(id: string): Set<string> {
    const existing = this.neighbors.get(id);
    if (existing) return existing;
    const created = new Set<string>();
    this.neighbors.set(id, created);
    return created;
  }

  /**
   * Ids directly linked to a node — what the renderer needs to keep a hovered node's
   * connections lit while everything else fades.
   *
   * @param id - Node id.
   * @returns Its neighbours' ids (empty set if isolated or unknown).
   */
  getNeighbors(id: string): ReadonlySet<string> {
    return this.neighbors.get(id) ?? EMPTY_NEIGHBORS;
  }

  /**
   * (Re)creates every force from the current tunables.
   *
   * Cohesion is {@link homeForce}: a real per-node pull toward the origin that gives
   * the graph its round silhouette (R1), which becomes a pull toward where the node
   * settled once it has settled. There is intentionally no `forceCenter`.
   */
  private applyForces(): void {
    const t = this.tunables;

    this.simulation
      .force(
        "link",
        forceLink<CanvasNode, CanvasLink>(this.links)
          .id((node) => node.id)
          .distance((link) => springLength(link.weight, t))
          .strength((link) => springStrength(link.weight, t)),
      )
      .force(
        "repulsion",
        forceManyBody<CanvasNode>()
          .strength(repulsionCharge(t))
          .theta(REPULSION_THETA)
          // No `distanceMax`: truncating repulsion makes it non-conservative and the
          // layout can never stop shivering. See tunables.ts.
          .distanceMin(t.linkDistance * REPULSION_MIN),
      )
      .force(
        "collide",
        forceCollide<CanvasNode>(
          (node) => collisionRadius(node.degree, t),
          // A single iteration on purpose: two makes the collision constraint stiff
          // enough to overshoot on a squeezed node and hand that overshoot straight to
          // the anchor/repulsion tug-of-war next tick, reading as buzz.
        )
          .strength(COLLIDE_STRENGTH)
          .iterations(1),
      )
      .force(
        "home",
        homeForce(
          () => this.nodes,
          () => this.tunables,
          () => this.dragged,
        ),
      );
  }

  /**
   * Settles the layout headlessly so the first painted frame is already at rest, then
   * takes the first set of anchors from it.
   *
   * Anchoring here rather than waiting for the render loop to observe a rest is what
   * makes the graph local *immediately*. Otherwise the first few seconds on screen are
   * both un-anchored and still converging, and a drag in that window drags everything.
   */
  private prewarm(): void {
    this.simulation.alpha(1);
    for (
      let tick = 0;
      tick < PREWARM_TICK_LIMIT && this.simulation.alpha() >= REST_ALPHA;
      tick++
    ) {
      this.simulation.tick(1);
    }
    this.converge();
    this.simulation.alpha(0);
    this.captureAnchors();
  }

  /**
   * Runs at a fixed alpha until the layout stops moving — a *real* equilibrium, where
   * the forces cancel, rather than merely a cold one.
   *
   * This is the fix for the deepest of the jitter bugs. `d3-force` normally stops
   * because alpha decayed to nothing, not because anything balanced, so the layout is
   * frozen mid-fall with substantial net force still on every node. Raising alpha again
   * for a drag — and alpha is global, there is no other kind — resumes that interrupted
   * fall everywhere at once, which is the whole cloud creeping and shivering while you
   * move one node. Converging here means later alphas have nothing left to resume.
   *
   * Held at {@link DRAG_ALPHA} because that is the alpha interactions actually run at,
   * though equilibrium is alpha-independent: zero net force is zero at any scale.
   */
  private converge(): void {
    // Heavy damping only for this pass. At the normal decay the layout never converges
    // at all: `forceCollide` is a position constraint that keeps trading pushes with
    // the springs, so the peak speed oscillates around ~1 unit/tick forever. Damped
    // near-critically it drops to zero in a couple of hundred ticks, and the resting
    // *positions* are the same either way — only the ringing goes away.
    this.simulation.velocityDecay(CONVERGE_VELOCITY_DECAY);

    for (let tick = 0; tick < CONVERGE_TICK_LIMIT; tick++) {
      this.simulation.alpha(DRAG_ALPHA);
      this.simulation.tick(1);

      let peak = 0;
      for (const node of this.nodes) {
        const speed = Math.hypot(node.vx ?? 0, node.vy ?? 0);
        if (speed > peak) peak = speed;
      }
      if (peak < CONVERGED_SPEED) break;
    }

    this.simulation.velocityDecay(VELOCITY_DECAY);
  }

  /** Injects energy so the layout responds to a change, then cools again. */
  reheat(): void {
    this.resetStall();
    this.simulation.alpha(Math.max(this.simulation.alpha(), REHEAT_ALPHA));
  }

  /**
   * Advances the physics by one frame.
   *
   * While a node is being dragged the simulation is kept warm so neighbours keep
   * reacting; otherwise it cools and, once at rest, captures fresh anchors if the last
   * ones were invalidated. `relaxAnchors` runs every moving frame, dragging or not, so
   * that loosening after a grab and tightening after a release are both gradual.
   *
   * @returns True if the layout is still moving and should be redrawn next frame.
   */
  tick(): boolean {
    if (this.dragged) {
      this.simulation.alpha(Math.max(this.simulation.alpha(), DRAG_ALPHA));
    } else if (this.peakSpeed() > RESOLVE_SPEED && !this.hasStalled()) {
      // Still visibly moving, so keep enough energy to finish the job. Rest used to be
      // decided by the alpha clock alone, which meant a node dropped far from home
      // simply stopped partway there when the budget ran out — the layout gave up
      // rather than resolved. This terminates because the layout has a real
      // equilibrium to reach (see the repulsion cutoff note in tunables.ts); at rest
      // peak speed is ~0.001, two orders below this threshold.
      this.simulation.alpha(Math.max(this.simulation.alpha(), RESOLVE_ALPHA));
    } else if (this.simulation.alpha() < REST_ALPHA) {
      if (this.anchorsStale) this.captureAnchors();
      return false;
    }

    this.relaxAnchors();
    this.simulation.tick(1);
    return true;
  }

  /**
   * Whether the layout has stopped getting any calmer and should be left alone.
   *
   * Tracks the lowest peak speed seen since the last disturbance; if nothing beats it
   * by a meaningful margin for {@link STALL_TICKS}, the layout is at whatever floor
   * these forces have and further frames would only redraw a shimmer.
   *
   * @returns True when the settle has plateaued.
   */
  private hasStalled(): boolean {
    const speed = this.peakSpeed();
    if (speed < this.bestSpeed * STALL_IMPROVEMENT) {
      this.bestSpeed = speed;
      this.stalledFor = 0;
      return false;
    }
    this.stalledFor++;
    return this.stalledFor > STALL_TICKS;
  }

  /** Forgets the stall history, so a new disturbance gets a full chance to resolve. */
  private resetStall(): void {
    this.bestSpeed = Number.POSITIVE_INFINITY;
    this.stalledFor = 0;
  }

  /**
   * Fastest node in the layout right now.
   *
   * @returns Speed in world units per tick.
   */
  private peakSpeed(): number {
    let peak = 0;
    for (const node of this.nodes) {
      const speed = Math.hypot(node.vx ?? 0, node.vy ?? 0);
      if (speed > peak) peak = speed;
    }
    return peak;
  }

  /** @returns Live nodes, positioned. Mutated by every tick — do not cache. */
  getNodes(): PositionedNode[] {
    return this.nodes as PositionedNode[];
  }

  /** @returns Live links with resolved endpoints. Mutated by every tick. */
  getLinks(): PositionedLink[] {
    return this.links as PositionedLink[];
  }

  /**
   * Finds the node under a world-space point.
   *
   * @param x - World x.
   * @param y - World y.
   * @param radius - Hit radius in world units (usually generous, for touch).
   * @returns The closest node within the radius, or null.
   */
  nodeAt(x: number, y: number, radius: number): PositionedNode | null {
    let best: PositionedNode | null = null;
    let bestDistance = radius;

    for (const node of this.getNodes()) {
      const distance = Math.hypot(node.x - x, node.y - y);
      if (distance <= bestDistance) {
        best = node;
        bestDistance = distance;
      }
    }
    return best;
  }

  /**
   * Pins a node to the pointer and works out how much of its anchor each other node
   * keeps for the duration, by link distance from the one being dragged.
   *
   * Nothing is frozen and nothing is released outright: every node gets a *fraction*
   * of its anchor (see {@link HOP_HOLD}), and `applyDragInfluence` lowers it further
   * for whatever the pointer is currently near.
   *
   * @param node - The node being dragged.
   */
  startDrag(node: CanvasNode): void {
    this.dragged = node;
    node.fx = node.x;
    node.fy = node.y;

    this.hopHold.clear();
    this.hopHold.set(node.id, HOP_HOLD[0]!);
    let frontier = [node.id];
    for (let hop = 1; hop < HOP_HOLD.length; hop++) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const neighbor of this.getNeighbors(id)) {
          if (this.hopHold.has(neighbor)) continue;
          this.hopHold.set(neighbor, HOP_HOLD[hop]!);
          next.push(neighbor);
        }
      }
      frontier = next;
    }

    this.resetStall();
    this.relaxAnchors();
    // No reheat: a drag must not inject global energy. `tick` holds DRAG_ALPHA while
    // the pointer is down, which is enough for the neighbourhood to respond.
  }

  /**
   * Advances every node's `anchorHold` and lets disturbed anchors drift toward where
   * their nodes now are. Runs on **every** tick, dragging or not.
   *
   * Three properties, and all three have to be continuous or the graph clicks:
   *
   *  - **Loosening.** While dragging, hold falls off smoothly with distance from the
   *    pointer, so there is no edge in the graph for a node to be shoved against.
   *  - **Drift.** An anchor follows its node in proportion to how loose it is, so a
   *    region the pointer pushed through keeps its new shape rather than re-inflating.
   *    The dragged node is included — without that it keeps a full-strength anchor at
   *    the spot it started from and snaps back there the moment it is released.
   *  - **Recovery.** After the drag, hold eases back to 1 over ~a second instead of
   *    being restored at once. Restoring it in one step re-tightens a stale anchor and
   *    yanks the whole neighbourhood, which is the same snap in a different place.
   */
  private relaxAnchors(): void {
    const dragged = this.dragged;
    const scale = this.tunables.linkDistance;
    const inner = scale * DRAG_FREE_RADIUS;
    const outer = scale * DRAG_INFLUENCE_RADIUS;
    const pointerX = dragged?.fx ?? dragged?.x ?? 0;
    const pointerY = dragged?.fy ?? dragged?.y ?? 0;

    for (const node of this.nodes) {
      let hold = node.anchorHold ?? 1;

      if (!dragged) {
        hold += (1 - hold) * ANCHOR_RECOVER;
      } else if (node === dragged) {
        hold = 0;
      } else {
        const distance = Math.hypot(
          (node.x ?? 0) - pointerX,
          (node.y ?? 0) - pointerY,
        );
        const t = Math.min(
          1,
          Math.max(0, (distance - inner) / (outer - inner)),
        );
        // Smoothstep, not a straight ramp: its slope is zero at both ends, so a node
        // crossing either boundary feels no sudden change in stiffness.
        const radial = t * t * (3 - 2 * t);
        // Never re-tighten mid-drag; the pointer moving on must not drag things back.
        hold = Math.min(hold, radial, this.hopHold.get(node.id) ?? 1);
      }

      node.anchorHold = hold;

      if (node.anchorX === undefined || node.anchorY === undefined) continue;

      if (node === dragged) {
        // Pinned to the pointer, so its home is simply wherever it is. Drifting at the
        // usual rate is not enough: the pointer outruns the drift and leaves the anchor
        // trailing far behind, which then hauls the node back the instant it is
        // released — the "drag it and it jumps home" bug.
        node.anchorX = node.x ?? 0;
        node.anchorY = node.y ?? 0;
        continue;
      }

      const flow = (1 - hold) * ANCHOR_FLOW;
      node.anchorX += ((node.x ?? 0) - node.anchorX) * flow;
      node.anchorY += ((node.y ?? 0) - node.anchorY) * flow;
    }
  }

  /**
   * Moves the dragged node. Position is set directly rather than nudged by a force,
   * so the node tracks the pointer exactly (R4).
   *
   * @param x - World x under the pointer.
   * @param y - World y under the pointer.
   */
  dragTo(x: number, y: number): void {
    if (!this.dragged) return;
    this.dragged.fx = x;
    this.dragged.fy = y;
  }

  /**
   * Releases the dragged node back into the simulation, leaving it to ease into place
   * rather than pinning it where it was dropped.
   *
   * There is no reheat here: the alpha the drag was already running at carries the
   * local settle, whereas reheating on release is what made letting go of a node kick
   * the whole graph. Anchors are marked stale so the next rest captures a fresh set
   * that includes the drag's new resting positions.
   */
  endDrag(): void {
    if (!this.dragged) return;

    this.dragged.fx = null;
    this.dragged.fy = null;
    this.dragged = null;
    this.hopHold.clear();
    // Every node the drag disturbed gives up its anchor entirely, and gets a fresh one
    // at the next rest. Keeping one would strand it: an anchor is far stronger than
    // gravity, so a node dropped at the edge of the graph would sit out there forever
    // no matter how high centre gravity was turned up. Without an anchor it simply
    // falls back in under the real forces, which is what "let go and it drifts home"
    // has to mean.
    for (const node of this.nodes) {
      // Only nodes the drag actually loosened. Any threshold below 1 would sweep in
      // the whole outer fringe of the gradient, which barely moved, and hand the entire
      // layout back to the solver.
      if ((node.anchorHold ?? 1) > DISTURBED_HOLD) continue;
      node.anchorX = undefined;
      node.anchorY = undefined;
      node.anchorHold = 1;
    }
    this.anchorsStale = true;
    this.resetStall();
    // No reheat. Letting go already leaves the simulation at DRAG_ALPHA, which is
    // enough to draw the node into place; jumping to REHEAT_ALPHA more than doubles
    // every force in the frame the pointer lifts, and that step change is felt as a
    // lurch at exactly the moment the user is watching the node they dropped. (The
    // reheat was needed when a released node's anchor stayed frozen at the spot it was
    // dropped; anchors follow their nodes now, so it isn't.)
  }

  /**
   * Records every node's current position as its anchor and clears the staleness
   * flag. Called once the layout has settled after something invalidated the
   * previous anchors.
   */
  private captureAnchors(): void {
    for (const node of this.nodes) {
      node.anchorX = node.x ?? 0;
      node.anchorY = node.y ?? 0;
    }
    this.anchorsStale = false;
  }

  /**
   * Discards every node's anchor and marks the set stale, so the next rest captures
   * fresh ones. Used when new data arrives or a physics-affecting tunable changes —
   * both are legitimate relayouts, not residual drift to be cancelled.
   */
  private clearAnchors(): void {
    for (const node of this.nodes) {
      node.anchorX = undefined;
      node.anchorY = undefined;
    }
    this.anchorsStale = true;
  }

  /** @returns The node currently being dragged, if any. */
  getDragged(): CanvasNode | null {
    return this.dragged;
  }
}
