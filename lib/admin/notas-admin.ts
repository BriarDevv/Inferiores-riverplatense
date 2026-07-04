/**
 * Capa de datos del PANEL. Usa el cliente de sesión: la RLS decide qué ve/toca cada rol
 * (staff ve todas las notas, incluidos borradores; anon jamás llega acá por el proxy).
 *
 * Estados: en DB solo persisten 'borrador' y 'publicada'. "Programada" es DERIVADO
 * (estado publicada + publicada_en en el futuro): la RLS pública la oculta sola hasta
 * que llegue la fecha — sin cron.
 */
import { createSupabaseServer } from "@/lib/supabase/server";
import { mapRowToNota, type NotaRow } from "@/lib/notas-mapper";
import type { Autor, EstadoNota, Nota, Sujeto } from "@/lib/types";

export interface NotaAdmin extends Nota {
  estado: EstadoNota;
  cuerpo: unknown | null;
  creada_por: string | null;
}

export interface FiltrosAdmin {
  estado?: EstadoNota;
  tipo?: string;
  division?: string;
  autor_id?: string;
  q?: string;
}

interface NotaAdminRow extends NotaRow {
  estado: "borrador" | "publicada";
  cuerpo: unknown | null;
  creada_por: string | null;
}

const SELECT_ADMIN =
  "*, autor:autores(id, nombre, rol, foto_url), nota_sujetos(sujeto:sujetos(id, tipo, nombre, slug, division, bio))";

/** Estado que ve el panel: deriva "programada" de la fecha futura. */
function estadoDerivado(row: NotaAdminRow): EstadoNota {
  if (row.estado === "publicada" && row.publicada_en && new Date(row.publicada_en) > new Date()) {
    return "programada";
  }
  return row.estado;
}

function mapAdmin(row: NotaAdminRow): NotaAdmin {
  return {
    ...mapRowToNota(row),
    estado: estadoDerivado(row),
    cuerpo: row.cuerpo,
    creada_por: row.creada_por,
  };
}

export async function listNotasAdmin(filtros: FiltrosAdmin = {}): Promise<NotaAdmin[]> {
  const supabase = await createSupabaseServer();
  let query = supabase
    .from("notas")
    .select(SELECT_ADMIN)
    .order("publicada_en", { ascending: false, nullsFirst: true })
    .order("creado_en", { ascending: false });

  if (filtros.tipo) query = query.eq("tipo", filtros.tipo);
  if (filtros.division) query = query.eq("division", filtros.division);
  if (filtros.autor_id) query = query.eq("autor_id", filtros.autor_id);
  if (filtros.q?.trim()) {
    const term = filtros.q.trim().replaceAll("%", "").replaceAll(",", " ");
    query = query.or(`titulo.ilike.%${term}%,bajada.ilike.%${term}%,slug.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Error listando notas: ${error.message}`);
  let notas = (data as unknown as NotaAdminRow[]).map(mapAdmin);

  // "programada" vive derivado, así que este filtro se aplica en memoria.
  if (filtros.estado) notas = notas.filter((n) => n.estado === filtros.estado);
  return notas;
}

export async function getNotaAdmin(id: string): Promise<NotaAdmin | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("notas")
    .select(SELECT_ADMIN)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Error leyendo nota: ${error.message}`);
  return data ? mapAdmin(data as unknown as NotaAdminRow) : null;
}

export interface AutorAdmin extends Autor {
  slug: string;
  bio?: string;
  rol_publico?: string;
  redes: { x?: string; instagram?: string; youtube?: string };
  email_contacto?: string;
  notas_count?: number;
}

export async function listAutoresAdmin(): Promise<AutorAdmin[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("autores")
    .select("*, notas(count)")
    .order("nombre");
  if (error) throw new Error(`Error listando autores: ${error.message}`);
  return (data ?? []).map((a) => ({
    id: a.id,
    nombre: a.nombre,
    rol: a.rol,
    avatar_url: a.foto_url ?? undefined,
    slug: a.slug,
    bio: a.bio ?? undefined,
    rol_publico: a.rol_publico ?? undefined,
    redes: (a.redes ?? {}) as AutorAdmin["redes"],
    email_contacto: a.email_contacto ?? undefined,
    notas_count: a.notas?.[0]?.count ?? 0,
  }));
}

export async function getAutorAdmin(id: string): Promise<AutorAdmin | null> {
  const autores = await listAutoresAdmin();
  return autores.find((a) => a.id === id) ?? null;
}

export async function listSujetosAdmin(): Promise<Sujeto[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from("sujetos").select("*").order("nombre");
  if (error) throw new Error(`Error listando sujetos: ${error.message}`);
  return (data ?? []).map((s) => ({
    id: s.id,
    tipo: s.tipo,
    nombre: s.nombre,
    slug: s.slug ?? undefined,
    division: s.division ?? undefined,
    bio: s.bio ?? undefined,
  }));
}

export interface PerfilActual {
  userId: string;
  email: string;
  rol: "admin" | "editor";
}

/** Usuario logueado + su rol. null si no hay sesión o no tiene profile. */
export async function getPerfilActual(): Promise<PerfilActual | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (!profile) return null;
  return { userId: user.id, email: user.email ?? "", rol: profile.rol };
}
