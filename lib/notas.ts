/**
 * Capa de acceso a datos de notas — contra Supabase.
 * La interfaz pública NO cambia respecto de la versión mock:
 * si mañana cambia la fuente de datos, solo se toca este archivo.
 */
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { mapRowToNota, type NotaRow } from "./notas-mapper";
import { norm } from "./constants";
import type { FiltrosNota, Nota, Sujeto } from "./types";

const SELECT_NOTA =
  "*, autor:autores(id, nombre, rol, foto_url, slug), nota_sujetos(sujeto:sujetos(id, tipo, nombre, slug, division, bio))";

/**
 * Todas las notas publicadas (RLS ya filtra estado y fecha), más recientes primero.
 * Cacheado por request: múltiples llamadas en un mismo render pegan UNA sola query.
 */
const fetchNotasPublicadas = cache(async (): Promise<Nota[]> => {
  // Cliente anónimo sin cookies: la lectura pública solo ve notas publicadas (RLS)
  // y así funciona también en build time (generateStaticParams / sitemap / RSS).
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase
    .from("notas")
    .select(SELECT_NOTA)
    .order("publicada_en", { ascending: false });
  if (error) throw new Error(`Error leyendo notas: ${error.message}`);
  return (data as unknown as NotaRow[]).map(mapRowToNota);
});

/** Texto buscable de una nota (titulo + bajada + tags + sujetos + autor). */
function haystack(n: Nota): string {
  return norm(
    [
      n.titulo,
      n.bajada,
      ...n.tags,
      ...n.sujetos.map((s) => s.nombre),
      n.autor.nombre,
    ].join(" "),
  );
}

export async function getNotas(filtros: FiltrosNota = {}): Promise<Nota[]> {
  let resultado = await fetchNotasPublicadas();

  if (filtros.tipo) {
    resultado = resultado.filter((n) => n.tipo === filtros.tipo);
  }
  if (filtros.division) {
    resultado = resultado.filter((n) => n.division === filtros.division);
  }
  if (filtros.formato) {
    resultado = resultado.filter((n) => n.formato === filtros.formato);
  }
  if (filtros.sujeto_id) {
    resultado = resultado.filter((n) =>
      n.sujetos.some((s) => s.id === filtros.sujeto_id),
    );
  }
  if (filtros.tags && filtros.tags.length > 0) {
    const objetivo = new Set(filtros.tags.map(norm));
    resultado = resultado.filter((n) => n.tags.some((t) => objetivo.has(norm(t))));
  }
  if (filtros.q && filtros.q.trim()) {
    const term = norm(filtros.q.trim());
    resultado = resultado.filter((n) => haystack(n).includes(term));
  }

  return resultado;
}

export async function getNotaDestacada(): Promise<Nota | null> {
  const notas = await fetchNotasPublicadas();
  // Si no hay destacada, degradá a la más reciente (ya vienen ordenadas).
  return notas.find((n) => n.destacada) ?? notas[0] ?? null;
}

export async function getNotaPorSlug(slug: string): Promise<Nota | null> {
  const notas = await fetchNotasPublicadas();
  return notas.find((n) => n.slug === slug) ?? null;
}

/** Todas las notas, ordenadas. Para sitemap / RSS. */
export async function getTodasLasNotas(): Promise<Nota[]> {
  return fetchNotasPublicadas();
}

export async function getNotasRelacionadas(nota: Nota, limit = 3): Promise<Nota[]> {
  const notas = await fetchNotasPublicadas();
  const sujetoIds = new Set(nota.sujetos.map((s) => s.id));
  return notas
    .filter(
      (n) =>
        n.id !== nota.id &&
        (n.division === nota.division ||
          n.sujetos.some((s) => sujetoIds.has(s.id))),
    )
    .slice(0, limit);
}

/** Devuelve el sujeto (con su info) a partir de su slug. */
export async function getSujetoPorSlug(slug: string): Promise<Sujeto | null> {
  const notas = await fetchNotasPublicadas();
  for (const n of notas) {
    const s = n.sujetos.find((x) => x.slug === slug);
    if (s) return s;
  }
  return null;
}

/** Todas las notas en las que aparece un sujeto (por id), más recientes primero. */
export async function getNotasPorSujeto(sujetoId: string): Promise<Nota[]> {
  const notas = await fetchNotasPublicadas();
  return notas.filter((n) => n.sujetos.some((s) => s.id === sujetoId));
}

/** Todas las notas firmadas por un autor (por id), más recientes primero. */
export async function getNotasPorAutor(autorId: string): Promise<Nota[]> {
  const notas = await fetchNotasPublicadas();
  return notas.filter((n) => n.autor.id === autorId);
}

/** Slugs de jugadores con al menos una nota — para generateStaticParams / sitemap. */
export async function getSlugsDeJugadores(): Promise<string[]> {
  const notas = await fetchNotasPublicadas();
  const slugs = new Set<string>();
  for (const n of notas) {
    for (const s of n.sujetos) {
      if (s.tipo === "jugador" && s.slug) slugs.add(s.slug);
    }
  }
  return [...slugs];
}
