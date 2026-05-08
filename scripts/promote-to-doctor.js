#!/usr/bin/env node
// Promotes an existing user to role='doctor' and assigns them to the demo clinic.
// Usage:  node scripts/promote-to-doctor.js <email>
// Requires DATABASE_URL in .env.local.

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/promote-to-doctor.js <email>');
  process.exit(1);
}

const DEMO_CLINIC_ID = '11111111-1111-1111-1111-111111111111';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const { rows: users } = await client.query(
  'select id from auth.users where lower(email) = lower($1) limit 1',
  [email]
);
if (users.length === 0) {
  console.error(`No auth user found with email ${email}.`);
  console.error('Sign the user up first via /registar, then run this again.');
  await client.end();
  process.exit(1);
}

const userId = users[0].id;

const { rows: clinics } = await client.query(
  'select id, name from public.clinics where id = $1',
  [DEMO_CLINIC_ID]
);
if (clinics.length === 0) {
  console.error('Demo clinic not found. Run `npm run migrate` first to apply 002_seed_demo_clinic.sql.');
  await client.end();
  process.exit(1);
}

const { rowCount } = await client.query(
  `update public.profiles
     set role = 'doctor',
         clinic_id = $2
   where id = $1`,
  [userId, DEMO_CLINIC_ID]
);

if (rowCount === 0) {
  console.error('Profile row missing for user. Did the auth trigger fire?');
  await client.end();
  process.exit(1);
}

console.log(`✓ Promoted ${email} to doctor at "${clinics[0].name}".`);
await client.end();
