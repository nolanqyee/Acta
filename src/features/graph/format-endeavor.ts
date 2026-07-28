/**
 * @fileoverview Small, shared text formatting for an endeavor's fields — used by both
 * the hover card and the node detail panel, so the two surfaces agree on how a kind,
 * status, or fuzzy date reads.
 */

import type { GraphNode } from "@/lib/contracts";

/** A partial calendar date, as `Timeframe.start`/`Timeframe.end` carry it. */
interface PartialDate {
  year: number;
  month?: number;
  day?: number;
}

/**
 * Turns an enum-ish snake_case value into display text.
 *
 * @param value - e.g. `"creative_work"`.
 * @returns e.g. `"Creative work"`.
 */
export function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * @param date - A year, or year + month, or full date.
 * @returns e.g. `"2024"`, `"Mar 2024"`, or `"Mar 4, 2024"`.
 */
function formatDate(date: PartialDate): string {
  if (!date.month) return `${date.year}`;
  const month = new Date(Date.UTC(2000, date.month - 1, 1)).toLocaleString(
    "en-US",
    { month: "short", timeZone: "UTC" },
  );
  return date.day
    ? `${month} ${date.day}, ${date.year}`
    : `${month} ${date.year}`;
}

/**
 * @param timeframe - The endeavor's fuzzy start/end.
 * @returns A human span, or `null` if neither end is known.
 */
export function formatTimeframe(
  timeframe: GraphNode["timeframe"],
): string | null {
  if (!timeframe) return null;
  const start = timeframe.start ? formatDate(timeframe.start) : null;
  const end =
    timeframe.end === "ongoing"
      ? "ongoing"
      : timeframe.end
        ? formatDate(timeframe.end)
        : null;

  if (start && end) return `${start} – ${end}`;
  return start ?? end;
}
