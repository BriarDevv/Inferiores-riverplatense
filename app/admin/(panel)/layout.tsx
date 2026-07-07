import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ToastProvider from "@/components/admin/Toasts";
import { getPerfilActual } from "@/lib/admin/notas-admin";
import { cerrarSesion } from "@/lib/admin/actions";

// El formatter se construye una sola vez: crearlo es caro.
const FORMATO_CIERRE = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function fechaCierre(): string {
  return FORMATO_CIERRE.format(new Date()).replaceAll(".", "").toUpperCase();
}

/** Layout del panel: guard de sesión + sidebar "mesa de redacción" + barra de cierre. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getPerfilActual();
  if (!perfil) redirect("/admin/login");

  return (
    <div className="admin-shell min-h-screen bg-[var(--color-paper)] flex flex-col md:flex-row">
      <AdminSidebar email={perfil.email} rol={perfil.rol} firma={perfil.firma} onCerrarSesion={cerrarSesion} />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Franja roja superior: eco de la barra del diario, solo la fecha */}
        <div className="bg-[var(--color-river-red-deep)] text-white px-5 md:px-10 py-1.5">
          <span className="font-mono text-[10px] tracking-[0.18em]">{fechaCierre()}</span>
        </div>
        <ToastProvider>
          <main className="flex-1 px-4 py-6 sm:px-5 sm:py-7 md:px-10 md:py-9">{children}</main>
        </ToastProvider>
      </div>
    </div>
  );
}
