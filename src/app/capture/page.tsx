"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  actionCreateCaptureAndExtract,
  actionMergeProposal,
} from "@/server/actions";
import type { ExtractProposal } from "@/domain";

export default function CapturePage() {
  const [text, setText] = useState(
    "Today I implemented Redis caching. Had to debug a race condition. Lock wasn’t scoped correctly. Reduced latency ~60%.",
  );
  const [captureId, setCaptureId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ExtractProposal | null>(null);
  const [merged, setMerged] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Capture</h1>
        <p className="text-sm text-stone-600">
          Type a yap → extract proposal → diff-skim confirm → merge into graph.
        </p>
      </div>

      <textarea
        className="min-h-32 w-full rounded-md border border-stone-300 p-3 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        type="button"
        disabled={pending || !text.trim()}
        className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        onClick={() =>
          start(async () => {
            setError(null);
            setMerged(false);
            try {
              const res = await actionCreateCaptureAndExtract(text);
              setCaptureId(res.capture.id);
              setProposal(res.proposal);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Extract failed");
            }
          })
        }
      >
        {pending ? "Extracting…" : "Extract"}
      </button>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {proposal && (
        <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-medium">Diff-skim proposal</h2>
          <p className="text-xs text-stone-500">Capture {captureId}</p>

          <div>
            <h3 className="text-sm font-medium">Endeavors</h3>
            <ul className="mt-1 space-y-1 text-sm">
              {proposal.endeavors.map((e) => (
                <li key={e.tempId}>
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">
                    {e.kind}
                  </span>{" "}
                  {e.title}
                  {e.summary ? (
                    <span className="text-stone-500"> — {e.summary}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {proposal.achievements.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">Achievements</h3>
              <ul className="mt-1 list-inside list-disc text-sm">
                {proposal.achievements.map((a) => (
                  <li key={a.tempId}>{a.statement}</li>
                ))}
              </ul>
            </div>
          )}

          {proposal.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">Skills</h3>
              <p className="text-sm text-stone-600">
                {proposal.skills.map((s) => s.name).join(", ")}
              </p>
            </div>
          )}

          {proposal.edges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">Edges</h3>
              <ul className="mt-1 font-mono text-xs text-stone-600">
                {proposal.edges.map((e, i) => (
                  <li key={i}>
                    {e.type}: {e.fromTempId} → {e.toTempId}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            disabled={pending || !captureId || merged}
            className="rounded-md bg-emerald-800 px-4 py-2 text-sm text-white disabled:opacity-50"
            onClick={() =>
              start(async () => {
                if (!captureId || !proposal) return;
                setError(null);
                try {
                  await actionMergeProposal(captureId, proposal);
                  setMerged(true);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Merge failed");
                }
              })
            }
          >
            {merged ? "Merged" : pending ? "Merging…" : "Looks right — merge"}
          </button>

          {merged && (
            <p className="text-sm text-emerald-800">
              Merged.{" "}
              <Link href="/graph" className="underline">
                View graph
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
