/**
 * @fileoverview A plain, opaque panel of sliders for the four forces, plus a frame
 * counter.
 *
 * This exists so physics can be judged by feel instead of by argument: move a slider,
 * watch the graph respond. It is deliberately ugly and **opaque** — translucent
 * surfaces over a live graph made text unreadable, which is why the glass direction is
 * shelved (docs/graph-canvas.md R7).
 *
 * Not a product surface. It will be replaced by a real settings control once the
 * numbers are settled.
 */

"use client";

import { DEFAULT_TUNABLES, TUNABLE_RANGES, type Tunables } from "./tunables";

/** Human labels for the sliders, in the order they should read. */
const CONTROLS: { key: keyof Tunables; label: string }[] = [
  { key: "gravity", label: "Centre gravity" },
  { key: "repulsion", label: "Repulsion" },
  { key: "linkDistance", label: "Link distance" },
  { key: "linkStrength", label: "Link strength" },
  { key: "nodeRadius", label: "Node size" },
];

interface DevHudProps {
  tunables: Tunables;
  onChange: (tunables: Tunables) => void;
  fps: number;
  nodeCount: number;
  linkCount: number;
}

/**
 * Renders the physics sliders and a live frame rate.
 *
 * @param props.tunables - Current force settings.
 * @param props.onChange - Called with the updated settings on every slider move.
 * @param props.fps - Measured frame rate, for spotting stutter during a drag.
 * @param props.nodeCount - Nodes currently in the simulation.
 * @param props.linkCount - Links currently in the simulation.
 * @returns The dev panel.
 */
export function DevHud({
  tunables,
  onChange,
  fps,
  nodeCount,
  linkCount,
}: DevHudProps) {
  return (
    <aside
      className="absolute right-acta-4 top-acta-4 z-10 flex w-[230px] flex-col gap-acta-3 rounded-panel border border-edge-strong bg-elevated p-acta-3 font-ui text-[11px] text-ink shadow-soft"
      aria-label="Graph physics (development)"
    >
      <header className="flex items-baseline justify-between uppercase tracking-widest text-muted">
        <span>physics</span>
        <span className="tabular-nums normal-case tracking-normal text-ink">
          {Math.round(fps)} fps · {nodeCount}n · {linkCount}e
        </span>
      </header>

      {CONTROLS.map(({ key, label }) => {
        const range = TUNABLE_RANGES[key];
        return (
          <label key={key} className="flex flex-col gap-1">
            <span className="flex justify-between gap-acta-2 text-muted">
              {label}
              <span className="tabular-nums text-ink">{tunables[key]}</span>
            </span>
            <input
              type="range"
              className="w-full accent-accent"
              min={range.min}
              max={range.max}
              step={range.step}
              value={tunables[key]}
              onChange={(event) =>
                onChange({ ...tunables, [key]: Number(event.target.value) })
              }
            />
          </label>
        );
      })}

      <button
        type="button"
        className="cursor-pointer rounded-ctl border border-edge-strong bg-transparent px-2 py-1.5 font-inherit text-muted hover:text-ink"
        onClick={() => onChange(DEFAULT_TUNABLES)}
      >
        Reset to defaults
      </button>
    </aside>
  );
}
