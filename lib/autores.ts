/**
 * Capa de acceso público a autores (firmas) — para /autor/[slug].
 * Cliente anónimo sin cookies: funciona en build time (SSG) y solo ve lo público.
 */
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export interface AutorPublico {
  id: string;
  nombre: string;
  slug: string;
  foto_url?: string;
  bio?: string;
  rol_publico?: string;
  redes: { x?: string; instagram?: string; youtube?: string };
  email_contacto?: string;
}

interface AutorRow {
  id: string;
  nombre: string;
  slug: string;
  foto_url: string | null;
  bio: string | null;
  rol_publico: string | null;
  redes: { x?: string; instagram?: string; youtube?: string } | null;
  email_contacto: string | null;
}

const fetchAutores = cache(async (): Promise<AutorPublico[]> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase
    .from("autores")
    .select("id, nombre, slug, foto_url, bio, rol_publico, redes, email_contacto")
    .order("nombre");
  if (error) throw new Error(`Error leyendo autores: ${error.message}`);
  return (data as AutorRow[]).map((a) => ({
    id: a.id,
    nombre: a.nombre,
    slug: a.slug,
    foto_url: a.foto_url ?? undefined,
    bio: a.bio ?? undefined,
    rol_publico: a.rol_publico ?? undefined,
    redes: a.redes ?? {},
    email_contacto: a.email_contacto ?? undefined,
  }));
});

export async function getAutorPorSlug(slug: string): Promise<AutorPublico | null> {
  const autores = await fetchAutores();
  return autores.find((a) => a.slug === slug) ?? null;
}

export async function getSlugsDeAutores(): Promise<string[]> {
  const autores = await fetchAutores();
  return autores.map((a) => a.slug);
}
