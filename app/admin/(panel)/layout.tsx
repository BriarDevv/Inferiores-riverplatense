import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getPerfilActual } from "@/lib/admin/notas-admin";
import { cerrarSesion } from "@/lib/admin/actions";

/** Layout del panel: guard de sesión + sidebar "mesa de redacción". */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getPerfilActual();
  if (!perfil) redirect("/admin/login");

  return (
    <div className="admin-shell min-h-screen bg-[var(--color-paper)] flex flex-col md:flex-row">
      <AdminSidebar email={perfil.email} rol={perfil.rol} onCerrarSesion={cerrarSesion} />
      <main className="flex-1 min-w-0 px-5 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
