-- =============================================================================
-- 021 · Lunga staff flag + admin inbox access
-- =============================================================================
-- contact_messages and clinic_leads are platform-level (Lunga's), not
-- clinic-level. A clinic admin must NOT see them. There is no "Lunga staff"
-- concept yet, so we add one: profiles.is_lunga_staff.
--
-- It is set ONLY via a direct DB change (Supabase Studio) — never through the
-- app. The self-elevation guard from migration 010 is extended to enforce
-- that: any authenticated app user changing is_lunga_staff is rejected.
--
-- With the flag in place, Lunga staff get SELECT + UPDATE on the two inbox
-- tables (everyone else still has insert-only, no read).
-- =============================================================================

alter table public.profiles
  add column if not exists is_lunga_staff boolean not null default false;

-- Helper: is the current user Lunga staff?
create or replace function public.is_lunga_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_lunga_staff from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Extend the self-elevation guard: is_lunga_staff can never be changed by an
-- app user (auth.uid() is not null). Only a direct DB / Studio change can.
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

  if new.is_lunga_staff is distinct from old.is_lunga_staff
     and auth.uid() is not null then
    raise exception 'Não tem permissão para alterar este campo.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- contact_messages — Lunga staff can read + update.
drop policy if exists "contact_messages_select_staff" on public.contact_messages;
create policy "contact_messages_select_staff" on public.contact_messages
  for select to authenticated using (public.is_lunga_staff());

drop policy if exists "contact_messages_update_staff" on public.contact_messages;
create policy "contact_messages_update_staff" on public.contact_messages
  for update to authenticated
  using (public.is_lunga_staff())
  with check (public.is_lunga_staff());

-- clinic_leads — Lunga staff can read + update.
drop policy if exists "clinic_leads_select_staff" on public.clinic_leads;
create policy "clinic_leads_select_staff" on public.clinic_leads
  for select to authenticated using (public.is_lunga_staff());

drop policy if exists "clinic_leads_update_staff" on public.clinic_leads;
create policy "clinic_leads_update_staff" on public.clinic_leads
  for update to authenticated
  using (public.is_lunga_staff())
  with check (public.is_lunga_staff());
