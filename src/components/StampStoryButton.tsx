"use client";

import { useTransition } from "react";
import { actionStampStory } from "@/server/actions";

export function StampStoryButton({ storyId }: { storyId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="rounded-md bg-emerald-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      onClick={() =>
        start(async () => {
          await actionStampStory(storyId);
          window.location.reload();
        })
      }
    >
      {pending ? "Stamping…" : "Stamp (approve)"}
    </button>
  );
}
