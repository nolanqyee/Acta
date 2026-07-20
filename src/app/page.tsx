/**
 * @fileoverview U1 health shell (client component). Its only job is to prove the
 * migrated wiring end-to-end: that `@/lib/contracts` resolves in the browser
 * bundle (we render the shared EndeavorKind enum), that design tokens apply, and
 * that the co-located route-handler API is reachable same-origin (no CORS). It
 * is replaced by the Graph home shell in U3.
 */

"use client";

import { useEffect, useState } from "react";
import { EndeavorKind } from "@/lib/contracts";

/**
 * Root page for the U1 shell. Renders the contract-sourced endeavor kinds and
 * probes the in-app `/api/health` route to confirm the API layer runs.
 *
 * @returns The health-shell UI.
 */
export default function Page() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "unreachable">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(() => !cancelled && setApiStatus("ok"))
      .catch(() => !cancelled && setApiStatus("unreachable"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg-canvas)",
        color: "var(--text)",
        fontFamily: "var(--font-ui)",
        gap: "var(--space-4)",
      }}
    >
      <section style={{ textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h-lg)",
          }}
        >
          Acta
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-ui)" }}>
          U1 shell — Next app, contracts + tokens wired.
        </p>
        <p
          style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}
        >
          /api/health: {apiStatus}
        </p>
        <p
          style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}
        >
          endeavor kinds from @/lib/contracts: {EndeavorKind.options.join(", ")}
        </p>
      </section>
    </main>
  );
}
