-- =============================================================================
-- Migration 032: Emergency Card (MVP)
-- =============================================================================
-- Public read-only access to a controlled subset of a patient row, used to
-- power the emergency QR feature (Roadmap D5). A paramedic / ER doctor
-- scans the patient's QR with their phone and immediately sees the info
-- that matters in an unconscious-patient scenario: first name + age,
-- blood type, allergies, chronic conditions, emergency contact.
--
-- Explicit NON-goals at the data layer:
--   - id_number (BI) is never returned
--   - profile email, own phone are never returned
--   - clinical history, prescriptions, invoices, exams are never returned
--
-- The function is SECURITY DEFINER so it runs as the owner (postgres) and
-- bypasses the patients-table RLS in a controlled, auditable way. The
-- caller still needs to know the patient.id uuid — there's no list,
-- enumerate, or guess endpoint.
--
-- Future hardening (in roadmap D5): replace the patient.id with a separate
-- regenerable emergency_token uuid + an opt-in toggle + an audit log of
-- every scan. This MVP omits those so the feature can ship and the user
-- can validate the UX end-to-end.

create or replace function public.emergency_card(p_patient_id uuid)
returns table (
  first_name text,
  age integer,
  blood_type text,
  gender text,
  allergies text[],
  chronic_conditions text[],
  emergency_contact_name text,
  emergency_contact_phone text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    -- First name only — own-patient name lives on profiles.full_name,
    -- dependent name lives on patients.full_name. Either way, expose only
    -- the first word so the emergency view doesn't leak the surname.
    coalesce(
      split_part(pr.full_name, ' ', 1),
      split_part(pt.full_name, ' ', 1),
      '—'
    ) as first_name,
    case
      when pt.date_of_birth is null then null
      else extract(year from age(pt.date_of_birth))::int
    end as age,
    pt.blood_type::text,
    pt.gender,
    pt.allergies,
    pt.chronic_conditions,
    pt.emergency_contact_name,
    pt.emergency_contact_phone
  from public.patients pt
  left join public.profiles pr on pr.id = pt.profile_id
  where pt.id = p_patient_id
  limit 1;
$$;

-- Anyone — including the anon role used by the public /e/<id> route —
-- can call this function. The function itself decides what to return.
grant execute on function public.emergency_card(uuid) to anon, authenticated;
