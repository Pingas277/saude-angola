-- Contact / "fala connosco" inbox.
-- Anyone (anonymous or logged in) can insert a message from the public
-- legal pages. Reads are locked down — only the service_role (admin
-- dashboard / Supabase Studio) can list them, until we build a proper
-- in-app admin inbox.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  source text,                           -- which page sent it (privacidade, termos, …)
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  responded_at timestamptz,
  notes text
);

create index if not exists idx_contact_messages_created_at
  on public.contact_messages (created_at desc);

create index if not exists idx_contact_messages_unread
  on public.contact_messages (created_at desc) where read_at is null;

alter table public.contact_messages enable row level security;

-- Anyone can submit. We rely on app-level validation + rate-limiting
-- (still to be added) to prevent abuse. The form does not allow the
-- caller to set read_at / responded_at / notes / user_id.
drop policy if exists "contact_messages_insert_any" on public.contact_messages;
create policy "contact_messages_insert_any"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- No select policy → reads only via service_role (Supabase Studio,
-- future admin route handler). This is intentional; we'd rather leak
-- nothing than leak the wrong thing.
