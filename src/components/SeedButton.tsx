"use client";

import { useTransition } from "react";
import { actionSeedDogfood } from "@/server/actions";

export function SeedButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await actionSeedDogfood();
          window.location.href = "/graph";
        })
      }
      className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm disabled:opacity-50"
    >
      {pending ? "Seeding…" : "Seed dogfood graph"}
    </button>
  );
}
