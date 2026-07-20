# acta-web — agent notes

Vite React SPA for Acta (Graph canvas + chrome). Part of the one-repo workspace;
see the root [`AGENTS.md`](../AGENTS.md) for repo-wide conventions.

- **No secrets here.** Only `VITE_`-prefixed public values (Supabase URL + anon
  key, API base URL). The service role and LLM keys live in `acta-api` only.
- Imports shared types from `@acta/contracts` (workspace resolution).
- Design tokens: `src/styles/tokens.css` (copied from repo-root `styles/tokens.css`;
  re-sync when tokens change). Prefer token variables over ad-hoc hex/rem.
- **Doc-comment rule (required):** every file gets a `@fileoverview`; every
  function/hook/component gets a JSDoc block (summary, `@param`, `@returns`,
  `@throws`). Explain intent, not syntax. See root `AGENTS.md` for the full rule.
