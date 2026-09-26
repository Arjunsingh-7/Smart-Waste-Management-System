import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

const url =
  process.env.TURSO_CONNECTION_URL ||
  'libsql://wastewizard-db-arjun-007.aws-ap-south-1.turso.io';

const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MjE3NjE1OTQsImlhdCI6MTc5MDIyNTU5NCwiaWQiOiIwMWEwZDFjMi0xOTAxLTc5ODgtOTBiOS1kYjM5MDg3OWFmMjkiLCJraWQiOiJPaWFzdXJUUmFWemU1QzlKU2N6X0RUNGlmSmU1V0MtRllQRk85WDBGVURVIiwicmlkIjoiMmQwODhhZWMtYzFhOS00ZDEyLTk1M2UtYjc2NmNlOGUxZWNmIn0.dX5sXjw-20diLgG3ZM7FxVLrgU5qsfPlcPSyT-dQxns_g-vOKyDmQF81YTEpolseFY5orcBBtbjlTRNlxYj9BA';

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;