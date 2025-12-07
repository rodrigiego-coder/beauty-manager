import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Conexao sera inicializada pelo modulo do NestJS
export function createDatabaseConnection(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDatabaseConnection>;
export * from './schema';
