/**
 * @fileoverview Stable canvas node ids for pending endeavor ghosts. Previews use
 * extract `tempId`s; the canvas contract requires UUID-shaped ids.
 */

/**
 * Derives a deterministic RFC-4122-shaped id from a proposal id and preview temp id.
 *
 * @param proposalId - Owning extract proposal uuid.
 * @param tempId - Extract emit temp id for the endeavor preview.
 * @returns Stable uuid string safe for {@link GraphNode.id}.
 */
export function pendingGhostNodeId(proposalId: string, tempId: string): string {
  const input = `${proposalId}\0${tempId}`;
  const parts = [fnv1a(input), fnv1a(tempId + proposalId), fnv1a(proposalId), fnv1a(tempId)];
  const hex = parts.map((n) => n.toString(16).padStart(8, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `8${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}

/**
 * FNV-1a 32-bit hash for deterministic ids (sync, works in browser + Node).
 *
 * @param value - String to hash.
 * @returns Unsigned 32-bit hash.
 */
function fnv1a(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
