import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ToastProvider from "@/components/admin/Toasts";
import { getPerfilActual } from "@/lib/admin/notas-admin";
import { cerrarSesion } from "@/lib/admin/actions";

function fechaCierre(): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .replaceAll(".", "")
    .toUpperCase();
}

/** Layout del panel: guard de sesión + sidebar "mesa de redacción" + barra de cierre. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getPerfilActual();
  if (!perfil) redirect("/admin/login");

  return (
    <div className="admin-shell min-h-screen bg-[var(--color-paper)] flex flex-col md:flex-row">
      <AdminSidebar email={perfil.email} rol={perfil.rol} onCerrarSesion={cerrarSesion} />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barra de cierre de edición: eco de la barra roja del diario */}
        <div className="bg-[var(--color-river-red-deep)] text-white flex items-center justify-between gap-4 px-5 md:px-10 py-1.5">
          <span className="font-mono text-[10px] tracking-[0.18em]">{fechaCierre()}</span>
          <span className="hidden sm:block font-mono text-[10px] tracking-[0.18em]">
            ● CIERRE DE EDICIÓN ●
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em]">Nº 001</span>
        </div>
        <ToastProvider>
          <main className="flex-1 px-4 py-6 sm:px-5 sm:py-7 md:px-10 md:py-9">{children}</main>
        </ToastProvider>
      </div>
    </div>
  );
}
