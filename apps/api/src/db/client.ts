import { Pool } from "pg";
import { env } from "../env.js";

let pool: Pool | null = null;

export function hasDatabaseConfig() {
  return env.databaseUrl.length > 0;
}

export function getPool(): Pool {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl
    });
  }

  return pool;
}

export async function isDatabaseReachable(): Promise<boolean> {
  if (!hasDatabaseConfig()) {
    return false;
  }

  try {
    await getPool().query("select 1");
    return true;
  } catch {
    return false;
  }
}
