"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  abierto: boolean;
  titulo: string;
  /** Consecuencias de la acción, en lenguaje llano. */
  descripcion?: string;
  confirmarLabel: string;
  /** true = acción destructiva (botón rojo profundo). */
  peligroso?: boolean;
  pendiente?: boolean;
  onConfirmar: () => void;
  onCerrar: () => void;
}

/**
 * Confirmación brutalist sobre <dialog> nativo: foco atrapado y Escape gratis.
 * Reemplaza a window.confirm en todo el panel.
 */
export default function ConfirmDialog({
  abierto,
  titulo,
  descripcion,
  confirmarLabel,
  peligroso = false,
  pendiente = false,
  onConfirmar,
  onCerrar,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (abierto && !dialog.open) dialog.showModal();
    if (!abierto && dialog.open) dialog.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className="brut-dialog"
      aria-labelledby="confirm-dialog-titulo"
      onCancel={(e) => {
        e.preventDefault();
        if (!pendiente) onCerrar();
      }}
      onClick={(e) => {
        // Click en el backdrop (el propio <dialog>) cierra.
        if (e.target === ref.current && !pendiente) onCerrar();
      }}
    >
      <div className="bg-[var(--color-ink)] text-white px-5 py-3">
        <h2 id="confirm-dialog-titulo" className="font-sports uppercase tracking-[0.16em] text-sm">
          {titulo}
        </h2>
      </div>
      <div className="px-5 py-5">
        {descripcion && (
          <p className="font-body text-sm leading-relaxed text-black/70 mb-5">{descripcion}</p>
        )}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            disabled={pendiente}
            className="px-4 py-2.5 font-mono text-xs uppercase tracking-widest border-2 border-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={pendiente}
            autoFocus
            className={`px-4 py-2.5 font-sports uppercase tracking-[0.14em] text-sm text-white border-2 transition-colors disabled:opacity-60 ${
              peligroso
                ? "bg-[var(--color-river-red-deep)] border-[var(--color-river-red-deep)] hover:bg-[var(--color-ink)] hover:border-[var(--color-ink)]"
                : "bg-[var(--color-ink)] border-[var(--color-ink)] hover:bg-[var(--color-river-red-deep)] hover:border-[var(--color-river-red-deep)]"
            }`}
          >
            {pendiente ? "Un momento…" : confirmarLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
