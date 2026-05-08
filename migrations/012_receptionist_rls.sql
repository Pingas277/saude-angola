-- =============================================================================
-- 012 · Receptionist RLS — register walk-in patients, edit walk-in profiles
-- =============================================================================
-- Receptionists need to:
--   1. INSERT a `patients` row on behalf of someone who just walked in. The
--      original "patients: insert self" policy required `profile_id = auth.uid()`
--      which only works for self-signup.
--   2. UPDATE the walk-in patient's profile (full_name, phone) right after the
--      auth user was created via signUp(). The walk-in user is unaffiliated
--      (clinic_id IS NULL) at this moment.
-- The role-change trigger from migration 010 still blocks privilege escalation
-- attempts (only an admin can change someone's role/clinic_id on their own row).
-- =============================================================================

drop policy if exists "patients: insert self" on public.patients;
drop policy if exists "patients: insert by self or clinic staff" on public.patients;
create policy "patients: insert by self or clinic staff" on public.patients
  for insert with check (
    profile_id = auth.uid()
    or public.current_user_role() in ('admin','doctor','nurse','receptionist')
  );

-- Receptionist can update unaffiliated profiles (walk-ins they just registered)
-- and profiles already in their clinic. Admins already have a similar policy
-- via migration 009; this extends the same scope to receptionists, but the
-- trigger from 010 still prevents role / clinic_id privilege escalation.
drop policy if exists "profiles: receptionist manage walk-ins" on public.profiles;
create policy "profiles: receptionist manage walk-ins" on public.profiles
  for update using (
    public.current_user_role() = 'receptionist'
    and (clinic_id is null or clinic_id = public.current_user_clinic())
  ) with check (
    public.current_user_role() = 'receptionist'
    and (clinic_id is null or clinic_id = public.current_user_clinic())
  );

-- Receptionist also needs to find existing patients by email/phone when booking
-- an appointment for someone who already has an account. Mirror the admin's
-- global read of profiles, scoped to receptionist role only.
drop policy if exists "profiles: receptionist read all" on public.profiles;
create policy "profiles: receptionist read all" on public.profiles
  for select using (
    public.current_user_role() = 'receptionist'
  );
