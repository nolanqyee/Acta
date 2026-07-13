import { actionListStories } from "@/server/actions";
import { StampStoryButton } from "@/components/StampStoryButton";

export default async function StoriesPage() {
  const stories = await actionListStories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stories</h1>
        <p className="text-sm text-stone-600">
          Secondary narrative nodes — draft → stamp (user wins; no silent
          overwrite).
        </p>
      </div>

      {stories.length === 0 ? (
        <p className="text-sm text-stone-500">
          No stories yet. Open an endeavor and propose one.
        </p>
      ) : (
        <ul className="space-y-4">
          {stories.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-stone-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">{s.title}</h2>
                <span className="rounded bg-stone-100 px-2 py-0.5 text-xs">
                  {s.synthesisStatus}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-stone-700">
                {s.situation && <p>{s.situation}</p>}
                {s.task && <p>{s.task}</p>}
                {s.action && <p>{s.action}</p>}
                {s.result && <p>{s.result}</p>}
              </div>
              {s.synthesisStatus !== "stamped" && (
                <div className="mt-3">
                  <StampStoryButton storyId={s.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
