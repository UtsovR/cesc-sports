-- Safe additive migration for calendar event time support.
-- Keeping the column nullable preserves legacy rows until times are backfilled.

alter table public.calendar_events
add column if not exists event_time time;
