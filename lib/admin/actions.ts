"use server";

/**
 * Server Actions del panel. Todas usan el cliente de sesión: la RLS es la
 * autoridad final (editor solo toca lo suyo, admin todo, autores solo admin).
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type ModoPublicacion = "borrador" | "ahora" | "programada";

export interface GuardarNotaInput {
  id?: string; // sin id = crear
  titulo: string;
  bajada: string;
  slug: string;
  tipo: string;
  division: string;
  formato: string;
  fuente: string;
  poster_url: string;
  youtube_id?: string;
  video_url?: string;
  autor_id: string;
  tags: string[];
  sujetos: string[]; // ids
  cuerpo: unknown; // JSON Tiptap
  primicia: boolean;
  destacada: boolean;
  modo: ModoPublicacion;
  programada_para?: string; // ISO, requerido si modo=programada
  /** true = autosave: no revalida rutas (un borrador no toca el sitio público). */
  silencioso?: boolean;
}

function validar(input: GuardarNotaInput): string | null {
  if (!input.titulo.trim()) return "El título es obligatorio.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return "El slug solo puede tener minúsculas, números y guiones.";
  }
  if (!input.autor_id) return "Elegí una firma para la nota.";
  // Un borrador puede guardarse incompleto; para publicar se exige todo.
  if (input.modo !== "borrador") {
    if (!input.bajada.trim()) return "La bajada es obligatoria para publicar.";
    if (!input.poster_url.trim()) return "Falta la imagen principal para publicar.";
  }
  if (input.modo === "programada" && !input.programada_para) {
    return "Elegí fecha y hora de publicación.";
  }
  if (
    input.modo === "programada" &&
    input.programada_para &&
    new Date(input.programada_para) <= new Date()
  ) {
    return "La fecha programada tiene que ser futura.";
  }
  return null;
}

export interface ResultadoAccion {
  ok: boolean;
  error?: string;
  id?: string;
}

const SIN_SESION = "Sesión vencida. Volvé a entrar.";
const SIN_PERMISO =
  "No tenés permiso para esta acción (o el registro ya no existe).";

// Guard de sesión INLINE en cada action que escribe: la RLS es la autoridad
// final, pero sin este chequeo una llamada anónima "afecta 0 filas" sin error
// y la action reportaría un falso ok.

export async function guardarNota(input: GuardarNotaInput): Promise<ResultadoAccion> {
  const error = validar(input);
  if (error) return { ok: false, error };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };

  // Estado persistido: 'programada' se guarda como publicada con fecha futura
  // (la RLS pública la oculta hasta que llegue la hora).
  const estado = input.modo === "borrador" ? "borrador" : "publicada";
  const publicada_en =
    input.modo === "ahora"
      ? new Date().toISOString()
      : input.modo === "programada"
        ? new Date(input.programada_para!).toISOString()
        : null;

  const fila = {
    slug: input.slug,
    titulo: input.titulo.trim(),
    bajada: input.bajada.trim(),
    tipo: input.tipo,
    division: input.division,
    formato: input.formato,
    fuente: input.fuente,
    poster_url: input.poster_url,
    youtube_id: input.youtube_id || null,
    video_url: input.video_url || null,
    autor_id: input.autor_id,
    tags: input.tags,
    cuerpo: input.cuerpo ?? null,
    primicia: input.primicia,
    destacada: input.destacada,
    estado,
    actualizada_en: input.id ? new Date().toISOString() : null,
  };

  let notaId = input.id;
  if (notaId) {
    // Al editar: "ahora" sobre una nota ya publicada CONSERVA su fecha original
    // (no queremos que cada corrección la mande arriba de todo en la portada).
    let fechaFinal = publicada_en;
    if (input.modo === "ahora") {
      const { data: actual } = await supabase
        .from("notas")
        .select("publicada_en, estado")
        .eq("id", notaId)
        .single();
      if (actual?.estado === "publicada" && actual.publicada_en) {
        fechaFinal = actual.publicada_en;
      }
    }
    const patch =
      input.modo === "borrador"
        ? { ...fila, publicada_en: null }
        : { ...fila, publicada_en: fechaFinal };
    const { data: filas, error: err } = await supabase
      .from("notas")
      .update(patch)
      .eq("id", notaId)
      .select("id");
    if (err) return { ok: false, error: traducirError(err.message) };
    // La RLS filtra sin error: 0 filas = nota ajena o inexistente.
    if (!filas || filas.length === 0) return { ok: false, error: SIN_PERMISO };
  } else {
    notaId = `n-${crypto.randomUUID().slice(0, 8)}`;
    const { error: err } = await supabase
      .from("notas")
      .insert({ ...fila, id: notaId, publicada_en, creada_por: user.id });
    if (err) return { ok: false, error: traducirError(err.message) };
  }

  // Pivote de sujetos: reemplazo total (simple y correcto para N chico).
  const { error: errDel } = await supabase.from("nota_sujetos").delete().eq("nota_id", notaId);
  if (errDel) return { ok: false, error: traducirError(errDel.message) };
  if (input.sujetos.length > 0) {
    const { error: errPiv } = await supabase
      .from("nota_sujetos")
      .insert(input.sujetos.map((sujeto_id) => ({ nota_id: notaId, sujeto_id })));
    if (errPiv) return { ok: false, error: traducirError(errPiv.message) };
  }

  if (!input.silencioso) revalidarPublico(input.slug);
  return { ok: true, id: notaId };
}

export async function cambiarEstadoNota(
  id: string,
  accion: "publicar" | "despublicar",
): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };
  const patch =
    accion === "publicar"
      ? { estado: "publicada", publicada_en: new Date().toISOString() }
      : { estado: "borrador", publicada_en: null };
  const { data: filas, error } = await supabase
    .from("notas")
    .update(patch)
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, error: traducirError(error.message) };
  if (!filas || filas.length === 0) return { ok: false, error: SIN_PERMISO };
  revalidarPublico();
  return { ok: true };
}

export async function toggleDestacada(id: string, destacada: boolean): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };
  const { data: filas, error } = await supabase
    .from("notas")
    .update({ destacada })
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, error: traducirError(error.message) };
  if (!filas || filas.length === 0) return { ok: false, error: SIN_PERMISO };
  revalidarPublico();
  return { ok: true };
}

/** Crea una copia de la nota como borrador (sin destacada ni primicia, sin fecha). */
export async function duplicarNota(id: string): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión vencida. Volvé a entrar." };

  const { data: orig, error: errGet } = await supabase
    .from("notas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (errGet || !orig) return { ok: false, error: "No se encontró la nota a duplicar." };

  const { data: pivote } = await supabase
    .from("nota_sujetos")
    .select("sujeto_id")
    .eq("nota_id", id);

  const { id: _id, creado_en: _creado, ...resto } = orig as Record<string, unknown> & {
    id: string;
    creado_en?: string;
  };
  const base = {
    ...resto,
    titulo: `${orig.titulo} (copia)`,
    primicia: false,
    destacada: false,
    estado: "borrador",
    publicada_en: null,
    actualizada_en: null,
    creada_por: user.id,
  };

  // Primer intento con slug "-copia"; si ya existe, sufijo corto único.
  let nuevoId = `n-${crypto.randomUUID().slice(0, 8)}`;
  let { error: errIns } = await supabase
    .from("notas")
    .insert({ ...base, id: nuevoId, slug: `${orig.slug}-copia` });
  if (errIns?.message.includes("duplicate key")) {
    nuevoId = `n-${crypto.randomUUID().slice(0, 8)}`;
    ({ error: errIns } = await supabase
      .from("notas")
      .insert({ ...base, id: nuevoId, slug: `${orig.slug}-copia-${nuevoId.slice(-4)}` }));
  }
  if (errIns) return { ok: false, error: traducirError(errIns.message) };

  if (pivote && pivote.length > 0) {
    const { error: errPivote } = await supabase
      .from("nota_sujetos")
      .insert(pivote.map((p) => ({ nota_id: nuevoId, sujeto_id: p.sujeto_id })));
    if (errPivote) {
      // La copia existe pero sin protagonistas: mejor avisarlo que un ok mudo.
      revalidatePath("/admin/notas");
      return {
        ok: false,
        error: `La copia se creó pero sin los protagonistas (${traducirError(errPivote.message)})`,
      };
    }
  }

  revalidatePath("/admin/notas");
  return { ok: true, id: nuevoId };
}

export async function borrarNota(id: string): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };
  // La RLS solo deja borrar al admin; select("id") detecta el bloqueo silencioso.
  const { data: filas, error } = await supabase
    .from("notas")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, error: traducirError(error.message) };
  if (!filas || filas.length === 0) return { ok: false, error: SIN_PERMISO };
  revalidarPublico();
  return { ok: true };
}

export interface GuardarAutorInput {
  id?: string;
  nombre: string;
  slug: string;
  foto_url?: string;
  bio?: string;
  rol_publico?: string;
  redes: { x?: string; instagram?: string; youtube?: string };
  email_contacto?: string;
}

export async function guardarAutor(input: GuardarAutorInput): Promise<ResultadoAccion> {
  if (!input.nombre.trim()) return { ok: false, error: "El nombre es obligatorio." };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return { ok: false, error: "El slug solo puede tener minúsculas, números y guiones." };
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };
  const fila = {
    nombre: input.nombre.trim(),
    slug: input.slug,
    foto_url: input.foto_url || null,
    bio: input.bio?.trim() || null,
    rol_publico: input.rol_publico?.trim() || null,
    redes: input.redes,
    email_contacto: input.email_contacto?.trim() || null,
  };

  if (input.id) {
    const { data: filas, error } = await supabase
      .from("autores")
      .update(fila)
      .eq("id", input.id)
      .select("id");
    if (error) return { ok: false, error: traducirError(error.message) };
    if (!filas || filas.length === 0) return { ok: false, error: SIN_PERMISO };
  } else {
    const id = `a-${crypto.randomUUID().slice(0, 8)}`;
    const { error } = await supabase.from("autores").insert({ ...fila, id, rol: "editor" });
    if (error) return { ok: false, error: traducirError(error.message) };
  }

  revalidatePath("/admin/autores");
  revalidarPublico();
  return { ok: true };
}

export async function borrarAutor(id: string): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };
  const { data: filas, error } = await supabase
    .from("autores")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) {
    if (error.message.includes("foreign key")) {
      return { ok: false, error: "Esta firma tiene notas publicadas: reasignalas antes de borrarla." };
    }
    return { ok: false, error: traducirError(error.message) };
  }
  if (!filas || filas.length === 0) return { ok: false, error: SIN_PERMISO };
  revalidatePath("/admin/autores");
  // El perfil público /autor/[slug] y el sitemap quedan horneados
  // apuntando a la firma borrada si no se invalida el árbol público.
  revalidarPublico();
  return { ok: true };
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Errores de Postgres/RLS → mensajes que un periodista entiende. */
function traducirError(msg: string): string {
  if (msg.includes("row-level security")) {
    return "No tenés permiso para esta acción (las notas ajenas solo las toca el administrador).";
  }
  if (msg.includes("duplicate key") && msg.includes("slug")) {
    return "Ya existe una nota con ese slug. Cambialo.";
  }
  if (msg.includes("duplicate key")) return "Ya existe un registro con esos datos.";
  return `Algo falló al guardar: ${msg}`;
}

function revalidarPublico(slug?: string): void {
  // Una nota alimenta TODO el árbol horneado: portada, landings, hubs,
  // /sobre (stats), /contacto y la barra roja "Último" que vive en el
  // layout de cada página. Se invalida el layout completo (igual que
  // partido-actions) en vez de enumerar familias que pueden desactualizarse.
  revalidatePath("/", "layout");
  revalidatePath("/admin/notas");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/nota/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/news-sitemap.xml");
  revalidatePath("/feed.xml");
}
