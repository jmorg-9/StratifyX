import { readFile } from "node:fs/promises";
import { getPool } from "./client.js";
import { paths } from "../env.js";

async function main() {
  const runSeed = process.argv.includes("--seed");
  const pool = getPool();
  const schemaSql = await readFile(paths.schemaSql, "utf8");

  await pool.query(schemaSql);

  if (runSeed) {
    const seedSql = await readFile(paths.seedSql, "utf8");
    await pool.query(seedSql);
  }

  console.log(runSeed ? "Schema and seed applied." : "Schema applied.");
  await pool.end();
}

void main();
