/**
 * @fileoverview Placeholder surface — a minimal, token-styled Server Component
 * used to reserve a route segment before its real UI exists. It pins the route's
 * name/URL and intended purpose so later work (and agents) don't reinvent naming.
 * Replace each usage with the real surface in its milestone; this component is
 * scaffolding, not a shipped surface.
 */

/**
 * Renders a centered placeholder for an unbuilt surface.
 *
 * @param props.title - Human-readable surface name (e.g. "Settings").
 * @param props.note - Short note on what will live here and which unit builds it.
 * @returns A full-height placeholder panel styled with design tokens.
 */
export function PlaceholderSurface({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg-canvas)",
        color: "var(--text)",
        fontFamily: "var(--font-ui)",
        padding: "var(--space-4)",
      }}
    >
      <section style={{ textAlign: "center", maxWidth: "32rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h-lg)",
          }}
        >
          {title}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-ui)" }}>
          {note}
        </p>
        <p
          style={{ color: "var(--text-muted)", fontSize: "var(--text-label)" }}
        >
          Placeholder route — UI not built yet.
        </p>
      </section>
    </main>
  );
}
