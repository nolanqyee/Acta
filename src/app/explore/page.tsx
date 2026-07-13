"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { actionExploreNl } from "@/server/actions";
import type { ExploreHit } from "@/server/graph";

export default function ExplorePage() {
  const [query, setQuery] = useState("what have I done related to Redis?");
  const [hits, setHits] = useState<ExploreHit[]>([]);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Explore</h1>
        <p className="text-sm text-stone-600">
          Natural-language query over your graph — returns nodes + scores (local
          bag-of-words embeddings; swap for pgvector later).
        </p>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              start(async () => setHits(await actionExploreNl(query)));
            }
          }}
        />
        <button
          type="button"
          disabled={pending || !query.trim()}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={() =>
            start(async () => setHits(await actionExploreNl(query)))
          }
        >
          {pending ? "Searching…" : "Ask"}
        </button>
      </div>

      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {hits.map((h) => (
          <li key={`${h.entityType}-${h.entityId}`} className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="mr-2 rounded bg-stone-100 px-1.5 py-0.5 text-xs">
                  {h.entityType}
                </span>
                {h.entityType === "endeavor" ? (
                  <Link
                    href={`/graph/${h.entityId}`}
                    className="font-medium underline"
                  >
                    {h.title}
                  </Link>
                ) : h.entityType === "skill" ? (
                  <Link
                    href={`/skills/${h.entityId}`}
                    className="font-medium underline"
                  >
                    {h.title}
                  </Link>
                ) : (
                  <span className="font-medium">{h.title}</span>
                )}
                {h.snippet && (
                  <p className="mt-1 text-sm text-stone-600">{h.snippet}</p>
                )}
              </div>
              <span className="text-xs text-stone-400">
                {h.score.toFixed(3)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
