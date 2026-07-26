/**
 * @fileoverview The canvas itself: one `<canvas>`, one animation loop, one set of
 * pointer handlers.
 *
 * React's job here is only to mount the element and tear it down. Everything that has
 * to happen at frame rate — ticking physics, painting, tracking the pointer — runs
 * outside React state, because routing 60 frames a second through re-renders is how a
 * drag ends up feeling laggy (docs/graph-canvas.md R4).
 *
 * The loop is demand-driven: it runs while the layout is moving or the pointer is
 * interacting, and stops once everything is at rest. Any input wakes it again.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphSnapshot } from "@/lib/contracts";
import { boundsOf, Camera } from "./camera";
import { getPalette } from "./palette";
import { drawFrame, HoverFade, LabelGate } from "./render";
import { GraphSimulation } from "./simulation";
import { DEFAULT_TUNABLES, type Tunables } from "./tunables";
import type { PositionedNode } from "./types";

/** How generous node hit-testing is, in CSS pixels, so small dots stay grabbable. */
const HIT_RADIUS_PX = 14;

/**
 * Pointer travel (CSS px) allowed before a press counts as a drag rather than a click.
 *
 * Physics is not touched until this is exceeded, so a click is inert: pressing a node
 * used to start a drag immediately, and starting a drag used to reheat the layout, so
 * merely selecting something made the whole graph lurch.
 */
const DRAG_THRESHOLD_PX = 3;

/** Zoom sensitivity for a mouse wheel / trackpad pinch (ctrl-modified wheel). */
const ZOOM_PER_WHEEL_UNIT = 0.0016;
const ZOOM_PER_PINCH_UNIT = 0.01;

/**
 * A read-only window into the live canvas, for development tooling.
 *
 * The screenshot script needs to know where a node actually is on screen in order to
 * drag one; positions live in a mutable simulation outside React, so there is nothing
 * in the DOM to target. Only the lab wires this up.
 */
export interface GraphDebugApi {
  /** @returns Every node's current screen position, in CSS pixels. */
  nodesOnScreen: () => { id: string; title: string; x: number; y: number }[];
  /** @returns Current zoom. */
  scale: () => number;
}

interface GraphCanvasProps {
  snapshot: GraphSnapshot;
  tunables?: Tunables;
  /** Called on every frame with the measured frame rate, for the dev HUD. */
  onFps?: (fps: number) => void;
  /** Called when a node is clicked without dragging. */
  onSelect?: (node: PositionedNode) => void;
  /** Development hook; receives a handle for inspecting the live canvas. */
  onDebugApi?: (api: GraphDebugApi) => void;
}

/**
 * Renders the graph and runs its physics.
 *
 * @param props.snapshot - Nodes and links to lay out.
 * @param props.tunables - Force settings; changes are applied live.
 * @param props.onFps - Frame-rate reporter for the dev HUD.
 * @param props.onSelect - Node click handler.
 * @param props.onDebugApi - Development hook (see {@link GraphDebugApi}).
 * @returns A full-bleed canvas element.
 */
export function GraphCanvas({
  snapshot,
  tunables = DEFAULT_TUNABLES,
  onFps,
  onSelect,
  onDebugApi,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simulationRef = useRef<GraphSimulation | null>(null);
  const cameraRef = useRef<Camera>(new Camera());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Frame-rate state lives in refs: reading it must never cause a render.
  const hoveredIdRef = useRef<string | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const wakeRef = useRef<() => void>(() => {});
  const labelGateRef = useRef<LabelGate>(new LabelGate());
  const hoverFadeRef = useRef<HoverFade>(new HoverFade());
  const pointerRef = useRef<{
    id: number;
    mode: "node" | "pan";
    lastX: number;
    lastY: number;
    travelled: number;
    node: PositionedNode | null;
    /** True once travel passed the threshold and the simulation was told to drag. */
    dragging: boolean;
  } | null>(null);
  const onSelectRef = useRef(onSelect);
  const onFpsRef = useRef(onFps);

  // Callbacks are mirrored into refs so the animation loop — which is created once and
  // outlives every render — always calls the latest one without being torn down.
  useEffect(() => {
    onSelectRef.current = onSelect;
    onFpsRef.current = onFps;
  }, [onSelect, onFps]);

  /**
   * Rebuilds the simulation when the graph's contents change. Tunable changes are
   * handled separately so moving a slider never restarts the layout.
   */
  useEffect(() => {
    const existing = simulationRef.current;
    if (existing) existing.setSnapshot(snapshot);
    else simulationRef.current = new GraphSimulation(snapshot, tunables);

    const camera = cameraRef.current;
    const { width, height } = sizeRef.current;
    if (width > 0 && height > 0) {
      camera.fit(boundsOf(simulationRef.current!.getNodes()), width, height);
    }
    wakeRef.current();
    // `tunables` is read only when first constructing; the effect below owns updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  useEffect(() => {
    simulationRef.current?.setTunables(tunables);
    wakeRef.current();
  }, [tunables]);

  /** Publishes the development handle once, if a caller asked for one. */
  useEffect(() => {
    if (!onDebugApi) return;
    onDebugApi({
      nodesOnScreen: () => {
        const simulation = simulationRef.current;
        if (!simulation) return [];
        const { width, height } = sizeRef.current;
        return simulation.getNodes().map((node) => {
          const screen = cameraRef.current.toScreen(
            node.x,
            node.y,
            width,
            height,
          );
          return { id: node.id, title: node.title, x: screen.x, y: screen.y };
        });
      },
      scale: () => cameraRef.current.getScale(),
    });
  }, [onDebugApi]);

  /**
   * Owns the canvas lifecycle: sizing for the device pixel ratio, the animation loop,
   * and the resize observer. Runs once.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let frame = 0;
    let idleFrames = 0;
    let lastFrameTime = performance.now();
    let smoothedFps = 0;

    /**
     * Resizes the backing store to match the element and the display's pixel ratio,
     * so dots and hairlines stay crisp instead of blurry.
     */
    const resize = (): void => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      sizeRef.current = { width, height };

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    /** Paints one frame from the simulation's current positions. */
    const paint = (): void => {
      const simulation = simulationRef.current;
      if (!simulation) return;

      const camera = cameraRef.current;
      const { width, height } = sizeRef.current;
      const dragged = simulation.getDragged();
      // The node the *treatment* is drawn for, which lags the pointer while the
      // previous one fades away.
      const hovered = hoverFadeRef.current.getActiveId();

      drawFrame(ctx, {
        nodes: simulation.getNodes(),
        links: simulation.getLinks(),
        project: (x, y) => camera.toScreen(x, y, width, height),
        scale: camera.getScale(),
        width,
        height,
        palette: getPalette(
          document.documentElement.dataset.mode ??
            (window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"),
        ),
        tunables: simulation.getTunables(),
        hoveredId: hovered,
        hoverAmount: hoverFadeRef.current.getAmount(),
        hoveredNeighborIds: hovered ? simulation.getNeighbors(hovered) : null,
        draggedId: dragged?.id ?? null,
        labelGate: labelGateRef.current,
      });
    };

    /**
     * One iteration of the loop: step physics, paint, and decide whether another frame
     * is needed. A few extra frames are drawn after rest so the last motion isn't cut
     * off mid-easing.
     */
    const step = (): void => {
      if (!running) return;

      const now = performance.now();
      const delta = now - lastFrameTime;
      lastFrameTime = now;
      // Waking the loop resets the clock, which can produce a sub-millisecond delta
      // and a nonsense instantaneous rate; smooth it and ignore those.
      if (delta >= 1) {
        smoothedFps =
          smoothedFps === 0
            ? 1000 / delta
            : smoothedFps * 0.9 + (1000 / delta) * 0.1;
        onFpsRef.current?.(smoothedFps);
      }

      const pointerTarget = hoveredIdRef.current;
      hoverFadeRef.current.update(pointerTarget, delta);
      const fading = hoverFadeRef.current.isAnimating(pointerTarget);

      const moving = simulationRef.current?.tick() ?? false;
      paint();

      idleFrames = moving || fading || pointerRef.current ? 0 : idleFrames + 1;
      if (idleFrames > 3) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(step);
    };

    /** Restarts the loop after it has parked itself. */
    const wake = (): void => {
      if (!running || frame !== 0) return;
      idleFrames = 0;
      lastFrameTime = performance.now();
      frame = requestAnimationFrame(step);
    };
    wakeRef.current = wake;

    const observer = new ResizeObserver(() => {
      resize();
      const simulation = simulationRef.current;
      const { width, height } = sizeRef.current;
      if (simulation && width > 0 && height > 0) {
        cameraRef.current.fit(boundsOf(simulation.getNodes()), width, height);
      }
      wake();
    });
    observer.observe(canvas);

    resize();
    const simulation = simulationRef.current;
    if (simulation) {
      cameraRef.current.fit(
        boundsOf(simulation.getNodes()),
        sizeRef.current.width,
        sizeRef.current.height,
      );
    }
    wake();

    return () => {
      running = false;
      if (frame !== 0) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  /**
   * Converts a pointer event to world coordinates.
   *
   * @param event - The pointer event.
   * @returns The world position under the pointer.
   */
  const worldAt = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const { width, height } = sizeRef.current;
      return cameraRef.current.toWorld(
        event.clientX - rect.left,
        event.clientY - rect.top,
        width,
        height,
      );
    },
    [],
  );

  /**
   * Begins either a node drag or a background pan, depending on what's under the
   * pointer.
   *
   * @param event - The pointer-down event.
   */
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const simulation = simulationRef.current;
      if (!simulation) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      const world = worldAt(event);
      const node = simulation.nodeAt(
        world.x,
        world.y,
        HIT_RADIUS_PX / cameraRef.current.getScale(),
      );

      pointerRef.current = {
        id: event.pointerId,
        mode: node ? "node" : "pan",
        lastX: event.clientX,
        lastY: event.clientY,
        travelled: 0,
        node,
        dragging: false,
      };

      // Deliberately no `startDrag` here — see DRAG_THRESHOLD_PX.
      wakeRef.current();
    },
    [worldAt],
  );

  /**
   * Drags a node, pans the view, or just updates hover — whichever the current
   * gesture is.
   *
   * @param event - The pointer-move event.
   */
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const simulation = simulationRef.current;
      if (!simulation) return;

      const gesture = pointerRef.current;
      if (!gesture) {
        const world = worldAt(event);
        const node = simulation.nodeAt(
          world.x,
          world.y,
          HIT_RADIUS_PX / cameraRef.current.getScale(),
        );
        if ((node?.id ?? null) !== hoveredIdRef.current) {
          hoveredIdRef.current = node?.id ?? null;
          setHoveredId(node?.id ?? null);
          wakeRef.current();
        }
        return;
      }

      const deltaX = event.clientX - gesture.lastX;
      const deltaY = event.clientY - gesture.lastY;
      gesture.lastX = event.clientX;
      gesture.lastY = event.clientY;
      gesture.travelled += Math.hypot(deltaX, deltaY);

      if (gesture.mode === "node") {
        if (!gesture.dragging) {
          if (gesture.travelled < DRAG_THRESHOLD_PX) return;
          gesture.dragging = true;
          if (gesture.node) simulation.startDrag(gesture.node);
        }
        const world = worldAt(event);
        simulation.dragTo(world.x, world.y);
      } else {
        cameraRef.current.panByScreen(deltaX, deltaY);
      }
      wakeRef.current();
    },
    [worldAt],
  );

  /**
   * Ends the gesture. A press that barely moved counts as a click on the node.
   *
   * @param event - The pointer-up (or cancel) event.
   */
  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const simulation = simulationRef.current;
      const gesture = pointerRef.current;
      pointerRef.current = null;
      if (!simulation || !gesture) return;

      if (gesture.mode === "node") {
        if (gesture.dragging) simulation.endDrag();
        else if (gesture.node) onSelectRef.current?.(gesture.node);
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      wakeRef.current();
    },
    [],
  );

  /**
   * Owns wheel, trackpad and pinch input.
   *
   * This is a native listener rather than React's `onWheel` because React attaches
   * wheel handlers **passively**, where `preventDefault()` is ignored — so a trackpad
   * pinch fell through to the browser and zoomed the whole page, chrome and all,
   * instead of zooming the graph. A non-passive listener is the only way to claim the
   * gesture.
   *
   * The mapping is the one every canvas tool uses: pinch (which macOS reports as a
   * ctrl-modified wheel) and ctrl/⌘+wheel zoom about the pointer; a plain wheel or
   * two-finger scroll pans. Safari's non-standard `gesture*` events are swallowed for
   * the same reason.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const { width, height } = sizeRef.current;

      if (event.ctrlKey || event.metaKey) {
        const rect = canvas.getBoundingClientRect();
        const perUnit = event.ctrlKey
          ? ZOOM_PER_PINCH_UNIT
          : ZOOM_PER_WHEEL_UNIT;
        cameraRef.current.zoomAt(
          Math.exp(-event.deltaY * perUnit),
          event.clientX - rect.left,
          event.clientY - rect.top,
          width,
          height,
        );
      } else {
        cameraRef.current.panByScreen(-event.deltaX, -event.deltaY);
      }
      wakeRef.current();
    };

    const swallow = (event: Event): void => event.preventDefault();

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("gesturestart", swallow);
    canvas.addEventListener("gesturechange", swallow);
    canvas.addEventListener("gestureend", swallow);

    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("gesturestart", swallow);
      canvas.removeEventListener("gesturechange", swallow);
      canvas.removeEventListener("gestureend", swallow);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="graph-canvas"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        touchAction: "none",
        overscrollBehavior: "none",
        cursor: hoveredId ? "grab" : "default",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
