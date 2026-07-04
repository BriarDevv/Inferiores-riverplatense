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
  await client.query(
    `create table if not exists public._migraciones (
       archivo text primary key,
       aplicada_en timestamptz not null default now()
     )`,
  );
  const { rows } = await client.query("select archivo from public._migraciones");
  const aplicadas = new Set(rows.map((r) => r.archivo));

  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) {
      console.log(`→ ${archivo} ... ya aplicada, salto`);
      continue;
    }
    const sql = readFileSync(join(dir, archivo), "utf8");
    process.stdout.write(`→ ${archivo} ... `);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public._migraciones (archivo) values ($1)", [archivo]);
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    }
    process.stdout.write("OK\n");
  }
  await client.end();
}

main().catch(async (err) => {
  await client.end().catch(() => undefined);
  console.error(`ERROR: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
