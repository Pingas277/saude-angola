-- =============================================================================
-- 007 · Clinical identifiers — medical license, patient BI/NIF, clinic logo
-- =============================================================================
-- Required for medico-legal validity of receitas in Angola:
--   · doctors must show their cédula profissional (Ordem dos Médicos)
--   · patients must be identifiable by BI (Bilhete de Identidade) or NIF
--   · clinics include their logo for brand recognition
-- All fields are nullable so existing rows aren't broken.
-- =============================================================================

alter table public.profiles
  add column if not exists medical_license text,
  add column if not exists specialty text;

alter table public.patients
  add column if not exists id_number text;

alter table public.clinics
  add column if not exists logo_url text;
