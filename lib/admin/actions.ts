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
}

function validar(input: GuardarNotaInput): string | null {
  if (!input.titulo.trim()) return "El título es obligatorio.";
  if (!input.bajada.trim()) return "La bajada es obligatoria.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return "El slug solo puede tener minúsculas, números y guiones.";
  }
  if (!input.autor_id) return "Elegí una firma para la nota.";
  if (!input.poster_url.trim()) return "La nota necesita una imagen principal.";
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

export async function guardarNota(input: GuardarNotaInput): Promise<ResultadoAccion> {
  const error = validar(input);
  if (error) return { ok: false, error };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión vencida. Volvé a entrar." };

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
    // Al editar, solo pisamos publicada_en si el modo cambia la publicación.
    const patch =
      input.modo === "borrador" ? { ...fila, publicada_en: null } : { ...fila, publicada_en };
    const { error: err } = await supabase.from("notas").update(patch).eq("id", notaId);
    if (err) return { ok: false, error: traducirError(err.message) };
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

  revalidarPublico(input.slug);
  return { ok: true, id: notaId };
}

export async function cambiarEstadoNota(
  id: string,
  accion: "publicar" | "despublicar",
): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const patch =
    accion === "publicar"
      ? { estado: "publicada", publicada_en: new Date().toISOString() }
      : { estado: "borrador", publicada_en: null };
  const { error } = await supabase.from("notas").update(patch).eq("id", id);
  if (error) return { ok: false, error: traducirError(error.message) };
  revalidarPublico();
  return { ok: true };
}

export async function toggleDestacada(id: string, destacada: boolean): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("notas").update({ destacada }).eq("id", id);
  if (error) return { ok: false, error: traducirError(error.message) };
  revalidarPublico();
  return { ok: true };
}

export async function borrarNota(id: string): Promise<ResultadoAccion> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("notas").delete().eq("id", id);
  if (error) return { ok: false, error: traducirError(error.message) };
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
    const { error } = await supabase.from("autores").update(fila).eq("id", input.id);
    if (error) return { ok: false, error: traducirError(error.message) };
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
  const { error } = await supabase.from("autores").delete().eq("id", id);
  if (error) {
    if (error.message.includes("foreign key")) {
      return { ok: false, error: "Esta firma tiene notas publicadas: reasignalas antes de borrarla." };
    }
    return { ok: false, error: traducirError(error.message) };
  }
  revalidatePath("/admin/autores");
  return { ok: true };
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
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
  revalidatePath("/");
  revalidatePath("/admin/notas");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/nota/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
}
