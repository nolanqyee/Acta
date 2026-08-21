/**
 * @fileoverview Human-readable labels for diff-skim thread rows (U4-F).
 */

import type { ChangelogEntry, ProposalStatus } from "@/lib/contracts/proposal";

/**
 * Returns display copy for one changelog row in the diff-skim thread.
 *
 * @param entry - Append-only proposal changelog row.
 * @returns Short sentence for the thread UI.
 */
export function formatChangelogMessage(entry: ChangelogEntry): string {
  if (entry.message) {
    return entry.message;
  }

  switch (entry.kind) {
    case "capture":
      return "Capture committed";
    case "extract_started":
      return "Extract started";
    case "extract_ready":
      return "Extract ready";
    case "extract_failed":
      return "Extract failed";
    case "status":
      return "Status updated";
    default:
      return entry.kind;
  }
}

/**
 * Returns the panel status label for a proposal lifecycle state.
 *
 * @param status - Proposal-level status.
 * @returns Phase label shown in the diff-skim header.
 */
export function formatProposalPhaseLabel(status: ProposalStatus): string {
  switch (status) {
    case "streaming":
      return "Extracting";
    case "ready":
      return "Review";
    case "failed":
      return "Failed";
    case "merging":
      return "Merging";
    default:
      return status;
  }
}
