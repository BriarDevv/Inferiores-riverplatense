import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import InvitarForm from "@/components/admin/InvitarForm";
import EquipoAcciones from "@/components/admin/EquipoAcciones";
import { getPerfilActual, listAutoresAdmin } from "@/lib/admin/notas-admin";
import { listEquipo } from "@/lib/admin/equipo";
import { formatearFecha } from "@/lib/constants";

export const metadata = { title: "Equipo — Panel" };

export default async function AdminEquipo() {
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") redirect("/admin");

  const [equipo, autores] = await Promise.all([listEquipo(), listAutoresAdmin()]);
  const opcionesAutor = autores.map((a) => ({ id: a.id, nombre: a.nombre }));

  return (
    <div className="max-w-5xl">
      <PageHeader
        overline="Panel de redacción"
        titulo="Equipo"
        descripcion="Quiénes entran al panel y con qué permisos. Editor: carga y edita sus notas. Admin: todo, incluida esta pantalla."
      />

      <InvitarForm />

      <div className="brut-frame-shadow overflow-x-auto bg-[var(--color-paper-pure)]">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cuenta</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th className="text-right">Rol · Firma · Acceso</th>
            </tr>
          </thead>
          <tbody>
            {equipo.map((m) => (
              <tr key={m.userId}>
                <td>
                  <span className="block font-body font-medium">
                    {m.email}
                    {m.userId === perfil.userId && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-river-red-deep)]"> · vos</span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                    Invitado {formatearFecha(m.invitadoEn)}
                  </span>
                </td>
                <td>
                  {m.rol ? (
                    <span className={`chip-estado ${m.rol === "admin" ? "chip-estado-publicada" : "chip-estado-programada"}`}>
                      {m.rol}
                    </span>
                  ) : (
                    <span className="chip-estado chip-estado-borrador">sin acceso</span>
                  )}
                </td>
                <td className="font-mono text-xs whitespace-nowrap">
                  {m.ultimoAcceso ? formatearFecha(m.ultimoAcceso) : "nunca entró"}
                </td>
                <td>
                  <EquipoAcciones
                    userId={m.userId}
                    email={m.email}
                    rol={m.rol}
                    autorId={m.autorId}
                    esYo={m.userId === perfil.userId}
                    autores={opcionesAutor}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-body text-sm text-black/50 max-w-2xl">
        La invitación llega por email con un link de acceso. Ojo: el plan gratis de
        Supabase manda pocos emails por hora; si el envío falla, esperá un rato o
        generá el acceso a mano con <code className="font-mono text-xs">scripts/gen-login-link.ts</code>.
      </p>
    </div>
  );
}
