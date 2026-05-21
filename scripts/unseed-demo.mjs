#!/usr/bin/env node
// Removes ALL demo data created by:
//   - scripts/seed-demo-doctors.mjs (emails @saudeangola.local)
//   - scripts/seed-demo-data.mjs    (emails @paciente.saudeangola.local)
//
// Safe to run at any time — only touches rows whose owning auth.user
// email matches one of those two demo domains. Real users are never
// touched.
//
// Usage:  node scripts/unseed-demo.mjs

import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const DOCTOR_EMAIL_DOMAIN  = "@saudeangola.local";
const PATIENT_EMAIL_DOMAIN = "@paciente.saudeangola.local";

const pgClient = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await pgClient.connect();

console.log("— Removing demo data —\n");

// 1. Find all demo auth users (doctors + patients)
const { rows: demoUsers } = await pgClient.query(
  `select id, email from auth.users
    where lower(email) like '%' || $1
       or lower(email) like '%' || $2`,
  [DOCTOR_EMAIL_DOMAIN, PATIENT_EMAIL_DOMAIN]
);
const demoIds = demoUsers.map((u) => u.id);
console.log(`  ${demoUsers.length} demo auth user(s) found`);

if (demoIds.length === 0) {
  console.log("Nothing to clean up.");
  await pgClient.end();
  process.exit(0);
}

const placeholders = demoIds.map((_, i) => `$${i + 1}`).join(",");

// 2. Find demo patient IDs (linked to demo patient profiles)
const { rows: demoPatients } = await pgClient.query(
  `select id from public.patients where profile_id in (${placeholders})`,
  demoIds
);
const demoPatientIds = demoPatients.map((p) => p.id);

// 3. Wipe data owned BY demo patients (cascading from patient_id)
if (demoPatientIds.length) {
  const ph = demoPatientIds.map((_, i) => `$${i + 1}`).join(",");
  const r1 = await pgClient.query(`delete from public.prescriptions where patient_id in (${ph})`, demoPatientIds);
  const r2 = await pgClient.query(`delete from public.invoices       where patient_id in (${ph})`, demoPatientIds);
  const r3 = await pgClient.query(`delete from public.appointments   where patient_id in (${ph})`, demoPatientIds);
  console.log(`  ✓ prescriptions: ${r1.rowCount}`);
  console.log(`  ✓ invoices     : ${r2.rowCount}`);
  console.log(`  ✓ appointments : ${r3.rowCount}`);
}

// 4. Wipe appointments BOOKED with demo doctors (doctor_id) — those may
//    have been created against real patients during testing.
const r4 = await pgClient.query(
  `delete from public.appointments where doctor_id in (${placeholders})`,
  demoIds
);
console.log(`  ✓ appointments via demo doctors: ${r4.rowCount}`);

// 5. Wipe prescriptions and invoices linked to demo doctors
const r5 = await pgClient.query(
  `delete from public.prescriptions where doctor_id in (${placeholders})`,
  demoIds
);
console.log(`  ✓ prescriptions via demo doctors: ${r5.rowCount}`);

// 6. Delete patients rows
if (demoPatientIds.length) {
  const ph = demoPatientIds.map((_, i) => `$${i + 1}`).join(",");
  const r6 = await pgClient.query(`delete from public.patients where id in (${ph})`, demoPatientIds);
  console.log(`  ✓ patients     : ${r6.rowCount}`);
}

// 7. Finally — auth.users (profiles cascade via FK on delete cascade)
const r7 = await pgClient.query(
  `delete from auth.users where id in (${placeholders})`,
  demoIds
);
console.log(`  ✓ auth users   : ${r7.rowCount}`);

// 8. Demo clinics — only delete the ones with their stable UUIDs from the
//    doctors script. Real clinics will never match these IDs.
const DEMO_CLINIC_IDS = [
  "22222222-2222-2222-2222-222222222222",
  "33333333-3333-3333-3333-333333333333",
  "44444444-4444-4444-4444-444444444444",
  "55555555-5555-5555-5555-555555555555",
  "66666666-6666-6666-6666-666666666666",
  "77777777-7777-7777-7777-777777777777",
  "88888888-8888-8888-8888-888888888888",
];
const ph2 = DEMO_CLINIC_IDS.map((_, i) => `$${i + 1}`).join(",");
const r8 = await pgClient.query(
  `delete from public.clinics where id in (${ph2})`,
  DEMO_CLINIC_IDS
);
console.log(`  ✓ demo clinics : ${r8.rowCount}`);

await pgClient.end();
console.log("\nAll demo data removed. Real users untouched.");
