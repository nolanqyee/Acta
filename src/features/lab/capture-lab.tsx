/**
 * @fileoverview Dev-only API workbench for Capture intake (U4-A). Calls the
 * same `src/lib/api/*` client helpers the product will use — cookie session,
 * `/api/captures`, no lab-specific routes or headers.
 */

"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { createCapture } from "@/lib/api/captures";
import {
  retryCaptureExtract,
  subscribeProposalEvents,
  type ProposalSseEvent,
} from "@/lib/api/proposal-events";
import { getOpenProposal } from "@/lib/api/proposals";
import { apiFetch, readJsonBody } from "@/lib/api/http";
import type { CreateCaptureResponse, ProposalSnapshot } from "@/lib/contracts";

/** One row in the request log panel. */
interface LogEntry {
  id: string;
  label: string;
  status: number;
  ok: boolean;
  body: unknown;
}

/**
 * Renders a minimal GUI to exercise Capture API routes during U4 development.
 *
 * @returns The lab workbench surface.
 */
export function CaptureLab() {
  const [text, setText] = useState(
    "SWE intern at Bubble — built a Redis cache for billing webhooks.",
  );
  const [busy, setBusy] = useState(false);
  const [lastCapture, setLastCapture] = useState<CreateCaptureResponse | null>(
    null,
  );
  const [lastProposal, setLastProposal] = useState<ProposalSnapshot | null>(
    null,
  );
  const [log, setLog] = useState<LogEntry[]>([]);

  /**
   * Appends one line to the on-screen request log.
   *
   * @param entry - Log row without id (assigned here).
   */
  const appendLog = useCallback((entry: Omit<LogEntry, "id">) => {
    setLog((prev) => [
      { id: crypto.randomUUID(), ...entry },
      ...prev,
    ].slice(0, 20));
  }, []);

  /**
   * Loads the open proposal snapshot via the shared API client.
   *
   * @param logRequest - When true, append a row to the request log panel.
   */
  const refreshOpenProposal = useCallback(
    async (logRequest = true) => {
      const result = await getOpenProposal();
      if (logRequest) {
        appendLog({
          label: "GET /api/proposals/open",
          status: result.status,
          ok: result.ok,
          body: result.ok ? result.data : result.error,
        });
      }
      if (result.ok) {
        setLastProposal(result.data?.proposal ?? null);
      }
      return result;
    },
    [appendLog],
  );

  /**
   * Subscribes to proposal SSE until Extract finishes (U4-E).
   *
   * @param proposalId - Proposal created by the capture response.
   */
  const watchExtractViaSse = useCallback(
    async (proposalId: string) => {
      const events: ProposalSseEvent[] = [];
      try {
        const response = await subscribeProposalEvents(
          proposalId,
          (event) => {
            events.push(event);
            if (event.event === "snapshot" || event.event === "proposal_upsert") {
              const body = event.data as { proposal?: ProposalSnapshot };
              if (body.proposal) {
                setLastProposal(body.proposal);
              }
            }
          },
        );
        appendLog({
          label: "GET /api/proposals/:id/events (SSE)",
          status: response.status,
          ok: response.ok,
          body: { eventCount: events.length, events },
        });
      } catch (error) {
        appendLog({
          label: "GET /api/proposals/:id/events (SSE)",
          status: 0,
          ok: false,
          body: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [appendLog],
  );

  /**
   * Runs an arbitrary same-origin API call through {@link apiFetch}.
   *
   * @param label - Short description shown in the log.
   * @param path - App-relative API path.
   * @param init - Fetch init passed through unchanged.
   */
  const runRaw = useCallback(
    async (label: string, path: string, init?: RequestInit) => {
      setBusy(true);
      try {
        const response = await apiFetch(path, init);
        const body = await readJsonBody(response);
        appendLog({
          label,
          status: response.status,
          ok: response.ok,
          body,
        });
      } catch (error) {
        appendLog({
          label,
          status: 0,
          ok: false,
          body: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setBusy(false);
      }
    },
    [appendLog],
  );

  /**
   * Submits the yap field via the shared {@link createCapture} client.
   */
  const onSubmitCapture = useCallback(async () => {
    setBusy(true);
    try {
      const result = await createCapture({ text, sourceType: "typed" });
      if (result.ok && result.data) {
        setLastCapture(result.data);
      }
      appendLog({
        label: "POST /api/captures (createCapture client)",
        status: result.status,
        ok: result.ok,
        body: result.ok ? result.data : result.error,
      });
      if (result.ok && result.data?.proposalId) {
        await watchExtractViaSse(result.data.proposalId);
      }
    } catch (error) {
      appendLog({
        label: "POST /api/captures (createCapture client)",
        status: 0,
        ok: false,
        body: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(false);
    }
  }, [appendLog, text, watchExtractViaSse]);

  /**
   * Retries Extract on the last capture via `POST /api/captures/:id/extract`.
   */
  const onRetryExtract = useCallback(async () => {
    if (!lastCapture?.id || !lastCapture.proposalId) {
      return;
    }
    setBusy(true);
    try {
      const response = await retryCaptureExtract(lastCapture.id);
      const body = await readJsonBody(response);
      appendLog({
        label: "POST /api/captures/:id/extract",
        status: response.status,
        ok: response.ok,
        body,
      });
      if (response.ok) {
        await watchExtractViaSse(lastCapture.proposalId);
      }
    } catch (error) {
      appendLog({
        label: "POST /api/captures/:id/extract",
        status: 0,
        ok: false,
        body: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(false);
    }
  }, [appendLog, lastCapture, watchExtractViaSse]);

  return (
    <main
      className="min-h-dvh bg-canvas p-acta-6 font-ui text-ink"
      data-design="neubrutalism"
      data-mode="light"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-acta-6">
        <header className="flex flex-col gap-acta-3">
          <div className="flex flex-wrap items-center gap-acta-3">
            <Link
              href="/lab/graph"
              className="acta-chip no-underline hover:bg-panel"
            >
              Graph lab
            </Link>
            <Link href="/home" className="acta-chip no-underline hover:bg-panel">
              /home
            </Link>
            <Link href="/login" className="acta-chip no-underline hover:bg-panel">
              Sign in
            </Link>
          </div>
          <h1 className="m-0 font-display text-[var(--text-h-md)] font-bold">
            Capture API lab
          </h1>
          <p className="m-0 max-w-prose text-[14px] leading-normal text-muted">
            Same-origin fetch with your session cookie — identical to how{" "}
            <code className="font-mono text-[13px]">/home</code> will call these
            routes. Sign in first; unauthenticated calls return 401. A second
            capture returns 409 while a blocking proposal exists (`streaming`,
            `ready`, or `merging`). After submit, Extract runs via OpenAI
            structured output (SSE until ready/failed). A failed Extract does
            not block the next capture.
          </p>
        </header>

        <section className="acta-panel flex flex-col gap-acta-4 p-acta-5">
          <h2 className="acta-label m-0">POST /api/captures</h2>
          <textarea
            className="acta-composer min-h-32 w-full resize-y p-acta-4 font-ui text-[15px] text-ink outline-none"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Yap text…"
          />
          <div className="flex flex-wrap gap-acta-3">
            <button
              type="button"
              className="acta-button acta-button-accent acta-button-primary"
              disabled={busy}
              onClick={() => void onSubmitCapture()}
            >
              Submit capture
            </button>
            <button
              type="button"
              className="acta-button"
              disabled={busy || !lastCapture?.id}
              onClick={() => void onRetryExtract()}
            >
              Retry extract (last capture)
            </button>
            <button
              type="button"
              className="acta-button"
              disabled={busy}
              onClick={() => void refreshOpenProposal()}
            >
              Fetch open proposal
            </button>
            <button
              type="button"
              className="acta-button"
              disabled={busy}
              onClick={() =>
                void runRaw("GET /api/graph (session probe)", "/api/graph")
              }
            >
              Probe session (GET /api/graph)
            </button>
          </div>
        </section>

        {lastCapture ? (
          <section className="acta-panel flex flex-col gap-acta-3 p-acta-5">
            <h2 className="acta-label m-0">Last capture</h2>
            <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-all rounded-soft border-2 border-ink bg-card p-acta-4 font-mono text-[12px] leading-relaxed text-[var(--ink-soft)]">
              {JSON.stringify(lastCapture, null, 2)}
            </pre>
          </section>
        ) : null}

        {lastProposal ? (
          <section className="acta-panel flex flex-col gap-acta-3 p-acta-5">
            <h2 className="acta-label m-0">Open proposal</h2>
            <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-all rounded-soft border-2 border-ink bg-card p-acta-4 font-mono text-[12px] leading-relaxed text-[var(--ink-soft)]">
              {JSON.stringify(lastProposal, null, 2)}
            </pre>
          </section>
        ) : null}

        <section className="acta-panel flex flex-col gap-acta-3 p-acta-5">
          <h2 className="acta-label m-0">Request log</h2>
          {log.length === 0 ? (
            <p className="m-0 text-[14px] text-muted">No requests yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-acta-3 p-0">
              {log.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-soft border-2 border-ink bg-card p-acta-3"
                >
                  <div className="mb-2 flex flex-wrap items-baseline gap-acta-3">
                    <span className="font-ui text-[13px] font-semibold text-ink">
                      {entry.label}
                    </span>
                    <span
                      className={`acta-label ${entry.ok ? "text-[var(--brand-primary-text)]" : "text-[var(--brand-secondary)]"}`}
                    >
                      HTTP {entry.status || "ERR"}
                    </span>
                  </div>
                  <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed text-[var(--ink-soft)]">
                    {JSON.stringify(entry.body, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
