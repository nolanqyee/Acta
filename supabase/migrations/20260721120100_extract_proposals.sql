-- Acta extract_proposals table — the persisted, refresh-surviving home for an
-- in-flight Extract (the piece the salvaged init schema never had).
--
-- Role in the system: when a Capture is committed, the Extract agent streams a
-- structured proposal here (proposal-only writes; the live graph is untouched
-- until Confirm merges it — R4). Persisting partials means the diff-skim panel
-- survives refresh and the job keeps writing even if the browser JWT expires
-- mid-stream (written by the server-only service-role client with an explicit
-- user_id). State-machine rules live in docs/technical-implementation-plan.md
-- (KTD10); the payload jsonb holds an ExtractProposal per src/lib/contracts.
--
-- RLS is owner-only like every user table: user B can never see user A's
-- proposal even with a valid session.

create table if not exists public.extract_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Captures this proposal was extracted from (usually one; array leaves room
  -- for multi-capture extraction later).
  capture_ids uuid[] not null default '{}',
  status text not null default 'streaming' check (status in (
    'streaming', 'ready', 'failed', 'merging', 'confirmed', 'discarded'
  )),
  -- Full ExtractProposal (Zod-validated before status flips to 'ready').
  payload jsonb not null default '{}'::jsonb,
  -- UI-facing incremental state so a reattaching client can rehydrate the skim.
  changelog jsonb not null default '[]'::jsonb,
  pending_endeavor_previews jsonb not null default '[]'::jsonb,
  -- Why an extract ended in 'failed' (e.g. 'empty', 'timeout', 'model_error').
  failure_reason text,
  -- Resume marker for SSE reattach (?cursor=) while streaming.
  stream_cursor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists extract_proposals_user_id_idx on public.extract_proposals (user_id);
create index if not exists extract_proposals_user_status_idx on public.extract_proposals (user_id, status);

alter table public.extract_proposals enable row level security;

create policy extract_proposals_own on public.extract_proposals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
