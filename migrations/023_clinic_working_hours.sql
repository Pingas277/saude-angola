-- 023_clinic_working_hours.sql
-- Per-weekday working hours for clinics.
--
-- Stored as JSONB keyed by JS getDay() (0=Sunday .. 6=Saturday). Each value
-- is { "open": "HH:MM", "close": "HH:MM" } when the clinic is open that day,
-- or null when it's closed. The booking flow generates slots only inside the
-- selected day's window; the doctor search surfaces the weekly schedule.
--
-- Default mirrors a typical Angolan clinic: Mon–Fri 08:00–18:00,
-- Sat 08:00–13:00, Sun closed.

alter table public.clinics
  add column if not exists working_hours jsonb not null default '{
    "0": null,
    "1": {"open": "08:00", "close": "18:00"},
    "2": {"open": "08:00", "close": "18:00"},
    "3": {"open": "08:00", "close": "18:00"},
    "4": {"open": "08:00", "close": "18:00"},
    "5": {"open": "08:00", "close": "18:00"},
    "6": {"open": "08:00", "close": "13:00"}
  }'::jsonb;

comment on column public.clinics.working_hours is
  'Per-weekday hours keyed by JS getDay() (0=Sun..6=Sat). Value {open,close} HH:MM or null when closed.';
