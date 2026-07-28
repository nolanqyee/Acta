/**
 * @fileoverview Paints one frame: edges, then dots, then labels.
 *
 * Three of the canvas requirements are decided here rather than in the physics:
 *
 *  - **R2, small nodes.** A node is a dot a few pixels across. Its world radius is
 *    scaled by zoom but clamped, so zooming in never turns the constellation into a
 *    diagram of circles.
 *  - **R6, subtle edges.** Hairline, straight, low-contrast, drawn beneath the dots.
 *    Crossings are allowed to happen and simply don't read as noise at this weight.
 *  - **R3, captions only when they don't block anything.** Captions are all-or-nothing
 *    and gated on zoom: the whole set fades in at the scale where the *graph* has room
 *    for the whole set. See {@link LabelGate} for why per-label culling was dropped.
 *
 * Hovering also lives here: the pointed-at node and its links stay lit while the rest
 * of the graph fades back, so a node's neighbourhood is legible without any chrome.
 *
 * Selection uses the identical dim/lit/accent language. Background dim snaps on when
 * something is selected; the green accent itself fades in and out — including when hover
 * over a different node temporarily takes it over and when hover clears again.
 */

import type { Palette } from "./palette";
import type { PositionedLink, PositionedNode } from "./types";
import { nodeRadius, type Tunables } from "./tunables";

/** Everything needed to draw a frame. */
export interface Frame {
  nodes: PositionedNode[];
  links: PositionedLink[];
  /** Screen position of a world point, in CSS pixels. */
  project: (x: number, y: number) => { x: number; y: number };
  scale: number;
  width: number;
  height: number;
  palette: Palette;
  tunables: Tunables;
  /**
   * The node the hover treatment is currently drawn for. Not necessarily the one under
   * the pointer: it lags during a fade-out so the highlight can ease away.
   */
  hoveredId: string | null;
  /** How far the hover treatment has faded in, 0–1. See {@link HoverFade}. */
  hoverAmount: number;
  /** How far the selection accent has faded in, 0–1. See {@link SelectionAccentFade}. */
  selectionAccentAmount: number;
  /** Ids linked to the hovered node; they stay lit while the rest fades. */
  hoveredNeighborIds: ReadonlySet<string> | null;
  /** The clicked-and-persisted node, if any. Independent of hover. */
  selectedId: string | null;
  /** Ids linked to the selected node; they stay lit while the rest fades. */
  selectedNeighborIds: ReadonlySet<string> | null;
  draggedId: string | null;
  /** Caches the zoom level at which captions become readable. Owned by the canvas. */
  labelGate: LabelGate;
}

/** Screen-space clamps keeping dots small but always visible. */
const MIN_DOT_RADIUS = 1.4;
const MAX_DOT_RADIUS = 9;

/** Label type size in CSS pixels; deliberately fixed so text stays legible at any zoom. */
const LABEL_FONT_SIZE = 11;

/** Gap between a dot and its caption, in CSS pixels. */
const LABEL_OFFSET = 6;

/** Longest caption drawn; the full title belongs in UI, not on the plane. */
const MAX_LABEL_CHARS = 28;

/** Empty space a caption needs beyond its own box, in CSS pixels. */
const LABEL_CLEARANCE_PX = 7;

/**
 * How dark the rest of the graph goes while a node is hovered.
 *
 * Dimming rather than hiding: the surrounding shape stays readable as context, so the
 * neighbourhood is seen *in* the graph rather than extracted from it.
 */
const DIM_NODE_ALPHA = 0.16;
const DIM_EDGE_ALPHA = 0.35;

/** Opacity of the hovered node's own links, which are promoted to the accent colour. */
const HOVER_EDGE_ALPHA = 0.7;

/** Milliseconds for the hover treatment to reach full strength, and to let go again. */
const HOVER_FADE_IN_MS = 130;
const HOVER_FADE_OUT_MS = 90;

/**
 * Eases the hover treatment in and out instead of switching it on the frame the
 * pointer arrives.
 *
 * Everything hover does — dimming the graph, lighting the accent edges, brightening and
 * growing the dot, showing the name — is driven off the single 0–1 value this produces,
 * so it all moves together. An instant switch reads as a flicker when the pointer
 * crosses a dense area; a short fade reads as a response.
 *
 * Moving between two nodes fades the first out before the second in (~220ms end to
 * end), rather than teleporting the highlight. Fading out is quicker than in, which
 * keeps that hand-off from feeling sticky.
 */
export class HoverFade {
  private activeId: string | null = null;
  private amount = 0;

  /**
   * Advances the fade one frame.
   *
   * @param hoveredId - Node under the pointer right now, or null.
   * @param deltaMs - Milliseconds since the previous frame.
   */
  update(hoveredId: string | null, deltaMs: number): void {
    // Clamped: a backgrounded tab can hand back a delta of several seconds, which would
    // otherwise snap the fade and defeat the point.
    const step = Math.min(deltaMs, 50);

    if (hoveredId === this.activeId && hoveredId !== null) {
      this.amount = Math.min(1, this.amount + step / HOVER_FADE_IN_MS);
      return;
    }

    this.amount = Math.max(0, this.amount - step / HOVER_FADE_OUT_MS);
    // Only adopt the new node once the old one has finished getting out of the way.
    if (this.amount === 0) this.activeId = hoveredId;
  }

  /** @returns The node the hover treatment should be drawn for, if any. */
  getActiveId(): string | null {
    return this.amount > 0 ? this.activeId : null;
  }

  /** @returns Fade progress, 0–1. */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Whether the fade still needs frames.
   *
   * @param hoveredId - Node under the pointer right now, or null.
   * @returns True while the treatment is still moving, so the render loop stays awake.
   */
  isAnimating(hoveredId: string | null): boolean {
    if (hoveredId !== this.activeId) return true;
    return hoveredId === null ? this.amount > 0 : this.amount < 1;
  }
}

/**
 * Eases the selection accent in and out when hover temporarily takes it over.
 *
 * A click still selects immediately (background dim snaps on), but the green accent
 * and lit neighbourhood fade rather than popping — especially when hover clears and
 * selection takes the accent back from a different node.
 */
export class SelectionAccentFade {
  private amount = 0;

  /**
   * Advances the selection accent one frame.
   *
   * @param selectedId - The persistently selected node, if any.
   * @param hoveredId - Node the hover treatment is drawn for (may lag the pointer).
   * @param hoverAmount - Current hover fade strength.
   * @param deltaMs - Milliseconds since the previous frame.
   */
  update(
    selectedId: string | null,
    hoveredId: string | null,
    hoverAmount: number,
    deltaMs: number,
  ): void {
    const step = Math.min(deltaMs, 50);
    const hoverOverrides =
      selectedId !== null &&
      hoveredId !== null &&
      hoveredId !== selectedId &&
      hoverAmount > 0;
    const target = selectedId !== null && !hoverOverrides ? 1 : 0;

    if (target > this.amount) {
      this.amount = Math.min(target, this.amount + step / HOVER_FADE_IN_MS);
    } else if (target < this.amount) {
      this.amount = Math.max(target, this.amount - step / HOVER_FADE_OUT_MS);
    }
  }

  /** @returns Selection accent strength, 0–1. */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Whether the accent still needs frames.
   *
   * @param selectedId - The persistently selected node, if any.
   * @param hoveredId - Node the hover treatment is drawn for.
   * @param hoverAmount - Current hover fade strength.
   * @returns True while the accent is still easing.
   */
  isAnimating(
    selectedId: string | null,
    hoveredId: string | null,
    hoverAmount: number,
  ): boolean {
    const hoverOverrides =
      selectedId !== null &&
      hoveredId !== null &&
      hoveredId !== selectedId &&
      hoverAmount > 0;
    const target = selectedId !== null && !hoverOverrides ? 1 : 0;
    return Math.abs(this.amount - target) > 0.001;
  }
}

/**
 * Decides, for the graph as a whole, the zoom at which captions can all be shown.
 *
 * Captions used to be placed one at a time, each drawn only if it personally had room.
 * That reads badly: a view is permanently half-labelled, the set changes as the layout
 * breathes, and there is no zoom at which you can simply *read the graph*. So the rule
 * is now all-or-nothing, and the only question is where the threshold sits.
 *
 * It is measured rather than hard-coded, because the right zoom depends on how tightly
 * the layout packs and how long the titles are. For each node, the zoom that would give
 * its caption clear space is `(label width + clearance) / distance to nearest node`;
 * the threshold is a high percentile of those, so one pathologically tight pair cannot
 * hold the whole graph's captions hostage.
 *
 * Recomputed on a timer, not per frame: it depends on node positions, which drift
 * slowly, and an O(n) sweep every frame is not worth a number that barely moves.
 */
export class LabelGate {
  private threshold = Number.POSITIVE_INFINITY;
  private computedAt = 0;
  private nodeCount = -1;
  private readonly widths = new Map<string, number>();

  /**
   * Width of a caption in CSS pixels, cached because `measureText` is not free and
   * the answer only changes when the font does.
   *
   * @param ctx - 2D context with the label font already applied.
   * @param text - The caption.
   * @returns Width in CSS pixels.
   */
  measure(ctx: CanvasRenderingContext2D, text: string): number {
    const cached = this.widths.get(text);
    if (cached !== undefined) return cached;
    const measured = ctx.measureText(text).width;
    this.widths.set(text, measured);
    return measured;
  }

  /**
   * How visible captions should be at the current zoom: 0 below the threshold, 1 above
   * it, and a short ramp in between so crossing the line is a fade rather than a pop.
   *
   * @param ctx - 2D context with the label font already applied.
   * @param frame - Current frame state.
   * @returns Opacity multiplier in 0–1, applied to every caption alike.
   */
  opacity(ctx: CanvasRenderingContext2D, frame: Frame): number {
    const now =
      typeof performance === "undefined" ? Date.now() : performance.now();
    if (
      now - this.computedAt > RECOMPUTE_INTERVAL_MS ||
      this.nodeCount !== frame.nodes.length
    ) {
      this.threshold = measureThresholdScale(ctx, frame, this);
      this.computedAt = now;
      this.nodeCount = frame.nodes.length;
    }

    if (!Number.isFinite(this.threshold)) return 0;
    const start = this.threshold * FADE_BAND;
    if (frame.scale <= start) return 0;
    if (frame.scale >= this.threshold) return 1;
    return (frame.scale - start) / (this.threshold - start);
  }
}

/** How often the caption threshold is re-derived from node positions. */
const RECOMPUTE_INTERVAL_MS = 500;

/** Fraction of the threshold at which captions start fading in. */
const FADE_BAND = 0.82;

/** Percentile of per-node requirements the threshold satisfies (1 = every node). */
const THRESHOLD_PERCENTILE = 0.6;

/**
 * Derives the zoom at which captions become readable across the graph.
 *
 * @param ctx - 2D context with the label font already applied.
 * @param frame - Current frame state.
 * @param gate - Gate providing cached text measurement.
 * @returns Scale at which captions should be fully visible, or Infinity when there is
 *   nothing to label.
 */
function measureThresholdScale(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  gate: LabelGate,
): number {
  const { nodes } = frame;
  if (nodes.length < 2) return 0;

  const cellSize = Math.max(1, frame.tunables.linkDistance * 2);
  const cells = new Map<string, PositionedNode[]>();
  for (const node of nodes) {
    const key = `${Math.floor(node.x / cellSize)},${Math.floor(node.y / cellSize)}`;
    const cell = cells.get(key);
    if (cell) cell.push(node);
    else cells.set(key, [node]);
  }

  const required: number[] = [];
  for (const node of nodes) {
    const cellX = Math.floor(node.x / cellSize);
    const cellY = Math.floor(node.y / cellSize);
    let nearest = Number.POSITIVE_INFINITY;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const other of cells.get(`${cellX + dx},${cellY + dy}`) ?? []) {
          if (other === node) continue;
          const distance = Math.hypot(other.x - node.x, other.y - node.y);
          if (distance < nearest) nearest = distance;
        }
      }
    }

    // Nothing within a cell of this node: it has all the room it could want.
    if (!Number.isFinite(nearest) || nearest <= 0) continue;

    const text = shortLabel(node.title);
    required.push((gate.measure(ctx, text) + LABEL_CLEARANCE_PX) / nearest);
  }

  if (required.length === 0) return 0;
  required.sort((a, b) => a - b);
  const index = Math.min(
    required.length - 1,
    Math.floor(required.length * THRESHOLD_PERCENTILE),
  );
  return required[index]!;
}

/** Shared so an absent neighbour set never allocates. */
const NO_IDS: ReadonlySet<string> = new Set<string>();

/**
 * The dim/lit/accent treatment for one frame — selection and hover compose for
 * background dim, but hover over a *different* node temporarily owns the green accent.
 */
interface Highlight {
  /** Every id that should stay at full strength: selected/hovered ids + neighbours. */
  litIds: ReadonlySet<string>;
  /**
   * How dimmed the rest of the graph is, 0–1. Pinned to 1 the instant something is
   * selected — a persistent choice, not a fade — so hovering can never relax the
   * background back toward full brightness while the detail panel is open.
   */
  dimAmount: number;
  /** The selected node's id, if any — its emphasis tracks {@link primaryAmount}. */
  primaryId: string | null;
  /** How strongly the selection accent is shown, 0–1. */
  primaryAmount: number;
  /** The hovered node's id, if any — its emphasis fades with {@link secondaryAmount}. */
  secondaryId: string | null;
  secondaryAmount: number;
}

/**
 * Composes selection (persistent dim) and hover (transient accent) into one treatment.
 *
 * Background dim strength only ever depends on *whether* something is selected, never
 * on which hover transition is mid-flight — that is what stops the flash when hover
 * crosses a selection. Accent and lit neighbourhood, however, yield to hover whenever
 * the pointer is over a node other than the selected one.
 *
 * @param frame - Current frame state.
 * @returns The active highlight; `litIds` is empty when neither is set.
 */
function resolveHighlight(frame: Frame): Highlight {
  const selectedId = frame.selectedId;
  const hoveredId = frame.hoveredId;
  const secondaryAmount = frame.hoverAmount;
  const primaryAmount = frame.selectionAccentAmount;
  const dimAmount = Math.max(selectedId ? 1 : 0, secondaryAmount);

  const primaryId =
    selectedId !== null && primaryAmount > 0 ? selectedId : null;
  const secondaryId = hoveredId;

  if (!primaryId && !secondaryId) {
    return {
      litIds: NO_IDS,
      dimAmount,
      primaryId,
      primaryAmount,
      secondaryId,
      secondaryAmount,
    };
  }

  const litIds = new Set<string>();
  if (primaryId) {
    litIds.add(primaryId);
    for (const id of frame.selectedNeighborIds ?? NO_IDS) litIds.add(id);
  }
  if (secondaryId) {
    litIds.add(secondaryId);
    for (const id of frame.hoveredNeighborIds ?? NO_IDS) litIds.add(id);
  }
  return {
    litIds,
    dimAmount,
    primaryId,
    primaryAmount,
    secondaryId,
    secondaryAmount,
  };
}

/**
 * Screen radius of a node's dot.
 *
 * @param node - The node.
 * @param frame - Current frame state.
 * @returns Radius in CSS pixels, clamped to stay small.
 */
function dotRadius(
  node: PositionedNode,
  frame: Frame,
  highlight: Highlight,
): number {
  const world = nodeRadius(node.degree, frame.tunables);
  const raw =
    world * frame.scale * (1 + 0.35 * emphasisOf(node.id, frame, highlight));
  return Math.min(MAX_DOT_RADIUS, Math.max(MIN_DOT_RADIUS, raw));
}

/**
 * How strongly a node is drawn as the subject of the interaction, 0–1.
 *
 * The selected node carries a flat 1 (a click is a discrete choice, not a fade); the
 * hovered node carries the hover fade. A node that's both just takes the higher of the
 * two, so re-hovering the selected node stays pinned at 1 instead of dipping. A drag
 * overrides everything — the pointer is already on the node by then.
 *
 * @param id - Node id.
 * @param frame - Current frame state.
 * @param highlight - The active highlight for this frame.
 * @returns Emphasis in 0–1.
 */
function emphasisOf(id: string, frame: Frame, highlight: Highlight): number {
  if (id === frame.draggedId) return 1;
  let emphasis = 0;
  if (id === highlight.primaryId) emphasis = highlight.primaryAmount;
  if (id === highlight.secondaryId)
    emphasis = Math.max(emphasis, highlight.secondaryAmount);
  return emphasis;
}

/**
 * Whether a node belongs to the highlighted neighbourhood — the selected and/or
 * hovered node, or something either links to. Everything else is dimmed.
 *
 * @param id - Node id.
 * @param highlight - The active highlight for this frame.
 * @returns True when the node stays at full strength.
 */
function isLit(id: string, highlight: Highlight): boolean {
  return highlight.litIds.size === 0 || highlight.litIds.has(id);
}

/**
 * How much the graph outside the highlighted neighbourhood is currently faded back.
 *
 * @param highlight - The active highlight for this frame.
 * @param floor - The dim level at full strength.
 * @returns Alpha multiplier, easing from 1 to `floor` as the highlight fades in.
 */
function dimFactor(highlight: Highlight, floor: number): number {
  return 1 - (1 - floor) * highlight.dimAmount;
}

/**
 * Shortens a title to something that belongs on a canvas.
 *
 * @param title - Full endeavor title.
 * @returns The title, truncated with an ellipsis if needed.
 */
function shortLabel(title: string): string {
  return title.length <= MAX_LABEL_CHARS
    ? title
    : `${title.slice(0, MAX_LABEL_CHARS - 1).trimEnd()}…`;
}

/**
 * Draws the whole frame.
 *
 * @param ctx - 2D context, already scaled for device pixel ratio so all coordinates
 *   here are CSS pixels.
 * @param frame - Nodes, links, projection, and style for this frame.
 */
export function drawFrame(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { palette, width, height } = frame;
  const highlight = resolveHighlight(frame);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  drawEdges(ctx, frame, highlight);
  drawNodes(ctx, frame, highlight);
  drawLabels(ctx, frame, highlight);
  ctx.globalAlpha = 1;
}

/**
 * Draws every link as a hairline straight line, in two passes when a node is
 * highlighted: the graph at large recedes, that node's own links come forward in the
 * accent colour.
 *
 * @param ctx - 2D context.
 * @param frame - Current frame state.
 * @param highlight - The active hover-or-selection target for this frame.
 */
function drawEdges(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  highlight: Highlight,
): void {
  // Thinner than a pixel at low zoom: the line fades rather than disappearing, which
  // is exactly the "texture, not diagram" reading we want when zoomed out.
  ctx.lineWidth = Math.min(1.1, Math.max(0.55, frame.scale * 0.5));

  const touches = (link: PositionedLink, id: string | null): boolean =>
    id !== null && (link.source.id === id || link.target.id === id);
  const touchesEither = (link: PositionedLink): boolean =>
    touches(link, highlight.primaryId) || touches(link, highlight.secondaryId);

  const trace = (only: (link: PositionedLink) => boolean): void => {
    ctx.beginPath();
    for (const link of frame.links) {
      if (!only(link)) continue;
      const source = frame.project(link.source.x, link.source.y);
      const target = frame.project(link.target.x, link.target.y);
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
    }
    ctx.stroke();
  };

  ctx.strokeStyle = frame.palette.edge;
  if (!highlight.primaryId && !highlight.secondaryId) {
    ctx.globalAlpha = 1;
    trace(() => true);
    return;
  }

  // The graph at large recedes; the selected and/or hovered node's own links hold
  // their normal weight and then take on the accent colour — the selected node's at
  // full strength immediately (no fade of its own), the hovered node's easing in.
  ctx.globalAlpha = dimFactor(highlight, DIM_EDGE_ALPHA);
  trace((link) => !touchesEither(link));

  ctx.globalAlpha = 1;
  trace(touchesEither);

  ctx.strokeStyle = frame.palette.accent;
  if (highlight.primaryId) {
    ctx.globalAlpha = HOVER_EDGE_ALPHA * highlight.primaryAmount;
    trace((link) => touches(link, highlight.primaryId));
  }
  if (highlight.secondaryId) {
    ctx.globalAlpha = HOVER_EDGE_ALPHA * highlight.secondaryAmount;
    trace((link) => touches(link, highlight.secondaryId));
  }
  ctx.globalAlpha = 1;
}

/**
 * Draws every node as a small dot, emphasising the hovered/selected/dragged one and
 * fading everything outside its neighbourhood.
 *
 * @param ctx - 2D context.
 * @param frame - Current frame state.
 * @param highlight - The active hover-or-selection target for this frame.
 */
function drawNodes(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  highlight: Highlight,
): void {
  for (const node of frame.nodes) {
    const { x, y } = frame.project(node.x, node.y);
    const radius = dotRadius(node, frame, highlight);
    const emphasis = emphasisOf(node.id, frame, highlight);
    const lit = isLit(node.id, highlight)
      ? 1
      : dimFactor(highlight, DIM_NODE_ALPHA);

    ctx.globalAlpha = lit;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = frame.palette.node;
    ctx.fill();

    if (emphasis <= 0) continue;

    // The brighter fill is laid over the normal one at the fade's opacity rather than
    // swapped for it — cross-fading two solid colours is far simpler than trying to
    // interpolate two resolved CSS colour strings.
    ctx.globalAlpha = lit * emphasis;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = frame.palette.nodeStrong;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, radius + 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = frame.palette.accent;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draws captions.
 *
 * All of them or none of them, at the opacity {@link LabelGate} allows for the current
 * zoom — with two exceptions that are about answering a question, not about density:
 * the selected node and the hovered node (and the ones either links to) are always
 * named, at any zoom.
 *
 * @param ctx - 2D context.
 * @param frame - Current frame state.
 * @param highlight - The active highlight for this frame.
 */
function drawLabels(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  highlight: Highlight,
): void {
  ctx.font = `500 ${LABEL_FONT_SIZE}px ${frame.palette.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const opacity = frame.labelGate.opacity(ctx, frame);
  const highlighting =
    highlight.primaryId !== null || highlight.secondaryId !== null;
  if (opacity === 0 && !highlighting && !frame.draggedId) return;

  for (const node of frame.nodes) {
    const emphasis = emphasisOf(node.id, frame, highlight);
    const lit = isLit(node.id, highlight);

    // Naming is reserved for the selected and/or hovered node itself (via `emphasis`,
    // which is exactly 1/hoverAmount for those two and 0 otherwise) — never their
    // neighbours. Naming every lit neighbour too turned a hover over a dense cluster
    // into a pile of overlapping captions, which is the opposite of the answer the
    // highlight is supposed to give. Everything else stays on the zoom gate, dimmed by
    // however far the highlight has faded in.
    const gated = opacity * (lit ? 1 : dimFactor(highlight, DIM_NODE_ALPHA));
    const alpha = Math.max(gated, emphasis);
    if (alpha <= 0.02) continue;

    const { x, y } = frame.project(node.x, node.y);
    if (x < -80 || y < -40 || x > frame.width + 80 || y > frame.height + 40)
      continue;

    const text = shortLabel(node.title);
    const top = y + dotRadius(node, frame, highlight) + LABEL_OFFSET;

    ctx.globalAlpha = alpha;
    // A halo in the canvas colour keeps a hairline edge from cutting through text.
    ctx.strokeStyle = frame.palette.background;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, top);

    ctx.fillStyle =
      emphasis > 0.5 ? frame.palette.nodeStrong : frame.palette.label;
    ctx.fillText(text, x, top);
  }

  ctx.globalAlpha = 1;
}
