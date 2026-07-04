import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Panel de redacción" };

export default async function AdminHome() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center px-4">
      <div className="brut-frame-shadow-red bg-[var(--color-paper-pure)] p-8 max-w-lg">
        <p className="overline mb-2">Panel de redacción</p>
        <h1 className="font-display text-3xl font-bold mb-4">Sesión activa</h1>
        <p className="font-body">
          Entraste como <strong>{user.email}</strong> con rol{" "}
          <strong>{profile?.rol ?? "sin profile"}</strong>. El dashboard llega en la
          Fase 2.
        </p>
      </div>
    </main>
  );
}
