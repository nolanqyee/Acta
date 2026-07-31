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
import { Charis_SIL, Figtree, Space_Mono } from "next/font/google";
import { ThemeBootScript } from "@/features/theme/theme-boot-script";
import "@/styles/tokens.css";
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

/** Space Mono — labels, counts, machine values (Neubrutalism design system). */
const monoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono-loaded",
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
 *
 * `suppressHydrationWarning` is scoped to `<html>` alone: the boot script sets
 * `data-mode` before React hydrates, so the client element legitimately carries an
 * attribute the server markup cannot know about.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${uiFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeBootScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
