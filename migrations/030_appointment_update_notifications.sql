-- 030_appointment_update_notifications.sql
-- Fan-out notifications when an existing appointment changes:
--   * status flips to 'cancelled'    → notify patient + doctor ("Consulta cancelada")
--   * scheduled_at moves to a new time → notify patient + doctor ("Consulta reagendada")
--
-- INSERT-time notifications are already handled by notify_on_appointment
-- in migration 028. This trigger covers the post-creation lifecycle
-- changes that the patient now drives from /painel/consultas.

create or replace function public.notify_on_appointment_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  patient_profile uuid;
  doctor_name     text;
  scheduled_label text;
  is_cancel       boolean;
  is_reschedule   boolean;
begin
  is_cancel := new.status = 'cancelled'
               and old.status is distinct from 'cancelled';
  is_reschedule := new.scheduled_at is distinct from old.scheduled_at;

  if not is_cancel and not is_reschedule then
    return new;
  end if;

  patient_profile := public.patient_profile_id(new.patient_id);
  scheduled_label := to_char(
    new.scheduled_at at time zone 'Africa/Luanda',
    'DD/MM "às" HH24:MI'
  );

  if new.doctor_id is not null then
    select 'Dr(a). ' || full_name into doctor_name
      from public.profiles where id = new.doctor_id;
  end if;

  if is_cancel then
    if patient_profile is not null then
      insert into public.notifications (profile_id, type, title, body, link)
      values (
        patient_profile,
        'appointment',
        'Consulta cancelada',
        coalesce(doctor_name, 'Médico') || ' · ' || scheduled_label,
        '/painel/consultas'
      );
    end if;
    if new.doctor_id is not null then
      insert into public.notifications (profile_id, type, title, body, link)
      values (
        new.doctor_id,
        'appointment',
        'Consulta cancelada pelo paciente',
        scheduled_label,
        '/medico/agenda'
      );
    end if;
  elsif is_reschedule then
    if patient_profile is not null then
      insert into public.notifications (profile_id, type, title, body, link)
      values (
        patient_profile,
        'appointment',
        'Consulta reagendada',
        coalesce(doctor_name, 'Médico') || ' · ' || scheduled_label,
        '/painel/consultas'
      );
    end if;
    if new.doctor_id is not null then
      insert into public.notifications (profile_id, type, title, body, link)
      values (
        new.doctor_id,
        'appointment',
        'Consulta reagendada',
        scheduled_label,
        '/medico/agenda'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_appointment_update on public.appointments;
create trigger trg_notify_appointment_update
  after update on public.appointments
  for each row execute function public.notify_on_appointment_update();
