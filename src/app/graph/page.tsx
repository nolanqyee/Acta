import Link from "next/link";
import { actionListEndeavors } from "@/server/actions";

export default async function GraphPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const kind = sp.kind as
    | "role"
    | "leadership"
    | "project"
    | "creative_work"
    | "course"
    | "education"
    | "event"
    | "volunteer"
    | "hobby"
    | undefined;
  const tag = sp.tag as
    | "internship_resume"
    | "interview_story"
    | "app_question"
    | "linkedin"
    | "personal_site"
    | "portfolio"
    | "keep_personal"
    | undefined;

  const endeavors = await actionListEndeavors({ kind, tag });

  const kinds = [
    "role",
    "leadership",
    "project",
    "creative_work",
    "course",
    "education",
    "event",
    "volunteer",
    "hobby",
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Graph</h1>
        <p className="text-sm text-stone-600">
          Endeavors by kind / application tag. Open one for subgraph.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/graph"
          className={`rounded-full px-3 py-1 ${!kind ? "bg-stone-900 text-white" : "bg-stone-200"}`}
        >
          all
        </Link>
        {kinds.map((k) => (
          <Link
            key={k}
            href={`/graph?kind=${k}`}
            className={`rounded-full px-3 py-1 ${kind === k ? "bg-stone-900 text-white" : "bg-stone-200"}`}
          >
            {k}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {(
          [
            "internship_resume",
            "interview_story",
            "portfolio",
            "keep_personal",
          ] as const
        ).map((t) => (
          <Link
            key={t}
            href={`/graph?tag=${t}`}
            className={`rounded-full px-3 py-1 ${tag === t ? "bg-emerald-800 text-white" : "bg-stone-100"}`}
          >
            {t}
          </Link>
        ))}
      </div>

      {endeavors.length === 0 ? (
        <p className="text-sm text-stone-500">
          No endeavors yet. Seed dogfood from home or merge a capture.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {endeavors.map((e) => (
            <li key={e.id}>
              <Link
                href={`/graph/${e.id}`}
                className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-stone-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">
                      {e.kind}
                    </span>
                    <span className="font-medium">{e.title}</span>
                  </div>
                  {e.summary && (
                    <p className="mt-1 text-sm text-stone-600">{e.summary}</p>
                  )}
                </div>
                <span className="text-xs text-stone-400">{e.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
