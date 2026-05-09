-- =============================================================================
-- 013 · Function to fetch a doctor's busy time slots for a given date
-- =============================================================================
-- The patient booking marketplace at /painel/marcar needs to render only the
-- slots that are still available for the chosen doctor + date. The patient
-- cannot read other patients' appointments directly (RLS blocks it), so we
-- expose a thin SECURITY DEFINER function that returns ONLY the times — no
-- patient_id, no reason, no clinic context. Just an array like
-- {"08:30","09:00","11:30"} of times that are already taken.
-- =============================================================================

create or replace function public.get_doctor_busy_slots(
  doctor_uuid uuid,
  day date
) returns text[]
language sql
security definer
set search_path = public
as $$
  select coalesce(
    array_agg(to_char(scheduled_at, 'HH24:MI') order by scheduled_at),
    array[]::text[]
  )
  from public.appointments
  where doctor_id = doctor_uuid
    and scheduled_at::date = day
    and status not in ('cancelled', 'no_show');
$$;

-- Anyone authenticated can call it (only the doctor identifier is required;
-- the function reveals nothing beyond aggregate occupancy).
grant execute on function public.get_doctor_busy_slots(uuid, date) to authenticated, anon;
