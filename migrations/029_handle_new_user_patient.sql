-- 029_handle_new_user_patient.sql
-- Extend handle_new_user so the patient row is created at signup with the
-- BI carried in auth metadata.
--
-- Previously the trigger only inserted into profiles; the patients row was
-- created later when the user filled /perfil?onboarding=1. Now that BI is
-- mandatory at signup, doing the patients insert here is both simpler and
-- safer: the signup server action can pass id_number via options.data and
-- not worry about session/cookie timing between auth.signUp and the
-- subsequent client query (which doesn't yet see the new auth.uid()).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_bi   text;
begin
  v_role := coalesce(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'patient'
  );
  v_bi := nullif(
    trim(coalesce(new.raw_user_meta_data->>'id_number', '')),
    ''
  );

  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'phone',
    v_role
  )
  on conflict (id) do nothing;

  -- Patient role → also create the medical-side row, stamping the BI from
  -- metadata. Older non-patient roles (admin/doctor/etc.) don't get a
  -- patients row.
  if v_role = 'patient' then
    insert into public.patients (profile_id, id_number)
    values (new.id, v_bi)
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;
