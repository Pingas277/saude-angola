-- =============================================================================
-- 014 · Enfermeiro (nurse) — vital signs triage table + nurse RLS
-- =============================================================================
-- The nurse role triages checked-in patients before the doctor sees them:
-- captures vital signs against the appointment so the doctor's consulta is
-- pre-filled. medical_records.doctor_id is NOT NULL, so vitals captured by a
-- nurse (pre-consultation) can't live there — hence a dedicated table.
--
-- Pharmacy stock already has an "all clinic staff incl. nurse" policy from
-- migration 001, so no extra policy is needed for /enfermeiro/farmacia.
-- =============================================================================

create table if not exists public.vital_signs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  recorded_by uuid references public.profiles(id) on delete set null,
  temperature_c numeric(4,1),
  blood_pressure text,
  pulse_bpm int,
  respiratory_rate int,
  oxygen_saturation int,
  weight_kg numeric(5,2),
  height_cm numeric(5,1),
  notes text,
  recorded_at timestamptz not null default now()
);
create index if not exists idx_vitals_appointment on public.vital_signs(appointment_id);
create index if not exists idx_vitals_patient on public.vital_signs(patient_id);

alter table public.vital_signs enable row level security;

-- Clinic staff (admin/doctor/nurse/receptionist) of the same clinic can read
-- and write vitals; the patient can read their own.
drop policy if exists "vitals: clinic staff" on public.vital_signs;
create policy "vitals: clinic staff" on public.vital_signs
  for all using (
    (clinic_id = public.current_user_clinic()
       and public.current_user_role() in ('admin','doctor','nurse','receptionist'))
    or patient_id = public.current_patient_id()
  ) with check (
    clinic_id = public.current_user_clinic()
    and public.current_user_role() in ('admin','doctor','nurse','receptionist')
  );

-- Nurse needs to read patient profiles (names/phones) when working the queue.
-- Patients have clinic_id IS NULL, so the base "read self or same clinic"
-- policy doesn't cover them. Mirror the receptionist read-all from migration
-- 012, scoped to the nurse role only. The role-change trigger from migration
-- 010 still blocks any privilege escalation on writes.
drop policy if exists "profiles: nurse read all" on public.profiles;
create policy "profiles: nurse read all" on public.profiles
  for select using (
    public.current_user_role() = 'nurse'
  );
