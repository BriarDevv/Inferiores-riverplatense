"use client";

import { createContext, use, useCallback, useRef, useState } from "react";

export interface ToastInput {
  texto: string;
  tipo?: "ok" | "error";
  /** Link opcional al final del toast (ej: "Ver en el sitio"). */
  href?: string;
  hrefLabel?: string;
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

/** Dispara toasts desde cualquier client component del panel. */
export function useToast() {
  return use(ToastContext);
}

const DURACION_OK_MS = 4500;
const DURACION_ERROR_MS = 8000;
const MAX_VISIBLES = 3;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const quitar = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: ToastInput) => {
      const id = nextId.current++;
      setToasts((ts) => [...ts.slice(-(MAX_VISIBLES - 1)), { ...t, id }]);
      const duracion = t.tipo === "error" ? DURACION_ERROR_MS : DURACION_OK_MS;
      setTimeout(() => quitar(id), duracion);
    },
    [quitar],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-pila" role="region" aria-label="Avisos del panel">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tipo === "error" ? "alert" : "status"}
            className={`toast ${t.tipo === "error" ? "toast-error" : ""}`}
          >
            <p className="font-body text-sm leading-snug flex-1 min-w-0">
              {t.texto}
              {t.href && (
                <a
                  href={t.href}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 font-mono text-[11px] uppercase tracking-widest underline underline-offset-2 hover:text-[var(--color-river-red-soft)] whitespace-nowrap"
                >
                  {t.hrefLabel ?? "Ver"} ↗
                </a>
              )}
            </p>
            <button
              type="button"
              onClick={() => quitar(t.id)}
              aria-label="Cerrar aviso"
              className="font-mono text-xs text-white/60 hover:text-white shrink-0 pt-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
