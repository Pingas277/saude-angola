#!/usr/bin/env node
// Seeds demo clinics + doctors so the patient marketplace at /painel/marcar
// looks rich. Idempotent — skips clinics + doctors that already exist.
//
// Usage:  node scripts/seed-demo-doctors.mjs
// Requires DATABASE_URL + NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.

import { config } from 'dotenv';
import { createClient as createSb } from '@supabase/supabase-js';
import pg from 'pg';

config({ path: '.env.local' });

const DEMO_PASSWORD = 'MedicoDemo2026!';

// =============================================================================
// Clinics
// =============================================================================
const CLINICS = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Clínica Sagrada Esperança',
    address: 'Av. Pedro de Castro Van-Dúnem Loy, Luanda',
    province: 'Luanda',
    phone: '+244 222 000 100',
    email: 'geral@sagradaesperanca.ao',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Clínica Multiperfil Benguela',
    address: 'Rua Comandante Cassanji, Benguela',
    province: 'Benguela',
    phone: '+244 272 000 200',
    email: 'contacto@multiperfil.ao',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Centro Médico do Lubango',
    address: 'Av. 1.º Congresso do MPLA, Lubango',
    province: 'Huila',
    phone: '+244 261 000 300',
    email: 'recepcao@centromedicolubango.ao',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Hospital Privado do Huambo',
    address: 'Rua José Mendes de Carvalho, Huambo',
    province: 'Huambo',
    phone: '+244 241 000 400',
    email: 'info@hospitalhuambo.ao',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Clínica Cabinda Care',
    address: 'Rua Marien Ngouabi, Cabinda',
    province: 'Cabinda',
    phone: '+244 231 000 500',
    email: 'cabinda@saudeangola.ao',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Centro Clínico do Bié',
    address: 'Av. da Independência, Kuito',
    province: 'Bie',
    phone: '+244 248 000 600',
    email: 'bie@saudeangola.ao',
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'Clínica Litoral Namibe',
    address: 'Marginal de Moçâmedes, Namibe',
    province: 'Namibe',
    phone: '+244 264 000 700',
    email: 'namibe@saudeangola.ao',
  },
];

// =============================================================================
// Doctors
// =============================================================================
const DOCTORS = [
  // Luanda — Sagrada Esperança
  { name: 'Esperança Cardoso',  specialty: 'Cardiologia',                license: 'OMA/SE-201', clinicId: '22222222-2222-2222-2222-222222222222', phone: '+244 923 000 201' },
  { name: 'António Mateus',     specialty: 'Pediatria',                  license: 'OMA/SE-202', clinicId: '22222222-2222-2222-2222-222222222222', phone: '+244 923 000 202' },
  { name: 'José Cabral',        specialty: 'Medicina Geral e Familiar',  license: 'OMA/SE-203', clinicId: '22222222-2222-2222-2222-222222222222', phone: '+244 923 000 203' },
  { name: 'Inês Pereira',       specialty: 'Ginecologia e Obstetrícia',  license: 'OMA/SE-204', clinicId: '22222222-2222-2222-2222-222222222222', phone: '+244 923 000 204' },
  { name: 'Paulo Miguel',       specialty: 'Ortopedia',                  license: 'OMA/SE-205', clinicId: '22222222-2222-2222-2222-222222222222', phone: '+244 923 000 205' },

  // Luanda — Demo
  { name: 'Sofia Andrade',      specialty: 'Dermatologia',               license: 'OMA/DC-101', clinicId: '11111111-1111-1111-1111-111111111111', phone: '+244 923 000 101' },
  { name: 'Rui Borges',         specialty: 'Neurologia',                 license: 'OMA/DC-102', clinicId: '11111111-1111-1111-1111-111111111111', phone: '+244 923 000 102' },
  { name: 'Liliana Sambo',      specialty: 'Pneumologia',                license: 'OMA/DC-103', clinicId: '11111111-1111-1111-1111-111111111111', phone: '+244 923 000 103' },

  // Benguela
  { name: 'Ana Pinto',          specialty: 'Medicina Geral e Familiar',  license: 'OMA/MP-301', clinicId: '33333333-3333-3333-3333-333333333333', phone: '+244 923 000 301' },
  { name: 'Carlos Alves',       specialty: 'Pediatria',                  license: 'OMA/MP-302', clinicId: '33333333-3333-3333-3333-333333333333', phone: '+244 923 000 302' },
  { name: 'Marta Domingos',     specialty: 'Ginecologia e Obstetrícia',  license: 'OMA/MP-303', clinicId: '33333333-3333-3333-3333-333333333333', phone: '+244 923 000 303' },
  { name: 'Tiago Sebastião',    specialty: 'Cardiologia',                license: 'OMA/MP-304', clinicId: '33333333-3333-3333-3333-333333333333', phone: '+244 923 000 304' },

  // Huambo
  { name: 'Bruno Capemba',      specialty: 'Medicina Geral e Familiar',  license: 'OMA/HU-401', clinicId: '55555555-5555-5555-5555-555555555555', phone: '+244 923 000 401' },
  { name: 'Helena Tchipa',      specialty: 'Pediatria',                  license: 'OMA/HU-402', clinicId: '55555555-5555-5555-5555-555555555555', phone: '+244 923 000 402' },
  { name: 'Vasco Sumbe',        specialty: 'Psiquiatria',                license: 'OMA/HU-403', clinicId: '55555555-5555-5555-5555-555555555555', phone: '+244 923 000 403' },

  // Huíla
  { name: 'André Sanyanga',     specialty: 'Medicina Geral e Familiar',  license: 'OMA/LU-501', clinicId: '44444444-4444-4444-4444-444444444444', phone: '+244 923 000 501' },
  { name: 'Rosa Mendes',        specialty: 'Ginecologia e Obstetrícia',  license: 'OMA/LU-502', clinicId: '44444444-4444-4444-4444-444444444444', phone: '+244 923 000 502' },
  { name: 'Filipe Domingos',    specialty: 'Endocrinologia',             license: 'OMA/LU-503', clinicId: '44444444-4444-4444-4444-444444444444', phone: '+244 923 000 503' },

  // Cabinda
  { name: 'Catarina Buanga',    specialty: 'Medicina Geral e Familiar',  license: 'OMA/CB-601', clinicId: '66666666-6666-6666-6666-666666666666', phone: '+244 923 000 601' },
  { name: 'João Lubota',        specialty: 'Cardiologia',                license: 'OMA/CB-602', clinicId: '66666666-6666-6666-6666-666666666666', phone: '+244 923 000 602' },

  // Bié
  { name: 'Hélder Kazembe',     specialty: 'Medicina Geral e Familiar',  license: 'OMA/BI-701', clinicId: '77777777-7777-7777-7777-777777777777', phone: '+244 923 000 701' },
  { name: 'Beatriz Quizua',     specialty: 'Pediatria',                  license: 'OMA/BI-702', clinicId: '77777777-7777-7777-7777-777777777777', phone: '+244 923 000 702' },

  // Namibe
  { name: 'Ricardo Capelo',     specialty: 'Medicina Geral e Familiar',  license: 'OMA/NM-801', clinicId: '88888888-8888-8888-8888-888888888888', phone: '+244 923 000 801' },
  { name: 'Sara Tati',          specialty: 'Oftalmologia',               license: 'OMA/NM-802', clinicId: '88888888-8888-8888-8888-888888888888', phone: '+244 923 000 802' },
  { name: 'Domingos Tchindandi',specialty: 'Otorrinolaringologia',       license: 'OMA/NM-803', clinicId: '88888888-8888-8888-8888-888888888888', phone: '+244 923 000 803' },
];

// =============================================================================
// Run
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
if (!SUPABASE_URL || !SUPABASE_KEY || !DATABASE_URL) {
  console.error('Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL.');
  process.exit(1);
}

function emailFor(name) {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z\s]/g, '')
      .trim()
      .replace(/\s+/g, '.') + '@saudeangola.local'
  );
}

const pgClient = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await pgClient.connect();

// ----- Clinics -----
console.log('— Seeding clinics —');
let clinicsCreated = 0;
for (const c of CLINICS) {
  const { rows } = await pgClient.query(
    'select id from public.clinics where id = $1',
    [c.id],
  );
  if (rows.length) {
    console.log(`  skip   ${c.name}  (already exists)`);
    continue;
  }
  await pgClient.query(
    `insert into public.clinics (id, name, address, province, phone, email, subscription_plan, is_active)
     values ($1, $2, $3, $4::angola_province, $5, $6, 'standard', true)`,
    [c.id, c.name, c.address, c.province, c.phone, c.email],
  );
  console.log(`  ✓      ${c.name}  (${c.province})`);
  clinicsCreated++;
}

// ----- Doctors -----
console.log('\n— Seeding doctors —');
let doctorsCreated = 0;
let doctorsSkipped = 0;
const sb = createSb(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

for (const d of DOCTORS) {
  const email = emailFor(d.name);

  // Skip if already exists
  const { rows: existing } = await pgClient.query(
    'select id from auth.users where lower(email) = lower($1)',
    [email],
  );
  if (existing.length) {
    console.log(`  skip   Dr(a). ${d.name}  (already exists)`);
    doctorsSkipped++;
    continue;
  }

  // signUp via Supabase API so auth.identities + raw_user_meta_data are populated
  const { data, error } = await sb.auth.signUp({
    email,
    password: DEMO_PASSWORD,
    options: { data: { full_name: d.name } },
  });
  if (error || !data.user) {
    console.error(`  ✗      Dr(a). ${d.name}: ${error?.message ?? 'no user returned'}`);
    continue;
  }

  // Promote to doctor with all metadata
  await pgClient.query(
    `update public.profiles
        set role = 'doctor',
            clinic_id = $2::uuid,
            full_name = $3,
            phone = $4,
            specialty = $5,
            medical_license = $6
      where id = $1`,
    [data.user.id, d.clinicId, d.name, d.phone, d.specialty, d.license],
  );
  console.log(`  ✓      Dr(a). ${d.name}  ·  ${d.specialty}  ·  ${d.clinicId.slice(0, 8)}…`);
  doctorsCreated++;
}

await pgClient.end();

console.log('\nDone.');
console.log(`  Clinics created: ${clinicsCreated}  (${CLINICS.length - clinicsCreated} already existed)`);
console.log(`  Doctors created: ${doctorsCreated}  (${doctorsSkipped} already existed)`);
console.log(`\nLogin password for any demo doctor: ${DEMO_PASSWORD}`);
console.log('Example: ana.pinto@saudeangola.local / MedicoDemo2026!');
