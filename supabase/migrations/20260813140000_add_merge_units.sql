-- Add merge_units jsonb to extract_proposals — disposition SoT per proposed
-- endeavor (see docs/capture-diff-skim-flow.md). Populated by Extract post-
-- processing in U4-D; partial accept reads it in U5.

alter table public.extract_proposals
  add column if not exists merge_units jsonb not null default '[]'::jsonb;
