-- 028_notification_triggers.sql
-- Fan-out triggers that create rows in public.notifications when source
-- tables get new rows. All functions are SECURITY DEFINER so they bypass
-- RLS to write into a table the trigger's caller (a patient creating an
-- appointment, a doctor uploading a result, etc.) cannot write to directly.

-- ── Helper: resolve a patient_id → that patient's profile_id ───────────
create or replace function public.patient_profile_id(patient_uuid uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select profile_id from public.patients where id = patient_uuid;
$$;

-- ── Lab results → notify the patient ───────────────────────────────────
create or replace function public.notify_on_lab_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  patient_profile uuid;
begin
  patient_profile := public.patient_profile_id(new.patient_id);
  if patient_profile is null then return new; end if;
  insert into public.notifications (profile_id, type, title, body, link)
  values (
    patient_profile,
    'lab_result',
    'Novo resultado de exame',
    new.lab_name || coalesce(' · ' || new.test_name, ''),
    '/painel/exames'
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_lab_result on public.lab_results;
create trigger trg_notify_lab_result
  after insert on public.lab_results
  for each row execute function public.notify_on_lab_result();

-- ── Prescriptions → notify the patient ─────────────────────────────────
create or replace function public.notify_on_prescription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  patient_profile uuid;
begin
  patient_profile := public.patient_profile_id(new.patient_id);
  if patient_profile is null then return new; end if;
  insert into public.notifications (profile_id, type, title, body, link)
  values (
    patient_profile,
    'prescription',
    'Nova receita disponível',
    'Pode descarregar a receita com código QR para a farmácia.',
    '/painel/receitas'
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_prescription on public.prescriptions;
create trigger trg_notify_prescription
  after insert on public.prescriptions
  for each row execute function public.notify_on_prescription();

-- ── Appointments → notify both the patient and the doctor ──────────────
create or replace function public.notify_on_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  patient_profile uuid;
  doctor_name text;
  scheduled_label text;
begin
  patient_profile := public.patient_profile_id(new.patient_id);
  scheduled_label := to_char(new.scheduled_at at time zone 'Africa/Luanda',
                             'DD/MM "às" HH24:MI');

  -- Notify the patient — confirms the booking exists.
  if patient_profile is not null then
    select 'Dr(a). ' || full_name into doctor_name
      from public.profiles where id = new.doctor_id;
    insert into public.notifications (profile_id, type, title, body, link)
    values (
      patient_profile,
      'appointment',
      'Consulta marcada',
      coalesce(doctor_name, 'Médico') || ' · ' || scheduled_label,
      '/painel/consultas'
    );
  end if;

  -- Notify the doctor — they have a new appointment to handle.
  if new.doctor_id is not null then
    insert into public.notifications (profile_id, type, title, body, link)
    values (
      new.doctor_id,
      'appointment',
      'Nova consulta marcada',
      scheduled_label,
      '/medico/agenda'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_appointment on public.appointments;
create trigger trg_notify_appointment
  after insert on public.appointments
  for each row execute function public.notify_on_appointment();

-- ── Invoices → notify the patient ──────────────────────────────────────
create or replace function public.notify_on_invoice()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  patient_profile uuid;
begin
  patient_profile := public.patient_profile_id(new.patient_id);
  if patient_profile is null then return new; end if;
  insert into public.notifications (profile_id, type, title, body, link)
  values (
    patient_profile,
    'invoice',
    'Nova fatura',
    'Tem uma fatura no valor de ' ||
      to_char(new.amount, 'FM999G999G999') || ' Kz para pagamento.',
    '/painel/faturas'
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_invoice on public.invoices;
create trigger trg_notify_invoice
  after insert on public.invoices
  for each row execute function public.notify_on_invoice();
