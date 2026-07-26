/**
 * @fileoverview The canvas workbench: the fixture graph, the physics HUD, and
 * nothing else.
 *
 * Separate from `graph-view.tsx` so the real surface never inherits workbench
 * behaviour, and so this can grow deliberately unrealistic controls (a denser
 * fixture, a fixed theme) without leaking them into the product.
 */

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildSampleGraph } from "@/lib/graph/sample-graph";
import { DevHud } from "./dev-hud";
import { GraphCanvas, type GraphDebugApi } from "./graph-canvas";
import styles from "./graph-view.module.css";
import { buildLabFixture } from "./lab-fixture";
import { DEFAULT_TUNABLES, type Tunables } from "./tunables";

/** Frame rate is sampled into React state this often; every frame would defeat the point. */
const FPS_REPORT_INTERVAL_MS = 400;

/**
 * Renders a fixture graph with live physics controls.
 *
 * Pass `?n=<count>` to generate a synthetic graph of that size instead of the
 * hand-authored sample — shape and label density can only be judged at scale.
 *
 * @returns The workbench surface.
 */
export function GraphLab() {
  const params = useSearchParams();
  const size = Number(params.get("n") ?? "");
  const snapshot = useMemo(
    () =>
      Number.isFinite(size) && size > 0
        ? buildLabFixture(size)
        : buildSampleGraph(),
    [size],
  );

  // Force values can also arrive in the URL (`?gravity=0.14&repulsion=220`), which is
  // what makes candidate settings comparable: the screenshot script can capture
  // several of them without a human moving sliders in between.
  const fromUrl = useMemo<Tunables>(() => {
    const read = (key: keyof Tunables): number => {
      const value = Number(params.get(key) ?? "");
      return Number.isFinite(value) && value > 0
        ? value
        : DEFAULT_TUNABLES[key];
    };
    return {
      gravity: read("gravity"),
      repulsion: read("repulsion"),
      linkDistance: read("linkDistance"),
      linkStrength: read("linkStrength"),
      nodeRadius: read("nodeRadius"),
    };
  }, [params]);

  const [tunables, setTunables] = useState<Tunables>(fromUrl);
  const [fps, setFps] = useState(0);
  const lastFpsReport = useRef(0);

  /**
   * Records the frame rate at a human-readable cadence.
   *
   * @param value - Instantaneous frames per second from the render loop.
   */
  const handleFps = useCallback((value: number) => {
    const now = performance.now();
    if (now - lastFpsReport.current < FPS_REPORT_INTERVAL_MS) return;
    lastFpsReport.current = now;
    setFps(value);
  }, []);

  /**
   * Publishes the canvas inspection handle on `window` so `scripts/shoot-graph.mjs`
   * can drag a real node. Lab-only: the product surface never exposes this.
   *
   * @param api - Handle provided by the canvas.
   */
  const handleDebugApi = useCallback((api: GraphDebugApi) => {
    (
      window as unknown as { __ACTA_GRAPH_DEBUG__?: GraphDebugApi }
    ).__ACTA_GRAPH_DEBUG__ = api;
  }, []);

  return (
    <main className={styles.shell}>
      <GraphCanvas
        snapshot={snapshot}
        tunables={tunables}
        onFps={handleFps}
        onDebugApi={handleDebugApi}
      />
      <div className={styles.readout}>
        <span className={styles.source}>
          lab ·{" "}
          {size > 0 ? `${snapshot.nodes.length}-node fixture` : "sample graph"}
        </span>
      </div>
      <DevHud
        tunables={tunables}
        onChange={setTunables}
        fps={fps}
        nodeCount={snapshot.nodes.length}
        linkCount={snapshot.links.length}
      />
    </main>
  );
}
