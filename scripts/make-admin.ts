/**
 * Crea (o actualiza) el profile de un usuario invitado y le asigna rol.
 * Uso: npx tsx scripts/make-admin.ts email@ejemplo.com [admin|editor]
 */
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) throw new Error("Falta SUPABASE_DB_URL en .env.local");

const email = process.argv[2];
const rol = process.argv[3] ?? "admin";
if (!email) throw new Error("Uso: npx tsx scripts/make-admin.ts email@ejemplo.com [admin|editor]");
if (rol !== "admin" && rol !== "editor") throw new Error(`Rol inválido: ${rol}`);

const client = new pg.Client({ connectionString: dbUrl });

async function main() {
  await client.connect();
  const { rows } = await client.query(
    "select id, email from auth.users where lower(email) = lower($1)",
    [email],
  );
  if (rows.length === 0) {
    throw new Error(
      `No existe usuario con email ${email}. Invitalo primero desde Supabase Dashboard → Authentication → Users.`,
    );
  }
  await client.query(
    `insert into public.profiles (id, rol) values ($1, $2)
     on conflict (id) do update set rol = $2`,
    [rows[0].id, rol],
  );
  console.log(`OK: ${rows[0].email} ahora tiene rol "${rol}" (uid ${rows[0].id})`);
  await client.end();
}

main().catch(async (err) => {
  await client.end().catch(() => undefined);
  console.error(`ERROR: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
