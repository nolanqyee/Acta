# acta-api — agent notes

Hono backend for Acta (capture, extract, graph). Part of the one-repo workspace;
see the root [`AGENTS.md`](../AGENTS.md) for repo-wide conventions.

- **This is the only place secrets live.** Supabase service role, LLM keys, and
  JWKS config belong in this app's deploy env (see `.env.example`) — never in
  `acta-web` or any `VITE_` var.
- Imports shared types from `@acta/contracts` (workspace resolution).
- Owns `supabase/migrations/` (added at U2).
- **Doc-comment rule (required):** every file gets a `@fileoverview`; every
  function/method gets a JSDoc block (summary, `@param`, `@returns`, `@throws`).
  Explain intent, not syntax. See root `AGENTS.md` for the full rule.
