/**
 * Agregaciones PURAS sobre visitas crudas, para que el período elegido en
 * Estadísticas afecte a toda la página. Sin Supabase: reciben filas y fechas,
 * devuelven números. Testeables con vitest.
 */

export const TZ_SITIO = "America/Argentina/Buenos_Aires";

export interface VisitaCruda {
  nota_id: string;
  visto_en: string; // timestamptz ISO
  referer: string | null;
  dispositivo: string | null;
}

export type PeriodoStats = "7d" | "30d" | "90d" | "total";

export const DIAS_PERIODO: Record<Exclude<PeriodoStats, "total">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const DIA_MS = 86_400_000;

/** YYYY-MM-DD del instante, en el huso del sitio. */
export function claveDia(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-CA", { timeZone: TZ_SITIO });
}

/** Hora 0–23 del instante, en el huso del sitio. */
export function horaLocal(iso: string): number {
  const h = new Date(iso).toLocaleString("en-US", {
    timeZone: TZ_SITIO,
    hour: "2-digit",
    hour12: false,
  });
  return Number(h) % 24;
}

/** Divide el lote de 2×período en {actuales, anteriores} según el corte. */
export function partirPorCorte(
  visitas: VisitaCruda[],
  corte: Date,
): { actuales: VisitaCruda[]; anteriores: VisitaCruda[] } {
  const t = corte.getTime();
  const actuales: VisitaCruda[] = [];
  const anteriores: VisitaCruda[] = [];
  for (const v of visitas) {
    (new Date(v.visto_en).getTime() >= t ? actuales : anteriores).push(v);
  }
  return { actuales, anteriores };
}

export interface PuntoSerie {
  label: string; // legible para el tooltip/eje
  dia: string; // YYYY-MM-DD del inicio del punto
  visitas: number;
}

/** Serie diaria entre dos fechas (inclusive), días sin visitas en 0. */
export function serieDiaria(visitas: VisitaCruda[], desde: Date, hasta: Date): PuntoSerie[] {
  const porDia = new Map<string, number>();
  for (const v of visitas) {
    const clave = claveDia(v.visto_en);
    porDia.set(clave, (porDia.get(clave) ?? 0) + 1);
  }
  const serie: PuntoSerie[] = [];
  // Itero por días calendario del huso del sitio.
  for (let t = desde.getTime(); serie.length < 400; t += DIA_MS) {
    const clave = claveDia(new Date(t));
    if (serie.length > 0 && serie[serie.length - 1].dia === clave) continue;
    serie.push({ dia: clave, label: labelDia(clave), visitas: porDia.get(clave) ?? 0 });
    if (clave === claveDia(hasta)) break;
  }
  return serie;
}

function labelDia(claveYmd: string): string {
  const [y, m, d] = claveYmd.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d, 12));
  return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });
}

/** Si la serie es muy larga para barras diarias, agrupa en semanas (desde el final). */
export function agruparPorSemana(serie: PuntoSerie[]): PuntoSerie[] {
  const grupos: PuntoSerie[] = [];
  for (let fin = serie.length; fin > 0; fin -= 7) {
    const ini = Math.max(0, fin - 7);
    const bloque = serie.slice(ini, fin);
    grupos.unshift({
      dia: bloque[0].dia,
      label: `Semana del ${bloque[0].label}`,
      visitas: bloque.reduce((acc, p) => acc + p.visitas, 0),
    });
  }
  return grupos;
}

export function mejorDia(serie: PuntoSerie[]): PuntoSerie | null {
  let mejor: PuntoSerie | null = null;
  for (const p of serie) {
    if (p.visitas > 0 && (!mejor || p.visitas > mejor.visitas)) mejor = p;
  }
  return mejor;
}

/** Visitas por hora local (0–23). */
export function porHora(visitas: VisitaCruda[]): number[] {
  const horas = Array.from({ length: 24 }, () => 0);
  for (const v of visitas) horas[horaLocal(v.visto_en)]++;
  return horas;
}

export interface ConteoDispositivos {
  mobile: number;
  desktop: number;
  sinDato: number;
}

export function porDispositivo(visitas: VisitaCruda[]): ConteoDispositivos {
  const r: ConteoDispositivos = { mobile: 0, desktop: 0, sinDato: 0 };
  for (const v of visitas) {
    if (v.dispositivo === "mobile") r.mobile++;
    else if (v.dispositivo === "desktop") r.desktop++;
    else r.sinDato++;
  }
  return r;
}

const FUENTES_CONOCIDAS: Array<{ patron: RegExp; nombre: string }> = [
  { patron: /google\./i, nombre: "Google" },
  { patron: /instagram\.com/i, nombre: "Instagram" },
  { patron: /(^|\.)t\.co$|twitter\.com|(^|\.)x\.com/i, nombre: "X" },
  { patron: /facebook\.com|fb\.com/i, nombre: "Facebook" },
  { patron: /tiktok\.com/i, nombre: "TikTok" },
  { patron: /youtube\.com|youtu\.be/i, nombre: "YouTube" },
  { patron: /whatsapp/i, nombre: "WhatsApp" },
  // Visitas registradas antes del fix del referer (guardaban la URL propia).
  { patron: /localhost|127\.0\.0\.1/i, nombre: "Sin dato" },
];

/** Host del referer → nombre de fuente conocido. null = visita directa. */
export function normalizarFuente(referer: string | null): string {
  if (!referer) return "Directo";
  let host: string;
  try {
    host = new URL(referer).host;
  } catch {
    return "Sin dato";
  }
  const conocida = FUENTES_CONOCIDAS.find((f) => f.patron.test(host));
  return conocida?.nombre ?? "Otros";
}

export interface FuentePeriodo {
  fuente: string;
  visitas: number;
}

export function porFuente(visitas: VisitaCruda[]): FuentePeriodo[] {
  const acc = new Map<string, number>();
  for (const v of visitas) {
    const nombre = normalizarFuente(v.referer);
    acc.set(nombre, (acc.get(nombre) ?? 0) + 1);
  }
  return [...acc.entries()]
    .map(([fuente, visitas]) => ({ fuente, visitas }))
    .sort((a, b) => b.visitas - a.visitas);
}

/** Mapa nota_id → visitas del período. */
export function porNota(visitas: VisitaCruda[]): Map<string, number> {
  const acc = new Map<string, number>();
  for (const v of visitas) acc.set(v.nota_id, (acc.get(v.nota_id) ?? 0) + 1);
  return acc;
}
