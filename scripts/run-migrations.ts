/**
 * Corre los .sql de supabase/migrations en orden alfabético contra la DB.
 * Uso: npx tsx scripts/run-migrations.ts
 */
import { config } from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

config({ path: ".env.local" });

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) throw new Error("Falta SUPABASE_DB_URL en .env.local");

const dir = join(process.cwd(), "supabase", "migrations");
const archivos = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const client = new pg.Client({ connectionString: dbUrl });

async function main() {
  await client.connect();
  for (const archivo of archivos) {
    const sql = readFileSync(join(dir, archivo), "utf8");
    process.stdout.write(`→ ${archivo} ... `);
    await client.query(sql);
    process.stdout.write("OK\n");
  }
  await client.end();
}

main().catch(async (err) => {
  await client.end().catch(() => undefined);
  console.error(`ERROR: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
