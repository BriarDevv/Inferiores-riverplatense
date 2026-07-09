/**
 * Siembra el contenido real (scripts/seed-data.ts) en la DB y elimina el
 * contenido mock original si todavía existe. Idempotente (upsert por PK).
 * Uso: npx tsx scripts/seed.ts
 */
import { config } from "dotenv";
import pg from "pg";
import { AUTORES_SEED, NOTAS_SEED, PARTIDO_SEED, SUJETOS_SEED } from "./seed-data";

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

/**
 * Convierte los párrafos del seed al JSON de Tiptap que edita el panel.
 * "## " = h2 · "> " = cita destacada · resto = párrafo.
 */
function parrafosATiptap(parrafos: string[]): object {
  const content = parrafos.map((p) => {
    if (p.startsWith("## ")) {
      return {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: p.slice(3) }],
      };
    }
    if (p.startsWith("> ")) {
      return {
        type: "blockquote",
        content: [
          { type: "paragraph", content: [{ type: "text", text: p.slice(2) }] },
        ],
      };
    }
    return { type: "paragraph", content: [{ type: "text", text: p }] };
  });
  return { type: "doc", content };
}

async function limpiarMocks(): Promise<void> {
  // IDs del contenido demo original (n-1..n-22, jug-*, tec-*, eq-*).
  // Los FK con on delete cascade limpian nota_sujetos y nota_visitas.
  const notas = await client.query(
    `delete from public.notas where id ~ '^n-[0-9]+$'`,
  );
  const sujetos = await client.query(
    `delete from public.sujetos where id ~ '^(jug|tec|eq)-[0-9]+$'`,
  );
  if ((notas.rowCount ?? 0) > 0 || (sujetos.rowCount ?? 0) > 0) {
    console.log(
      `Mocks eliminados — notas: ${notas.rowCount}, sujetos: ${sujetos.rowCount}`,
    );
  }
}

async function main() {
  await client.connect();

  await limpiarMocks();

  for (const a of AUTORES_SEED) {
    await client.query(
      `insert into public.autores (id, nombre, slug, rol, foto_url)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update set nombre = $2, slug = $3, rol = $4, foto_url = $5`,
      [a.id, a.nombre, slugify(a.nombre), a.rol, a.foto_url],
    );
  }

  for (const s of SUJETOS_SEED) {
    await client.query(
      `insert into public.sujetos (id, tipo, nombre, slug, division, bio)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do update set tipo = $2, nombre = $3, slug = $4, division = $5, bio = $6`,
      [s.id, s.tipo, s.nombre, s.slug ?? null, s.division ?? null, s.bio ?? null],
    );
  }

  for (const n of NOTAS_SEED) {
    const cuerpo = JSON.stringify(parrafosATiptap(n.parrafos));
    await client.query(
      `insert into public.notas (
         id, slug, formato, tipo, division, titulo, bajada, cuerpo, fuente,
         poster_url, autor_id, tags, estado, publicada_en, destacada, primicia
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,'propio',$9,$10,$11,'publicada',$12,$13,$14)
       on conflict (id) do update set
         slug=$2, formato=$3, tipo=$4, division=$5, titulo=$6, bajada=$7,
         cuerpo=$8, poster_url=$9, autor_id=$10, tags=$11, publicada_en=$12,
         destacada=$13, primicia=$14`,
      [
        n.id, n.slug, n.formato, n.tipo, n.division, n.titulo, n.bajada,
        cuerpo, n.poster_url, n.autor_id, n.tags, n.publicada_en,
        n.destacada ?? false, n.primicia ?? false,
      ],
    );
    // Vínculos nota↔sujeto: se regeneran completos para esta nota.
    await client.query(`delete from public.nota_sujetos where nota_id = $1`, [n.id]);
    for (const sujetoId of n.sujeto_ids) {
      await client.query(
        `insert into public.nota_sujetos (nota_id, sujeto_id) values ($1, $2)
         on conflict do nothing`,
        [n.id, sujetoId],
      );
    }
  }

  // Próximo partido de la barra roja (singleton). Ojo: pisa lo que se haya
  // cargado desde el panel — el seed solo se corre para armar la demo.
  await client.query(
    `insert into public.proximo_partido (id, rival, division, fecha, torneo)
     values (true, $1, $2, $3, $4)
     on conflict (id) do update set
       rival = $1, division = $2, fecha = $3, torneo = $4, actualizado_en = now()`,
    [PARTIDO_SEED.rival, PARTIDO_SEED.division, PARTIDO_SEED.fecha, PARTIDO_SEED.torneo],
  );

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
