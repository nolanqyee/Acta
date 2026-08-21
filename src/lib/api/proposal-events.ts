/**
 * @fileoverview Browser client for proposal snapshot and SSE routes (U4-E).
 */

import {
  ProposalSnapshotResponse,
  type ProposalSnapshotResponse as ProposalSnapshotResponseType,
} from "@/lib/contracts/proposal";
import { apiFetch, readJsonBody } from "./http";

/** Parsed SSE event from {@link readProposalEventStream}. */
export interface ProposalSseEvent {
  event: string;
  data: unknown;
}

/** Result of {@link getProposalById}. */
export interface GetProposalByIdResult {
  ok: boolean;
  status: number;
  data?: ProposalSnapshotResponseType;
  error?: unknown;
}

/**
 * Loads a full proposal snapshot by id.
 *
 * @param proposalId - Proposal uuid.
 * @returns Parsed response plus HTTP status.
 */
export async function getProposalById(
  proposalId: string,
): Promise<GetProposalByIdResult> {
  const response = await apiFetch(`/api/proposals/${proposalId}`);
  const json = await readJsonBody(response);
  if (!response.ok) {
    return { ok: false, status: response.status, error: json };
  }
  return {
    ok: true,
    status: response.status,
    data: ProposalSnapshotResponse.parse(json),
  };
}

/**
 * Reads an SSE response body into parsed `{ event, data }` frames.
 *
 * @param response - Fetch response from `/api/proposals/:id/events`.
 * @param onEvent - Called for each parsed SSE event.
 * @returns Resolves when the stream closes.
 */
export async function readProposalEventStream(
  response: Response,
  onEvent: (event: ProposalSseEvent) => void,
): Promise<void> {
  if (!response.body) {
    throw new Error("SSE response has no body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      if (!chunk.trim() || chunk.startsWith(":")) {
        continue;
      }

      let event = "message";
      let dataLine = "";
      for (const line of chunk.split("\n")) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLine = line.slice(5).trim();
        }
      }

      if (dataLine) {
        onEvent({ event, data: JSON.parse(dataLine) as unknown });
      }
    }
  }
}

/**
 * Opens the proposal SSE stream and forwards events to a callback.
 *
 * @param proposalId - Proposal uuid.
 * @param cursor - Optional changelog entry id to resume after.
 * @param onEvent - Handler for each SSE frame.
 * @returns Fetch response (for status inspection) after the stream completes.
 */
export async function subscribeProposalEvents(
  proposalId: string,
  onEvent: (event: ProposalSseEvent) => void,
  cursor?: string,
): Promise<Response> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const response = await apiFetch(`/api/proposals/${proposalId}/events${query}`, {
    headers: { Accept: "text/event-stream" },
  });

  if (!response.ok) {
    return response;
  }

  await readProposalEventStream(response, onEvent);
  return response;
}

/**
 * Retries Extract on an existing Capture (`POST /api/captures/:id/extract`).
 *
 * @param captureId - Capture uuid.
 * @returns Raw fetch response for lab display or product handling.
 */
export function retryCaptureExtract(captureId: string): Promise<Response> {
  return apiFetch(`/api/captures/${captureId}/extract`, { method: "POST" });
}
