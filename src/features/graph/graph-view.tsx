/**
 * @fileoverview The `/` surface while the canvas is being rebuilt: the graph, hover,
 * and selection — nothing more.
 *
 * The chrome from the first attempt (ask bar, filter menu, floating panels) was
 * deliberately deleted rather than carried over. Those surfaces are still the plan —
 * see docs/surfaces-and-flows.md — but each one gets built and looked at on its own, on
 * top of a canvas that already feels right (docs/graph-canvas.md § Deliberately
 * deferred). The tunables slider panel lives only in the dev workbench
 * (`graph-lab.tsx`); this surface renders with the finalised defaults.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { GraphSnapshot } from "@/lib/contracts";
import { buildSampleGraph } from "@/lib/graph/sample-graph";
import { GraphCanvas, type HoverInfo } from "./graph-canvas";
import { HoverCard } from "./hover-card";
import { NodeDetail } from "./node-detail";

/** Full-bleed graph shell shared with `graph-lab.tsx`. */
export const GRAPH_SHELL_CLASS =
  "relative h-dvh w-full overflow-hidden bg-canvas";

/** Top-left readout row for sample/live/lab status. */
export const GRAPH_READOUT_CLASS =
  "pointer-events-none absolute left-acta-4 top-acta-4 z-10 flex items-center gap-acta-2 font-ui text-[11px] text-muted";

/** Opaque badge inside the readout. */
export const GRAPH_READOUT_BADGE_CLASS =
  "rounded-ctl border border-edge-strong bg-elevated px-2 py-1 uppercase tracking-widest";

/** Where the rendered graph came from, so the readout can say so honestly. */
type Source = "loading" | "live" | "sample";

/**
 * Loads the graph and renders the canvas.
 *
 * @returns The graph surface.
 */
export function GraphView() {
  const [snapshot, setSnapshot] = useState<GraphSnapshot | null>(null);
  const [source, setSource] = useState<Source>("loading");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  // Looked up from the snapshot rather than kept on the click event: the snapshot's
  // fields (title, summary, facets, …) are what the detail panel shows, and they stay
  // correct across a re-fetch as long as the node itself still exists.
  const selectedNode = useMemo(
    () => snapshot?.nodes.find((node) => node.id === selectedId) ?? null,
    [snapshot, selectedId],
  );

  /**
   * The left detail panel: the selection when idle, or a temporary preview of whatever
   * node is hovered while a different one stays selected. Clears back to the selection
   * when hover ends.
   */
  const panelNode = useMemo(() => {
    if (!snapshot) return null;
    if (
      hover &&
      selectedId &&
      hover.node.id !== selectedId
    ) {
      return (
        snapshot.nodes.find((node) => node.id === hover.node.id) ?? hover.node
      );
    }
    return selectedNode;
  }, [snapshot, hover, selectedId, selectedNode]);

  /**
   * Fetches the signed-in user's graph, falling back to the sample fixture when it is
   * empty — an empty canvas can't be judged, and the real empty state is a later slice.
   */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/graph", { cache: "no-store" });
        if (!response.ok)
          throw new Error(`graph fetch failed: ${response.status}`);
        const parsed = GraphSnapshot.parse(await response.json());
        if (cancelled) return;

        if (parsed.nodes.length > 0) {
          setSnapshot(parsed);
          setSource("live");
          return;
        }
      } catch {
        // Fall through to the fixture: this surface exists to judge physics, and it
        // should still do that when the API or the session is unavailable.
      }

      if (cancelled) return;
      setSnapshot(buildSampleGraph());
      setSource("sample");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={GRAPH_SHELL_CLASS}>
      {snapshot ? (
        <GraphCanvas
          snapshot={snapshot}
          selectedId={selectedId}
          onSelect={(node) => setSelectedId(node.id)}
          onBackgroundClick={() => setSelectedId(null)}
          onHover={setHover}
        />
      ) : null}

      {hover && !selectedId ? (
        <HoverCard node={hover.node} x={hover.x} y={hover.y} />
      ) : null}

      <div className={GRAPH_READOUT_CLASS}>
        <span className={GRAPH_READOUT_BADGE_CLASS}>
          {source === "sample"
            ? "sample graph"
            : source === "live"
              ? "your graph"
              : "loading"}
        </span>
      </div>

      {panelNode ? (
        <NodeDetail node={panelNode} onClose={() => setSelectedId(null)} />
      ) : null}
    </main>
  );
}
