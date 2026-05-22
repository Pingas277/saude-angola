-- =============================================================================
-- 020 · Guard invoice updates against patient tampering
-- =============================================================================
-- The "invoices: patient mark paid" policy (migration 008) lets a patient
-- UPDATE their own invoice. RLS WITH CHECK only confirms the row still
-- belongs to them — it cannot compare NEW vs OLD, so as written a patient
-- could PATCH the PostgREST endpoint directly with their JWT and set
-- { amount: 0, status: 'paid' } without paying.
--
-- The mockPayMulticaixaAction server action already does the right thing,
-- but RLS is the last line of defence and must not depend on the app code.
--
-- Same fix shape as migration 010 (self-elevation): a BEFORE UPDATE trigger.
-- When the acting user is a patient, they may only:
--   • settle a still-open invoice  (pending/overdue → paid)
--   • cancel a still-open invoice  (pending/overdue → cancelled)
--   • set payment_method / payment_reference / paid_at
-- They may NOT touch amount, currency, the linked ids, due_date or created_at.
-- Clinic staff (admin/doctor/nurse/receptionist) are unaffected — they manage
-- invoices legitimately.
-- =============================================================================

create or replace function public.guard_invoice_patient_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  acting_role user_role;
begin
  select role into acting_role from public.profiles where id = auth.uid();

  -- Only constrain patients. coalesce → treat an unknown actor as a patient
  -- (most restrictive).
  if coalesce(acting_role, 'patient') = 'patient' then
    if new.amount         is distinct from old.amount
       or new.currency    is distinct from old.currency
       or new.patient_id  is distinct from old.patient_id
       or new.clinic_id   is distinct from old.clinic_id
       or new.appointment_id  is distinct from old.appointment_id
       or new.consultation_id is distinct from old.consultation_id
       or new.due_date    is distinct from old.due_date
       or new.created_at  is distinct from old.created_at then
      raise exception 'Não pode alterar os dados desta fatura.'
        using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
      if old.status not in ('pending', 'overdue')
         or new.status not in ('paid', 'cancelled') then
        raise exception 'Transição de estado da fatura não permitida.'
          using errcode = '42501';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_invoices_guard_patient on public.invoices;
create trigger trg_invoices_guard_patient
  before update on public.invoices
  for each row execute function public.guard_invoice_patient_update();
