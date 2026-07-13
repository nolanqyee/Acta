"use client";

import { useState, useTransition } from "react";
import { actionDraftAppAnswer } from "@/server/actions";

export default function AppQuestionAdapterPage() {
  const [question, setQuestion] = useState(
    "Tell me about a time you improved system performance.",
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [citations, setCitations] = useState<
    { entityType: string; entityId: string; title: string }[]
  >([]);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">App question adapter</h1>
        <p className="text-sm text-stone-600">
          Paste-ready draft grounded in graph nodes (stories preferred). Not
          unmoored generation.
        </p>
      </div>

      <textarea
        className="min-h-24 w-full rounded-md border border-stone-300 p-3 text-sm"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        type="button"
        disabled={pending || !question.trim()}
        className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        onClick={() =>
          start(async () => {
            const res = await actionDraftAppAnswer(question);
            setDraft(res.draft);
            setCitations(res.citations);
          })
        }
      >
        {pending ? "Drafting…" : "Draft answer"}
      </button>

      {draft && (
        <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-medium text-stone-500">Draft</h2>
          <pre className="whitespace-pre-wrap text-sm">{draft}</pre>
          {citations.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-stone-500">Citations</h3>
              <ul className="mt-1 text-xs text-stone-600">
                {citations.map((c) => (
                  <li key={c.entityId}>
                    {c.entityType}: {c.title} ({c.entityId.slice(0, 8)}…)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
