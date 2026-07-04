"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarRol, revocarAcceso, vincularFirma } from "@/lib/admin/equipo-actions";
import type { ResultadoAccion } from "@/lib/admin/actions";

interface EquipoAccionesProps {
  userId: string;
  email: string;
  rol: "admin" | "editor" | null;
  autorId: string | null;
  esYo: boolean;
  autores: Array<{ id: string; nombre: string }>;
}

export default function EquipoAcciones({
  userId,
  email,
  rol,
  autorId,
  esYo,
  autores,
}: EquipoAccionesProps) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function correr(fn: () => Promise<ResultadoAccion>) {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Algo falló.");
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 justify-end">
      <label className="sr-only" htmlFor={`rol-${userId}`}>Rol de {email}</label>
      <select
        id={`rol-${userId}`}
        value={rol ?? ""}
        disabled={pendiente || esYo}
        onChange={(e) => correr(() => cambiarRol(userId, e.target.value as "admin" | "editor"))}
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
        onChange={(e) => correr(() => vincularFirma(userId, e.target.value || null))}
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
          onClick={() => {
            if (window.confirm(`¿Sacarle el acceso al panel a ${email}?`)) {
              correr(() => revocarAcceso(userId));
            }
          }}
          className="font-mono text-[11px] uppercase tracking-widest px-2 py-1 text-black/40 hover:text-[var(--color-river-red-deep)] transition-colors disabled:opacity-40"
        >
          Revocar
        </button>
      )}
      {error && (
        <span role="alert" className="basis-full text-right font-body text-xs text-[var(--color-river-red-deep)]">
          {error}
        </span>
      )}
    </div>
  );
}
