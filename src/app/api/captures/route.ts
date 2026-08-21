/**
 * @fileoverview `POST /api/captures` — persists immutable intake text (U4-A),
 * rejects a second Capture while an open proposal exists (U4-B), creates a
 * proposal shell, and auto-starts Extract (U4-D structured LLM output).
 */

import { CreateCaptureRequest, CreateCaptureResponse } from "@/lib/contracts/capture";
import { OpenProposalConflictError } from "@/lib/contracts/proposal";
import { createServerSupabase } from "@/lib/supabase/server";
import { scheduleExtract } from "@/server/agents/extract/run-extract";
import {
  CaptureValidationError,
  CaptureWriteError,
  createCaptureRow,
  normalizeCaptureText,
} from "@/server/capture/capture-repository";
import {
  createProposalShell,
  discardFailedProposals,
  findOpenProposal,
  ProposalReadError,
  ProposalWriteError,
} from "@/server/proposal/proposal-repository";
import { withRateLimit } from "@/server/rate-limit";

/**
 * Creates a Capture from typed (or import-typed) yap text.
 *
 * @param request - JSON body matching {@link CreateCaptureRequest}.
 * @returns 201 with capture + `proposalId`, 400 on empty text, 401 when
 *   unauthenticated, 409 when an open proposal blocks a new Capture, 429 when
 *   rate limited, or 500 on persistence failure.
 */
export const POST = withRateLimit(
  async (request: Request) => {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "invalid_json" }, { status: 400 });
    }

    const parsed = CreateCaptureRequest.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }

    let text: string;
    try {
      text = normalizeCaptureText(parsed.data.text);
    } catch (error) {
      if (error instanceof CaptureValidationError) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    try {
      const openProposal = await findOpenProposal(supabase, userId);
      if (openProposal) {
        const conflict = OpenProposalConflictError.parse({
          error: "open_proposal_exists",
          proposalId: openProposal.id,
          status: openProposal.status,
        });
        return Response.json(conflict, { status: 409 });
      }

      await discardFailedProposals(supabase, userId);

      const capture = await createCaptureRow(
        supabase,
        userId,
        text,
        parsed.data.sourceType,
      );
      const proposal = await createProposalShell(supabase, userId, capture.id);

      scheduleExtract({
        proposalId: proposal.id,
        captureId: capture.id,
        userId,
      });

      const response = CreateCaptureResponse.parse({
        ...capture,
        proposalId: proposal.id,
      });
      return Response.json(response, {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (error instanceof ProposalReadError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "open_proposal_lookup_failed" }, { status: 500 });
      }
      if (error instanceof ProposalWriteError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "proposal_write_failed" }, { status: 500 });
      }
      if (error instanceof CaptureWriteError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "capture_write_failed" }, { status: 500 });
      }
      throw error;
    }
  },
  { limit: 60, windowMs: 60_000 },
);
