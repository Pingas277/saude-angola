-- =============================================================================
-- 005 · RLS so doctors can serve telemedicine consultations
-- =============================================================================
-- Telemedicine consultations are inserted by patients with doctor_id = null
-- ("waiting" pool). We need:
--   1. Doctors to SELECT from the waiting pool so they can pick the next patient.
--   2. Doctors to UPDATE an unassigned row to claim it (set doctor_id = themself,
--      status = 'in_progress'). The base "consultations: update by participant"
--      policy doesn't fire because the row has no doctor_id yet.
-- =============================================================================

-- Doctors see waiting (unassigned) consultations + ones already assigned to them.
drop policy if exists "consultations: doctors read waiting" on public.consultations;
create policy "consultations: doctors read waiting" on public.consultations
  for select using (
    public.current_user_role() = 'doctor'
    and (doctor_id is null or doctor_id = auth.uid())
  );

-- Doctors can claim an unassigned consultation by setting themselves as the doctor.
drop policy if exists "consultations: doctor claim" on public.consultations;
create policy "consultations: doctor claim" on public.consultations
  for update using (
    public.current_user_role() = 'doctor'
    and doctor_id is null
  ) with check (
    doctor_id = auth.uid()
  );
