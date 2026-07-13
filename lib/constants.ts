import type { Division, TipoNota } from "./types";

export const DIVISIONES: Array<{ value: Division; label: string; short: string }> = [
  { value: "primera", label: "Primera", short: "1ra" },
  { value: "reserva", label: "Reserva", short: "Res" },
  { value: "cuarta", label: "Cuarta", short: "4ta" },
  { value: "quinta", label: "Quinta", short: "5ta" },
  { value: "sexta", label: "Sexta", short: "6ta" },
  { value: "septima", label: "Séptima", short: "7ma" },
  { value: "octava", label: "Octava", short: "8va" },
  { value: "novena", label: "Novena", short: "9na" },
  { value: "femenino", label: "Femenino", short: "Fem" },
];

export const TIPOS_NOTA: Array<{ value: TipoNota; label: string }> = [
  { value: "entrevista", label: "Entrevistas" },
  { value: "perfil", label: "Perfiles" },
  { value: "cronica", label: "Crónicas" },
  { value: "analisis", label: "Análisis" },
  { value: "columna", label: "Columnas" },
  { value: "noticia", label: "Noticias" },
];

/** Etiqueta del tag de formato que llevan las cards sobre la imagen. */
export const FORMATO_LABEL: Record<"short" | "youtube" | "articulo", string> = {
  short: "Short",
  youtube: "Video",
  articulo: "Nota",
};

export function labelDivision(d: Division): string {
  return DIVISIONES.find((x) => x.value === d)?.label ?? d;
}

export function labelTipo(t: TipoNota): string {
  return TIPOS_NOTA.find((x) => x.value === t)?.label ?? t;
}

// Formatter hoisted: construir un Intl.DateTimeFormat es caro y esto corre
// una vez por card renderizada.
const FORMATO_DIA_BA = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Año/mes/día de un instante EN HORA DE BUENOS AIRES (no local del server ni UTC). */
function partesBA(iso: string): { anio: number; mes: number; dia: number } {
  const [anio, mes, dia] = FORMATO_DIA_BA.format(new Date(iso))
    .split("-")
    .map(Number);
  return { anio, mes, dia };
}

const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export function formatearFecha(iso: string): string {
  const pub = partesBA(iso);
  const hoy = partesBA(new Date().toISOString());
  const diffDias = Math.round(
    (Date.UTC(hoy.anio, hoy.mes - 1, hoy.dia) -
      Date.UTC(pub.anio, pub.mes - 1, pub.dia)) /
      86400000,
  );

  if (diffDias === 0) return "hoy";
  if (diffDias === 1) return "ayer";
  if (diffDias > 1 && diffDias < 7) return `hace ${diffDias}d`;

  // Fechas futuras (nota programada horneada en SSG) o de más de una semana:
  // fecha absoluta, nunca un "hace -2d".
  return `${pub.dia} ${MESES_CORTOS[pub.mes - 1]}`;
}

export function formatearDuracion(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const MESES_LARGOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Fecha absoluta y determinística (no depende de "ahora") — para el detalle de nota. */
export function formatearFechaLarga(iso: string): string {
  const { anio, mes, dia } = partesBA(iso);
  return `${dia} de ${MESES_LARGOS[mes - 1]} de ${anio}`;
}

/** Normaliza texto para matching sin acentos / mayúsculas. */
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Minutos de lectura estimados a partir del cuerpo (≈200 palabras/min). */
export function tiempoLectura(contenido?: string): number {
  if (!contenido) return 1;
  const palabras = contenido.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

/** Thumbnail de YouTube. `hqdefault` siempre existe; `maxresdefault` 404ea en muchos videos. */
export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
