import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __trayboxPool: Pool | undefined;
}

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new Pool({
    connectionString: url,
    max: 5,
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? undefined : { rejectUnauthorized: false },
  });
}

// Reuse one pool across hot reloads and warm serverless invocations.
const pool = globalThis.__trayboxPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalThis.__trayboxPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
