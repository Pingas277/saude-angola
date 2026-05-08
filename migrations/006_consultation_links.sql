-- =============================================================================
-- 006 · Link medical_records and prescriptions to telemedicine consultations
-- =============================================================================
-- Today both tables only link to appointments (clinic / scheduled flow).
-- Telemedicine consultations live in `consultations` and need their own FK so
-- the doctor can write a record and issue a receita during a video call.
-- The columns are nullable: an encounter is either an appointment or a
-- consultation, never both.
-- =============================================================================

alter table public.medical_records
  add column if not exists consultation_id uuid
    references public.consultations(id) on delete set null;
create index if not exists idx_records_consultation
  on public.medical_records(consultation_id);

alter table public.prescriptions
  add column if not exists consultation_id uuid
    references public.consultations(id) on delete set null;
create index if not exists idx_prescriptions_consultation
  on public.prescriptions(consultation_id);
