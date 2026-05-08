-- =============================================================================
-- 003 · Allow authenticated users to read doctor profiles for booking
-- =============================================================================
-- Patients need to discover doctors across clinics to book appointments.
-- We add a permissive SELECT policy alongside the existing
-- "profiles: read self or same clinic" rule (RLS combines policies with OR).
-- Doctors are professional listings; exposing name/role/clinic is intended.
-- =============================================================================

drop policy if exists "profiles: read doctors publicly" on public.profiles;
create policy "profiles: read doctors publicly" on public.profiles
  for select to authenticated using (role = 'doctor');
