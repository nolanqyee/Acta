/**
 * @fileoverview `/adapters/[kind]` route — an individual adapter workspace
 * (resume, interview, application question, …), a full page away from the Graph
 * with an expandable mini-graph peek (per surfaces-and-flows § Adapter pages).
 * `kind` selects which adapter. Placeholder for now; built in U-F.
 */

import { PlaceholderSurface } from "@/components/placeholder-surface";

/**
 * Adapter workspace placeholder for a given adapter `kind`.
 *
 * @param props.params - Route params promise carrying the adapter `kind` slug.
 * @returns The reserved `/adapters/[kind]` route shell.
 */
export default async function AdapterPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  return (
    <PlaceholderSurface
      title={`Adapter: ${kind}`}
      note="Draft and manage this adapter's artifacts, with a mini-graph peek back to the Graph. Built in U-F."
    />
  );
}
