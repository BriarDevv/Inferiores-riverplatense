/**
 * Capa de acceso a datos de notas.
 * Hoy: mock in-memory.
 * Mañana: Supabase (solo se cambia esta capa, el resto del código no se toca).
 */
import { MOCK_NOTAS } from "./mock-data";
import type { FiltrosNota, Nota } from "./types";

function ordenar(notas: Nota[], orden: FiltrosNota["orden"] = "recientes"): Nota[] {
  if (orden === "recientes") {
    return [...notas].sort(
      (a, b) =>
        new Date(b.publicada_en).getTime() - new Date(a.publicada_en).getTime(),
    );
  }
  return notas;
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

  return ordenar(resultado, filtros.orden);
}

export async function getNotaDestacada(): Promise<Nota | null> {
  const destacada = MOCK_NOTAS.find((n) => n.destacada);
  return destacada ?? MOCK_NOTAS[0] ?? null;
}

export async function getNotaPorSlug(slug: string): Promise<Nota | null> {
  return MOCK_NOTAS.find((n) => n.slug === slug) ?? null;
}

export async function getShorts(): Promise<Nota[]> {
  return getNotas({ formato: "short" });
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
