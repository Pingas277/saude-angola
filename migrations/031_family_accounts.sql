-- 031_family_accounts.sql
-- Family accounts — a logged-in patient (the *guardian*) can register and
-- manage one or more dependents who don't have their own login.
--
-- Schema:
--   * patients.profile_id is now NULLABLE — dependents have no login.
--   * patients.guardian_profile_id references the guardian's profiles.id.
--   * patients.full_name + relationship — dependents have no profile row
--     to read full_name from, and the relationship label is patient-facing.
--   * CHECK: at least one of {profile_id, guardian_profile_id} is set.
--
-- RLS: every patient-scoped table that previously used current_patient_id()
-- now uses current_user_patient_ids() which returns the array of ALL
-- patient_ids the auth user controls (their own + their dependents).
-- The data layer thus surfaces dependents' rows automatically wherever
-- the patient already saw their own.

-- ─── schema ────────────────────────────────────────────────────────────
alter table public.patients
  alter column profile_id drop not null;

alter table public.patients
  add column if not exists guardian_profile_id uuid
    references public.profiles(id) on delete cascade;

alter table public.patients
  add column if not exists full_name text;

alter table public.patients
  add column if not exists relationship text;

alter table public.patients
  drop constraint if exists patients_owner_check;
alter table public.patients
  add constraint patients_owner_check check (
    profile_id is not null or guardian_profile_id is not null
  );

create index if not exists idx_patients_guardian
  on public.patients(guardian_profile_id)
  where guardian_profile_id is not null;

-- ─── helper: every patient_id the current user controls ───────────────
create or replace function public.current_user_patient_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(id), '{}'::uuid[])
  from public.patients
  where profile_id = auth.uid()
     or guardian_profile_id = auth.uid();
$$;

-- ─── patients RLS (guardian-aware) ────────────────────────────────────
drop policy if exists "patients: select own or staff" on public.patients;
create policy "patients: select own or staff" on public.patients
  for select using (
    profile_id = auth.uid()
    or guardian_profile_id = auth.uid()
    or public.current_user_role() in ('admin','doctor','nurse','receptionist')
  );

-- Replaces both migration 001's "insert self" and migration 012's
-- "insert by self or clinic staff" — guardian can also insert dependents.
drop policy if exists "patients: insert self" on public.patients;
drop policy if exists "patients: insert by self or clinic staff" on public.patients;
drop policy if exists "patients: insert by self or clinic staff or guardian" on public.patients;
create policy "patients: insert by self or clinic staff or guardian" on public.patients
  for insert with check (
    profile_id = auth.uid()
    or guardian_profile_id = auth.uid()
    or public.current_user_role() in ('admin','doctor','nurse','receptionist')
  );

drop policy if exists "patients: update own or staff" on public.patients;
drop policy if exists "patients: update own or staff or guardian" on public.patients;
create policy "patients: update own or staff or guardian" on public.patients
  for update using (
    profile_id = auth.uid()
    or guardian_profile_id = auth.uid()
    or public.current_user_role() in ('admin','doctor','nurse')
  );

-- Delete is new — only the guardian can remove their dependent rows, and
-- only rows that have no own profile (a real adult should never be deleted
-- here; their account dies via auth.users cascade).
drop policy if exists "patients: delete by guardian" on public.patients;
create policy "patients: delete by guardian" on public.patients
  for delete using (
    profile_id is null
    and guardian_profile_id = auth.uid()
  );

-- ─── appointments RLS (now guardian-aware via the array helper) ───────
drop policy if exists "appointments: select own or staff" on public.appointments;
create policy "appointments: select own or staff" on public.appointments
  for select using (
    patient_id = ANY(public.current_user_patient_ids())
    or doctor_id = auth.uid()
    or (clinic_id is not null and clinic_id = public.current_user_clinic())
  );

drop policy if exists "appointments: insert by patient or staff" on public.appointments;
create policy "appointments: insert by patient or staff" on public.appointments
  for insert with check (
    patient_id = ANY(public.current_user_patient_ids())
    or public.current_user_role() in ('admin','doctor','receptionist')
  );

drop policy if exists "appointments: update by doctor or staff" on public.appointments;
create policy "appointments: update by doctor or staff" on public.appointments
  for update using (
    doctor_id = auth.uid()
    or public.current_user_role() in ('admin','receptionist')
    or patient_id = ANY(public.current_user_patient_ids())
  );

-- ─── consultations RLS ───────────────────────────────────────────────
drop policy if exists "consultations: select own or doctor" on public.consultations;
create policy "consultations: select own or doctor" on public.consultations
  for select using (
    patient_id = ANY(public.current_user_patient_ids())
    or doctor_id = auth.uid()
  );

drop policy if exists "consultations: insert by patient" on public.consultations;
create policy "consultations: insert by patient" on public.consultations
  for insert with check (
    patient_id = ANY(public.current_user_patient_ids())
  );

drop policy if exists "consultations: update by participant" on public.consultations;
create policy "consultations: update by participant" on public.consultations
  for update using (
    patient_id = ANY(public.current_user_patient_ids())
    or doctor_id = auth.uid()
  );

-- ─── prescriptions ────────────────────────────────────────────────────
drop policy if exists "prescriptions: select own or doctor" on public.prescriptions;
create policy "prescriptions: select own or doctor" on public.prescriptions
  for select using (
    patient_id = ANY(public.current_user_patient_ids())
    or public.current_user_role() in ('admin','doctor','nurse')
  );

-- ─── medical_records ─────────────────────────────────────────────────
drop policy if exists "records: select own or doctor" on public.medical_records;
create policy "records: select own or doctor" on public.medical_records
  for select using (
    patient_id = ANY(public.current_user_patient_ids())
    or public.current_user_role() in ('admin','doctor','nurse')
  );

-- ─── lab_results ─────────────────────────────────────────────────────
drop policy if exists "lab_results: select own or staff" on public.lab_results;
create policy "lab_results: select own or staff" on public.lab_results
  for select using (
    patient_id = ANY(public.current_user_patient_ids())
    or public.current_user_role() in ('admin','doctor','nurse')
  );

-- ─── invoices (migration 008) ────────────────────────────────────────
drop policy if exists "invoices: select own or clinic staff" on public.invoices;
create policy "invoices: select own or clinic staff" on public.invoices
  for select using (
    patient_id = ANY(public.current_user_patient_ids())
    or (clinic_id is not null and clinic_id = public.current_user_clinic())
  );

-- ─── vital_signs (migration 014) ─────────────────────────────────────
drop policy if exists "vital_signs: select own or staff" on public.vital_signs;
create policy "vital_signs: select own or staff" on public.vital_signs
  for select using (
    patient_id = ANY(public.current_user_patient_ids())
    or public.current_user_role() in ('admin','doctor','nurse')
  );

comment on column public.patients.guardian_profile_id is
  'When set, this is a dependent patient managed by the given profile (their guardian/tutor). Dependents have no profile_id (no login).';
comment on function public.current_user_patient_ids() is
  'Array of all patient_ids the current auth user controls (their own + all dependents). Used in RLS so guardian queries surface dependent data.';
