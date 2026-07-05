"use client";

import { useEffect, useRef, useState } from "react";
import type { EstadoNota } from "@/lib/types";
import type { ModoPublicacion } from "@/lib/admin/actions";
import SelloEstado from "./SelloEstado";
import ConfirmDialog from "./ConfirmDialog";

export type EstadoGuardado = "inicial" | "sucio" | "guardando" | "guardado";

interface BarraEditorProps {
  esNueva: boolean;
  estadoNota: EstadoNota;
  guardado: EstadoGuardado;
  ultimoGuardado: Date | null;
  pendiente: boolean;
  /** Checklist en verde: se puede publicar/mantener publicada. */
  puedePublicar: boolean;
  motivoBloqueo?: string;
  /** Fecha actual de una programada, en formato datetime-local. */
  programadaPara?: string;
  onSalir: () => void;
  onVistaPrevia: () => void;
  onGuardar: (modo: ModoPublicacion, fechaLocal?: string) => void;
  onDespublicar: () => void;
}

function hora(d: Date): string {
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

/** Mañana a las 18:00, como sugerencia inicial del panel de programación. */
function fechaSugerida(): string {
  const d = new Date(Date.now() + 86_400_000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T18:00`;
}

/**
 * Barra de acciones del editor. Sin radios: cada botón dice lo que hace.
 * borrador → [Guardar borrador] [Publicar ▾: ahora / programar]
 * publicada → [Guardar cambios] [▾: despublicar]
 * programada → [Guardar] [▾: publicar ahora / cambiar fecha / despublicar]
 */
export default function BarraEditor({
  esNueva,
  estadoNota,
  guardado,
  ultimoGuardado,
  pendiente,
  puedePublicar,
  motivoBloqueo,
  programadaPara,
  onSalir,
  onVistaPrevia,
  onGuardar,
  onDespublicar,
}: BarraEditorProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [programarAbierto, setProgramarAbierto] = useState(false);
  const [fecha, setFecha] = useState(programadaPara ?? fechaSugerida());
  const [confirmaDespublicar, setConfirmaDespublicar] = useState(false);
  const zonaAcciones = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAbierto && !programarAbierto) return;
    function cerrarSiAfuera(e: MouseEvent) {
      if (!zonaAcciones.current?.contains(e.target as Node)) {
        setMenuAbierto(false);
        setProgramarAbierto(false);
      }
    }
    function conTeclado(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuAbierto(false);
        setProgramarAbierto(false);
      }
    }
    document.addEventListener("mousedown", cerrarSiAfuera);
    document.addEventListener("keydown", conTeclado);
    return () => {
      document.removeEventListener("mousedown", cerrarSiAfuera);
      document.removeEventListener("keydown", conTeclado);
    };
  }, [menuAbierto, programarAbierto]);

  const indicador =
    guardado === "guardando"
      ? { texto: "Guardando…", clase: "text-black/50" }
      : guardado === "sucio"
        ? { texto: "Cambios sin guardar", clase: "text-[var(--estado-pendiente)]" }
        : guardado === "guardado" && ultimoGuardado
          ? { texto: `Guardado ${hora(ultimoGuardado)}`, clase: "text-[var(--estado-publicada)]" }
          : { texto: "", clase: "" };

  const itemMenu =
    "block w-full text-left font-mono text-[11px] uppercase tracking-widest px-3 py-2.5 hover:bg-[var(--color-river-red-soft)] transition-colors disabled:opacity-40 disabled:hover:bg-transparent";

  const esBorrador = estadoNota === "borrador";
  const primarioLabel = pendiente
    ? "Guardando…"
    : esBorrador
      ? "Publicar"
      : estadoNota === "publicada"
        ? "Guardar cambios"
        : "Guardar";
  const primarioBloqueado = pendiente || (!esBorrador && !puedePublicar);

  function accionPrimaria() {
    if (esBorrador) {
      setMenuAbierto(!menuAbierto);
      setProgramarAbierto(false);
    } else if (estadoNota === "programada") {
      onGuardar("programada", programadaPara);
    } else {
      onGuardar("ahora");
    }
  }

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
        <span className="font-display font-bold text-sm hidden sm:inline">
          {esNueva ? "Nueva nota" : "Editando"}
        </span>
        <SelloEstado tipo={estadoNota} />
        <span
          aria-live="polite"
          className={`font-mono text-[11px] uppercase tracking-widest ${indicador.clase}`}
        >
          {indicador.texto}
        </span>
        <span className="flex-1" />

        <button
          type="button"
          onClick={onVistaPrevia}
          className="font-mono text-[11px] uppercase tracking-widest px-3 py-2.5 border-2 border-[var(--color-ink)] hover:bg-[var(--color-river-red-soft)] transition-colors"
        >
          Vista previa
        </button>

        <div ref={zonaAcciones} className="relative flex items-center gap-2">
          {esBorrador && (
            <button
              type="button"
              disabled={pendiente}
              onClick={() => onGuardar("borrador")}
              className="brut-cta-ink px-4 py-2.5 font-sports uppercase tracking-[0.15em] text-sm disabled:opacity-50"
            >
              {pendiente ? "Guardando…" : "Guardar borrador"}
            </button>
          )}

          <button
            type="button"
            disabled={primarioBloqueado}
            onClick={accionPrimaria}
            aria-haspopup={esBorrador ? "menu" : undefined}
            aria-expanded={esBorrador ? menuAbierto : undefined}
            className="brut-cta-red px-5 py-2.5 font-sports uppercase tracking-[0.15em] text-sm disabled:opacity-50"
          >
            {primarioLabel}
            {esBorrador && <span aria-hidden className="ml-2">▾</span>}
          </button>

          {/* Menú secundario de publicadas/programadas */}
          {!esBorrador && (
            <button
              type="button"
              disabled={pendiente}
              onClick={() => {
                setMenuAbierto(!menuAbierto);
                setProgramarAbierto(false);
              }}
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
              aria-label="Más acciones de publicación"
              className="font-sports text-sm px-2.5 py-2.5 border-2 border-[var(--color-ink)] hover:bg-[var(--color-river-red-soft)] transition-colors disabled:opacity-50"
            >
              ▾
            </button>
          )}

          {menuAbierto && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 z-50 min-w-56 bg-[var(--color-paper-pure)] border-2 border-[var(--color-ink)] p-1"
              style={{ boxShadow: "5px 5px 0 var(--color-ink)" }}
            >
              {esBorrador ? (
                <>
                  <button
                    role="menuitem"
                    type="button"
                    disabled={!puedePublicar}
                    title={puedePublicar ? undefined : motivoBloqueo}
                    className={itemMenu}
                    onClick={() => {
                      setMenuAbierto(false);
                      onGuardar("ahora");
                    }}
                  >
                    Publicar ahora
                  </button>
                  <button
                    role="menuitem"
                    type="button"
                    disabled={!puedePublicar}
                    title={puedePublicar ? undefined : motivoBloqueo}
                    className={itemMenu}
                    onClick={() => {
                      setMenuAbierto(false);
                      setProgramarAbierto(true);
                    }}
                  >
                    Programar fecha…
                  </button>
                  {!puedePublicar && motivoBloqueo && (
                    <p className="px-3 py-2 font-body text-xs text-[var(--color-river-red-deep)] border-t border-black/10">
                      {motivoBloqueo}
                    </p>
                  )}
                </>
              ) : (
                <>
                  {estadoNota === "programada" && (
                    <>
                      <button
                        role="menuitem"
                        type="button"
                        className={itemMenu}
                        onClick={() => {
                          setMenuAbierto(false);
                          onGuardar("ahora");
                        }}
                      >
                        Publicar ahora
                      </button>
                      <button
                        role="menuitem"
                        type="button"
                        className={itemMenu}
                        onClick={() => {
                          setMenuAbierto(false);
                          setProgramarAbierto(true);
                        }}
                      >
                        Cambiar fecha…
                      </button>
                    </>
                  )}
                  <button
                    role="menuitem"
                    type="button"
                    className={`${itemMenu} text-[var(--color-river-red-deep)]`}
                    onClick={() => {
                      setMenuAbierto(false);
                      setConfirmaDespublicar(true);
                    }}
                  >
                    Despublicar
                  </button>
                </>
              )}
            </div>
          )}

          {/* Panel de programación */}
          {programarAbierto && (
            <div
              className="absolute right-0 top-full mt-2 z-50 w-72 bg-[var(--color-paper-pure)] border-2 border-[var(--color-ink)] p-4"
              style={{ boxShadow: "5px 5px 0 var(--color-ink)" }}
            >
              <p className="brut-label mb-2">Sale sola el…</p>
              <input
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                autoFocus
                className="admin-input w-full font-mono text-sm mb-3"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProgramarAbierto(false)}
                  className="font-mono text-[11px] uppercase tracking-widest px-2 py-1.5 text-black/50 hover:text-[var(--color-ink)]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!fecha || pendiente}
                  onClick={() => {
                    setProgramarAbierto(false);
                    onGuardar("programada", fecha);
                  }}
                  className="brut-cta-red px-4 py-2 font-sports uppercase tracking-[0.14em] text-sm disabled:opacity-50"
                >
                  Programar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {motivoBloqueo && !esBorrador && (
        <p className="mt-1.5 font-body text-xs text-[var(--color-river-red-deep)] text-right">
          {motivoBloqueo}
        </p>
      )}

      <ConfirmDialog
        abierto={confirmaDespublicar}
        titulo="Despublicar nota"
        descripcion="La nota desaparece del sitio y vuelve a borradores, guardando los cambios que tengas acá. Los links que la apunten van a dar 404 hasta que la publiques de nuevo."
        confirmarLabel="Despublicar"
        pendiente={pendiente}
        onConfirmar={() => {
          setConfirmaDespublicar(false);
          onDespublicar();
        }}
        onCerrar={() => setConfirmaDespublicar(false)}
      />
    </div>
  );
}
