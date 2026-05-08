-- =============================================================================
-- 004 · Doctors can read profiles of patients with whom they have appointments
-- =============================================================================
-- The base "profiles: read self or same clinic" policy blocks a doctor from
-- reading a B2C patient's profile (patients have no clinic_id). When a doctor
-- opens a consultation, we must be able to display the patient's name and
-- contact, so we add a scoped SELECT policy: a profile row is visible to a
-- doctor when there exists an appointment that links them to that profile.
-- =============================================================================

drop policy if exists "profiles: read patient by their doctor" on public.profiles;
create policy "profiles: read patient by their doctor" on public.profiles
  for select to authenticated using (
    exists (
      select 1
      from public.appointments a
      join public.patients p on p.id = a.patient_id
      where a.doctor_id = auth.uid()
        and p.profile_id = profiles.id
    )
  );
