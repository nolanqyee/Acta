/**
 * @fileoverview SSE helpers for proposal Extract streams (U4-E). Formats named
 * events for `GET /proposals/:id/events` and filters changelog rows by cursor.
 */

import "server-only";

import type { ChangelogEntry, ProposalSnapshot } from "@/lib/contracts/proposal";

/** One SSE frame: event name plus JSON-serializable payload. */
export interface ProposalSseFrame {
  event: string;
  data: unknown;
}

/** Poll interval while a proposal is still `streaming`. */
export const PROPOSAL_SSE_POLL_MS = 500;

/** Max time to keep an SSE connection open while waiting for Extract. */
export const PROPOSAL_SSE_MAX_MS = 5 * 60 * 1000;

/**
 * Encodes one Server-Sent Events message (`event` + `data` lines).
 *
 * @param frame - Named event and JSON body.
 * @returns UTF-8 bytes for the HTTP stream.
 */
export function encodeProposalSseFrame(frame: ProposalSseFrame): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(
    `event: ${frame.event}\ndata: ${JSON.stringify(frame.data)}\n\n`,
  );
}

/**
 * Encodes an SSE comment line used as a keepalive ping.
 *
 * @returns UTF-8 bytes for `: keepalive`.
 */
export function encodeProposalSseKeepalive(): Uint8Array {
  return new TextEncoder().encode(": keepalive\n\n");
}

/**
 * Returns changelog entries after the client cursor (exclusive by array order).
 *
 * @param changelog - Full proposal changelog oldest-first.
 * @param cursor - Last seen changelog entry id, or undefined for all entries.
 * @returns Entries not yet sent to the client.
 */
export function changelogEntriesAfterCursor(
  changelog: ChangelogEntry[],
  cursor: string | undefined,
): ChangelogEntry[] {
  if (!cursor) {
    return changelog;
  }

  const cursorIndex = changelog.findIndex((entry) => entry.id === cursor);
  if (cursorIndex === -1) {
    return changelog;
  }

  return changelog.slice(cursorIndex + 1);
}

/**
 * Builds SSE frames for changelog rows the client has not seen yet.
 *
 * @param changelog - Full proposal changelog.
 * @param cursor - Client resume cursor.
 * @returns `changelog_append` frames in order.
 */
export function buildChangelogAppendFrames(
  changelog: ChangelogEntry[],
  cursor: string | undefined,
): ProposalSseFrame[] {
  return changelogEntriesAfterCursor(changelog, cursor).map((entry) => ({
    event: "changelog_append",
    data: { entry },
  }));
}

/**
 * Builds terminal SSE frames when Extract leaves `streaming`.
 *
 * @param proposal - Latest proposal snapshot.
 * @returns `stream_done` and optional `stream_error` plus final upsert.
 */
export function buildTerminalProposalFrames(
  proposal: ProposalSnapshot,
): ProposalSseFrame[] {
  const frames: ProposalSseFrame[] = [
    {
      event: "proposal_upsert",
      data: { proposal },
    },
  ];

  if (proposal.status === "failed") {
    frames.push({
      event: "stream_error",
      data: {
        failureReason: proposal.failureReason ?? "unknown",
        status: proposal.status,
      },
    });
  }

  frames.push({
    event: "stream_done",
    data: { status: proposal.status },
  });

  return frames;
}

/**
 * Parses the `cursor` query param from an events request URL.
 *
 * @param request - Incoming SSE request.
 * @returns Cursor string or undefined when absent/empty.
 */
export function readProposalEventCursor(request: Request): string | undefined {
  const cursor = new URL(request.url).searchParams.get("cursor");
  return cursor && cursor.length > 0 ? cursor : undefined;
}
