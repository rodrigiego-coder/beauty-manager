import postgres from 'postgres';
import * as schema from './schema';
export declare function createDatabaseConnection(connectionString: string): import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
export type Database = ReturnType<typeof createDatabaseConnection>;
export * from './schema';
//# sourceMappingURL=index.d.ts.map