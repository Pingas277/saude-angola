-- =============================================================================
-- 009 · Admin RLS — manage clinic staff, search users, update clinic row
-- =============================================================================
-- Clinic admins need to:
--   1. Read profiles globally so they can look up a user by email when adding
--      staff. (The base policy is clinic-scoped + self.)
--   2. Update profiles where the target is either unaffiliated (clinic_id is
--      null) — adding a free-agent user as staff — or already part of the
--      admin's clinic — changing their role or removing them.
--   3. Update the clinic row for their clinic. (Already covered by
--      "clinics: admin update own" from migration 001.)
-- =============================================================================

-- 1. Admin global read of profiles.
drop policy if exists "profiles: admin read all" on public.profiles;
create policy "profiles: admin read all" on public.profiles
  for select using (
    public.current_user_role() = 'admin'
  );

-- 2. Admin can update profiles within their hiring boundary.
drop policy if exists "profiles: admin manage clinic staff" on public.profiles;
create policy "profiles: admin manage clinic staff" on public.profiles
  for update using (
    public.current_user_role() = 'admin'
    and (
      clinic_id is null
      or clinic_id = public.current_user_clinic()
    )
  ) with check (
    public.current_user_role() = 'admin'
    and (
      clinic_id is null
      or clinic_id = public.current_user_clinic()
    )
  );
