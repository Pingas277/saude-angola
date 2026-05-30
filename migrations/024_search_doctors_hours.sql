-- 024_search_doctors_hours.sql
-- Surface clinic working_hours through the public doctor search so the landing
-- can show an "Aberto · fecha 18h" status chip. The function's return table
-- gains a column, so it must be dropped and recreated (Postgres won't let
-- CREATE OR REPLACE change the OUT signature).

drop function if exists public.search_doctors(text);

create or replace function public.search_doctors(q text default '')
returns table (
  id uuid,
  full_name text,
  specialty text,
  clinic_name text,
  province text,
  working_hours jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.specialty, c.name as clinic_name,
         c.province::text as province, c.working_hours
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
