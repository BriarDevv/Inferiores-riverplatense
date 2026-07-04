/**
 * Estadísticas de visitas para el panel. Lee la vista agregada
 * `nota_visitas_resumen` con el cliente de sesión (RLS: solo staff).
 */
import { createSupabaseServer } from "@/lib/supabase/server";

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

export interface TotalesVisitas {
  total: number;
  ult_7d: number;
  ult_30d: number;
}

export async function getTotalesVisitas(): Promise<TotalesVisitas> {
  const porNota = await getVisitasPorNota();
  let total = 0;
  let ult_7d = 0;
  let ult_30d = 0;
  for (const v of porNota.values()) {
    total += v.total;
    ult_7d += v.ult_7d;
    ult_30d += v.ult_30d;
  }
  return { total, ult_7d, ult_30d };
}
