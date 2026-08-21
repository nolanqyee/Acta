/**
 * @fileoverview Diff-skim panel (U4-F): Capture composer when idle, compact review
 * rows when Extract finishes. Accept/discard actions land in U5.
 */

"use client";

import { ArrowUp, Check, Info, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MergeUnit, ProposalSnapshot } from "@/lib/contracts";
import { humanize } from "@/features/graph/surfaces/format-endeavor";

/** Props for {@link DiffSkimPanel}. */
export interface DiffSkimPanelProps {
  open: boolean;
  proposal: ProposalSnapshot | null;
  busy: boolean;
  captureBlocked: boolean;
  onClose: () => void;
  onSubmitCapture: (text: string) => Promise<unknown>;
  onRetryExtract: () => void;
  /** Selects the pending ghost on the canvas for the given merge unit. */
  onFocusPendingUnit?: (tempId: string) => void;
  /** Accept one merge unit (U5). */
  onAcceptUnit?: (tempId: string) => void;
  /** Discard one merge unit (U5). */
  onDiscardUnit?: (tempId: string) => void;
  /** When false, accept/discard icon buttons stay disabled until U5 ships. */
  reviewActionsEnabled?: boolean;
}

/**
 * Returns the panel aria label and optional subtitle for non-review phases.
 *
 * @param proposal - Open proposal snapshot, if any.
 * @param pendingCount - Merge units still awaiting a decision.
 * @returns Header copy for the panel shell.
 */
function panelHeaderCopy(
  proposal: ProposalSnapshot | null,
  pendingCount: number,
): { ariaLabel: string; subtitle: string | null } {
  if (!proposal) {
    return {
      ariaLabel: "Capture",
      subtitle: "Describe something you did or learned.",
    };
  }

  switch (proposal.status) {
    case "streaming":
      return {
        ariaLabel: "Capture extracting",
        subtitle: "Structuring your capture into proposed graph changes.",
      };
    case "ready":
      return {
        ariaLabel:
          pendingCount === 1
            ? "Review one change pending"
            : `Review ${pendingCount} changes pending`,
        subtitle: null,
      };
    case "failed":
      return {
        ariaLabel: "Capture failed",
        subtitle: "Extract did not finish. Retry below or submit a new capture.",
      };
    default:
      return {
        ariaLabel: "Capture",
        subtitle: "Proposal in progress.",
      };
  }
}

/**
 * Short change-type prefix for a merge unit row (e.g. "Add role").
 *
 * @param unit - Pending merge unit from the open proposal.
 * @returns Type label without the endeavor title.
 */
function mergeUnitTypeLabel(unit: MergeUnit): string {
  return `${unit.op === "update" ? "Update" : "Add"} ${humanize(unit.endeavorPreview.kind).toLowerCase()}`;
}

/**
 * Renders the floating right Capture / diff-skim panel over the graph canvas.
 *
 * @param props - Panel state and callbacks from {@link useOpenProposal}.
 * @returns The panel, or null when closed.
 */
export function DiffSkimPanel({
  open,
  proposal,
  busy,
  captureBlocked,
  onClose,
  onSubmitCapture,
  onRetryExtract,
  onFocusPendingUnit,
  onAcceptUnit,
  onDiscardUnit,
  reviewActionsEnabled = false,
}: DiffSkimPanelProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const pendingUnits = useMemo(
    () =>
      proposal?.mergeUnits.filter((unit) => unit.disposition === "pending") ?? [],
    [proposal?.mergeUnits],
  );

  const showComposer =
    !proposal ||
    proposal.status === "failed" ||
    (proposal.status === "ready" && !captureBlocked);

  const { ariaLabel, subtitle } = panelHeaderCopy(proposal, pendingUnits.length);
  const isReview = proposal?.status === "ready";

  useEffect(() => {
    if (open && showComposer) {
      composerRef.current?.focus();
    }
  }, [open, showComposer]);

  /**
   * Submits composer text through the shared Capture client.
   */
  const onSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !showComposer || busy) {
      return;
    }

    setError(null);
    const result = (await onSubmitCapture(trimmed)) as {
      ok: boolean;
      status: number;
      error?: { error?: string };
    };

    if (result.ok) {
      setText("");
      return;
    }

    if (result.status === 409) {
      setError("An open proposal is still in review.");
      return;
    }

    setError("Capture failed. Try again.");
  }, [busy, onSubmitCapture, showComposer, text]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="acta-panel fixed top-[var(--chrome-top)] right-acta-6 z-[15] flex w-[min(var(--panel-width-explore),calc(100vw-var(--space-6)*2))] max-h-[var(--panel-max-height)] flex-col overflow-hidden p-0 font-ui text-ink"
      role="dialog"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="acta-panel-close"
        aria-label="Close capture panel"
        onClick={onClose}
      >
        ×
      </button>

      <header className="flex shrink-0 flex-col gap-acta-2 border-b border-[var(--ink-faint)] px-acta-5 pb-acta-3 pt-acta-5 pr-[var(--panel-close-gutter)]">
        {isReview ? (
          <p className="m-0 text-body font-semibold text-[var(--brand-secondary-text)]">
            Review ({pendingUnits.length}{" "}
            {pendingUnits.length === 1 ? "change" : "changes"} pending)
          </p>
        ) : (
          <>
            <p className="m-0 text-body font-semibold text-ink">Capture</p>
            {subtitle ? (
              <p className="m-0 text-body leading-normal text-muted">{subtitle}</p>
            ) : null}
          </>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-acta-4 overflow-y-auto px-acta-5 py-acta-4">
        {proposal?.status === "failed" ? (
          <section className="flex flex-col gap-acta-3">
            <p className="m-0 text-body text-[var(--brand-secondary-text)]">
              {proposal.failureReason ?? "Extract failed"}
            </p>
            <button
              type="button"
              className="acta-button acta-button-primary w-fit"
              disabled={busy}
              onClick={onRetryExtract}
            >
              Retry extract
            </button>
          </section>
        ) : null}

        {proposal?.status === "streaming" ? (
          <div className="flex items-center gap-acta-2 text-body text-muted">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Extract running…
          </div>
        ) : null}

        {pendingUnits.length > 0 ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {pendingUnits.map((unit) => (
              <li
                key={unit.tempId}
                className="flex items-center gap-acta-3 border-b border-[var(--ink-faint)] py-acta-3 last:border-b-0"
              >
                <p className="m-0 min-w-0 flex-1 truncate text-body leading-normal">
                  <span className="text-muted">{mergeUnitTypeLabel(unit)}</span>
                  <span className="text-muted"> · </span>
                  <span className="font-medium text-ink">
                    {unit.endeavorPreview.title}
                  </span>
                </p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    className="acta-icon-btn acta-icon-btn-info"
                    aria-label={`Show ${unit.endeavorPreview.title} on graph`}
                    onClick={() => onFocusPendingUnit?.(unit.tempId)}
                  >
                    <Info size={16} strokeWidth={2.25} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="acta-icon-btn acta-icon-btn-danger"
                    aria-label={`Discard ${unit.endeavorPreview.title}`}
                    disabled={!reviewActionsEnabled || busy}
                    onClick={() => onDiscardUnit?.(unit.tempId)}
                  >
                    <Trash2 size={16} strokeWidth={2.25} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="acta-icon-btn acta-icon-btn-success"
                    aria-label={`Accept ${unit.endeavorPreview.title}`}
                    disabled={!reviewActionsEnabled || busy}
                    onClick={() => onAcceptUnit?.(unit.tempId)}
                  >
                    <Check size={16} strokeWidth={2.25} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {showComposer ? (
        <footer className="shrink-0 border-t border-[var(--ink-faint)] bg-panel p-acta-4">
          {error ? (
            <p className="mb-acta-3 mt-0 text-body text-[var(--brand-secondary-text)]">
              {error}
            </p>
          ) : null}
          <div className="acta-composer flex items-end gap-acta-3 p-acta-3">
            <textarea
              ref={composerRef}
              className="min-h-[4.5rem] flex-1 resize-y border-0 bg-transparent font-ui text-[15px] leading-normal text-ink outline-none placeholder:text-muted disabled:opacity-60"
              value={text}
              placeholder="What happened? Work, school, a win, a lesson…"
              disabled={busy}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void onSubmit();
                }
              }}
            />
            <button
              type="button"
              className="acta-button acta-button-accent acta-button-primary grid size-10 shrink-0 place-items-center rounded-soft p-0"
              aria-label="Submit capture"
              disabled={busy || text.trim().length === 0}
              onClick={() => void onSubmit()}
            >
              {busy ? (
                <Loader2 size={18} className="animate-spin" aria-hidden />
              ) : (
                <ArrowUp size={18} strokeWidth={2.25} aria-hidden />
              )}
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
