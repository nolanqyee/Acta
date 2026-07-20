/**
 * @fileoverview U1 health shell for acta-web. Its only jobs are to prove the
 * workspace wiring end-to-end: that `@acta/contracts` resolves in the browser
 * build (we render the shared EndeavorKind enum) and that the design tokens are
 * applied. Replaced by the Graph home shell in U3.
 */

import { useEffect, useState } from "react";
import { EndeavorKind } from "@acta/contracts";

/** Base URL of acta-api; overridable via VITE_API_BASE_URL for deploys. */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

/**
 * Root component for the U1 shell. Renders the contract-sourced endeavor kinds
 * and probes the backend `/health` endpoint to confirm both workspaces run.
 *
 * @returns The health-shell UI.
 */
export function App() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "unreachable">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/health`)
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
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h-lg)" }}>
          Acta
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-ui)" }}>
          U1 workspace shell — contracts + tokens wired.
        </p>
        <p style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
          acta-api /health: {apiStatus}
        </p>
        <p style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
          endeavor kinds from @acta/contracts: {EndeavorKind.options.join(", ")}
        </p>
      </section>
    </main>
  );
}
