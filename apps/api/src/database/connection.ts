import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Direct database connection for use in services that need it
// outside of NestJS DI context (like scheduled jobs)
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export type Database = typeof db;
