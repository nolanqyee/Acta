/**
 * @fileoverview `/lab/design`'s composition root: the live graph canvas
 * full-bleed, with a mock of the full product chrome overlaid on top (brand,
 * adapters, capture/deepen/theme/profile, ask bar, Explore panel, node detail,
 * hover card), per the spatial layout in docs/archive/mockup-synthesis.md. Every
 * chrome surface uses one of two shared primitives
 * (`.surface`/`.control`/`.field`, defined in `design-lab.module.css`), so the
 * whole screen's visual treatment can be swapped between named design systems by
 * setting `data-design` on the shell.
 *
 * Chrome here is deliberately dumb: buttons render and take hover/press states
 * but only three things actually do anything — the hamburger opens/closes an
 * adapter menu, a lab control toggles the Explore panel, and the theme button
 * flips light/dark (glass reads very differently in each, so it has to be
 * switchable here). Node selection and hover come straight from the live canvas,
 * same as `graph-view.tsx`, so the detail panel and hover card react to a real
 * running simulation.
 *
 * The theme button is rebuilt locally instead of reusing `ThemeToggle`: the
 * product component carries its own fixed styling, which would leave one control
 * in the top-right cluster not wearing the system under test.
 */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp,
  Inbox,
  Menu,
  Mic,
  Moon,
  Plus,
  Settings,
  SlidersHorizontal,
  Sun,
  X,
} from "lucide-react";
import { buildSampleGraph } from "@/lib/graph/sample-graph";
import { GraphCanvas, type HoverInfo } from "@/features/graph/graph-canvas";
import { formatTimeframe, humanize } from "@/features/graph/format-endeavor";
import { animateFadeIn } from "@/features/motion/enter";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import { useTheme } from "@/features/theme/use-theme";
import styles from "./design-lab.module.css";
import { SystemSwitcher } from "./system-switcher";
import { parseDesignSystem, type DesignSystem } from "./systems";

/** Adapter menu rows behind the hamburger — labels only, no real navigation. */
const ADAPTER_OPTIONS = ["Resume", "LinkedIn bio", "Cover letter", "Brag doc"];

/** One mock row in the Explore floating panel. */
interface ExploreResult {
  title: string;
  kind: string;
}

/** Fixture rows for the Explore panel — a plausible "what have I done with Redis?" hit list. */
const EXPLORE_RESULTS: ExploreResult[] = [
  { title: "Redis caching layer", kind: "Project" },
  { title: "SWE Intern, Bubble", kind: "Role" },
  { title: "Billing webhook refactor", kind: "Project" },
  { title: "Graph embedding study", kind: "Project" },
];

/** Gap between the pointer and the hover card, in CSS px. */
const OFFSET_PX = 16;

/** Must match `.hoverCard`'s `max-width` in design-lab.module.css. */
const CARD_WIDTH_PX = 260;

/**
 * Height estimate for deciding whether to flip above the pointer — not used for
 * vertical placement (see {@link placement}).
 */
const CARD_FLIP_HEIGHT_PX = 120;

/** Frame rate is sampled into React state this often; every frame would defeat the point. */
const FPS_REPORT_INTERVAL_MS = 400;

/** Longest summary snippet shown before an ellipsis. */
const MAX_SNIPPET_CHARS = 140;

/**
 * @param summary - Full summary text, if any.
 * @returns A one-line-ish snippet short enough for a peek card.
 */
function snippet(summary: string | undefined): string | null {
  if (!summary) return null;
  return summary.length <= MAX_SNIPPET_CHARS
    ? summary
    : `${summary.slice(0, MAX_SNIPPET_CHARS - 1).trimEnd()}…`;
}

/**
 * Picks a corner to grow from so the card stays on screen, without measuring it.
 *
 * @param x - Pointer x in viewport CSS px.
 * @param y - Pointer y in viewport CSS px.
 * @returns Inline `left`/`top`/`flipY` for the card. When `flipY`, the card grows
 *   upward from `top` via `translateY(-100%)` so the gap above the pointer matches
 *   the gap below.
 */
function placement(
  x: number,
  y: number,
): {
  left: number;
  top: number;
  flipY: boolean;
} {
  const vw = typeof window === "undefined" ? Infinity : window.innerWidth;
  const vh = typeof window === "undefined" ? Infinity : window.innerHeight;

  const left =
    x + OFFSET_PX + CARD_WIDTH_PX > vw
      ? x - OFFSET_PX - CARD_WIDTH_PX
      : x + OFFSET_PX;
  const flipY = y + OFFSET_PX + CARD_FLIP_HEIGHT_PX > vh;
  const top = flipY ? y - OFFSET_PX : y + OFFSET_PX;

  return { left: Math.max(8, left), top: Math.max(8, top), flipY };
}

/**
 * Renders one labelled chip list in the node detail panel, or nothing if the
 * facet is empty.
 *
 * @param props.label - Section heading (e.g. "Skills").
 * @param props.values - Chip text values.
 * @returns The section, or `null` when `values` is empty.
 */
function FacetSection({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className={styles.detailSection}>
      <h3 className={styles.detailSectionLabel}>{label}</h3>
      <ul className={styles.detailChips}>
        {values.map((value) => (
          <li key={value} className={styles.detailChip}>
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The full mocked homepage: live canvas background plus every chrome surface,
 * switchable between design systems.
 *
 * @returns The `/lab/design` workbench surface.
 */
export function DesignLab() {
  const params = useSearchParams();
  const { resolvedTheme, toggle: toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const snapshot = useMemo(() => buildSampleGraph(), []);
  const isDark = resolvedTheme === "dark";

  const [designSystem, setDesignSystem] = useState<DesignSystem>(() =>
    parseDesignSystem(params.get("design")),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [adapterMenuOpen, setAdapterMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  const [fps, setFps] = useState(0);
  const lastFpsReport = useRef(0);

  /**
   * Records the frame rate at a human-readable cadence so chrome over the live
   * canvas can be judged without staring at DevTools.
   *
   * @param value - Instantaneous frames per second from the render loop.
   */
  const handleFps = useCallback((value: number) => {
    const now = performance.now();
    if (now - lastFpsReport.current < FPS_REPORT_INTERVAL_MS) return;
    lastFpsReport.current = now;
    setFps(value);
  }, []);

  const hamburgerAreaRef = useRef<HTMLDivElement>(null);
  const hoverCardRef = useRef<HTMLDivElement>(null);

  const selectedNode = useMemo(
    () => snapshot.nodes.find((node) => node.id === selectedId) ?? null,
    [snapshot, selectedId],
  );

  /**
   * Closes the adapter menu on Escape or on any pointer press outside its
   * anchor (the hamburger button plus the popover itself).
   */
  useEffect(() => {
    if (!adapterMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setAdapterMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent): void => {
      if (!hamburgerAreaRef.current?.contains(event.target as Node)) {
        setAdapterMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [adapterMenuOpen]);

  const hoverNodeId = hover && !selectedId ? hover.node.id : null;
  const hoverPlacement =
    hover && !selectedId ? placement(hover.x, hover.y) : null;
  const hoverTimeframe =
    hover && !selectedId ? formatTimeframe(hover.node.timeframe) : null;
  const hoverSummaryText =
    hover && !selectedId ? snippet(hover.node.summary) : null;
  const hoverFacetLine =
    hover && !selectedId
      ? [
          ...hover.node.facets.skills,
          ...hover.node.facets.people,
          ...hover.node.facets.orgs,
        ]
          .slice(0, 3)
          .join(" · ")
      : null;

  /**
   * Fades the hover card in when the hovered node changes, matching the product
   * hover card's entrance motion.
   */
  useEffect(() => {
    if (!hoverNodeId) return;
    const el = hoverCardRef.current;
    if (!el) return;
    const anim = animateFadeIn(el, reducedMotion);
    return () => {
      anim?.revert();
    };
  }, [hoverNodeId, reducedMotion]);

  return (
    <main className={styles.shell} data-design={designSystem}>
      <div className={styles.canvasLayer}>
        <GraphCanvas
          snapshot={snapshot}
          resolvedTheme={resolvedTheme}
          onFps={handleFps}
          selectedId={selectedId}
          onSelect={(node) => setSelectedId(node.id)}
          onBackgroundClick={() => setSelectedId(null)}
          onHover={setHover}
        />
      </div>

      {hover && hoverPlacement ? (
        <div
          ref={hoverCardRef}
          className={`${styles.surface} ${styles.hoverCard}`}
          style={{
            left: hoverPlacement.left,
            top: hoverPlacement.top,
            transform: hoverPlacement.flipY ? "translateY(-100%)" : undefined,
          }}
          role="status"
          aria-live="polite"
        >
          <div className={styles.hoverKicker}>
            <span className={styles.hoverKind}>
              {humanize(hover.node.kind)}
            </span>
            {hoverTimeframe ? (
              <span className={styles.hoverTimeframe}>{hoverTimeframe}</span>
            ) : null}
          </div>
          <div className={styles.hoverTitle}>{hover.node.title}</div>
          {hoverSummaryText ? (
            <p className={styles.hoverSummary}>{hoverSummaryText}</p>
          ) : null}
          {hoverFacetLine ? (
            <p className={styles.hoverFacets}>{hoverFacetLine}</p>
          ) : null}
        </div>
      ) : null}

      <div className={styles.brand}>
        <span className={styles.wordmark}>Acta</span>
        <div className={styles.hamburgerAnchor} ref={hamburgerAreaRef}>
          <button
            type="button"
            className={styles.control}
            aria-label={adapterMenuOpen ? "Close adapters" : "Open adapters"}
            aria-expanded={adapterMenuOpen}
            onClick={() => setAdapterMenuOpen((open) => !open)}
          >
            <Menu size={18} aria-hidden />
          </button>
          {adapterMenuOpen ? (
            <div
              className={`${styles.surface} ${styles.adapterMenu}`}
              role="menu"
            >
              {ADAPTER_OPTIONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  className={styles.adapterRow}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.topRight}>
        <div className={styles.captureCluster}>
          <button type="button" className={styles.captureLabel}>
            <Plus size={16} aria-hidden />
            Capture
          </button>
          <button
            type="button"
            className={styles.captureMic}
            aria-label="Capture by voice"
          >
            <Mic size={16} aria-hidden />
          </button>
        </div>

        <div className={styles.deepenWrap}>
          <button
            type="button"
            className={styles.control}
            aria-label="Deepen backlog"
          >
            <Inbox size={18} aria-hidden />
          </button>
          <span className={styles.badge}>3</span>
        </div>

        {/* The product ThemeToggle carries its own fixed styling, which would make it
            the one control in this cluster not wearing the system under test. */}
        <button
          type="button"
          className={styles.control}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDark}
          onClick={toggleTheme}
        >
          {isDark ? (
            <Sun size={18} aria-hidden />
          ) : (
            <Moon size={18} aria-hidden />
          )}
        </button>

        <button
          type="button"
          className={`${styles.control} ${styles.controlPill}`}
          aria-label="Profile menu"
        >
          <span className={styles.profileContent}>
            <span className={styles.avatar}>NY</span>
            <span className={styles.profileName}>Nolan</span>
          </span>
        </button>
      </div>

      <div className={styles.askRow}>
        <div className={`${styles.field} ${styles.askField}`}>
          <input
            type="text"
            className={styles.askInput}
            placeholder='Ask your graph — "what have I done with Redis?"'
          />
          {/* Deliberately not a glass surface — the send action stays flat. */}
          <button type="button" className={styles.askSend} aria-label="Send">
            <ArrowUp size={18} aria-hidden />
          </button>
        </div>
        <button type="button" className={styles.control} aria-label="Filter">
          <SlidersHorizontal size={18} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.control}
          aria-label="Graph settings"
        >
          <Settings size={18} aria-hidden />
        </button>
      </div>

      {exploreOpen ? (
        <div
          className={`${styles.surface} ${styles.explorePanel}`}
          role="dialog"
          aria-label="Explore results"
        >
          <div className={styles.exploreHeaderRow}>
            <h2 className={styles.exploreHeading}>Explore</h2>
            <button
              type="button"
              className={`${styles.control} ${styles.controlSm}`}
              aria-label="Close explore panel"
              onClick={() => setExploreOpen(false)}
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          <p className={styles.exploreSummary}>
            4 endeavors mention Redis, ranked by relevance.
          </p>
          <div className={styles.resultList}>
            {EXPLORE_RESULTS.map((result) => (
              <div key={result.title} className={styles.resultRow}>
                <span className={styles.resultTitle}>{result.title}</span>
                <span className={styles.resultKind}>{result.kind}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {selectedNode ? (
        <div
          className={`${styles.surface} ${styles.detailPanel}`}
          role="dialog"
          aria-label={selectedNode.title}
        >
          <button
            type="button"
            className={`${styles.control} ${styles.controlSm} ${styles.detailClose}`}
            aria-label="Close"
            onClick={() => setSelectedId(null)}
          >
            <X size={16} aria-hidden />
          </button>

          <div className={styles.detailKicker}>
            <span className={styles.detailKind}>
              {humanize(selectedNode.kind)}
            </span>
            {selectedNode.status !== "active" ? (
              <span className={styles.detailStatus}>
                {humanize(selectedNode.status)}
              </span>
            ) : null}
          </div>

          <h2 className={styles.detailTitle}>{selectedNode.title}</h2>
          {formatTimeframe(selectedNode.timeframe) ? (
            <p className={styles.detailTimeframe}>
              {formatTimeframe(selectedNode.timeframe)}
            </p>
          ) : null}

          {selectedNode.summary ? (
            <p className={styles.detailSummary}>{selectedNode.summary}</p>
          ) : (
            <p className={styles.detailEmpty}>
              No summary yet — this endeavor hasn&rsquo;t been deepened.
            </p>
          )}

          <FacetSection label="Skills" values={selectedNode.facets.skills} />
          <FacetSection label="People" values={selectedNode.facets.people} />
          <FacetSection
            label="Organizations"
            values={selectedNode.facets.orgs}
          />
        </div>
      ) : null}

      <div className={styles.labBar}>
        <SystemSwitcher active={designSystem} onChange={setDesignSystem} />
        <button
          type="button"
          className={styles.labToggle}
          aria-pressed={exploreOpen}
          onClick={() => setExploreOpen((open) => !open)}
        >
          {exploreOpen ? "Hide Explore" : "Show Explore"}
        </button>
        <span className={styles.labFps}>{Math.round(fps)} fps</span>
      </div>
    </main>
  );
}
