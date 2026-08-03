/**
 * @fileoverview Root layout for the Acta App Router tree. It is a Server Component
 * that wraps every route, sets base document metadata, loads the two brand faces,
 * and imports the design-token + base stylesheets once so `var(--...)` tokens are
 * available app-wide.
 *
 * Fonts are self-hosted through `next/font` (no third-party request at runtime) and
 * exposed as `--font-display-loaded` / `--font-ui-loaded`, which the token file
 * consumes with the literal family name as its fallback — so tokens stay the source
 * of truth for the type stack.
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Charis_SIL, Figtree } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/tailwind.css";
import "@/styles/base.css";

/** Charis SIL — brand/display face: wordmark, headings, node titles (brand §6). */
const displayFont = Charis_SIL({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-display-loaded",
});

/** Figtree — UI face: all app chrome, forms, and body copy (brand §6). */
const uiFont = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui-loaded",
});

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
    <html
      lang="en"
      data-mode="light"
      className={`${displayFont.variable} ${uiFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
