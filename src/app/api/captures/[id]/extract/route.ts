/**
 * @fileoverview `POST /api/captures/:id/extract` — retries Extract on a Capture
 * after `failed` or auto-discarded failure (U4-E). Idempotent when already
 * `streaming` for the same Capture.
 */

import { RetryExtractResponse } from "@/lib/contracts/proposal";
import { createServerSupabase } from "@/lib/supabase/server";
import { scheduleExtract } from "@/server/agents/extract/run-extract";
import {
  findLatestProposalForCapture,
  findOpenProposal,
  ProposalReadError,
  ProposalWriteError,
  resetProposalForExtractRetry,
} from "@/server/proposal/proposal-repository";
import { withRateLimitContext } from "@/server/rate-limit";

/** Statuses that allow reopening a proposal for Extract retry. */
const RETRYABLE_STATUSES = ["failed", "discarded"] as const;

/**
 * Restarts Extract for an existing Capture without creating a new Capture row.
 *
 * @param _request - Unused JSON body for now.
 * @param context - Route params with capture id.
 * @returns 200 with `proposalId`, 401, 404, 409, 429, or 500.
 */
export const POST = withRateLimitContext(
  async (
    _request: Request,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id: captureId } = await context.params;
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: captureRow, error: captureError } = await supabase
      .from("captures")
      .select("id")
      .eq("id", captureId)
      .eq("user_id", userId)
      .maybeSingle();

    if (captureError) {
      console.error("extract_retry_capture_lookup_failed", captureError);
      return Response.json({ error: "capture_lookup_failed" }, { status: 500 });
    }

    if (!captureRow) {
      return Response.json({ error: "capture_not_found" }, { status: 404 });
    }

    try {
      const openProposal = await findOpenProposal(supabase, userId);
      const linkedProposal = await findLatestProposalForCapture(
        supabase,
        userId,
        captureId,
      );

      if (!linkedProposal) {
        return Response.json({ error: "proposal_not_found" }, { status: 404 });
      }

      if (linkedProposal.status === "streaming") {
        const response = RetryExtractResponse.parse({
          proposalId: linkedProposal.id,
          captureId,
          status: "streaming",
        });
        return Response.json(response, {
          headers: { "Cache-Control": "no-store" },
        });
      }

      if (
        openProposal &&
        openProposal.id !== linkedProposal.id
      ) {
        return Response.json(
          {
            error: "open_proposal_exists",
            proposalId: openProposal.id,
            status: openProposal.status,
          },
          { status: 409 },
        );
      }

      if (
        linkedProposal.status === "ready" ||
        linkedProposal.status === "merging" ||
        linkedProposal.status === "confirmed"
      ) {
        return Response.json(
          { error: "proposal_not_retryable", status: linkedProposal.status },
          { status: 409 },
        );
      }

      if (
        !RETRYABLE_STATUSES.includes(
          linkedProposal.status as (typeof RETRYABLE_STATUSES)[number],
        )
      ) {
        return Response.json(
          { error: "proposal_not_retryable", status: linkedProposal.status },
          { status: 409 },
        );
      }

      const reopened = await resetProposalForExtractRetry(
        supabase,
        userId,
        linkedProposal.id,
        captureId,
      );

      scheduleExtract({
        proposalId: reopened.id,
        captureId,
        userId,
      });

      const response = RetryExtractResponse.parse({
        proposalId: reopened.id,
        captureId,
        status: "streaming",
      });
      return Response.json(response, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (error instanceof ProposalReadError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "proposal_lookup_failed" }, { status: 500 });
      }
      if (error instanceof ProposalWriteError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "proposal_retry_failed" }, { status: 500 });
      }
      throw error;
    }
  },
  { limit: 30, windowMs: 60_000 },
);
