-- =============================================================================
-- 001 · Initial schema for Angola Health Platform
-- Clinic Management (B2B) + Telemedicine (B2C)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin create type user_role as enum ('admin','doctor','nurse','receptionist','patient'); exception when duplicate_object then null; end $$;
do $$ begin create type subscription_plan as enum ('basic','standard','premium'); exception when duplicate_object then null; end $$;
do $$ begin create type appointment_status as enum ('scheduled','confirmed','in_progress','completed','cancelled','no_show'); exception when duplicate_object then null; end $$;
do $$ begin create type appointment_type as enum ('in_person','telemedicine'); exception when duplicate_object then null; end $$;
do $$ begin create type consultation_type as enum ('video','chat'); exception when duplicate_object then null; end $$;
do $$ begin create type consultation_status as enum ('scheduled','waiting','in_progress','completed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type invoice_status as enum ('pending','paid','overdue','cancelled','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_method as enum ('multicaixa_express','cash','bank_transfer','card'); exception when duplicate_object then null; end $$;
do $$ begin create type blood_type as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown'); exception when duplicate_object then null; end $$;
do $$ begin create type ai_urgency_level as enum ('low','medium','high','emergency'); exception when duplicate_object then null; end $$;
do $$ begin create type angola_province as enum (
  'Bengo','Benguela','Bie','Cabinda','Cuando Cubango','Cuanza Norte','Cuanza Sul',
  'Cunene','Huambo','Huila','Luanda','Lunda Norte','Lunda Sul','Malanje','Moxico',
  'Namibe','Uige','Zaire'
); exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- updated_at trigger helper
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- -----------------------------------------------------------------------------
-- clinics
-- -----------------------------------------------------------------------------
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  province angola_province,
  phone text,
  email text,
  subscription_plan subscription_plan not null default 'basic',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_clinics_updated_at on public.clinics;
create trigger trg_clinics_updated_at before update on public.clinics
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- profiles  (1:1 with auth.users — replaces a custom users table)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  role user_role not null default 'patient',
  clinic_id uuid references public.clinics(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_clinic on public.profiles(clinic_id);
create index if not exists idx_profiles_role on public.profiles(role);
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile when an auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'patient')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- patients (medical-side data; profile is the user account)
-- -----------------------------------------------------------------------------
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  date_of_birth date,
  blood_type blood_type default 'unknown',
  gender text,
  allergies text[] default '{}',
  chronic_conditions text[] default '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_patients_profile on public.patients(profile_id);
drop trigger if exists trg_patients_updated_at on public.patients;
create trigger trg_patients_updated_at before update on public.patients
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- appointments
-- -----------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  clinic_id uuid references public.clinics(id) on delete set null,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 30,
  status appointment_status not null default 'scheduled',
  appointment_type appointment_type not null default 'in_person',
  reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_appointments_patient on public.appointments(patient_id);
create index if not exists idx_appointments_doctor on public.appointments(doctor_id);
create index if not exists idx_appointments_clinic on public.appointments(clinic_id);
create index if not exists idx_appointments_scheduled on public.appointments(scheduled_at);
create index if not exists idx_appointments_status on public.appointments(status);
drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- medical_records
-- -----------------------------------------------------------------------------
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  appointment_id uuid references public.appointments(id) on delete set null,
  diagnosis text,
  symptoms text,
  notes text,
  vitals jsonb,
  record_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_records_patient on public.medical_records(patient_id);
create index if not exists idx_records_doctor on public.medical_records(doctor_id);
create index if not exists idx_records_date on public.medical_records(record_date desc);
drop trigger if exists trg_records_updated_at on public.medical_records;
create trigger trg_records_updated_at before update on public.medical_records
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- prescriptions
-- -----------------------------------------------------------------------------
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  appointment_id uuid references public.appointments(id) on delete set null,
  medications jsonb not null,
  qr_code text not null unique,
  notes text,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_prescriptions_patient on public.prescriptions(patient_id);
create index if not exists idx_prescriptions_doctor on public.prescriptions(doctor_id);
create index if not exists idx_prescriptions_qr on public.prescriptions(qr_code);
drop trigger if exists trg_prescriptions_updated_at on public.prescriptions;
create trigger trg_prescriptions_updated_at before update on public.prescriptions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- invoices
-- -----------------------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  appointment_id uuid references public.appointments(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'AOA',
  status invoice_status not null default 'pending',
  payment_method payment_method,
  payment_reference text,
  paid_at timestamptz,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_invoices_clinic on public.invoices(clinic_id);
create index if not exists idx_invoices_patient on public.invoices(patient_id);
create index if not exists idx_invoices_status on public.invoices(status);
drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- pharmacy_stock
-- -----------------------------------------------------------------------------
create table if not exists public.pharmacy_stock (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  medication_name text not null,
  generic_name text,
  quantity int not null default 0 check (quantity >= 0),
  minimum_stock int not null default 10,
  unit_price numeric(10,2),
  expiry_date date,
  batch_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_pharmacy_clinic on public.pharmacy_stock(clinic_id);
create index if not exists idx_pharmacy_expiry on public.pharmacy_stock(expiry_date);
create index if not exists idx_pharmacy_low_stock on public.pharmacy_stock(clinic_id) where quantity <= minimum_stock;
drop trigger if exists trg_pharmacy_updated_at on public.pharmacy_stock;
create trigger trg_pharmacy_updated_at before update on public.pharmacy_stock
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- consultations (telemedicine — video / chat)
-- -----------------------------------------------------------------------------
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid references public.profiles(id) on delete set null,
  consultation_type consultation_type not null default 'video',
  status consultation_status not null default 'scheduled',
  video_room_url text,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  ai_triage_summary text,
  ai_urgency ai_urgency_level,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_consultations_patient on public.consultations(patient_id);
create index if not exists idx_consultations_doctor on public.consultations(doctor_id);
create index if not exists idx_consultations_status on public.consultations(status);
drop trigger if exists trg_consultations_updated_at on public.consultations;
create trigger trg_consultations_updated_at before update on public.consultations
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- lab_results
-- -----------------------------------------------------------------------------
create table if not exists public.lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  lab_name text not null,
  test_name text,
  file_url text,
  result_summary text,
  result_date date,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_lab_patient on public.lab_results(patient_id);
create index if not exists idx_lab_date on public.lab_results(result_date desc);
drop trigger if exists trg_lab_updated_at on public.lab_results;
create trigger trg_lab_updated_at before update on public.lab_results
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================

-- Helper: get the role of the current user without recursion in RLS.
create or replace function public.current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_clinic()
returns uuid language sql stable security definer set search_path = public as $$
  select clinic_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_patient_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.patients where profile_id = auth.uid();
$$;

-- Enable RLS everywhere
alter table public.clinics         enable row level security;
alter table public.profiles        enable row level security;
alter table public.patients        enable row level security;
alter table public.appointments    enable row level security;
alter table public.medical_records enable row level security;
alter table public.prescriptions   enable row level security;
alter table public.invoices        enable row level security;
alter table public.pharmacy_stock  enable row level security;
alter table public.consultations   enable row level security;
alter table public.lab_results     enable row level security;

-- profiles
drop policy if exists "profiles: read self or same clinic" on public.profiles;
create policy "profiles: read self or same clinic" on public.profiles
  for select using (
    id = auth.uid()
    or (clinic_id is not null and clinic_id = public.current_user_clinic())
  );
drop policy if exists "profiles: update self" on public.profiles;
create policy "profiles: update self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- clinics: any authenticated user can read; only admins of that clinic can update
drop policy if exists "clinics: read authenticated" on public.clinics;
create policy "clinics: read authenticated" on public.clinics
  for select to authenticated using (true);
drop policy if exists "clinics: admin update own" on public.clinics;
create policy "clinics: admin update own" on public.clinics
  for update using (id = public.current_user_clinic() and public.current_user_role() = 'admin')
  with check (id = public.current_user_clinic() and public.current_user_role() = 'admin');

-- patients: own row, plus clinic staff of any role except 'patient'
drop policy if exists "patients: own or clinic staff" on public.patients;
create policy "patients: own or clinic staff" on public.patients
  for select using (
    profile_id = auth.uid()
    or public.current_user_role() in ('admin','doctor','nurse','receptionist')
  );
drop policy if exists "patients: insert self" on public.patients;
create policy "patients: insert self" on public.patients
  for insert with check (profile_id = auth.uid());
drop policy if exists "patients: update own or staff" on public.patients;
create policy "patients: update own or staff" on public.patients
  for update using (
    profile_id = auth.uid()
    or public.current_user_role() in ('admin','doctor','nurse')
  );

-- appointments: patient, doctor, or clinic staff
drop policy if exists "appointments: select own or staff" on public.appointments;
create policy "appointments: select own or staff" on public.appointments
  for select using (
    patient_id = public.current_patient_id()
    or doctor_id = auth.uid()
    or (clinic_id is not null and clinic_id = public.current_user_clinic())
  );
drop policy if exists "appointments: insert by patient or staff" on public.appointments;
create policy "appointments: insert by patient or staff" on public.appointments
  for insert with check (
    patient_id = public.current_patient_id()
    or public.current_user_role() in ('admin','doctor','receptionist')
  );
drop policy if exists "appointments: update by doctor or staff" on public.appointments;
create policy "appointments: update by doctor or staff" on public.appointments
  for update using (
    doctor_id = auth.uid()
    or public.current_user_role() in ('admin','receptionist')
    or patient_id = public.current_patient_id()
  );

-- medical_records: patient (read), doctor (read/write), clinic doctors (read)
drop policy if exists "records: select own or doctor" on public.medical_records;
create policy "records: select own or doctor" on public.medical_records
  for select using (
    patient_id = public.current_patient_id()
    or doctor_id = auth.uid()
    or public.current_user_role() in ('admin','doctor','nurse')
  );
drop policy if exists "records: insert by doctor" on public.medical_records;
create policy "records: insert by doctor" on public.medical_records
  for insert with check (public.current_user_role() in ('doctor','nurse'));
drop policy if exists "records: update by author" on public.medical_records;
create policy "records: update by author" on public.medical_records
  for update using (doctor_id = auth.uid());

-- prescriptions
drop policy if exists "prescriptions: select own or doctor" on public.prescriptions;
create policy "prescriptions: select own or doctor" on public.prescriptions
  for select using (
    patient_id = public.current_patient_id()
    or doctor_id = auth.uid()
  );
drop policy if exists "prescriptions: insert by doctor" on public.prescriptions;
create policy "prescriptions: insert by doctor" on public.prescriptions
  for insert with check (public.current_user_role() = 'doctor' and doctor_id = auth.uid());

-- invoices
drop policy if exists "invoices: select own or clinic staff" on public.invoices;
create policy "invoices: select own or clinic staff" on public.invoices
  for select using (
    patient_id = public.current_patient_id()
    or clinic_id = public.current_user_clinic()
  );
drop policy if exists "invoices: write by clinic staff" on public.invoices;
create policy "invoices: write by clinic staff" on public.invoices
  for all using (
    clinic_id = public.current_user_clinic()
    and public.current_user_role() in ('admin','receptionist')
  )
  with check (
    clinic_id = public.current_user_clinic()
    and public.current_user_role() in ('admin','receptionist')
  );

-- pharmacy_stock: clinic staff only
drop policy if exists "pharmacy: clinic staff" on public.pharmacy_stock;
create policy "pharmacy: clinic staff" on public.pharmacy_stock
  for all using (
    clinic_id = public.current_user_clinic()
    and public.current_user_role() in ('admin','doctor','nurse','receptionist')
  )
  with check (
    clinic_id = public.current_user_clinic()
    and public.current_user_role() in ('admin','doctor','nurse','receptionist')
  );

-- consultations
drop policy if exists "consultations: select own or doctor" on public.consultations;
create policy "consultations: select own or doctor" on public.consultations
  for select using (
    patient_id = public.current_patient_id()
    or doctor_id = auth.uid()
  );
drop policy if exists "consultations: insert by patient" on public.consultations;
create policy "consultations: insert by patient" on public.consultations
  for insert with check (patient_id = public.current_patient_id());
drop policy if exists "consultations: update by participant" on public.consultations;
create policy "consultations: update by participant" on public.consultations
  for update using (
    patient_id = public.current_patient_id()
    or doctor_id = auth.uid()
  );

-- lab_results
drop policy if exists "lab_results: select own or staff" on public.lab_results;
create policy "lab_results: select own or staff" on public.lab_results
  for select using (
    patient_id = public.current_patient_id()
    or public.current_user_role() in ('admin','doctor','nurse')
  );
drop policy if exists "lab_results: insert by staff" on public.lab_results;
create policy "lab_results: insert by staff" on public.lab_results
  for insert with check (public.current_user_role() in ('admin','doctor','nurse'));
