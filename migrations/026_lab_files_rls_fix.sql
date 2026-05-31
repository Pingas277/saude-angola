-- 026_lab_files_rls_fix.sql
-- Fix the storage policies from migration 025.
--
-- The original policies tried to gate access by matching the staff's
-- profiles.clinic_id with the patient's profiles.clinic_id. That's wrong:
-- clinic_id on profiles is a STAFF-only field — patients can book with
-- multiple clinics, so they have no single "home clinic". The result was
-- every upload failing with "new row violates row-level security policy".
--
-- Mirror the existing public.lab_results RLS (defined in migration 001)
-- instead: simple role check via the same helper used everywhere else.

drop policy if exists "lab-files: patient read own" on storage.objects;
drop policy if exists "lab-files: staff read for clinic patients" on storage.objects;
drop policy if exists "lab-files: staff upload for clinic patients" on storage.objects;

-- Read: the patient (identified by the path prefix = their patient_id) OR
-- any clinical staff (matches lab_results SELECT).
create policy "lab-files: patient or staff read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lab-files'
    and (
      public.current_user_role() in ('admin', 'doctor', 'nurse', 'receptionist')
      or exists (
        select 1
        from public.patients p
        where p.profile_id = auth.uid()
          and p.id::text = split_part(name, '/', 1)
      )
    )
  );

-- Write: clinical staff only (matches lab_results INSERT — admin/doctor/nurse).
create policy "lab-files: staff upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'lab-files'
    and public.current_user_role() in ('admin', 'doctor', 'nurse')
  );

-- Still no UPDATE/DELETE policy: lab results stay append-only.
