"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  borrarNota,
  cambiarEstadoNota,
  toggleDestacada,
  type ResultadoAccion,
} from "@/lib/admin/actions";
import type { EstadoNota } from "@/lib/types";

interface NotaAccionesProps {
  id: string;
  estado: EstadoNota;
  destacada: boolean;
  esAdmin: boolean;
}

export default function NotaAcciones({ id, estado, destacada, esAdmin }: NotaAccionesProps) {
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

  const btn =
    "font-mono text-[11px] uppercase tracking-widest px-2 py-1 border-2 border-transparent hover:border-[var(--color-ink)] transition-colors disabled:opacity-40";

  return (
    <div className="flex items-center gap-1 justify-end">
      <Link href={`/admin/notas/${id}`} className={`${btn} text-[var(--color-river-red-deep)]`}>
        Editar
      </Link>
      {estado === "publicada" || estado === "programada" ? (
        <button
          type="button"
          disabled={pendiente}
          onClick={() => correr(() => cambiarEstadoNota(id, "despublicar"))}
          className={btn}
        >
          Despublicar
        </button>
      ) : (
        <button
          type="button"
          disabled={pendiente}
          onClick={() => correr(() => cambiarEstadoNota(id, "publicar"))}
          className={btn}
        >
          Publicar
        </button>
      )}
      <button
        type="button"
        disabled={pendiente}
        title={destacada ? "Quitar de destacada" : "Destacar en portada"}
        onClick={() => correr(() => toggleDestacada(id, !destacada))}
        className={`${btn} ${destacada ? "text-[var(--color-river-red)]" : "text-black/40"}`}
      >
        ★
      </button>
      {esAdmin && (
        <button
          type="button"
          disabled={pendiente}
          onClick={() => {
            if (window.confirm("¿Borrar esta nota? No se puede deshacer.")) {
              correr(() => borrarNota(id));
            }
          }}
          className={`${btn} text-black/40 hover:text-[var(--color-river-red-deep)]`}
        >
          Borrar
        </button>
      )}
      {error && (
        <span role="alert" className="font-body text-xs text-[var(--color-river-red-deep)]">
          {error}
        </span>
      )}
    </div>
  );
}
