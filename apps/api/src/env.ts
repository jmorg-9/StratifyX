import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, "../../..");

loadEnv({ path: resolve(repoRoot, ".env.local"), override: false });
loadEnv({ path: resolve(repoRoot, ".env"), override: false });

export const env = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL ?? ""
};

export const paths = {
  repoRoot,
  schemaSql: resolve(repoRoot, "packages/db/schema.sql"),
  seedSql: resolve(repoRoot, "packages/db/seed.sql")
};
