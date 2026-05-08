-- =============================================================================
-- 008 · Invoices linkable to telemedicine consultations + RLS so doctors
--       can issue invoices on their own encounters
-- =============================================================================
-- The invoices table only links to appointments today. Telemedicine
-- consultations need the same FK pattern that medical_records / prescriptions
-- got in 006. Doctors should also be able to INSERT invoices for the
-- encounters they performed (the original policy was clinic-staff-only).
-- =============================================================================

alter table public.invoices
  add column if not exists consultation_id uuid
    references public.consultations(id) on delete set null;
create index if not exists idx_invoices_consultation
  on public.invoices(consultation_id);

-- Make clinic_id nullable so a B2C telemedicine invoice doesn't require a clinic.
alter table public.invoices
  alter column clinic_id drop not null;

-- Allow patients to read their own invoices regardless of clinic_id.
drop policy if exists "invoices: select own or clinic staff" on public.invoices;
create policy "invoices: select own or clinic staff" on public.invoices
  for select using (
    patient_id = public.current_patient_id()
    or (clinic_id is not null and clinic_id = public.current_user_clinic())
  );

-- Allow doctors to insert/update an invoice tied to a consultation or
-- appointment they personally performed. The base "invoices: write by
-- clinic staff" policy still covers admin / receptionist clinic flows.
drop policy if exists "invoices: write by encounter doctor" on public.invoices;
create policy "invoices: write by encounter doctor" on public.invoices
  for all using (
    public.current_user_role() = 'doctor'
    and (
      (consultation_id is not null and consultation_id in (
        select id from public.consultations where doctor_id = auth.uid()
      ))
      or (appointment_id is not null and appointment_id in (
        select id from public.appointments where doctor_id = auth.uid()
      ))
    )
  )
  with check (
    public.current_user_role() = 'doctor'
    and (
      (consultation_id is not null and consultation_id in (
        select id from public.consultations where doctor_id = auth.uid()
      ))
      or (appointment_id is not null and appointment_id in (
        select id from public.appointments where doctor_id = auth.uid()
      ))
    )
  );

-- Patients need to flip their own invoice to paid when the (mock) Multicaixa
-- callback fires. Restrict to status transition via the WITH CHECK below.
drop policy if exists "invoices: patient mark paid" on public.invoices;
create policy "invoices: patient mark paid" on public.invoices
  for update using (
    patient_id = public.current_patient_id()
  ) with check (
    patient_id = public.current_patient_id()
  );
