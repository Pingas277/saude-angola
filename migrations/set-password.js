import { readFileSync, writeFileSync } from 'fs';
import readline from 'readline';

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const stdin = process.openStdin();
    process.stdin.on('data', (char) => {
      char = char + '';
      switch (char) {
        case '\n': case '\r': case '':
          stdin.pause(); break;
        default:
          process.stdout.clearLine(0);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(question + Array(rl.line.length + 1).join('*'));
          break;
      }
    });
    rl.question(question, (value) => {
      rl.history = rl.history.slice(1);
      resolve(value);
      rl.close();
    });
  });
}

const path = '.env.local';
const current = readFileSync(path, 'utf8').trim();
const url = current.split('=', 2)[1];
const rest = url.slice('postgresql://'.length);
const [userinfo, hostinfo] = [rest.slice(0, rest.lastIndexOf('@')), rest.slice(rest.lastIndexOf('@') + 1)];
const [user] = userinfo.split(':', 1);

const pwd = await promptHidden('\nPaste your Supabase DB password (will not echo): ');
console.log();
if (!pwd || pwd.includes('[') || pwd.includes(']') || pwd.toUpperCase().includes('YOUR')) {
  console.error('Refusing — looks like a placeholder. Try again with the real password.');
  process.exit(1);
}
const encoded = encodeURIComponent(pwd);
const newUrl = `postgresql://${user}:${encoded}@${hostinfo}`;
writeFileSync(path, `DATABASE_URL=${newUrl}\n`);
console.log(`Saved. Password length: ${pwd.length} chars (encoded: ${encoded.length} chars).`);
