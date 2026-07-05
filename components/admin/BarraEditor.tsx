"use client";

import type { EstadoNota } from "@/lib/types";
import SelloEstado from "./SelloEstado";

export type EstadoGuardado = "inicial" | "sucio" | "guardando" | "guardado";

interface BarraEditorProps {
  estadoNota: EstadoNota;
  guardado: EstadoGuardado;
  ultimoGuardado: Date | null;
  esNueva: boolean;
  submitLabel: string;
  submitDeshabilitado: boolean;
  /** Motivo visible cuando el submit está bloqueado (ej: falta el poster). */
  motivoBloqueo?: string;
  onSalir: () => void;
  onVistaPrevia: () => void;
}

function hora(d: Date): string {
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

/** Barra sticky del editor: salida, estado de la nota, estado de guardado y acción. */
export default function BarraEditor({
  estadoNota,
  guardado,
  ultimoGuardado,
  esNueva,
  submitLabel,
  submitDeshabilitado,
  motivoBloqueo,
  onSalir,
  onVistaPrevia,
}: BarraEditorProps) {
  const indicador =
    guardado === "guardando"
      ? { texto: "Guardando…", clase: "text-black/50" }
      : guardado === "sucio"
        ? { texto: "Cambios sin guardar", clase: "text-[var(--estado-pendiente)]" }
        : guardado === "guardado" && ultimoGuardado
          ? { texto: `Guardado ${hora(ultimoGuardado)}`, clase: "text-[var(--estado-publicada)]" }
          : { texto: esNueva ? "Nota nueva" : "Sin cambios", clase: "text-black/40" };

  return (
    <div className="barra-editor -mx-4 px-4 sm:-mx-5 sm:px-5 md:-mx-10 md:px-10 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={onSalir}
          className="font-mono text-xs uppercase tracking-widest text-black/60 hover:text-[var(--color-river-red-deep)] transition-colors"
        >
          ‹ Notas
        </button>
        <SelloEstado tipo={estadoNota} />
        <span
          aria-live="polite"
          className={`font-mono text-[11px] uppercase tracking-widest ${indicador.clase}`}
        >
          {indicador.texto}
        </span>
        <span className="flex-1" />
        {motivoBloqueo && (
          <span className="font-body text-xs text-[var(--color-river-red-deep)] max-w-56 text-right leading-tight hidden sm:block">
            {motivoBloqueo}
          </span>
        )}
        <button
          type="button"
          onClick={onVistaPrevia}
          className="brut-cta-ink px-4 py-2.5 font-sports uppercase tracking-[0.15em] text-sm"
        >
          Vista previa
        </button>
        <button
          type="submit"
          disabled={submitDeshabilitado}
          className="brut-cta-red px-5 py-2.5 font-sports uppercase tracking-[0.15em] text-sm disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
      {motivoBloqueo && (
        <p className="sm:hidden mt-1.5 font-body text-xs text-[var(--color-river-red-deep)]">
          {motivoBloqueo}
        </p>
      )}
    </div>
  );
}
