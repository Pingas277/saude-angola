-- =============================================================================
-- 015 · Public doctor search RPC
-- =============================================================================
-- The landing page has a "Encontre o seu médico" search that must work for
-- anonymous visitors (no session). RLS blocks anon reads of `profiles`, so we
-- expose a thin SECURITY DEFINER function that returns ONLY the public-facing
-- marketplace fields (name, specialty, clinic, province) — nothing sensitive
-- (no email, phone, license, ids). Same pattern as get_doctor_busy_slots.
-- =============================================================================

create or replace function public.search_doctors(q text default '')
returns table (
  id uuid,
  full_name text,
  specialty text,
  clinic_name text,
  province text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.specialty, c.name as clinic_name,
         c.province::text as province
  from public.profiles p
  left join public.clinics c on c.id = p.clinic_id
  where p.role = 'doctor'
    and p.full_name is not null
    and (
      coalesce(btrim(q), '') = ''
      or p.full_name ilike '%' || q || '%'
      or p.specialty ilike '%' || q || '%'
      or c.name ilike '%' || q || '%'
      or c.province::text ilike '%' || q || '%'
    )
  order by p.full_name
  limit 30;
$$;

grant execute on function public.search_doctors(text) to anon, authenticated;
