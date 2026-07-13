"use client";

import { useTransition } from "react";
import { actionProposeStory } from "@/server/actions";

export function ProposeStoryButton({ endeavorId }: { endeavorId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="rounded-md border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-50"
      onClick={() =>
        start(async () => {
          await actionProposeStory(endeavorId);
          window.location.href = "/stories";
        })
      }
    >
      {pending ? "Proposing…" : "Propose interview story"}
    </button>
  );
}
