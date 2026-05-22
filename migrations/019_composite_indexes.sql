-- Composite indexes for the hot query paths.
--
-- The schema already has single-column indexes (patient_id, doctor_id,
-- clinic_id, scheduled_at, status, …). But almost every page filters by
-- an owner column AND range/order by a date column at the same time —
-- e.g. "appointments for patient X, ordered by scheduled_at". A composite
-- index on (owner, date) serves those in one index scan instead of
-- combining two single-column indexes via a bitmap.
--
-- Purely additive — safe to run on a populated database. Existing
-- single-column indexes are kept (they still help other queries).

-- ── appointments ──────────────────────────────────────────────────────
-- /painel/consultas: patient's appointments by date.
create index if not exists idx_appointments_patient_sched
  on public.appointments (patient_id, scheduled_at);

-- /medico, /medico/agenda, busy-slots: a doctor's appointments by date.
create index if not exists idx_appointments_doctor_sched
  on public.appointments (doctor_id, scheduled_at);

-- /clinica, /clinica/agenda: a clinic's appointments by date.
create index if not exists idx_appointments_clinic_sched
  on public.appointments (clinic_id, scheduled_at);

-- ── invoices ──────────────────────────────────────────────────────────
-- /clinica/faturas: a clinic's invoices, newest first.
create index if not exists idx_invoices_clinic_created
  on public.invoices (clinic_id, created_at desc);

-- /clinica home: clinic invoices filtered by status (paid/pending/overdue).
create index if not exists idx_invoices_clinic_status
  on public.invoices (clinic_id, status);

-- /painel/faturas: a patient's invoices, newest first.
create index if not exists idx_invoices_patient_created
  on public.invoices (patient_id, created_at desc);

-- ── prescriptions ─────────────────────────────────────────────────────
-- /painel/receitas: a patient's prescriptions, newest first.
create index if not exists idx_prescriptions_patient_issued
  on public.prescriptions (patient_id, issued_at desc);

-- /medico week summary: a doctor's prescriptions in a date range.
create index if not exists idx_prescriptions_doctor_issued
  on public.prescriptions (doctor_id, issued_at desc);

-- ── lab_results ───────────────────────────────────────────────────────
-- /painel/exames: a patient's lab results, newest first.
create index if not exists idx_lab_patient_date
  on public.lab_results (patient_id, result_date desc);

-- ── profiles ──────────────────────────────────────────────────────────
-- /clinica/equipa: a clinic's staff, filtered/ordered by role.
create index if not exists idx_profiles_clinic_role
  on public.profiles (clinic_id, role);
