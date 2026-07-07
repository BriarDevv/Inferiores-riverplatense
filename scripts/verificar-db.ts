/**
 * Chequeo rápido de la DB: contenido real cargado y mocks eliminados.
 * Uso: npx tsx scripts/verificar-db.ts
 */
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });

async function main() {
  await client.connect();

  const q = async (sql: string) => (await client.query(sql)).rows;

  const [mocks] = await q(`select
    (select count(*) from public.notas where id ~ '^n-[0-9]+$') as notas_mock,
    (select count(*) from public.sujetos where id ~ '^(jug|tec|eq)-[0-9]+$') as sujetos_mock`);

  const [reales] = await q(`select
    (select count(*) from public.notas where id like 'nr-%') as notas_reales,
    (select count(*) from public.notas where id like 'nr-%' and estado = 'publicada') as publicadas,
    (select count(*) from public.notas where id like 'nr-%' and cuerpo is not null) as con_cuerpo,
    (select count(*) from public.notas where id like 'nr-%' and destacada) as destacadas,
    (select count(*) from public.sujetos where id like 'suj-%') as sujetos_reales,
    (select count(*) from public.sujetos where id like 'suj-%' and slug is not null and tipo = 'jugador') as con_hub,
    (select count(*) from public.nota_sujetos) as vinculos,
    (select count(*) from public.autores) as autores`);

  const [total] = await q(`select
    (select count(*) from public.notas) as notas_total,
    (select count(*) from public.sujetos) as sujetos_total,
    (select count(*) from public.nota_visitas) as visitas`);

  const huerfanas = await q(`select id, slug from public.notas
    where id not like 'nr-%' order by id`);

  console.log("MOCKS  → notas:", mocks.notas_mock, "| sujetos:", mocks.sujetos_mock);
  console.log(
    "REALES → notas:", reales.notas_reales,
    "| publicadas:", reales.publicadas,
    "| con cuerpo Tiptap:", reales.con_cuerpo,
    "| destacadas:", reales.destacadas,
  );
  console.log(
    "       sujetos:", reales.sujetos_reales,
    "| jugadores con hub:", reales.con_hub,
    "| vinculos:", reales.vinculos,
    "| autores:", reales.autores,
  );
  console.log(
    "TOTAL  → notas:", total.notas_total,
    "| sujetos:", total.sujetos_total,
    "| visitas registradas:", total.visitas,
  );
  console.log(
    "Notas fuera del seed real:",
    huerfanas.length === 0 ? "ninguna" : JSON.stringify(huerfanas),
  );
  await client.end();
}

main().catch(async (err) => {
  await client.end().catch(() => undefined);
  console.error(`ERROR: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
