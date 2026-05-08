import { config as loadEnv } from 'dotenv';
import pg from 'pg';

loadEnv({ path: '.env.local' });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set — .env.local missing or malformed');
  process.exit(1);
}

// Parse without exposing the password
const parsed = new URL(url);
console.log('attempting connection:');
console.log('  protocol:', parsed.protocol);
console.log('  host:    ', parsed.hostname);
console.log('  port:    ', parsed.port);
console.log('  user:    ', parsed.username);
console.log('  database:', parsed.pathname.slice(1));
console.log('  pwd len: ', parsed.password.length);

const { Client } = pg;
const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const r = await client.query('SELECT version(), current_database(), current_user');
  console.log('\nCONNECTED ✓');
  console.log('  database:', r.rows[0].current_database);
  console.log('  user:    ', r.rows[0].current_user);
  console.log('  version: ', r.rows[0].version.split(',')[0]);
  await client.end();
} catch (err) {
  console.error('\nFAILED:', err.message);
  console.error('  code:    ', err.code || '(none)');
  console.error('  errno:   ', err.errno || '(none)');
  console.error('  syscall: ', err.syscall || '(none)');
  console.error('  address: ', err.address || '(none)');
  console.error('  port:    ', err.port || '(none)');
  process.exit(1);
}
