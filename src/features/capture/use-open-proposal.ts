/**
 * @fileoverview Client hook for open-proposal hydrate, Capture submit, and SSE
 * streaming on `/home` (U4-F).
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createCapture, type CreateCaptureResult } from "@/lib/api/captures";
import {
  getProposalById,
  retryCaptureExtract,
  subscribeProposalEvents,
} from "@/lib/api/proposal-events";
import { getOpenProposal } from "@/lib/api/proposals";
import type { ProposalSnapshot } from "@/lib/contracts";

/** Result surface from {@link useOpenProposal}. */
export interface UseOpenProposalResult {
  proposal: ProposalSnapshot | null;
  hydrated: boolean;
  busy: boolean;
  pendingUnitCount: number;
  captureBlocked: boolean;
  refresh: () => Promise<void>;
  submitCapture: (text: string) => Promise<CreateCaptureResult>;
  retryExtract: (captureId: string, proposalId: string) => Promise<boolean>;
  setProposal: (proposal: ProposalSnapshot | null) => void;
}

/**
 * Hydrates the blocking open proposal, follows SSE while Extract streams, and
 * exposes Capture submit helpers for the diff-skim panel.
 *
 * @returns Proposal state and actions for graph home.
 */
export function useOpenProposal(): UseOpenProposalResult {
  const [proposal, setProposal] = useState<ProposalSnapshot | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const watchingIdRef = useRef<string | null>(null);

  /**
   * Loads the newest blocking proposal from `GET /api/proposals/open`.
   */
  const refresh = useCallback(async () => {
    const result = await getOpenProposal();
    if (result.ok) {
      setProposal(result.data?.proposal ?? null);
    }
    setHydrated(true);
  }, []);

  /**
   * Subscribes to proposal SSE until Extract reaches a terminal stream state.
   *
   * @param proposalId - Proposal to watch.
   * @param cursor - Optional changelog resume cursor.
   */
  const watchProposal = useCallback(
    async (proposalId: string, cursor?: string) => {
      if (watchingIdRef.current === proposalId) {
        return;
      }
      watchingIdRef.current = proposalId;

      try {
        await subscribeProposalEvents(
          proposalId,
          (event) => {
            if (event.event === "snapshot" || event.event === "proposal_upsert") {
              const body = event.data as { proposal?: ProposalSnapshot };
              if (body.proposal) {
                setProposal(body.proposal);
              }
            }
          },
          cursor,
        );
      } finally {
        if (watchingIdRef.current === proposalId) {
          watchingIdRef.current = null;
        }
        await refresh();
      }
    },
    [refresh],
  );

  /**
   * Commits yap text and watches Extract on the returned proposal id.
   *
   * @param text - Non-empty capture text.
   * @returns Shared capture client result.
   */
  const submitCapture = useCallback(
    async (text: string): Promise<CreateCaptureResult> => {
      setBusy(true);
      try {
        const result = await createCapture({ text, sourceType: "typed" });
        if (result.ok && result.data?.proposalId) {
          const snapshot = await getProposalById(result.data.proposalId);
          if (snapshot.ok && snapshot.data) {
            setProposal(snapshot.data.proposal);
          }
          await watchProposal(result.data.proposalId);
        }
        return result;
      } finally {
        setBusy(false);
      }
    },
    [watchProposal],
  );

  /**
   * Retries Extract on an existing Capture without creating a new row.
   *
   * @param captureId - Capture uuid.
   * @param proposalId - Linked proposal uuid (for SSE watch).
   * @returns True when retry started successfully.
   */
  const retryExtract = useCallback(
    async (captureId: string, proposalId: string): Promise<boolean> => {
      setBusy(true);
      try {
        const response = await retryCaptureExtract(captureId);
        if (!response.ok) {
          return false;
        }
        setProposal((current) =>
          current
            ? { ...current, status: "streaming", failureReason: undefined }
            : current,
        );
        await watchProposal(proposalId);
        return true;
      } finally {
        setBusy(false);
      }
    },
    [watchProposal],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getOpenProposal();
      if (cancelled) {
        return;
      }
      if (result.ok) {
        setProposal(result.data?.proposal ?? null);
      }
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (proposal?.status === "streaming" && proposal.id !== watchingIdRef.current) {
      void watchProposal(proposal.id, proposal.streamCursor);
    }
  }, [proposal?.id, proposal?.status, proposal?.streamCursor, watchProposal]);

  const pendingUnitCount = proposal?.mergeUnits.filter(
    (unit) => unit.disposition === "pending",
  ).length ?? 0;

  const captureBlocked =
    proposal != null &&
    (proposal.status === "streaming" ||
      proposal.status === "ready" ||
      proposal.status === "merging");

  return {
    proposal,
    hydrated,
    busy,
    pendingUnitCount,
    captureBlocked,
    refresh,
    submitCapture,
    retryExtract,
    setProposal,
  };
}
