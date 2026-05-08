-- =============================================================================
-- 010 · Prevent self-elevation of role/clinic_id on profiles
-- =============================================================================
-- The base "profiles: update self" policy lets a user update any column on
-- their own row — including `role` and `clinic_id`. That's a privilege
-- escalation: a patient could promote themselves to admin.
--
-- We can't constrain it via RLS alone (RLS WITH CHECK doesn't compare to OLD).
-- Instead, a BEFORE UPDATE trigger raises an exception when role/clinic_id
-- change AND the change is being made by the row's owner who isn't already
-- an admin. Admin-on-admin and admin-on-other-staff updates still work via
-- the "profiles: admin manage clinic staff" policy from migration 009.
-- =============================================================================

create or replace function public.prevent_self_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  acting_role user_role;
begin
  if new.role is distinct from old.role
     or new.clinic_id is distinct from old.clinic_id then
    select role into acting_role from public.profiles where id = auth.uid();
    if auth.uid() = old.id and coalesce(acting_role, 'patient') <> 'admin' then
      raise exception 'Não tem permissão para alterar a função ou clínica.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_no_self_elevate on public.profiles;
create trigger trg_profiles_no_self_elevate
  before update on public.profiles
  for each row execute function public.prevent_self_role_change();
