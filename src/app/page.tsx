import Link from "next/link";
import { SeedButton } from "@/components/SeedButton";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Stilva</h1>
        <p className="max-w-2xl text-stone-600">
          Personal evidence graph — capture life material, structure it into
          endeavors and edges, explore in natural language, and draft grounded
          artifacts. Local dogfood uses an in-memory graph; point env at
          Supabase when ready (see <code className="text-sm">.env.example</code>
          ).
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <SeedButton />
        <Link
          href="/capture"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white"
        >
          New capture
        </Link>
        <Link
          href="/graph"
          className="rounded-md border border-stone-300 px-4 py-2 text-sm"
        >
          Browse graph
        </Link>
        <Link
          href="/explore"
          className="rounded-md border border-stone-300 px-4 py-2 text-sm"
        >
          Ask your graph
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-medium">Foundation</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-stone-600">
            <li>Zod domain schemas from data-model.md</li>
            <li>Postgres migrations under supabase/migrations</li>
            <li>GraphRepository (in-memory + merge/extract)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-medium">Try next</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-stone-600">
            <li>Seed dogfood data</li>
            <li>Capture a yap → diff-skim → merge</li>
            <li>Explore “Redis” or “startups”</li>
            <li>Propose a story → stamp → app-question draft</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
