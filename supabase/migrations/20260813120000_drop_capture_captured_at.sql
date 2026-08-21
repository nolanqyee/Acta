-- Drop captures.captured_at — intake history sorts on created_at; life dates live
-- on entity timeframe after Extract (see docs/data-model.md Capture entity).

alter table public.captures drop column if exists captured_at;
