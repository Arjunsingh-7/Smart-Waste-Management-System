import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing Turso URL:', process.env.TURSO_CONNECTION_URL);
  if (!process.env.TURSO_CONNECTION_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('Missing TURSO credentials in environment!');
    return;
  }
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  try {
    const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('Tables in Turso DB:', res.rows.map(r => r.name));
  } catch (e) {
    console.error('Turso Error:', e);
  }
}
test();
