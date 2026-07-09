"use server";

/**
 * Server Actions del "Próximo partido" (la línea que anuncia la barra roja
 * del sitio). Mismo esquema que actions.ts: chequeo de sesión inline y la
 * RLS como autoridad final (escribe cualquier staff).
 */
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DIVISIONES } from "@/lib/constants";
import type { ResultadoAccion } from "./actions";

export interface GuardarPartidoInput {
  rival: string;
  division: string;
  /** Fecha del <input datetime-local> (YYYY-MM-DDTHH:mm), hora de Buenos Aires. */
  fecha: string;
  torneo?: string;
}

const SIN_SESION = "Sesión vencida. Volvé a entrar.";
const SIN_PERMISO =
  "No tenés permiso para esta acción (o el registro ya no existe).";

export async function guardarPartido(
  input: GuardarPartidoInput,
): Promise<ResultadoAccion> {
  if (!input.rival.trim()) return { ok: false, error: "Falta el rival." };
  if (!DIVISIONES.some((d) => d.value === input.division)) {
    return { ok: false, error: "Elegí una división válida." };
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input.fecha)) {
    return { ok: false, error: "Elegí fecha y hora del partido." };
  }
  // datetime-local llega sin zona: se interpreta como hora de Buenos Aires
  // (-03:00 fijo, Argentina no tiene horario de verano).
  const fecha = new Date(`${input.fecha}:00-03:00`);
  if (Number.isNaN(fecha.getTime())) {
    return { ok: false, error: "La fecha no es válida." };
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };

  const { data: filas, error } = await supabase
    .from("proximo_partido")
    .upsert({
      id: true,
      rival: input.rival.trim(),
      division: input.division,
      fecha: fecha.toISOString(),
      torneo: input.torneo?.trim() || null,
      actualizado_en: new Date().toISOString(),
    })
    .select("id");
  if (error) return { ok: false, error: `Algo falló al guardar: ${error.message}` };
  // La RLS bloquea sin error: 0 filas = sin permiso.
  if (!filas || filas.length === 0) return { ok: false, error: SIN_PERMISO };

  revalidarBarra();
  return { ok: true };
}

export async function quitarPartido(): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };

  const { data: filas, error } = await supabase
    .from("proximo_partido")
    .delete()
    .eq("id", true)
    .select("id");
  if (error) return { ok: false, error: `Algo falló al quitar: ${error.message}` };
  if (!filas || filas.length === 0) {
    return { ok: false, error: "No había ningún partido cargado." };
  }

  revalidarBarra();
  return { ok: true };
}

/** El anuncio vive en el layout del sitio: se revalida todo el árbol público. */
function revalidarBarra(): void {
  revalidatePath("/", "layout");
  revalidatePath("/admin/partido");
}
