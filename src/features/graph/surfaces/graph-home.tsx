/**
 * @fileoverview The graph home surface (`/home`): live canvas full-bleed with Neubrutalism
 * product chrome overlaid. Lives under `surfaces/` — imports the canvas engine from
 * `../engine/graph-canvas.tsx` but owns React chrome, panels, and data loading only.
 */

"use client";

import {
  ArrowUp,
  Filter,
  Inbox,
  Menu,
  Plus,
  Settings,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GraphSnapshot, type GraphSnapshot as GraphSnapshotType } from "@/lib/contracts";
import { mergePendingPreviewsIntoSnapshot } from "@/lib/graph/merge-pending-previews";
import { pendingGhostNodeId } from "@/lib/graph/pending-ghost-id";
import { DiffSkimPanel } from "@/features/capture/diff-skim-panel";
import { useOpenProposal } from "@/features/capture/use-open-proposal";
import { GraphCanvas, type HoverInfo } from "../engine/graph-canvas";
import { formatTimeframe, humanize } from "./format-endeavor";
import { animateFadeIn } from "@/features/motion/enter";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import {
  HOVER_CARD_ESTIMATE_HEIGHT_PX,
  HOVER_CARD_OFFSET_PX,
  HOVER_CARD_WIDTH_PX,
  resolveHoverCardPlacement,
} from "./hover-card-placement";

/** Adapter menu rows behind the hamburger — labels only, no real navigation yet. */
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

/** Whether the user's graph has loaded from the API yet. */
type GraphLoadState = "loading" | "live" | "error";

/** Gap between the pointer and the hover card, in CSS px. */
const OFFSET_PX = HOVER_CARD_OFFSET_PX;

/** Must match hover card width cap (`--hover-card-width` in tokens.css). */
const CARD_WIDTH_PX = HOVER_CARD_WIDTH_PX;

/** Longest summary snippet shown before an ellipsis. */
const MAX_SNIPPET_CHARS = 140;

/** Top chrome height — compact controls (brand row, capture, profile). */
const TOP_H = "h-[var(--ctl-size-brutal)]";

/** Bottom ask row height — ask bar, explore, filter, settings. */
const ASK_H = "h-[var(--ask-height-brutal)]";

/** Lucide sizing — slightly smaller in the compact top row. */
const TOP_ICON_SIZE = 16;
const ASK_ICON_SIZE = 18;
const ICON_STROKE = 2.25;

/** Square icon button for the top chrome row. */
const TOP_ICON_BTN = [
  "acta-control relative grid aspect-square min-w-[var(--ctl-size-brutal)] cursor-pointer place-items-center bg-card font-ui text-ink",
  TOP_H,
  "transition-[background,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-panel active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--ink)]",
].join(" ");

/** Pill control for the top chrome row. */
const TOP_PILL_BTN = [
  "acta-control inline-flex cursor-pointer items-center font-ui text-ink",
  TOP_H,
  "transition-[background,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-card active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--ink)]",
].join(" ");

/** Square icon button for the bottom ask row. */
const ASK_ICON_BTN = [
  "acta-control relative grid aspect-square min-w-[var(--ask-height-brutal)] cursor-pointer place-items-center bg-card font-ui text-ink",
  ASK_H,
  "transition-[background,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-panel active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--ink)]",
].join(" ");

/** Pill control for the bottom ask row. */
const ASK_PILL_BTN = [
  "acta-control inline-flex cursor-pointer items-center font-ui text-ink",
  ASK_H,
  "transition-[background,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-card active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--ink)]",
].join(" ");

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
    <div className="flex flex-col gap-acta-3">
      <h3 className="acta-label m-0">{label}</h3>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {values.map((value) => (
          <li key={value} className="acta-chip">
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
 * Builds the bottom status line from graph state and chrome toggles.
 *
 * @param snapshot - Loaded graph, if any.
 * @param loadState - Whether the graph fetch is still in flight or failed.
 * @param selectedNode - Currently selected canvas node, if any.
 * @param exploreOpen - Whether the Explore panel is open.
 * @returns Status copy for the footer readout.
 */
function statusLine(
  snapshot: GraphSnapshotType | null,
  loadState: GraphLoadState,
  selectedNode: GraphSnapshotType["nodes"][number] | null,
  exploreOpen: boolean,
  capturePanelOpen: boolean,
  pendingReviewCount: number,
): string {
  if (selectedNode) {
    const facetCount =
      selectedNode.facets.skills.length +
      selectedNode.facets.people.length +
      selectedNode.facets.orgs.length;
    return `${facetCount} facets · detail open`;
  }
  if (capturePanelOpen && pendingReviewCount > 0) {
    return `${pendingReviewCount} pending · review open`;
  }
  if (pendingReviewCount > 0) {
    return `${pendingReviewCount} pending · open Capture to review`;
  }
  if (exploreOpen) {
    return `${EXPLORE_RESULTS.length} of ${snapshot?.nodes.length ?? "—"} shown · filter · 2`;
  }
  if (loadState === "loading") {
    return "loading graph…";
  }
  if (loadState === "error") {
    return "couldn't load your graph · refresh to retry";
  }
  if (!snapshot) {
    return "your graph";
  }
  if (snapshot.nodes.length === 0) {
    return "empty graph · capture to add your first endeavor";
  }
  const endeavorWord = snapshot.nodes.length === 1 ? "endeavor" : "endeavors";
  const linkWord = snapshot.links.length === 1 ? "link" : "links";
  return `${snapshot.nodes.length} ${endeavorWord} · ${snapshot.links.length} ${linkWord} · your graph`;
}

/**
 * The graph home: live canvas background plus Neubrutalism product chrome.
 *
 * @returns The `/home` surface.
 */
export function GraphHome() {
  const reducedMotion = useReducedMotion();

  const [snapshot, setSnapshot] = useState<GraphSnapshotType | null>(null);
  const [loadState, setLoadState] = useState<GraphLoadState>("loading");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [adapterMenuOpen, setAdapterMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [deepenOpen, setDeepenOpen] = useState(false);
  const [capturePanelOpen, setCapturePanelOpen] = useState(false);

  const {
    proposal,
    busy: captureBusy,
    pendingUnitCount,
    captureBlocked,
    submitCapture,
    retryExtract,
  } = useOpenProposal();

  const hamburgerAreaRef = useRef<HTMLDivElement>(null);
  const hoverCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/graph", { cache: "no-store" });
        if (!response.ok)
          throw new Error(`graph fetch failed: ${response.status}`);
        const parsed = GraphSnapshot.parse(await response.json());
        if (cancelled) return;
        setSnapshot(parsed);
        setLoadState("live");
      } catch {
        if (cancelled) return;
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const canvasSnapshot = useMemo(() => {
    if (!snapshot) {
      return null;
    }
    if (!proposal || proposal.pendingEndeavorPreviews.length === 0) {
      return snapshot;
    }
    return mergePendingPreviewsIntoSnapshot(snapshot, proposal);
  }, [snapshot, proposal]);

  const selectedNode = useMemo(
    () => canvasSnapshot?.nodes.find((node) => node.id === selectedId) ?? null,
    [canvasSnapshot, selectedId],
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
   * Fades the hover card in when the hovered node changes.
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
    <main
      className="fixed inset-0 overflow-hidden bg-canvas text-ink [--ask-stack:calc(var(--space-6)+var(--ask-height-brutal))] [--status-offset:calc(var(--ask-stack)+var(--space-3))] [--chrome-top:calc(var(--space-6)+var(--ctl-size-brutal)+var(--space-4))] [--chrome-bottom:calc(var(--status-offset)+var(--space-4)+var(--text-label))] [--panel-max-height:calc(100dvh-var(--chrome-top)-var(--chrome-bottom))]"
      data-design="neubrutalism"
      data-mode="light"
    >
      <div className="absolute inset-0 z-0 bg-canvas [background-image:linear-gradient(var(--ink-wash)_1px,transparent_1px),linear-gradient(90deg,var(--ink-wash)_1px,transparent_1px)] [background-size:36px_36px] [&_canvas]:block [&_canvas]:size-full">
        {canvasSnapshot ? (
          <GraphCanvas
            snapshot={canvasSnapshot}
            transparentBackground
            showThinNodes={deepenOpen}
            selectedId={selectedId}
            onSelect={(node) => setSelectedId(node.id)}
            onBackgroundClick={() => setSelectedId(null)}
            onHover={setHover}
          />
        ) : null}
      </div>

      {hover && !selectedId && hoverPlacement ? (
        <div
          ref={hoverCardRef}
          className="acta-panel pointer-events-none fixed z-[25] box-border flex w-[min(18.25rem,calc(100vw-16px))] max-h-[min(280px,calc(100dvh-16px))] flex-col gap-acta-3 overflow-x-hidden overflow-y-auto px-5 py-acta-4 font-ui text-ink"
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
          <div className="acta-label flex flex-wrap items-center gap-acta-3">
            <span className="text-[var(--brand-primary-text)]">
              {humanize(hover.node.kind)}
            </span>
            {hover.node.state === "pending" ? (
              <span className="text-[var(--brand-secondary-text)]">Pending</span>
            ) : null}
            {hoverTimeframe ? (
              <span className="text-muted">{hoverTimeframe}</span>
            ) : null}
          </div>
          <div className="font-display text-[var(--text-h-sm)] font-bold leading-[1.12] text-ink">
            {hover.node.title}
          </div>
          {hoverSummaryText ? (
            <p className="m-0 text-body leading-normal text-[var(--ink-soft)]">
              {hoverSummaryText}
            </p>
          ) : null}
          {hoverFacets.length > 0 ? (
            <ul className="m-0 flex min-w-0 list-none flex-wrap gap-1.5 p-0">
              {hoverFacets.map((facet) => (
                <li
                  key={facet}
                  className="acta-chip max-w-full overflow-hidden text-ellipsis px-3 py-1"
                >
                  {facet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="fixed left-acta-6 top-acta-6 z-20">
        <div className="relative flex items-center gap-acta-4" ref={hamburgerAreaRef}>
          <div className="relative shrink-0">
            <button
              type="button"
              className={TOP_ICON_BTN}
              aria-label={adapterMenuOpen ? "Close adapters" : "Open adapters"}
              aria-expanded={adapterMenuOpen}
              onClick={() => setAdapterMenuOpen((open) => !open)}
            >
              <Menu size={TOP_ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
            </button>
            {adapterMenuOpen ? (
              <div
                className="acta-panel absolute left-0 top-[calc(100%+var(--space-3))] z-[1] flex w-[14.75rem] flex-col gap-1 p-acta-3 font-ui text-ink"
                role="menu"
              >
                <div className="acta-label px-acta-3 pb-acta-3 pt-1">
                  Generate from the graph
                </div>
                {ADAPTER_OPTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    className="acta-button flex w-full items-center gap-acta-3 rounded-soft border-0 bg-transparent p-acta-3 text-left transition-[background] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-card"
                  >
                    {label}
                    <span className="ml-auto text-[13px] text-muted" aria-hidden>
                      →
                    </span>
                  </button>
                ))}
                <p className="px-acta-3 pb-1 pt-acta-3 text-[11px] leading-normal text-muted">
                  Each opens its own page. The graph stays here.
                </p>
              </div>
            ) : null}
          </div>
          <span className="font-display text-[1.875rem] font-bold leading-none tracking-[0.01em] text-ink">
            Acta
          </span>
        </div>
      </div>

      <div className="fixed right-acta-6 top-acta-6 z-20 flex items-center gap-acta-3">
        <div className="relative inline-flex">
          <button
            type="button"
            className="acta-button acta-button-accent acta-button-primary"
            aria-expanded={capturePanelOpen}
            onClick={() => {
              setExploreOpen(false);
              setCapturePanelOpen(true);
            }}
          >
            <Plus size={TOP_ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
            Capture
          </button>
          {pendingUnitCount > 0 && !capturePanelOpen ? (
            <span className="absolute -right-1 -top-[5px] grid h-[18px] min-w-[18px] place-items-center rounded-pill border-2 border-ink bg-[var(--brand-secondary)] px-1 font-ui text-[10px] font-bold leading-none text-[var(--brand-secondary-ink)]">
              {pendingUnitCount}
            </span>
          ) : null}
        </div>

        <div className="relative inline-flex">
          <button
            type="button"
            className={TOP_ICON_BTN}
            aria-label={deepenOpen ? "Close deepen backlog" : "Open deepen backlog"}
            aria-expanded={deepenOpen}
            aria-pressed={deepenOpen}
            onClick={() => setDeepenOpen((open) => !open)}
          >
            <Inbox size={TOP_ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
          </button>
          <span className="absolute -right-1 -top-[5px] grid h-[18px] min-w-[18px] place-items-center rounded-pill border-2 border-ink bg-[var(--brand-secondary)] px-1 font-ui text-[10px] font-bold leading-none text-[var(--brand-secondary-ink)]">
            7
          </span>
        </div>

        <button
          type="button"
          className={`${TOP_PILL_BTN} acta-button gap-2 px-3 pl-2`}
          aria-label="Profile menu"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] font-ui text-[10px] font-semibold text-[var(--brand-primary-ink)]">
            NY
          </span>
          <span className="whitespace-nowrap font-ui text-[13px] font-medium text-ink">
            Nolan
          </span>
        </button>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-acta-6 z-20 flex items-center justify-center gap-acta-3 [&>*]:pointer-events-auto">
        <div className="acta-control relative flex h-[var(--ask-height-brutal)] w-[min(35rem,calc(100vw-220px))] cursor-text items-center gap-acta-3 px-5 font-ui text-ink">
          <input
            type="text"
            className="min-w-0 flex-1 border-0 bg-transparent font-ui text-[15px] text-ink outline-none placeholder:text-muted"
            placeholder='Ask your graph — "what have I done with Redis?"'
          />
          <button
            type="button"
            className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-muted shadow-none hover:text-ink"
            aria-label="Send"
          >
            <ArrowUp size={ASK_ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          className={`${ASK_PILL_BTN} acta-button shrink-0 whitespace-nowrap px-4 aria-pressed:bg-[var(--brand-primary)] aria-pressed:text-[var(--brand-primary-ink)]`}
          aria-pressed={exploreOpen}
          aria-label="Toggle explore panel"
          onClick={() => setExploreOpen((open) => !open)}
        >
          Explore
        </button>
        <button
          type="button"
          className={`${ASK_PILL_BTN} shrink-0 gap-acta-2 px-5 text-[13px]`}
          aria-label="Filter graph"
        >
          <Filter size={16} strokeWidth={ICON_STROKE} aria-hidden />
          Filter
        </button>
        <button
          type="button"
          className={`${ASK_ICON_BTN} shrink-0`}
          aria-label="Graph settings"
        >
          <Settings size={ASK_ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
        </button>
      </div>

      <p className="pointer-events-none fixed bottom-[var(--status-offset)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-mono text-label uppercase tracking-[0.16em] text-muted">
        {statusLine(
          snapshot,
          loadState,
          selectedNode,
          exploreOpen,
          capturePanelOpen,
          pendingUnitCount,
        )}
      </p>

      {exploreOpen ? (
        <div
          className="acta-panel fixed top-[var(--chrome-top)] right-acta-6 z-[15] flex w-[min(var(--panel-width-explore),calc(100vw-var(--space-6)*2))] max-h-[var(--panel-max-height)] flex-col gap-acta-4 overflow-y-auto p-5 font-ui text-ink"
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
          <div className="flex items-center gap-acta-3 pr-[var(--panel-close-gutter)]">
            <span className="acta-label">Explore</span>
          </div>
          <h2 className="m-0 font-display text-[var(--text-h-sm)] font-bold leading-[1.3] text-ink">
            &ldquo;what have I done with Redis?&rdquo;
          </h2>
          <p className="m-0 font-ui text-[13px] leading-[1.55] text-[var(--ink-soft)]">
            4 endeavors mention Redis, ranked by relevance.
          </p>
          <div className="flex flex-col gap-1">
            {EXPLORE_RESULTS.map((result) => (
              <div
                key={result.title}
                className="-mx-2.5 flex cursor-pointer items-baseline gap-acta-3 rounded-soft px-acta-3 py-acta-2 transition-[background] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-card"
              >
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-ui text-body font-medium text-ink">
                  {result.title}
                </span>
                <span className="acta-label ml-auto shrink-0 tracking-[0.1em]">
                  {result.kind}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <DiffSkimPanel
        open={capturePanelOpen}
        proposal={proposal}
        busy={captureBusy}
        captureBlocked={captureBlocked}
        onClose={() => setCapturePanelOpen(false)}
        onSubmitCapture={submitCapture}
        onRetryExtract={() => {
          const captureId = proposal?.captureIds[0];
          if (captureId && proposal) {
            void retryExtract(captureId, proposal.id);
          }
        }}
        onFocusPendingUnit={(tempId) => {
          if (proposal) {
            setSelectedId(pendingGhostNodeId(proposal.id, tempId));
          }
        }}
      />

      {selectedNode ? (
        <div
          className="acta-panel fixed left-acta-6 top-[var(--chrome-top)] z-20 w-[min(var(--panel-width-brutal),calc(100vw-var(--space-6)*2))] max-h-[var(--panel-max-height)] overflow-y-auto p-0 font-ui text-ink"
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

          <div className="flex flex-col gap-acta-4 p-5">
            <div className="flex items-center gap-acta-3 pr-[var(--panel-close-gutter)]">
              <span className="acta-label inline-flex items-center whitespace-nowrap rounded-pill bg-[var(--brand-primary)] px-2 py-1 text-[var(--brand-primary-ink)]">
                {humanize(selectedNode.kind)}
              </span>
              {selectedNode.state === "pending" ? (
                <span className="text-[var(--brand-secondary-text)]">Pending</span>
              ) : null}
              {selectedNode.status !== "active" ? (
                <span className="text-[11px] capitalize text-muted">
                  {humanize(selectedNode.status)}
                </span>
              ) : null}
            </div>

            <h2 className="m-0 font-display text-[var(--text-h-sm)] font-bold leading-[1.25] text-ink">
              {selectedNode.title}
            </h2>
            {formatTimeframe(selectedNode.timeframe) ? (
              <p className="m-0 text-[13px] text-muted">
                {formatTimeframe(selectedNode.timeframe)}
              </p>
            ) : null}

            {selectedNode.summary ? (
              <p className="m-0 text-[13px] leading-[1.55] text-[var(--ink-soft)]">
                {selectedNode.summary}
              </p>
            ) : (
              <p className="m-0 text-[13px] italic text-muted">
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
