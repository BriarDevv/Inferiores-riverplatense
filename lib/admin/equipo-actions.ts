"use server";

import "server-only";

/**
 * Acciones de la pantalla Equipo. Usan service role (invitar/leer emails),
 * así que CADA acción verifica primero que quien la ejecuta sea admin.
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/admin/notas-admin";
import { SITE_URL } from "@/lib/site";
import type { ResultadoAccion } from "@/lib/admin/actions";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

async function exigirAdmin(): Promise<string | null> {
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") return "Solo el administrador puede gestionar el equipo.";
  return null;
}

export async function invitarMiembro(
  email: string,
  rol: "admin" | "editor",
): Promise<ResultadoAccion> {
  const {
    data: { user },
  } = await (await createSupabaseServer()).auth.getUser();
  if (!user) return { ok: false, error: "Sesión vencida. Volvé a entrar." };
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return { ok: false, error: noAutorizado };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Ese email no parece válido." };
  }

  const supabase = admin();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback`,
  });
  if (error) {
    if (error.message.includes("already been registered")) {
      return { ok: false, error: "Ese email ya está registrado. Asignale rol desde la tabla." };
    }
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return {
        ok: false,
        error:
          "Se agotó el límite de emails por hora. Esperá un rato y volvé a intentar.",
      };
    }
    return { ok: false, error: `No se pudo invitar: ${error.message}` };
  }

  // El profile se crea YA, con el rol elegido: cuando la persona entre, ya tiene acceso.
  const { error: errP } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, rol });
  if (errP) return { ok: false, error: `Invitado, pero falló el rol: ${errP.message}` };

  revalidatePath("/admin/equipo");
  return { ok: true };
}

export async function cambiarRol(
  userId: string,
  rol: "admin" | "editor",
): Promise<ResultadoAccion> {
  const {
    data: { user },
  } = await (await createSupabaseServer()).auth.getUser();
  if (!user) return { ok: false, error: "Sesión vencida. Volvé a entrar." };
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return { ok: false, error: noAutorizado };

  const perfil = await getPerfilActual();
  if (perfil?.userId === userId && rol !== "admin") {
    return { ok: false, error: "No podés sacarte el admin a vos mismo." };
  }

  const supabase = admin();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, rol }, { onConflict: "id" });
  if (error) return { ok: false, error: `No se pudo cambiar el rol: ${error.message}` };

  revalidatePath("/admin/equipo");
  return { ok: true };
}

export async function vincularFirma(
  userId: string,
  autorId: string | null,
): Promise<ResultadoAccion> {
  const {
    data: { user },
  } = await (await createSupabaseServer()).auth.getUser();
  if (!user) return { ok: false, error: "Sesión vencida. Volvé a entrar." };
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return { ok: false, error: noAutorizado };

  const supabase = admin();
  const { error } = await supabase
    .from("profiles")
    .update({ autor_id: autorId })
    .eq("id", userId);
  if (error) return { ok: false, error: `No se pudo vincular: ${error.message}` };

  revalidatePath("/admin/equipo");
  return { ok: true };
}

export async function revocarAcceso(userId: string): Promise<ResultadoAccion> {
  const {
    data: { user },
  } = await (await createSupabaseServer()).auth.getUser();
  if (!user) return { ok: false, error: "Sesión vencida. Volvé a entrar." };
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return { ok: false, error: noAutorizado };

  const perfil = await getPerfilActual();
  if (perfil?.userId === userId) {
    return { ok: false, error: "No podés revocarte el acceso a vos mismo." };
  }

  const supabase = admin();
  // Sin profile no se pasa del login (el callback lo exige). Las notas que creó quedan.
  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  if (error) return { ok: false, error: `No se pudo revocar: ${error.message}` };

  revalidatePath("/admin/equipo");
  return { ok: true };
}
