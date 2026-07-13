import Link from "next/link";
import { actionGetSkillHub } from "@/server/actions";

export default async function SkillHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hub = await actionGetSkillHub(id);

  if (!hub) {
    return <p className="text-sm text-stone-500">Skill not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/skills" className="text-sm text-stone-500 hover:underline">
          ← Skills
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{hub.skill.name}</h1>
        <p className="text-sm text-stone-500">{hub.skill.skillKind}</p>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-medium text-stone-500">Endeavors</h2>
        {hub.endeavors.length === 0 ? (
          <p className="text-sm text-stone-500">None linked.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {hub.endeavors.map((e) => (
              <li key={e.id}>
                <Link href={`/graph/${e.id}`} className="underline">
                  {e.kind}: {e.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {hub.achievements.length > 0 && (
        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-stone-500">
            Achievements
          </h2>
          <ul className="list-inside list-disc text-sm">
            {hub.achievements.map((a) => (
              <li key={a.id}>{a.statement}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
