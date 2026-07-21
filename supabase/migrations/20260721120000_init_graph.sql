-- Acta v1 graph schema (Supabase / Postgres).
--
-- Role in the system: this is the durable source of truth for the personal
-- evidence graph — the DB mirror of the Zod contracts in src/lib/contracts.
-- Entity tables (captures, endeavors, primary children, secondaries) plus a
-- single typed `edges` table model the logical catalog in docs/data-model.md.
--
-- Security: every user table carries `user_id` and has RLS enabled with an
-- owner-only policy (auth.uid() = user_id). This is the real per-user boundary
-- (R10): a valid session still only ever reads/writes its own rows. The
-- server-only service-role client bypasses RLS and must filter by user_id in
-- application code (see src/lib/supabase/server.ts).
--
-- pgvector `embedding` columns are created now but left UNUSED until Explore
-- (per the technical-implementation-plan: migration may create columns; don't
-- wire retrieval until Explore ships).

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- Intake: immutable raw captures the Extract agent reads (provenance SoT).
create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  source_type text not null check (source_type in (
    'typed', 'resume_import', 'linkedin_import', 'github_import', 'other_import'
  )),
  source_meta jsonb,
  captured_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Primary container: the only entity drawn on the canvas. `kind` selects the
-- suggestion profile + theme; nesting is expressed via part_of edges (+ an
-- optional soft primary_parent_id).
create table if not exists public.endeavors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in (
    'role', 'leadership', 'project', 'creative_work', 'course',
    'education', 'event', 'volunteer', 'hobby'
  )),
  title text not null,
  summary text,
  timeframe jsonb,
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  application_tags jsonb not null default '[]'::jsonb,
  primary_parent_id uuid references public.endeavors (id) on delete set null,
  ext jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atomic contribution/claim under one or more endeavors (resume-bullet shaped).
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  statement text not null,
  detail text,
  timeframe jsonb,
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  application_tags jsonb not null default '[]'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shared skill vocabulary; deduped by (user_id, name). Not a canvas node.
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  skill_kind text not null check (skill_kind in ('tech', 'craft', 'soft', 'domain')),
  aliases text[] default '{}',
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- People connected to endeavors (role captured on the involved_person edge).
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  notes text,
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Org context (company/school/…); linked to endeavors via at_org.
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  org_kind text check (org_kind in (
    'company', 'school', 'club', 'lab', 'nonprofit', 'gallery', 'label', 'other'
  )),
  url text,
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- First-class quantified result; never required on an endeavor.
create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  value jsonb not null,
  unit text,
  direction text check (direction in ('up', 'down', 'neutral')),
  context text,
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Attachable provenance artifact (link, file, PR, doc, media).
create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  evidence_kind text not null check (evidence_kind in (
    'commit', 'pr', 'doc', 'url', 'image', 'audio', 'video', 'portfolio_file', 'other'
  )),
  title text,
  uri text,
  meta jsonb,
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Secondary: agent-synthesized STAR narrative; hybrid-stamped (user edits win).
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  situation text,
  task text,
  action text,
  result text,
  body text,
  synthesis_status text not null default 'draft' check (synthesis_status in ('draft', 'stamped', 'stale')),
  sourced_from_entity_ids uuid[] not null default '{}',
  source_fingerprint text,
  application_tags jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Secondary: agent-synthesized "what happened / what I learned"; same stamp lifecycle.
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  what_happened text,
  what_learned text,
  synthesis_status text not null default 'draft' check (synthesis_status in ('draft', 'stamped', 'stale')),
  sourced_from_entity_ids uuid[] not null default '{}',
  source_fingerprint text,
  application_tags jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'demoted', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Single typed edge collection for the whole graph. from_type/to_type name the
-- endpoint entity tables; attrs carries edge-specific fields (e.g. involved_person.role).
create table if not exists public.edges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in (
    'part_of', 'used_skill', 'involved_person', 'at_org', 'reports_metric',
    'supported_by', 'sourced_from_capture', 'about', 'derived_from', 'related_to'
  )),
  from_type text not null,
  from_id uuid not null,
  to_type text not null,
  to_id uuid not null,
  attrs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists endeavors_user_id_idx on public.endeavors (user_id);
create index if not exists endeavors_user_kind_idx on public.endeavors (user_id, kind);
create index if not exists achievements_user_id_idx on public.achievements (user_id);
create index if not exists skills_user_id_idx on public.skills (user_id);
create index if not exists edges_user_type_from_idx on public.edges (user_id, type, from_id);
create index if not exists edges_user_type_to_idx on public.edges (user_id, type, to_id);
create index if not exists captures_user_id_idx on public.captures (user_id);

-- Row-Level Security: the per-user boundary (R10). Enable on every user table.
alter table public.captures enable row level security;
alter table public.endeavors enable row level security;
alter table public.achievements enable row level security;
alter table public.skills enable row level security;
alter table public.people enable row level security;
alter table public.orgs enable row level security;
alter table public.metrics enable row level security;
alter table public.evidence enable row level security;
alter table public.stories enable row level security;
alter table public.lessons enable row level security;
alter table public.edges enable row level security;

-- Owner-only access: a session can only touch rows whose user_id is its subject.
create policy captures_own on public.captures for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy endeavors_own on public.endeavors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy achievements_own on public.achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy skills_own on public.skills for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy people_own on public.people for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy orgs_own on public.orgs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy metrics_own on public.metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy evidence_own on public.evidence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy stories_own on public.stories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy lessons_own on public.lessons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy edges_own on public.edges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
