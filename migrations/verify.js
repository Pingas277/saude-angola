import { config as loadEnv } from 'dotenv';
import pg from 'pg';

loadEnv({ path: '.env.local' });
const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const expected = [
  'clinics','profiles','patients','appointments','medical_records',
  'prescriptions','invoices','pharmacy_stock','consultations','lab_results',
];

const { rows: tables } = await client.query(`
  select tablename, rowsecurity
  from pg_tables
  where schemaname = 'public' and tablename = any($1)
  order by tablename
`, [expected]);

console.log('Tables (with RLS status):');
for (const t of tables) {
  console.log(`  ${t.rowsecurity ? '🔒' : '⚠️ '} ${t.tablename}`);
}
const missing = expected.filter(e => !tables.find(t => t.tablename === e));
if (missing.length) console.log('  MISSING:', missing.join(', '));

const { rows: enums } = await client.query(`
  select t.typname, count(e.enumlabel)::int as values
  from pg_type t
  join pg_enum e on e.enumtypid = t.oid
  join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public'
  group by t.typname
  order by t.typname
`);
console.log(`\nEnums: ${enums.length}`);
for (const e of enums) console.log(`  ${e.typname} (${e.values} values)`);

const { rows: policies } = await client.query(`
  select tablename, count(*)::int as policy_count
  from pg_policies
  where schemaname = 'public'
  group by tablename
  order by tablename
`);
console.log(`\nRLS policies per table:`);
for (const p of policies) console.log(`  ${p.tablename}: ${p.policy_count}`);

const { rows: trigs } = await client.query(`
  select event_object_table, count(*)::int as cnt
  from information_schema.triggers
  where event_object_schema = 'public'
  group by event_object_table
  order by event_object_table
`);
console.log(`\nTriggers per table:`);
for (const t of trigs) console.log(`  ${t.event_object_table}: ${t.cnt}`);

await client.end();
