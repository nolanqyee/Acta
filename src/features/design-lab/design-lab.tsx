/**
 * @fileoverview `/lab/design`'s composition root: the live graph canvas
 * full-bleed, with Neubrutalism product chrome overlaid on top (brand,
 * adapters, capture/deepen/theme/profile, ask bar, Explore panel, node detail,
 * hover card). Chrome uses shared primitives (`.surface`/`.control`/`.field` in
 * `design-lab.module.css`) styled with hard ink borders and offset shadows.
 *
 * Chrome here is deliberately dumb: buttons render and take hover/press states
 * but only two things actually do anything — the hamburger opens/closes an
 * adapter menu and a lab control toggles the Explore panel. Node selection and hover
 * come straight from the live canvas, same as `graph-view.tsx`, so the detail panel
 * and hover card react to a real running simulation. Neubrutalism is light-only here.
 */

"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildSampleGraph } from "@/lib/graph/sample-graph";
import { GraphCanvas, type HoverInfo } from "@/features/graph/graph-canvas";
import { formatTimeframe, humanize } from "@/features/graph/format-endeavor";
import { animateFadeIn } from "@/features/motion/enter";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import {
  HOVER_CARD_ESTIMATE_HEIGHT_PX,
  HOVER_CARD_OFFSET_PX,
  HOVER_CARD_WIDTH_PX,
  resolveHoverCardPlacement,
} from "@/features/graph/hover-card-placement";
import styles from "./design-lab.module.css";

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
const OFFSET_PX = HOVER_CARD_OFFSET_PX;

/** Must match `.hoverCard`'s width cap in design-lab.module.css. */
const CARD_WIDTH_PX = HOVER_CARD_WIDTH_PX;

/** Longest summary snippet shown before an ellipsis. */
const MAX_SNIPPET_CHARS = 140;

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
 * The full mocked homepage: live canvas background plus Neubrutalism chrome.
 *
 * @returns The `/lab/design` workbench surface.
 */
export function DesignLab() {
  const reducedMotion = useReducedMotion();
  const snapshot = useMemo(() => buildSampleGraph(), []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [adapterMenuOpen, setAdapterMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [deepenOpen, setDeepenOpen] = useState(false);

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
  const [hoverCardSize, setHoverCardSize] = useState({
    width: CARD_WIDTH_PX,
    height: HOVER_CARD_ESTIMATE_HEIGHT_PX,
  });
  const hoverTimeframe =
    hover && !selectedId ? formatTimeframe(hover.node.timeframe) : null;
  const hoverSummaryText =
    hover && !selectedId ? snippet(hover.node.summary) : null;
  const hoverFacets =
    hover && !selectedId
      ? [
          ...hover.node.facets.skills,
          ...hover.node.facets.people,
          ...hover.node.facets.orgs,
        ].slice(0, 6)
      : [];

  useLayoutEffect(() => {
    if (!hover || selectedId) return;
    const el = hoverCardRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setHoverCardSize((prev) =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  }, [
    hover,
    selectedId,
    hoverNodeId,
    hoverSummaryText,
    hoverFacets.length,
  ]);

  const hoverPlacement = useMemo(() => {
    if (!hover || selectedId) return null;
    return resolveHoverCardPlacement(
      hover.x,
      hover.y,
      hoverCardSize.width,
      hoverCardSize.height,
      OFFSET_PX,
    );
  }, [hover, hoverCardSize.height, hoverCardSize.width, selectedId]);

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
    <main className={styles.shell} data-design="neubrutalism" data-mode="light">
      <div className={styles.canvasLayer}>
        <GraphCanvas
          snapshot={snapshot}
          resolvedTheme="light"
          transparentBackground
          showThinNodes={deepenOpen}
          selectedId={selectedId}
          onSelect={(node) => setSelectedId(node.id)}
          onBackgroundClick={() => setSelectedId(null)}
          onHover={setHover}
        />
      </div>

      {hover && !selectedId && hoverPlacement ? (
        <div
          ref={hoverCardRef}
          className={`${styles.surface} ${styles.hoverCard}`}
          style={{
            left: hoverPlacement.left,
            top: hoverPlacement.top,
            transform: hoverPlacement.flipY
              ? "translateY(-100%)"
              : undefined,
          }}
          role="status"
          aria-live="polite"
        >
          <div className={styles.hoverKicker}>
            <span className={styles.hoverKind}>
              {humanize(hover.node.kind)}
            </span>
            {hover.node.state === "pending" ? (
              <span className={styles.hoverPending}>Pending</span>
            ) : null}
            {hoverTimeframe ? (
              <span className={styles.hoverTimeframe}>{hoverTimeframe}</span>
            ) : null}
          </div>
          <div className={styles.hoverTitle}>{hover.node.title}</div>
          {hoverSummaryText ? (
            <p className={styles.hoverSummary}>{hoverSummaryText}</p>
          ) : null}
          {hoverFacets.length > 0 ? (
            <ul className={styles.hoverChips}>
              {hoverFacets.map((facet) => (
                <li key={facet} className={styles.hoverChip}>
                  {facet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className={styles.brand}>
        <div className={styles.brandRow} ref={hamburgerAreaRef}>
          <div className={styles.hamburgerAnchor}>
            <button
              type="button"
              className={styles.control}
              aria-label={adapterMenuOpen ? "Close adapters" : "Open adapters"}
              aria-expanded={adapterMenuOpen}
              onClick={() => setAdapterMenuOpen((open) => !open)}
            >
              <span className={styles.hamburgerLines} aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
            {adapterMenuOpen ? (
              <div
                className={`${styles.surface} ${styles.adapterMenu}`}
                role="menu"
              >
                <div className={styles.adapterMenuLabel}>
                  Generate from the graph
                </div>
                {ADAPTER_OPTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    className={styles.adapterRow}
                  >
                    {label}
                    <span className={styles.adapterRowArrow} aria-hidden>
                      →
                    </span>
                  </button>
                ))}
                <p className={styles.adapterMenuFoot}>
                  Each opens its own page. The graph stays here.
                </p>
              </div>
            ) : null}
          </div>
          <span className={styles.wordmark}>Acta</span>
        </div>
      </div>

      <div className={styles.topRight}>
        <button type="button" className={styles.captureButton}>
          <span className={styles.capturePlus} aria-hidden>
            +
          </span>
          Capture
        </button>

        <div className={styles.deepenWrap}>
          <button
            type="button"
            className={styles.control}
            aria-label={deepenOpen ? "Close deepen backlog" : "Open deepen backlog"}
            aria-expanded={deepenOpen}
            aria-pressed={deepenOpen}
            onClick={() => setDeepenOpen((open) => !open)}
          >
            <span className={styles.deepenIcon} aria-hidden />
          </button>
          <span className={styles.badge}>7</span>
        </div>

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
          <button type="button" className={styles.askSend} aria-label="Send">
            ↑
          </button>
        </div>
        <button
          type="button"
          className={styles.exploreToggle}
          aria-pressed={exploreOpen}
          aria-label="Toggle explore panel"
          onClick={() => setExploreOpen((open) => !open)}
        >
          Explore
        </button>
        <button type="button" className={styles.filterButton}>
          Filter
        </button>
        <button
          type="button"
          className={`${styles.control} ${styles.settingsButton}`}
          aria-label="Graph settings"
        >
          <span className={styles.settingsGlyph} aria-hidden />
        </button>
      </div>

      <p className={styles.canvasStatus}>
        {selectedNode
          ? `${selectedNode.facets.skills.length + selectedNode.facets.people.length + selectedNode.facets.orgs.length} facets · detail open`
          : exploreOpen
            ? "4 of 142 shown · filter · 2"
            : "142 endeavors · 388 links · live simulation"}
      </p>

      {exploreOpen ? (
        <div
          className={`${styles.surface} ${styles.explorePanel}`}
          role="dialog"
          aria-label="Explore results"
        >
          <button
            type="button"
            className="acta-panel-close"
            aria-label="Close explore panel"
            onClick={() => setExploreOpen(false)}
          >
            ×
          </button>
          <div className={styles.exploreHeaderRow}>
            <span className={styles.exploreLabel}>Explore</span>
          </div>
          <h2 className={styles.exploreHeading}>
            &ldquo;what have I done with Redis?&rdquo;
          </h2>
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
            className="acta-panel-close"
            aria-label="Close"
            onClick={() => setSelectedId(null)}
          >
            ×
          </button>

          <div className={styles.detailScroll}>
            <div className={styles.detailKicker}>
              <span className={styles.detailKind}>
                {humanize(selectedNode.kind)}
              </span>
              {selectedNode.state === "pending" ? (
                <span className={styles.hoverPending}>Pending</span>
              ) : null}
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
        </div>
      ) : null}
    </main>
  );
}
