-- Grant base-table privileges to the Supabase roles (forward fix for the U2 schema).
--
-- Why this exists: the initial schema (20260721120000, 20260721120100) enabled RLS
-- and created owner-only policies but never granted table-level privileges to the
-- Supabase roles. RLS decides *which rows* a role may touch; a `GRANT` decides
-- whether the role may touch the table *at all*, and it is checked first — a role
-- with no grant is denied (SQLSTATE 42501) before any policy is evaluated. The
-- service-role client (src/lib/supabase/server.ts) bypasses RLS for background
-- writes and so was fully locked out until this ran; `authenticated`/`anon` stay
-- confined to their own rows by the existing owner-only policies.
--
-- This is a separate, later migration (not an edit to the already-applied ones) so
-- it runs forward on the hosted project on the next deploy. `grant ... on all
-- tables` covers every current table, including extract_proposals, and mirrors
-- Supabase's default public-schema grants so local (`supabase db reset`) matches
-- hosted. Idempotent: safe to re-run.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
