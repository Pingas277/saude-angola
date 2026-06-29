-- =============================================================================
-- Migration 036: patient_contact_internal RPC
-- =============================================================================
-- Used by server actions that issue prescriptions / lab results / invoices
-- and need to email the patient. Those actions run as the DOCTOR (or
-- receptionist/nurse/admin), whose RLS scope can't see auth.users.email.
--
-- SECURITY DEFINER lets the function read the email from auth.users in a
-- controlled way. The caller-side check `current_user_role() in (…staff…)`
-- gates anyone who isn't authenticated as a Lunga staff role — patients
-- never have this role, so they can't enumerate other patients' emails.
--
-- Returns the guardian's email when the patient is a dependent (no
-- profile_id of their own) so receipt notifications still reach an inbox.

create or replace function public.patient_contact_internal(p_patient_id uuid)
returns table (full_name text, email text)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(pr.full_name, pt.full_name) as full_name,
    u.email::text as email
  from public.patients pt
  left join public.profiles pr on pr.id = pt.profile_id
  left join auth.users u on u.id = coalesce(pt.profile_id, pt.guardian_profile_id)
  where pt.id = p_patient_id
    and public.current_user_role() in ('doctor', 'admin', 'receptionist', 'nurse');
$$;

grant execute on function public.patient_contact_internal(uuid) to authenticated;
