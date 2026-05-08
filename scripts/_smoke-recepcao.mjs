import { config } from 'dotenv';
import pg from 'pg';
config({ path: '.env.local' });
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const { rows: [rec] } = await c.query("select id from auth.users where email = 'recepcao.demo@saudeangola.ao'");
const { rows: [silva] } = await c.query("select id from auth.users where email = 'medico.silva@gmail.com'");

const setUser = async (uid) => {
  await c.query('set local role authenticated');
  await c.query(`set local request.jwt.claims = '${JSON.stringify({ sub: uid, role: 'authenticated' })}'`);
};

// Test 1: receptionist sees clinic-wide appointments today
await c.query('begin');
await setUser(rec.id);
const { rows: appts } = await c.query("select count(*)::int as n from appointments where clinic_id='11111111-1111-1111-1111-111111111111'");
console.log('1. receptionist sees clinic appointments:', appts[0].n);

// Test 2: receptionist can search profiles globally
const { rows: search } = await c.query("select id, full_name from profiles where role='patient' limit 3");
console.log('2. receptionist patient search returns:', search.length, 'rows');

// Test 3: receptionist creates a walk-in patient (insert profiles is allowed via signUp from temp client; here we just test inserting a patient row for an existing profile_id)
const tempProfileId = '99999999-9999-9999-9999-999999999999';
// We can't create an arbitrary auth user here — instead simulate by checking the policy. The patients RLS now allows clinic staff to insert.
// Simulating: the policy check expects current_user_role in (...); we're authenticated as receptionist, so it should pass.
let policyOk = false;
try {
  await c.query("savepoint sp");
  await c.query("insert into patients (profile_id, gender) values ($1, 'female')", [silva.id]);
  policyOk = true;
  await c.query("rollback to sp");
} catch (e) {
  console.error('3. receptionist patient INSERT FAILED:', e.message);
}
console.log('3. receptionist can INSERT patients:', policyOk ? '✓' : '✗');

// Test 4: receptionist updates appointment status (check-in)
const { rows: [appt] } = await c.query("select id from appointments where clinic_id='11111111-1111-1111-1111-111111111111' limit 1");
if (appt) {
  const { rowCount } = await c.query("update appointments set status='confirmed' where id=$1 and clinic_id='11111111-1111-1111-1111-111111111111'", [appt.id]);
  console.log('4. receptionist check-in: rows updated =', rowCount);
}

// Test 5: receptionist CANNOT change their own role to admin (privilege escalation guard from migration 010)
let blocked = false;
try {
  await c.query("savepoint sp2");
  await c.query("update profiles set role='admin' where id=$1", [rec.id]);
  await c.query("rollback to sp2");
} catch (e) {
  blocked = true;
}
console.log('5. receptionist self-elevate role:', blocked ? '✓ blocked' : '⚠ ALLOWED');

await c.query('rollback');
await c.end();
