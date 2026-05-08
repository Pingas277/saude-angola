import { config } from 'dotenv';
import pg from 'pg';
config({ path: '.env.local' });
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const { rows: [adm] } = await c.query("select id from auth.users where email = 'admin.demo@saudeangola.ao'");
const { rows: [maria] } = await c.query("select id from auth.users where email = 'saudeangola.qa.1778185789210@gmail.com'");

const setUser = async (uid) => {
  await c.query('reset role');
  await c.query('set local role authenticated');
  await c.query(`set local request.jwt.claims = '${JSON.stringify({ sub: uid, role: 'authenticated' })}'`);
};

await c.query('begin');

// Maria self-elevation should now FAIL
await setUser(maria.id);
try {
  await c.query("update profiles set role='admin' where id=$1", [maria.id]);
  console.error('⚠ STILL ALLOWED — bug not plugged');
} catch (e) {
  console.log('✓ Maria self-elevation blocked:', e.message);
}

// Maria self-update of harmless field still works
const r = await c.query("update profiles set phone='+244 911 111 111' where id=$1", [maria.id]);
console.log('✓ Maria phone change OK, rows =', r.rowCount);

// Admin can still elevate others
await setUser(adm.id);
const a = await c.query("update profiles set role='nurse' where id=$1", [maria.id]);
console.log('✓ admin promotes Maria to nurse, rows =', a.rowCount);

await c.query('rollback');
await c.end();
