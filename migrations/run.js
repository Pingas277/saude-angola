import { config as loadEnv } from 'dotenv';
import pg from 'pg';
import { readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

loadEnv({ path: '.env.local' });

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  create table if not exists public._migrations (
    id text primary key,
    applied_at timestamptz not null default now()
  );
`);

const files = readdirSync(__dirname)
  .filter(f => /^\d+_.+\.sql$/.test(f))
  .sort();

if (files.length === 0) {
  console.log('No migrations found.');
  await client.end();
  process.exit(0);
}

const { rows: applied } = await client.query('select id from public._migrations');
const appliedSet = new Set(applied.map(r => r.id));

let runCount = 0;
for (const file of files) {
  if (appliedSet.has(file)) {
    console.log(`  skip   ${file} (already applied)`);
    continue;
  }
  console.log(`  apply  ${file}`);
  const sql = readFileSync(join(__dirname, file), 'utf8');
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('insert into public._migrations(id) values ($1)', [file]);
    await client.query('commit');
    console.log(`         ✓ applied`);
    runCount++;
  } catch (err) {
    await client.query('rollback');
    console.error(`         ✗ FAILED: ${err.message}`);
    if (err.position) console.error(`           position: ${err.position}`);
    if (err.hint)     console.error(`           hint:     ${err.hint}`);
    if (err.detail)   console.error(`           detail:   ${err.detail}`);
    process.exit(1);
  }
}

console.log(`\nDone. ${runCount} migration(s) applied.`);
await client.end();
