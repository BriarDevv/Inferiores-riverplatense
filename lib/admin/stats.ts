/**
 * Estadísticas de visitas para el panel. Lee la vista agregada
 * `nota_visitas_resumen` con el cliente de sesión (RLS: solo staff).
 */
import { createSupabaseServer } from "@/lib/supabase/server";
import type { VisitaCruda } from "./stats-periodo";

export interface VisitasNota {
  nota_id: string;
  total: number;
  ult_7d: number;
  ult_30d: number;
}

/** Mapa nota_id → visitas. Notas sin visitas no aparecen (tratarlas como 0). */
export async function getVisitasPorNota(): Promise<Map<string, VisitasNota>> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from("nota_visitas_resumen").select("*");
  if (error) throw new Error(`Error leyendo visitas: ${error.message}`);
  return new Map((data as VisitasNota[]).map((v) => [v.nota_id, v]));
}

const PAGINA_CRUDAS = 1000;

/**
 * Visitas crudas para Estadísticas (RLS: solo staff). Con `desde` trae ese
 * rango; sin `desde`, todo el histórico. Pagina de a 1000 para no chocar el
 * límite por request de Supabase.
 */
export async function getVisitasCrudas(desde: Date | null): Promise<VisitaCruda[]> {
  const supabase = await createSupabaseServer();
  const filas: VisitaCruda[] = [];
  for (let offset = 0; ; offset += PAGINA_CRUDAS) {
    let query = supabase
      .from("nota_visitas")
      .select("nota_id, visto_en, referer, dispositivo")
      .order("visto_en", { ascending: true })
      .range(offset, offset + PAGINA_CRUDAS - 1);
    if (desde) query = query.gte("visto_en", desde.toISOString());
    const { data, error } = await query;
    if (error) throw new Error(`Error leyendo visitas crudas: ${error.message}`);
    filas.push(...(data as VisitaCruda[]));
    if (!data || data.length < PAGINA_CRUDAS) break;
  }
  return filas;
}

/* === Agregados del tablero del Resumen (vistas de 005_resumen.sql) === */

export interface DiaVisitas {
  dia: string; // YYYY-MM-DD
  visitas: number;
}

/** Serie diaria de los últimos N días, con los días sin visitas en 0. */
export async function getSerieDiaria(dias = 14): Promise<DiaVisitas[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from("visitas_por_dia").select("*");
  if (error) throw new Error(`Error leyendo visitas por día: ${error.message}`);
  const porDia = new Map((data as DiaVisitas[]).map((d) => [d.dia, d.visitas]));

  const serie: DiaVisitas[] = [];
  const hoy = new Date();
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const clave = d.toISOString().slice(0, 10);
    serie.push({ dia: clave, visitas: porDia.get(clave) ?? 0 });
  }
  return serie;
}

export interface DeltaVisitas {
  actual: number; // últimos 7 días
  anterior: number; // los 7 previos
  deltaPct: number | null; // null si no hay base de comparación
}

/** Visitas de los últimos 7 días contra los 7 anteriores. */
export function deltaDeSerie(serie14: DiaVisitas[]): DeltaVisitas {
  const actual = serie14.slice(-7).reduce((acc, d) => acc + d.visitas, 0);
  const anterior = serie14.slice(0, -7).reduce((acc, d) => acc + d.visitas, 0);
  const deltaPct = anterior > 0 ? Math.round(((actual - anterior) / anterior) * 100) : null;
  return { actual, anterior, deltaPct };
}

/** Visitas por hora del día (0–23), índices sin datos en 0. */
export async function getVisitasPorHora(): Promise<number[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from("visitas_por_hora").select("*");
  if (error) throw new Error(`Error leyendo visitas por hora: ${error.message}`);
  const horas = Array.from({ length: 24 }, () => 0);
  for (const fila of data as Array<{ hora: number; visitas: number }>) {
    if (fila.hora >= 0 && fila.hora < 24) horas[fila.hora] = fila.visitas;
  }
  return horas;
}

/** Ventana de 4 horas con más visitas, para el insight "pico entre 18 y 22". */
export function franjaPico(horas: number[]): { desde: number; hasta: number; visitas: number } | null {
  const total = horas.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  let mejor = { desde: 0, hasta: 4, visitas: 0 };
  for (let h = 0; h < 24; h++) {
    let suma = 0;
    for (let i = 0; i < 4; i++) suma += horas[(h + i) % 24];
    if (suma > mejor.visitas) mejor = { desde: h, hasta: (h + 4) % 24, visitas: suma };
  }
  return mejor;
}

export interface Dispositivos {
  mobile: number;
  desktop: number;
  sinDato: number;
}

export async function getDispositivos(): Promise<Dispositivos> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from("visitas_por_dispositivo").select("*");
  if (error) throw new Error(`Error leyendo dispositivos: ${error.message}`);
  const r: Dispositivos = { mobile: 0, desktop: 0, sinDato: 0 };
  for (const fila of data as Array<{ dispositivo: string | null; visitas: number }>) {
    if (fila.dispositivo === "mobile") r.mobile += fila.visitas;
    else if (fila.dispositivo === "desktop") r.desktop += fila.visitas;
    else r.sinDato += fila.visitas;
  }
  return r;
}

export interface Fuente {
  fuente: string;
  visitas: number;
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

/** De dónde llegan los lectores, normalizado a nombres conocidos. */
export async function getFuentes(): Promise<Fuente[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from("visitas_por_referer").select("*");
  if (error) throw new Error(`Error leyendo fuentes: ${error.message}`);

  const acc = new Map<string, number>();
  for (const fila of data as Array<{ host: string | null; visitas: number }>) {
    let nombre: string;
    if (fila.host === null) nombre = "Directo";
    else {
      const conocida = FUENTES_CONOCIDAS.find((f) => f.patron.test(fila.host!));
      nombre = conocida?.nombre ?? "Otros";
    }
    acc.set(nombre, (acc.get(nombre) ?? 0) + fila.visitas);
  }
  return [...acc.entries()]
    .map(([fuente, visitas]) => ({ fuente, visitas }))
    .sort((a, b) => b.visitas - a.visitas);
}
