-- 027_notifications_table.sql
-- In-app notifications. One row per "thing that happened that the user
-- should know about". Rows are inserted by SECURITY DEFINER triggers
-- attached to source tables (migration 028), never by clients.
--
-- `type` is a short string the UI maps to icon/colour:
--   'lab_result' | 'prescription' | 'appointment' | 'invoice' | …
-- `link` is the in-app destination ("/painel/exames", etc.) so a click
-- on the notification takes the user straight there.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Hot path: "give me my unread count / list".
create index if not exists idx_notif_profile_unread
  on public.notifications(profile_id, created_at desc)
  where read_at is null;
-- Full history for the dropdown panel.
create index if not exists idx_notif_profile_created
  on public.notifications(profile_id, created_at desc);

alter table public.notifications enable row level security;

-- Read: only your own.
drop policy if exists "notifications: select own" on public.notifications;
create policy "notifications: select own" on public.notifications
  for select using (profile_id = auth.uid());

-- Update: only your own (used to set read_at).
drop policy if exists "notifications: update own" on public.notifications;
create policy "notifications: update own" on public.notifications
  for update using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- No INSERT / DELETE policy → RLS denies both for clients. Only the
-- SECURITY DEFINER fan-out triggers in migration 028 can insert.

comment on table public.notifications is
  'Per-user in-app notifications. Inserted only by fan-out triggers on source tables (migration 028). Users can read and mark their own as read.';
