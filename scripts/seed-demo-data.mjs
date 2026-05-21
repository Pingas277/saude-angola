#!/usr/bin/env node
// Seeds demo patients, appointments, prescriptions and invoices on top
// of the existing demo clinics + doctors. Idempotent — re-running
// wipes only this script's demo rows (everything tied to the demo
// patients) and re-creates them with fresh dates relative to today.
//
// Usage:  node scripts/seed-demo-data.mjs
// Requires DATABASE_URL + NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.

import { config } from "dotenv";
import { createClient as createSb } from "@supabase/supabase-js";
import pg from "pg";
import { randomUUID } from "node:crypto";

config({ path: ".env.local" });

const DEMO_PASSWORD = "Paciente2026!";

// =============================================================================
// Demo patients
// =============================================================================
const PATIENTS = [
  { name: "Maria João Cardoso", dob: "1992-03-15", gender: "female", blood: "O+",  allergies: ["Penicilina"],          chronic: [],                          phone: "+244 923 100 001" },
  { name: "Eduardo Pinto",      dob: "1985-08-22", gender: "male",   blood: "A+",  allergies: [],                       chronic: [],                          phone: "+244 923 100 002" },
  { name: "Ana Sofia Martins",  dob: "1998-11-04", gender: "female", blood: "B+",  allergies: ["Amendoim", "Marisco"], chronic: [],                          phone: "+244 923 100 003" },
  { name: "Joaquim Silva",      dob: "1973-05-10", gender: "male",   blood: "O-",  allergies: [],                       chronic: ["Diabetes tipo 2"],          phone: "+244 923 100 004" },
  { name: "Helena Lopes",       dob: "1990-12-28", gender: "female", blood: "AB+", allergies: ["Ibuprofeno"],          chronic: [],                          phone: "+244 923 100 005" },
  { name: "Rui Sebastião",      dob: "2001-07-18", gender: "male",   blood: "A-",  allergies: [],                       chronic: [],                          phone: "+244 923 100 006" },
  { name: "Patrícia Mendes",    dob: "1988-02-14", gender: "female", blood: "O+",  allergies: [],                       chronic: ["Hipertensão"],              phone: "+244 923 100 007" },
  { name: "Tomás Capemba",      dob: "1995-09-30", gender: "male",   blood: "B-",  allergies: ["Aspirina"],            chronic: [],                          phone: "+244 923 100 008" },
  { name: "Inês Tati",          dob: "1979-06-25", gender: "female", blood: "O+",  allergies: [],                       chronic: [],                          phone: "+244 923 100 009" },
  { name: "Bernardo Costa",     dob: "2003-01-08", gender: "male",   blood: "A+",  allergies: [],                       chronic: [],                          phone: "+244 923 100 010" },
];

const REASONS = [
  "Dor de cabeça há uma semana",
  "Acompanhamento da tensão arterial",
  "Tosse seca persistente",
  "Acompanhamento de diabetes",
  "Vacinação infantil de rotina",
  "Análises de sangue de rotina",
  "Dor no peito intermitente",
  "Avaliação dermatológica de mancha",
  "Consulta de planeamento familiar",
  "Renovação de receita habitual",
];

const MEDICATIONS = [
  [{ name: "Paracetamol 500 mg", dosage: "1 cp 8/8 h",  duration: "5 dias",  notes: "Se dor ou febre" }],
  [{ name: "Amoxicilina 500 mg",   dosage: "1 cp 8/8 h",  duration: "7 dias",  notes: "Tomar após a refeição" }],
  [{ name: "Losartan 50 mg",       dosage: "1 cp ao dia", duration: "30 dias", notes: "Manhã, com água" }],
  [{ name: "Metformina 850 mg",    dosage: "1 cp 12/12 h",duration: "30 dias", notes: "Com as refeições" }],
  [
    { name: "Ibuprofeno 400 mg", dosage: "1 cp 12/12 h", duration: "3 dias", notes: "Se dor" },
    { name: "Omeprazol 20 mg",   dosage: "1 cp ao dia",  duration: "5 dias", notes: "Jejum, manhã" },
  ],
];

// =============================================================================
// Setup
// =============================================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
if (!SUPABASE_URL || !SUPABASE_KEY || !DATABASE_URL) {
  console.error("Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL.");
  process.exit(1);
}

function emailFor(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z\s]/g, "")
      .trim()
      .replace(/\s+/g, ".") + "@paciente.lunga.local"
  );
}

const pgClient = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await pgClient.connect();

const sb = createSb(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ============================================================================
// Pull existing demo clinics + doctors
// ============================================================================
console.log("— Discovering demo doctors —");
const { rows: doctors } = await pgClient.query(
  `select p.id, p.full_name, p.specialty, p.clinic_id, c.name as clinic_name, c.province
     from public.profiles p
     join public.clinics c on c.id = p.clinic_id
    where p.role = 'doctor'
      and p.medical_license like 'OMA/%'
    order by p.full_name`
);
if (doctors.length === 0) {
  console.error("No demo doctors found. Run 'node scripts/seed-demo-doctors.mjs' first.");
  process.exit(1);
}
console.log(`  found ${doctors.length} doctor(s) across ${new Set(doctors.map((d) => d.clinic_id)).size} clinic(s)`);

// ============================================================================
// Patients (auth users + profiles + patients row)
// ============================================================================
console.log("\n— Seeding patients —");
const patientRows = []; // { profileId, patientId, name, allergies, ... }
let patientsCreated = 0;
let patientsExisting = 0;

for (const p of PATIENTS) {
  const email = emailFor(p.name);

  // Find existing auth user
  const { rows: existing } = await pgClient.query(
    "select id from auth.users where lower(email) = lower($1)",
    [email]
  );
  let profileId = existing[0]?.id ?? null;

  if (!profileId) {
    const { data, error } = await sb.auth.signUp({
      email,
      password: DEMO_PASSWORD,
      options: { data: { full_name: p.name, phone: p.phone, role: "patient" } },
    });
    if (error || !data.user) {
      console.error(`  ✗  ${p.name}: ${error?.message ?? "no user returned"}`);
      continue;
    }
    profileId = data.user.id;
    patientsCreated++;
  } else {
    patientsExisting++;
  }

  // Profile (full_name + phone)
  await pgClient.query(
    `update public.profiles
        set role = 'patient',
            full_name = $2,
            phone = $3
      where id = $1`,
    [profileId, p.name, p.phone]
  );

  // Patients row (upsert)
  const { rows: existingPat } = await pgClient.query(
    "select id from public.patients where profile_id = $1",
    [profileId]
  );
  let patientId;
  if (existingPat[0]) {
    patientId = existingPat[0].id;
    await pgClient.query(
      `update public.patients
          set date_of_birth = $2,
              blood_type = $3,
              gender = $4,
              allergies = $5,
              chronic_conditions = $6
        where id = $1`,
      [patientId, p.dob, p.blood, p.gender, p.allergies, p.chronic]
    );
  } else {
    const { rows } = await pgClient.query(
      `insert into public.patients (profile_id, date_of_birth, blood_type, gender, allergies, chronic_conditions)
       values ($1, $2, $3, $4, $5, $6) returning id`,
      [profileId, p.dob, p.blood, p.gender, p.allergies, p.chronic]
    );
    patientId = rows[0].id;
  }

  patientRows.push({ profileId, patientId, ...p });
  console.log(`  ✓  ${p.name}`);
}

// ============================================================================
// Wipe previous demo appts / receitas / faturas for these patients
// (lets the script be re-run safely with refreshed dates)
// ============================================================================
const patientIds = patientRows.map((p) => p.patientId);
if (patientIds.length) {
  console.log("\n— Clearing previous demo appointments / prescriptions / invoices —");
  const args = patientIds.map((_, i) => `$${i + 1}`).join(",");
  await pgClient.query(`delete from public.prescriptions where patient_id in (${args})`, patientIds);
  await pgClient.query(`delete from public.invoices       where patient_id in (${args})`, patientIds);
  await pgClient.query(`delete from public.appointments   where patient_id in (${args})`, patientIds);
}

// ============================================================================
// Helpers for date math
// ============================================================================
function atTime(base, hour, minute) {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffled(arr) { return [...arr].sort(() => Math.random() - 0.5); }

const SLOT_HOURS = [
  [8, 0],  [8, 30], [9, 0],  [9, 30], [10, 0], [10, 30], [11, 0], [11, 30],
  [14, 0], [14, 30], [15, 0], [15, 30], [16, 0], [16, 30],
];

// ============================================================================
// Appointments — past completed/cancelled + today + future
// ============================================================================
console.log("\n— Seeding appointments —");

// Build a (patient, doctor) pairing matrix so every patient has a few visits
// with a few different doctors.
const APPT_SPECS = [
  // Past completed
  ...Array.from({ length: 14 }, () => ({ offset: -1 - Math.floor(Math.random() * 90), status: "completed" })),
  // Past cancelled / no_show (a few)
  { offset: -45, status: "cancelled" },
  { offset: -30, status: "no_show" },
  { offset: -12, status: "cancelled" },
  // This week (today, tomorrow, day-after)
  { offset: 0,  status: "scheduled" },
  { offset: 0,  status: "confirmed" },
  { offset: 1,  status: "scheduled" },
  { offset: 2,  status: "confirmed" },
  // Upcoming over next 30 days
  ...Array.from({ length: 16 }, () => ({ offset: 3 + Math.floor(Math.random() * 28), status: "scheduled" })),
];

const apptRows = [];
let apptCount = 0;
for (const spec of APPT_SPECS) {
  const patient = pick(patientRows);
  const doctor = pick(doctors);
  const [h, m] = pick(SLOT_HOURS);
  const day = daysFromNow(spec.offset);
  const scheduledAt = atTime(day, h, m);
  const reason = pick(REASONS);
  const type = Math.random() < 0.35 ? "telemedicine" : "in_person";

  const { rows } = await pgClient.query(
    `insert into public.appointments
       (patient_id, doctor_id, clinic_id, scheduled_at, duration_minutes,
        status, appointment_type, reason)
     values ($1, $2, $3, $4, 30, $5::appointment_status, $6::appointment_type, $7)
     returning id`,
    [
      patient.patientId,
      doctor.id,
      doctor.clinic_id,
      scheduledAt.toISOString(),
      spec.status,
      type,
      reason,
    ]
  );
  apptRows.push({
    id: rows[0].id,
    patient,
    doctor,
    scheduledAt,
    status: spec.status,
    type,
    reason,
  });
  apptCount++;
}
console.log(`  ✓ ${apptCount} appointments`);

// ============================================================================
// Prescriptions — one per completed appointment, up to 10
// ============================================================================
console.log("\n— Seeding prescriptions —");
let rxCount = 0;
for (const a of apptRows.filter((x) => x.status === "completed").slice(0, 10)) {
  const meds = pick(MEDICATIONS);
  const qr = `LG-RX-${randomUUID().slice(0, 12).toUpperCase()}`;
  await pgClient.query(
    `insert into public.prescriptions
       (patient_id, doctor_id, appointment_id, medications, qr_code, notes,
        issued_at, expires_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      a.patient.patientId,
      a.doctor.id,
      a.id,
      JSON.stringify(meds),
      qr,
      "Tomar como indicado. Em caso de dúvida, contacte a clínica.",
      a.scheduledAt.toISOString(),
      new Date(a.scheduledAt.getTime() + 30 * 86400000).toISOString(),
    ]
  );
  rxCount++;
}
console.log(`  ✓ ${rxCount} prescriptions`);

// ============================================================================
// Invoices — for every completed + half the scheduled future ones
// ============================================================================
console.log("\n— Seeding invoices —");
let invCount = 0;
for (const a of apptRows) {
  const past = a.scheduledAt.getTime() < Date.now();
  // Completed → paid; cancelled/no_show → cancelled invoice;
  // future scheduled → pending (random subset).
  let status = null;
  let amount = 0;
  if (a.status === "completed") {
    status = "paid";
    amount = 15000 + Math.floor(Math.random() * 25000);
  } else if (a.status === "scheduled" || a.status === "confirmed") {
    if (Math.random() < 0.5) {
      status = "pending";
      amount = 15000 + Math.floor(Math.random() * 25000);
    }
  } else if (a.status === "no_show") {
    status = "overdue";
    amount = 5000;
  }
  if (!status) continue;

  const paidAt = status === "paid" ? a.scheduledAt.toISOString() : null;
  const dueDate = past
    ? a.scheduledAt.toISOString().slice(0, 10)
    : new Date(a.scheduledAt.getTime() + 7 * 86400000).toISOString().slice(0, 10);

  await pgClient.query(
    `insert into public.invoices
       (clinic_id, patient_id, appointment_id, amount, currency, status,
        payment_method, payment_reference, paid_at, due_date)
     values ($1, $2, $3, $4, 'AOA', $5::invoice_status, $6, $7, $8, $9)`,
    [
      a.doctor.clinic_id,
      a.patient.patientId,
      a.id,
      amount,
      status,
      status === "paid" ? "multicaixa_express" : null,
      status === "paid"
        ? `MCX${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`
        : null,
      paidAt,
      dueDate,
    ]
  );
  invCount++;
}
console.log(`  ✓ ${invCount} invoices`);

// ============================================================================
// Done
// ============================================================================
await pgClient.end();

console.log("\nDone.");
console.log(`  Patients     : ${patientRows.length}  (${patientsCreated} new · ${patientsExisting} existing)`);
console.log(`  Appointments : ${apptCount}`);
console.log(`  Prescriptions: ${rxCount}`);
console.log(`  Invoices     : ${invCount}`);
console.log(`\nLogin password for any demo patient: ${DEMO_PASSWORD}`);
console.log(`Example: maria.joao.cardoso@paciente.lunga.local / ${DEMO_PASSWORD}`);
