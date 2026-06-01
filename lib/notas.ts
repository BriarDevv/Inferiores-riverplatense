/**
 * Capa de acceso a datos de notas.
 * Hoy: mock in-memory.
 * Mañana: Supabase (solo se cambia esta capa, el resto del código no se toca).
 */
import { MOCK_NOTAS } from "./mock-data";
import { norm } from "./constants";
import type { FiltrosNota, Nota, Sujeto } from "./types";

function ordenar(notas: Nota[]): Nota[] {
  return [...notas].sort(
    (a, b) =>
      new Date(b.publicada_en).getTime() - new Date(a.publicada_en).getTime(),
  );
}

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
  let resultado = [...MOCK_NOTAS];

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

  return ordenar(resultado);
}

export async function getNotaDestacada(): Promise<Nota | null> {
  // Si no hay destacada, degradá a la MÁS RECIENTE (no a la primera insertada).
  return MOCK_NOTAS.find((n) => n.destacada) ?? ordenar(MOCK_NOTAS)[0] ?? null;
}

export async function getNotaPorSlug(slug: string): Promise<Nota | null> {
  return MOCK_NOTAS.find((n) => n.slug === slug) ?? null;
}

/** Todas las notas, ordenadas. Para sitemap / RSS sin tocar MOCK_NOTAS directo. */
export async function getTodasLasNotas(): Promise<Nota[]> {
  return ordenar(MOCK_NOTAS);
}

export async function getNotasRelacionadas(nota: Nota, limit = 3): Promise<Nota[]> {
  const sujetoIds = new Set(nota.sujetos.map((s) => s.id));
  const candidatas = MOCK_NOTAS.filter(
    (n) =>
      n.id !== nota.id &&
      (n.division === nota.division ||
        n.sujetos.some((s) => sujetoIds.has(s.id))),
  );
  return ordenar(candidatas).slice(0, limit);
}

/** Devuelve el sujeto (con su info) a partir de su slug, buscándolo en todas las notas. */
export async function getSujetoPorSlug(slug: string): Promise<Sujeto | null> {
  for (const n of MOCK_NOTAS) {
    const s = n.sujetos.find((x) => x.slug === slug);
    if (s) return s;
  }
  return null;
}

/** Todas las notas en las que aparece un sujeto (por id), más recientes primero. */
export async function getNotasPorSujeto(sujetoId: string): Promise<Nota[]> {
  return ordenar(
    MOCK_NOTAS.filter((n) => n.sujetos.some((s) => s.id === sujetoId)),
  );
}

/** Slugs de jugadores con al menos una nota — para generateStaticParams / sitemap. */
export async function getSlugsDeJugadores(): Promise<string[]> {
  const slugs = new Set<string>();
  for (const n of MOCK_NOTAS) {
    for (const s of n.sujetos) {
      if (s.tipo === "jugador" && s.slug) slugs.add(s.slug);
    }
  }
  return [...slugs];
}
