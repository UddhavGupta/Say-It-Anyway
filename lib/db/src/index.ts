import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Small pool: on Vercel each function instance holds its own connections.
// Use a pooled connection string (e.g. Neon's -pooler host) in production.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX ?? 3),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
