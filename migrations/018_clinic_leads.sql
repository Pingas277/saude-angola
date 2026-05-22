-- Clinic partnership leads — submissions from the public /parceria form.
-- Same security shape as contact_messages: anyone can INSERT, nobody can
-- SELECT (reads happen via service_role in Supabase Studio / a future
-- admin pipeline view).

create table if not exists public.clinic_leads (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null,
  nif text,
  province text,
  num_doctors int,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  message text,
  status text not null default 'new',     -- new | contacted | converted | lost
  created_at timestamptz not null default now(),
  contacted_at timestamptz,
  notes text
);

create index if not exists idx_clinic_leads_created_at
  on public.clinic_leads (created_at desc);

create index if not exists idx_clinic_leads_status
  on public.clinic_leads (status, created_at desc);

alter table public.clinic_leads enable row level security;

drop policy if exists "clinic_leads_insert_any" on public.clinic_leads;
create policy "clinic_leads_insert_any"
  on public.clinic_leads
  for insert
  to anon, authenticated
  with check (true);

-- No SELECT policy on purpose — leads are read via service_role only.
