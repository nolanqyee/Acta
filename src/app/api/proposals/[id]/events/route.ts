/**
 * @fileoverview `GET /api/proposals/:id/events` — SSE stream for Phase A Extract
 * progress with optional `?cursor=` reattach (U4-E).
 */

import { createServerSupabase } from "@/lib/supabase/server";
import {
  findProposalById,
  ProposalReadError,
} from "@/server/proposal/proposal-repository";
import {
  buildChangelogAppendFrames,
  buildTerminalProposalFrames,
  encodeProposalSseFrame,
  encodeProposalSseKeepalive,
  PROPOSAL_SSE_MAX_MS,
  PROPOSAL_SSE_POLL_MS,
  readProposalEventCursor,
} from "@/server/proposal/proposal-sse";
import { withRateLimitContext } from "@/server/rate-limit";

/**
 * Streams proposal changelog and terminal upserts until Extract finishes.
 *
 * @param request - May include `?cursor=` changelog entry id for resume.
 * @param context - Route params with proposal id.
 * @returns `text/event-stream` response, or JSON error before stream opens.
 */
export const GET = withRateLimitContext(
  async (
    request: Request,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id: proposalId } = await context.params;
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    let initial;
    try {
      initial = await findProposalById(supabase, userId, proposalId);
    } catch (error) {
      if (error instanceof ProposalReadError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "proposal_lookup_failed" }, { status: 500 });
      }
      throw error;
    }

    if (!initial) {
      return Response.json({ error: "proposal_not_found" }, { status: 404 });
    }

    const cursor = readProposalEventCursor(request);
    let lastSentCursor = cursor;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enqueue = (frame: { event: string; data: unknown }) => {
          controller.enqueue(encodeProposalSseFrame(frame));
        };

        enqueue({ event: "snapshot", data: { proposal: initial } });

        for (const frame of buildChangelogAppendFrames(
          initial.changelog,
          cursor,
        )) {
          enqueue(frame);
          const entry = (frame.data as { entry: { id: string } }).entry;
          lastSentCursor = entry.id;
        }

        if (initial.status !== "streaming") {
          for (const frame of buildTerminalProposalFrames(initial)) {
            enqueue(frame);
          }
          controller.close();
          return;
        }

        const startedAt = Date.now();
        let lastKeepaliveAt = startedAt;

        while (Date.now() - startedAt < PROPOSAL_SSE_MAX_MS) {
          await new Promise((resolve) =>
            setTimeout(resolve, PROPOSAL_SSE_POLL_MS),
          );

          let proposal;
          try {
            proposal = await findProposalById(supabase, userId, proposalId);
          } catch (error) {
            console.error("proposal_sse_poll_failed", error);
            enqueue({
              event: "stream_error",
              data: { failureReason: "poll_failed", status: "failed" },
            });
            enqueue({ event: "stream_done", data: { status: "failed" } });
            controller.close();
            return;
          }

          if (!proposal) {
            enqueue({
              event: "stream_error",
              data: { failureReason: "proposal_not_found", status: "failed" },
            });
            enqueue({ event: "stream_done", data: { status: "failed" } });
            controller.close();
            return;
          }

          for (const frame of buildChangelogAppendFrames(
            proposal.changelog,
            lastSentCursor,
          )) {
            enqueue(frame);
            const entry = (frame.data as { entry: { id: string } }).entry;
            lastSentCursor = entry.id;
          }

          if (proposal.status !== "streaming") {
            for (const frame of buildTerminalProposalFrames(proposal)) {
              enqueue(frame);
            }
            controller.close();
            return;
          }

          const now = Date.now();
          if (now - lastKeepaliveAt >= 15_000) {
            controller.enqueue(encodeProposalSseKeepalive());
            lastKeepaliveAt = now;
          }
        }

        enqueue({
          event: "stream_error",
          data: { failureReason: "timeout", status: "streaming" },
        });
        enqueue({ event: "stream_done", data: { status: "streaming" } });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  },
  { limit: 30, windowMs: 60_000 },
);
