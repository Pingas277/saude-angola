-- =============================================================================
-- Migration 035: search_clinics RPC
-- =============================================================================
-- Companion to search_doctors. Powers the clinic-first patient flow the
-- user's mentor pushed for ("começa pela clínica, não pelo médico").
--
-- Returns each clinic with two derived stats:
--   - doctors_count: how many doctors practise there (used for sort + UX hint)
--   - specialties:   array of unique specialties offered (used for chips on
--                    the card so patients see the clinical mix at a glance)
--
-- province is a custom enum (angola_province); cast to text for fuzzy
-- compare against the user's query string.

create or replace function public.search_clinics(q text default '')
returns table (
  id uuid,
  name text,
  province text,
  address text,
  working_hours jsonb,
  doctors_count int,
  specialties text[]
)
language sql
stable
security definer
set search_path = public
as $$
  with q_norm as (select lower(coalesce(q, '')) as q)
  select
    c.id,
    c.name,
    c.province::text,
    c.address,
    c.working_hours,
    (
      select count(*)::int from public.profiles p
       where p.role = 'doctor' and p.clinic_id = c.id
    ) as doctors_count,
    (
      select coalesce(
        array_agg(distinct p.specialty order by p.specialty), '{}'::text[]
      )
        from public.profiles p
       where p.role = 'doctor'
         and p.clinic_id = c.id
         and p.specialty is not null
    ) as specialties
  from public.clinics c, q_norm
  where q_norm.q = ''
     or lower(c.name) like '%' || q_norm.q || '%'
     or lower(coalesce(c.province::text, '')) like '%' || q_norm.q || '%'
     or lower(coalesce(c.address, '')) like '%' || q_norm.q || '%'
     or exists (
       select 1 from public.profiles p
        where p.clinic_id = c.id
          and p.role = 'doctor'
          and (
            lower(coalesce(p.specialty, '')) like '%' || q_norm.q || '%'
         or lower(coalesce(p.full_name, '')) like '%' || q_norm.q || '%'
          )
     )
  order by doctors_count desc, c.name;
$$;

grant execute on function public.search_clinics(text) to anon, authenticated;
