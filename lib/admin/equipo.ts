import "server-only";

/**
 * Datos de la pantalla Equipo (solo admin). Los emails viven en auth.users,
 * que solo se lee con service role — por eso este módulo es server-only y
 * las páginas que lo usan verifican rol admin antes.
 */
import { createClient } from "@supabase/supabase-js";

export interface MiembroEquipo {
  userId: string;
  email: string;
  rol: "admin" | "editor" | null; // null = invitado sin profile (sin acceso aún)
  autorId: string | null;
  ultimoAcceso: string | null;
  invitadoEn: string;
}

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function listEquipo(): Promise<MiembroEquipo[]> {
  const supabase = admin();
  const [{ data: usuarios, error: errU }, { data: profiles, error: errP }] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 200 }),
    supabase.from("profiles").select("id, rol, autor_id"),
  ]);
  if (errU) throw new Error(`Error listando usuarios: ${errU.message}`);
  if (errP) throw new Error(`Error listando profiles: ${errP.message}`);

  const porId = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  return usuarios.users
    .map((u) => {
      const p = porId.get(u.id);
      return {
        userId: u.id,
        email: u.email ?? "(sin email)",
        rol: (p?.rol as "admin" | "editor" | undefined) ?? null,
        autorId: p?.autor_id ?? null,
        ultimoAcceso: u.last_sign_in_at ?? null,
        invitadoEn: u.created_at,
      };
    })
    .sort((a, b) => a.email.localeCompare(b.email));
}
