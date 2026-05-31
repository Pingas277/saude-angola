-- 025_lab_files_bucket.sql
-- Private storage bucket for lab/exam result files (PDFs, images).
--
-- Why PRIVATE: exam results are sensitive medical data (Lei 22/11 special
-- category). The `avatars` bucket from migration 016 is public, which is
-- fine for profile pictures but NOT for medical PDFs. Files here are served
-- via short-lived signed URLs generated server-side at render time.
--
-- Object key convention used by the upload action:
--   <patient_uuid>/<timestamp>-<original-filename>
-- This lets RLS use split_part(name, '/', 1) to check the patient owner.

insert into storage.buckets (id, name, public)
values ('lab-files', 'lab-files', false)
on conflict (id) do nothing;

-- ── Read: the patient themselves, plus any staff who can read the
-- corresponding lab_results row (the lab_results RLS already encodes the
-- "own or staff" rule, so we mirror it by looking the row up).
drop policy if exists "lab-files: patient read own" on storage.objects;
create policy "lab-files: patient read own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lab-files'
    and exists (
      select 1
      from public.patients p
      where p.profile_id = auth.uid()
        and p.id::text = split_part(name, '/', 1)
    )
  );

drop policy if exists "lab-files: staff read for clinic patients" on storage.objects;
create policy "lab-files: staff read for clinic patients" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lab-files'
    and exists (
      select 1
      from public.profiles me
      join public.patients pt on pt.id::text = split_part(storage.objects.name, '/', 1)
      join public.profiles patient_profile on patient_profile.id = pt.profile_id
      where me.id = auth.uid()
        and me.role in ('doctor', 'nurse', 'receptionist', 'admin')
        and me.clinic_id is not null
        and me.clinic_id = patient_profile.clinic_id
    )
  );

-- ── Write: only clinic staff (doctor/nurse/receptionist/admin) AND only for
-- a patient that belongs to their clinic. Same rule as lab_results INSERT.
drop policy if exists "lab-files: staff upload for clinic patients" on storage.objects;
create policy "lab-files: staff upload for clinic patients" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'lab-files'
    and exists (
      select 1
      from public.profiles me
      join public.patients pt on pt.id::text = split_part(storage.objects.name, '/', 1)
      join public.profiles patient_profile on patient_profile.id = pt.profile_id
      where me.id = auth.uid()
        and me.role in ('doctor', 'nurse', 'receptionist', 'admin')
        and me.clinic_id is not null
        and me.clinic_id = patient_profile.clinic_id
    )
  );

-- Deliberately no UPDATE/DELETE policy: lab results are append-only;
-- corrections happen by uploading a new row, not editing.

comment on column public.lab_results.file_url is
  'Storage path inside the lab-files bucket (e.g. "<patient_id>/123-result.pdf"). Older rows may contain a full https:// URL — readers must handle both.';
