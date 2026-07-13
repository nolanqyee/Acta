import Link from "next/link";
import { actionListSkills } from "@/server/actions";

export default async function SkillsPage() {
  const skills = await actionListSkills();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Skills</h1>
        <p className="text-sm text-stone-600">
          Shared skill nodes — open a hub to see linked endeavors.
        </p>
      </div>
      {skills.length === 0 ? (
        <p className="text-sm text-stone-500">No skills yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <li key={s.id}>
              <Link
                href={`/skills/${s.id}`}
                className="inline-block rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm hover:border-stone-400"
              >
                {s.name}{" "}
                <span className="text-xs text-stone-400">{s.skillKind}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
