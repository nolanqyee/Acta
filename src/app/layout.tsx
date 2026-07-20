/**
 * @fileoverview Root layout for the Acta App Router tree. It is a Server
 * Component that wraps every route, sets base document metadata, and imports the
 * design-token stylesheet once so `var(--...)` tokens are available app-wide.
 * Global providers (auth, theme) will be added here in later units.
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/tokens.css";

/** Base document metadata applied to all routes unless a page overrides it. */
export const metadata: Metadata = {
  title: "Acta",
  description: "Personal evidence graph.",
};

/**
 * Wraps all pages in the shared HTML shell.
 *
 * @param props.children - The active route's rendered content.
 * @returns The root `<html>`/`<body>` document tree.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
