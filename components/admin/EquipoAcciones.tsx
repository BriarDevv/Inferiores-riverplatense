"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarRol, revocarAcceso, vincularFirma } from "@/lib/admin/equipo-actions";
import type { ResultadoAccion } from "@/lib/admin/actions";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./Toasts";

interface EquipoAccionesProps {
  userId: string;
  email: string;
  rol: "admin" | "editor" | null;
  autorId: string | null;
  esYo: boolean;
  autores: Array<{ id: string; nombre: string }>;
}

type Confirmacion =
  | { tipo: "rol"; rol: "admin" | "editor" }
  | { tipo: "revocar" }
  | null;

const CONSECUENCIAS_ROL: Record<"admin" | "editor", string> = {
  admin:
    "va a poder borrar notas, gestionar firmas, invitar gente y cambiar roles — incluido el tuyo.",
  editor: "va a poder cargar y editar sus propias notas, sin acceso a Equipo ni a borrar contenido.",
};

export default function EquipoAcciones({
  userId,
  email,
  rol,
  autorId,
  esYo,
  autores,
}: EquipoAccionesProps) {
  const router = useRouter();
  const toast = useToast();
  const [pendiente, startTransition] = useTransition();
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);

  function correr(fn: () => Promise<ResultadoAccion>, okTexto: string) {
    startTransition(async () => {
      const r = await fn();
      setConfirmacion(null);
      if (!r.ok) toast({ tipo: "error", texto: r.error ?? "Algo falló. Probá de nuevo." });
      else {
        toast({ texto: okTexto });
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 justify-end">
      <label className="sr-only" htmlFor={`rol-${userId}`}>Rol de {email}</label>
      <select
        id={`rol-${userId}`}
        value={rol ?? ""}
        disabled={pendiente || esYo}
        onChange={(e) => {
          const nuevo = e.target.value as "admin" | "editor";
          if (nuevo && nuevo !== rol) setConfirmacion({ tipo: "rol", rol: nuevo });
        }}
        className="admin-input py-1.5 text-sm"
        title={esYo ? "Tu propio rol no se toca desde acá" : "Cambiar rol"}
      >
        {rol === null && <option value="">sin acceso</option>}
        <option value="editor">editor</option>
        <option value="admin">admin</option>
      </select>

      <label className="sr-only" htmlFor={`firma-${userId}`}>Firma vinculada de {email}</label>
      <select
        id={`firma-${userId}`}
        value={autorId ?? ""}
        disabled={pendiente || rol === null}
        onChange={(e) => {
          const id = e.target.value || null;
          const nombre = autores.find((a) => a.id === id)?.nombre;
          correr(
            () => vincularFirma(userId, id),
            nombre ? `Listo: ${email} firma como ${nombre}.` : `Se desvinculó la firma de ${email}.`,
          );
        }}
        className="admin-input py-1.5 text-sm max-w-40"
        title="Firma vinculada (con cuál firma escribe por defecto)"
      >
        <option value="">sin firma</option>
        {autores.map((a) => (
          <option key={a.id} value={a.id}>{a.nombre}</option>
        ))}
      </select>

      {!esYo && rol !== null && (
        <button
          type="button"
          disabled={pendiente}
          onClick={() => setConfirmacion({ tipo: "revocar" })}
          className="font-mono text-[11px] uppercase tracking-widest px-2 py-1 text-black/40 hover:text-[var(--color-river-red-deep)] transition-colors disabled:opacity-40"
        >
          Revocar
        </button>
      )}

      <ConfirmDialog
        abierto={confirmacion?.tipo === "rol"}
        titulo={confirmacion?.tipo === "rol" && confirmacion.rol === "admin" ? "Dar rol admin" : "Cambiar a editor"}
        descripcion={
          confirmacion?.tipo === "rol"
            ? `${email} ${CONSECUENCIAS_ROL[confirmacion.rol]}`
            : undefined
        }
        confirmarLabel={confirmacion?.tipo === "rol" ? `Hacer ${confirmacion.rol}` : ""}
        pendiente={pendiente}
        onConfirmar={() => {
          if (confirmacion?.tipo !== "rol") return;
          const nuevo = confirmacion.rol;
          correr(() => cambiarRol(userId, nuevo), `Ahora ${email} es ${nuevo}.`);
        }}
        onCerrar={() => setConfirmacion(null)}
      />

      <ConfirmDialog
        abierto={confirmacion?.tipo === "revocar"}
        titulo="Revocar acceso"
        descripcion={`${email} no va a poder entrar más al panel. Sus notas quedan como están y se pueden reasignar. Podés volver a invitarlo cuando quieras.`}
        confirmarLabel="Revocar acceso"
        peligroso
        pendiente={pendiente}
        onConfirmar={() => correr(() => revocarAcceso(userId), `Acceso revocado a ${email}.`)}
        onCerrar={() => setConfirmacion(null)}
      />
    </div>
  );
}
