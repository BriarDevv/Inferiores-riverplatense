/**
 * Migra el mock (lib/mock-data.ts) a la DB. Idempotente (upsert por PK).
 * Uso: npx tsx scripts/seed.ts
 */
import { config } from "dotenv";
import pg from "pg";
import { MOCK_NOTAS } from "../lib/mock-data";
import type { Autor, Sujeto } from "../lib/types";

config({ path: ".env.local" });

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) throw new Error("Falta SUPABASE_DB_URL en .env.local");

const client = new pg.Client({ connectionString: dbUrl });

function slugify(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await client.connect();

  const autores = new Map<string, Autor>();
  for (const n of MOCK_NOTAS) autores.set(n.autor.id, n.autor);
  for (const a of autores.values()) {
    await client.query(
      `insert into public.autores (id, nombre, slug, rol, foto_url)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update set nombre = $2, slug = $3, rol = $4, foto_url = $5`,
      [a.id, a.nombre, slugify(a.nombre), a.rol, a.avatar_url ?? null],
    );
  }

  const sujetos = new Map<string, Sujeto>();
  for (const n of MOCK_NOTAS) for (const s of n.sujetos) sujetos.set(s.id, s);
  for (const s of sujetos.values()) {
    await client.query(
      `insert into public.sujetos (id, tipo, nombre, slug, division, bio)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do update set tipo = $2, nombre = $3, slug = $4, division = $5, bio = $6`,
      [s.id, s.tipo, s.nombre, s.slug ?? null, s.division ?? null, s.bio ?? null],
    );
  }

  for (const n of MOCK_NOTAS) {
    await client.query(
      `insert into public.notas (
         id, slug, formato, tipo, division, titulo, bajada, contenido, fuente,
         video_url, youtube_id, poster_url, duracion_seg, quote_overlay,
         autor_id, tags, estado, publicada_en, actualizada_en, destacada, primicia, capitulos
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'publicada',$17,$18,$19,$20,$21)
       on conflict (id) do update set
         slug=$2, formato=$3, tipo=$4, division=$5, titulo=$6, bajada=$7, contenido=$8,
         fuente=$9, video_url=$10, youtube_id=$11, poster_url=$12, duracion_seg=$13,
         quote_overlay=$14, autor_id=$15, tags=$16, publicada_en=$17, actualizada_en=$18,
         destacada=$19, primicia=$20, capitulos=$21`,
      [
        n.id, n.slug, n.formato, n.tipo, n.division, n.titulo, n.bajada,
        n.contenido ?? null, n.fuente, n.video_url ?? null, n.youtube_id || null,
        n.poster_url, n.duracion_seg ?? null, n.quote_overlay ?? null,
        n.autor.id, n.tags, n.publicada_en, n.actualizada_en ?? null,
        n.destacada ?? false, n.primicia ?? false,
        n.capitulos ? JSON.stringify(n.capitulos) : null,
      ],
    );
    for (const s of n.sujetos) {
      await client.query(
        `insert into public.nota_sujetos (nota_id, sujeto_id) values ($1, $2)
         on conflict do nothing`,
        [n.id, s.id],
      );
    }
  }

  const { rows } = await client.query(
    `select
       (select count(*) from public.notas) as notas,
       (select count(*) from public.autores) as autores,
       (select count(*) from public.sujetos) as sujetos,
       (select count(*) from public.nota_sujetos) as vinculos`,
  );
  console.log(
    `Seed OK — notas: ${rows[0].notas}, autores: ${rows[0].autores}, sujetos: ${rows[0].sujetos}, vinculos: ${rows[0].vinculos}`,
  );
  await client.end();
}

main().catch(async (err) => {
  await client.end().catch(() => undefined);
  console.error(`ERROR: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
