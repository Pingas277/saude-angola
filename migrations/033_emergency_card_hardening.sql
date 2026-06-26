-- =============================================================================
-- Migration 033: Emergency Card hardening
-- =============================================================================
-- Adds the rest of what's flagged in ROADMAP D5:
--   1. A regenerable emergency_token (uuid) per patient, distinct from
--      patient.id — so the public QR never leaks the internal id and can
--      be revoked by regenerating the token.
--   2. An emergency_card_enabled (boolean) toggle. Default TRUE so the
--      feature works on day 1; user can disable in /perfil/emergencia.
--   3. An emergency_card_scans audit table — every successful public scan
--      writes one row with timestamp + user agent + IP so the patient can
--      review who looked them up.
--   4. The emergency_card() function now takes the token (not the patient
--      id), respects the toggle, and writes the audit row in the same
--      transaction. Two new helper functions for the patient/guardian to
--      regenerate the token or flip the toggle.
--   5. Same data model works for dependents — every patient row gets its
--      own token, so each dependent's compact passport can show a
--      separate QR.

-- ── 1. Token + toggle columns on patients ───────────────────────────────────
alter table public.patients
  add column if not exists emergency_token uuid unique default gen_random_uuid(),
  add column if not exists emergency_card_enabled boolean not null default true;

-- Backfill any pre-existing rows that came in before the column existed.
update public.patients
   set emergency_token = gen_random_uuid()
 where emergency_token is null;

-- ── 2. Audit log table ──────────────────────────────────────────────────────
create table if not exists public.emergency_card_scans (
  id bigserial primary key,
  patient_id uuid not null references public.patients(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  user_agent text,
  ip text
);
create index if not exists idx_emergency_card_scans_patient_time
  on public.emergency_card_scans (patient_id, scanned_at desc);

-- RLS: only the patient (or their guardian) can read their own scan log.
alter table public.emergency_card_scans enable row level security;

drop policy if exists "emergency_scans: own read" on public.emergency_card_scans;
create policy "emergency_scans: own read" on public.emergency_card_scans
  for select using (
    patient_id in (
      select id from public.patients
       where profile_id = auth.uid()
          or guardian_profile_id = auth.uid()
    )
  );

-- ── 3. Replace emergency_card to take the token + log the scan ──────────────
drop function if exists public.emergency_card(uuid);

create or replace function public.emergency_card(
  p_token uuid,
  p_user_agent text default null,
  p_ip text default null
)
returns table (
  first_name text,
  age integer,
  blood_type text,
  gender text,
  allergies text[],
  chronic_conditions text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  enabled boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_patient_id uuid;
  v_enabled boolean;
begin
  -- Token lookup. uuid type ⇒ no enumeration risk; unknown token returns
  -- no rows so the caller renders 404.
  select id, emergency_card_enabled
    into v_patient_id, v_enabled
    from public.patients
   where emergency_token = p_token;

  if v_patient_id is null then
    return; -- empty result set → 404
  end if;

  if not v_enabled then
    -- Token exists but the owner turned the card off. Surface a tombstone
    -- row so the page can say 'the owner disabled this card' instead of
    -- 404 (more useful for a paramedic standing over a patient).
    return query select
      null::text, null::integer, null::text, null::text,
      null::text[], null::text[], null::text, null::text, false;
    return;
  end if;

  -- Log the scan — non-blocking from the caller's point of view because
  -- we're inside the same SECURITY DEFINER call. Failure to insert
  -- shouldn't block the response; SQL inside a function commits with the
  -- enclosing tx, so on duplicate / constraint violations we just skip.
  begin
    insert into public.emergency_card_scans (patient_id, user_agent, ip)
    values (v_patient_id, p_user_agent, p_ip);
  exception when others then
    -- swallow — we never want a logging failure to deny a paramedic
    -- access to the emergency info.
    null;
  end;

  return query
    select
      coalesce(
        split_part(pr.full_name, ' ', 1),
        split_part(pt.full_name, ' ', 1),
        '—'
      ) as first_name,
      case
        when pt.date_of_birth is null then null
        else extract(year from age(pt.date_of_birth))::int
      end as age,
      pt.blood_type::text,
      pt.gender,
      pt.allergies,
      pt.chronic_conditions,
      pt.emergency_contact_name,
      pt.emergency_contact_phone,
      true as enabled
      from public.patients pt
      left join public.profiles pr on pr.id = pt.profile_id
     where pt.id = v_patient_id;
end;
$$;

-- ── 4. Helpers for the owner to regenerate / toggle ─────────────────────────

create or replace function public.regenerate_emergency_token(p_patient_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_token uuid;
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'unauthorized';
  end if;

  -- Only the patient themselves or their guardian can regenerate. Same
  -- check we apply to dependents elsewhere.
  if not exists (
    select 1 from public.patients
     where id = p_patient_id
       and (profile_id = v_caller or guardian_profile_id = v_caller)
  ) then
    raise exception 'unauthorized';
  end if;

  v_new_token := gen_random_uuid();
  update public.patients
     set emergency_token = v_new_token
   where id = p_patient_id;
  return v_new_token;
end;
$$;

create or replace function public.set_emergency_card_enabled(
  p_patient_id uuid,
  p_enabled boolean
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'unauthorized';
  end if;

  if not exists (
    select 1 from public.patients
     where id = p_patient_id
       and (profile_id = v_caller or guardian_profile_id = v_caller)
  ) then
    raise exception 'unauthorized';
  end if;

  update public.patients
     set emergency_card_enabled = p_enabled
   where id = p_patient_id;
  return p_enabled;
end;
$$;

-- ── 5. Grants ───────────────────────────────────────────────────────────────
grant execute on function
  public.emergency_card(uuid, text, text) to anon, authenticated;
grant execute on function
  public.regenerate_emergency_token(uuid) to authenticated;
grant execute on function
  public.set_emergency_card_enabled(uuid, boolean) to authenticated;
