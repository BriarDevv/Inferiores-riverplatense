/**
 * Próximo partido anunciado en la barra roja del nav.
 * Se carga a mano desde el panel (/admin/partido); acá viven la lectura
 * pública y la lógica de vigencia/formato. Solo se importa del lado server
 * (layout del sitio y página del panel) — el Nav recibe strings ya armados.
 */
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { ProximoPartido } from "./types";

/** Cuánto sigue visible el anuncio después de la hora del partido. */
export const GRACIA_POST_PARTIDO_MS = 3 * 60 * 60 * 1000;

const TZ = "America/Argentina/Buenos_Aires";

/** La fila singleton, o null si no hay partido cargado. */
export const getProximoPartido = cache(async (): Promise<ProximoPartido | null> => {
  // Cliente anónimo sin cookies: la tabla es de lectura pública (RLS) y así
  // funciona también en build time, igual que lib/notas.ts.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase
    .from("proximo_partido")
    .select("rival, division, fecha, torneo")
    .maybeSingle();
  if (error) throw new Error(`Error leyendo el próximo partido: ${error.message}`);
  return (data as ProximoPartido | null) ?? null;
});

/** Epoch ms del momento en que el anuncio deja de mostrarse. */
export function expiraPartido(fechaIso: string): number {
  return Date.parse(fechaIso) + GRACIA_POST_PARTIDO_MS;
}

/** true mientras el anuncio deba mostrarse (partido futuro o recién jugado). */
export function partidoVigente(fechaIso: string, ahora = Date.now()): boolean {
  return ahora < expiraPartido(fechaIso);
}

/**
 * "vie 10/07 · 12:00" en hora de Buenos Aires. Se arma por partes porque el
 * formato combinado de es-AR cambia el separador según la versión de ICU
 * ("10/07" en browsers, "10-07" en Node) y este string debe ser estable.
 */
export function formatearFechaPartido(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  const parte = (opciones: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-AR", { timeZone: TZ, ...opciones }).format(fecha);
  const semana = parte({ weekday: "short" });
  const dia = parte({ day: "2-digit" });
  const mes = parte({ month: "2-digit" });
  const hora = parte({ hour: "2-digit", minute: "2-digit", hour12: false });
  return `${semana} ${dia}/${mes} · ${hora}`;
}

/** ISO → valor para <input type="datetime-local"> en hora de Buenos Aires. */
export function fechaLocalBuenosAires(fechaIso: string): string {
  return new Date(fechaIso)
    .toLocaleString("sv-SE", { timeZone: TZ })
    .slice(0, 16)
    .replace(" ", "T");
}
