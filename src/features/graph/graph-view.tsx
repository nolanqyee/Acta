/**
 * @fileoverview The `/` surface while the canvas is being rebuilt: the graph and
 * nothing else.
 *
 * The chrome from the first attempt (ask bar, filter menu, hover cards, node modal,
 * floating panels) was deliberately deleted rather than carried over. Those surfaces
 * are still the plan — see docs/surfaces-and-flows.md — but each one gets built and
 * looked at on its own, on top of a canvas that already feels right
 * (docs/graph-canvas.md § Deliberately deferred). The tunables slider panel lives only
 * in the dev workbench (`graph-lab.tsx`); this surface renders with the finalised
 * defaults.
 */

"use client";

import { useEffect, useState } from "react";
import { GraphSnapshot } from "@/lib/contracts";
import { buildSampleGraph } from "@/lib/graph/sample-graph";
import { GraphCanvas } from "./graph-canvas";
import styles from "./graph-view.module.css";
import type { PositionedNode } from "./types";

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
  const [selected, setSelected] = useState<PositionedNode | null>(null);

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
    <main className={styles.shell}>
      {snapshot ? (
        <GraphCanvas snapshot={snapshot} onSelect={setSelected} />
      ) : null}

      <div className={styles.readout}>
        <span className={styles.source}>
          {source === "sample"
            ? "sample graph"
            : source === "live"
              ? "your graph"
              : "loading"}
        </span>
        {selected ? (
          <span className={styles.selected}>{selected.title}</span>
        ) : null}
      </div>
    </main>
  );
}
