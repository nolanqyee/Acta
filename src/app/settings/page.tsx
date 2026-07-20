/**
 * @fileoverview `/settings` route — account, connectors, export, and rare
 * hard-delete, reached via the top-right profile menu (per surfaces-and-flows
 * § Settings / export). Placeholder for now; auth/connectors land in U2 and the
 * export / hard-delete polish in U-E extras.
 */

import { PlaceholderSurface } from "@/components/placeholder-surface";

/**
 * Settings surface placeholder.
 *
 * @returns The reserved `/settings` route shell.
 */
export default function SettingsPage() {
  return (
    <PlaceholderSurface
      title="Settings"
      note="Account, connectors, export, and hard-delete. Auth + connectors arrive in U2; export/hard-delete in U-E extras."
    />
  );
}
