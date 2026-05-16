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

export function labelDivision(d: Division): string {
  return DIVISIONES.find((x) => x.value === d)?.label ?? d;
}

export function labelTipo(t: TipoNota): string {
  return TIPOS_NOTA.find((x) => x.value === t)?.label ?? t;
}

export function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return "hoy";
  if (diffDias === 1) return "ayer";
  if (diffDias < 7) return `hace ${diffDias}d`;

  const meses = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
}

export function formatearDuracion(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
