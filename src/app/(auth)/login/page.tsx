/**
 * @fileoverview `/login` — the magic-link sign-in surface (client component).
 * Submitting an email calls Supabase `signInWithOtp`, which emails a link that
 * lands on `/auth/callback` to establish the httpOnly cookie session. No
 * passwords: magic link is the only auth method for now. This replaces the U1
 * placeholder.
 */

"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

/** Local UI state for the sign-in form. */
type Status = "idle" | "sending" | "sent" | "error";

/**
 * Renders the email form and triggers a magic-link email on submit, showing a
 * "check your inbox" confirmation or an error message.
 *
 * @returns The `/login` sign-in UI.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  /**
   * Sends the magic link for the entered email, redirecting back through
   * `/auth/callback` after the user clicks it.
   *
   * @param event - The form submit event.
   */
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createBrowserSupabase();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (otpError) {
      setError(otpError.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

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
      <section style={{ width: "min(360px, 100%)", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h-lg)",
            marginBottom: "var(--space-2)",
          }}
        >
          Sign in to Acta
        </h1>

        {status === "sent" ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-ui)" }}>
            Check your inbox — we sent a magic link to <strong>{email}</strong>.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            style={{ display: "grid", gap: "var(--space-3)" }}
          >
            <label
              htmlFor="email"
              style={{
                fontSize: "var(--text-label)",
                color: "var(--text-muted)",
                textAlign: "left",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                padding: "var(--space-2)",
                borderRadius: "var(--radius-soft)",
                border: 0,
                background: "var(--bg-elevated)",
                color: "var(--text)",
                fontSize: "var(--text-ui)",
              }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                padding: "var(--space-2)",
                borderRadius: "var(--radius-soft)",
                border: "none",
                background: "var(--accent)",
                color: "var(--accent-contrast)",
                fontSize: "var(--text-ui)",
                cursor: status === "sending" ? "default" : "pointer",
              }}
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {status === "error" && error ? (
              <p
                role="alert"
                style={{
                  color: "var(--state-danger-text)",
                  fontSize: "var(--text-label)",
                }}
              >
                {error}
              </p>
            ) : null}
          </form>
        )}
      </section>
    </main>
  );
}
