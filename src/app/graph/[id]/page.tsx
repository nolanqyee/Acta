import Link from "next/link";
import { actionGetSubgraph } from "@/server/actions";
import { ProposeStoryButton } from "@/components/ProposeStoryButton";

export default async function EndeavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subgraph = await actionGetSubgraph(id);

  if (!subgraph) {
    return (
      <p className="text-sm text-stone-500">
        Endeavor not found.{" "}
        <Link href="/graph" className="underline">
          Back
        </Link>
      </p>
    );
  }

  const { endeavor, parents, children, achievements, skills, orgs, metrics } =
    subgraph;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/graph" className="text-sm text-stone-500 hover:underline">
          ← Graph
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-stone-100 px-2 py-0.5 text-xs">
            {endeavor.kind}
          </span>
          <h1 className="text-2xl font-semibold">{endeavor.title}</h1>
        </div>
        {endeavor.summary && (
          <p className="mt-2 text-stone-600">{endeavor.summary}</p>
        )}
        {endeavor.applicationTags.length > 0 && (
          <p className="mt-2 text-xs text-stone-500">
            tags: {endeavor.applicationTags.map((t) => t.tag).join(", ")}
          </p>
        )}
      </div>

      <ProposeStoryButton endeavorId={endeavor.id} />

      {parents.length > 0 && (
        <Section title="Parents (part_of)">
          {parents.map((p) => (
            <Link key={p.id} href={`/graph/${p.id}`} className="block underline">
              {p.kind}: {p.title}
            </Link>
          ))}
        </Section>
      )}

      {children.length > 0 && (
        <Section title="Children">
          {children.map((c) => (
            <Link key={c.id} href={`/graph/${c.id}`} className="block underline">
              {c.kind}: {c.title}
            </Link>
          ))}
        </Section>
      )}

      {achievements.length > 0 && (
        <Section title="Achievements">
          <ul className="list-inside list-disc text-sm">
            {achievements.map((a) => (
              <li key={a.id}>{a.statement}</li>
            ))}
          </ul>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          {skills.map((s) => (
            <Link
              key={s.id}
              href={`/skills/${s.id}`}
              className="mr-2 inline-block rounded bg-stone-100 px-2 py-0.5 text-sm"
            >
              {s.name}
            </Link>
          ))}
        </Section>
      )}

      {orgs.length > 0 && (
        <Section title="Orgs">
          {orgs.map((o) => (
            <span key={o.id} className="mr-2 text-sm">
              {o.name}
            </span>
          ))}
        </Section>
      )}

      {metrics.length > 0 && (
        <Section title="Metrics">
          <ul className="text-sm">
            {metrics.map((m) => (
              <li key={m.id}>
                {m.label}: {String(m.value)}
                {m.unit}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-medium text-stone-500">{title}</h2>
      {children}
    </section>
  );
}
