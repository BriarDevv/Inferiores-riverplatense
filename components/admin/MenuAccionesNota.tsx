"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  borrarNota,
  cambiarEstadoNota,
  duplicarNota,
  toggleDestacada,
  type ResultadoAccion,
} from "@/lib/admin/actions";
import type { EstadoNota } from "@/lib/types";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./Toasts";

interface MenuAccionesNotaProps {
  id: string;
  slug: string;
  titulo: string;
  estado: EstadoNota;
  destacada: boolean;
  esAdmin: boolean;
}

const ANCHO_MENU = 216;
const ALTO_ESTIMADO = 260;

/**
 * Menú ⋯ por fila. Se posiciona con `fixed` para que el overflow de la tabla
 * no lo recorte; se cierra con click afuera, Escape, scroll o resize.
 */
export default function MenuAccionesNota({
  id,
  slug,
  titulo,
  estado,
  destacada,
  esAdmin,
}: MenuAccionesNotaProps) {
  const router = useRouter();
  const toast = useToast();
  const [pendiente, startTransition] = useTransition();
  // pos != null ES el estado "abierto": un solo estado para el popover.
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const abierto = pos !== null;
  const [confirmacion, setConfirmacion] = useState<"borrar" | "despublicar" | null>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function abrir() {
    const rect = botonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const arriba = rect.bottom + ALTO_ESTIMADO > window.innerHeight && rect.top > ALTO_ESTIMADO;
    setPos({
      top: arriba ? rect.top - 6 : rect.bottom + 6,
      left: Math.max(8, Math.min(rect.right - ANCHO_MENU, window.innerWidth - ANCHO_MENU - 8)),
    });
  }

  useEffect(() => {
    if (!abierto) return;
    function cerrarSiAfuera(e: MouseEvent) {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !botonRef.current?.contains(e.target as Node)
      ) {
        setPos(null);
      }
    }
    function conTeclado(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPos(null);
        botonRef.current?.focus();
      }
    }
    const cerrar = () => setPos(null);
    document.addEventListener("mousedown", cerrarSiAfuera);
    document.addEventListener("keydown", conTeclado);
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("mousedown", cerrarSiAfuera);
      document.removeEventListener("keydown", conTeclado);
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
    };
  }, [abierto]);

  function correr(fn: () => Promise<ResultadoAccion>, okToast: Parameters<typeof toast>[0]) {
    setPos(null);
    startTransition(async () => {
      const r = await fn();
      setConfirmacion(null);
      if (!r.ok) toast({ tipo: "error", texto: r.error ?? "Algo falló. Probá de nuevo." });
      else {
        toast(okToast);
        router.refresh();
      }
    });
  }

  const item =
    "block w-full text-left font-mono text-[11px] uppercase tracking-widest px-3 py-2.5 hover:bg-[var(--color-river-red-soft)] transition-colors disabled:opacity-40";

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        disabled={pendiente}
        onClick={() => (abierto ? setPos(null) : abrir())}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Acciones de «${titulo}»`}
        className="font-sports text-lg leading-none px-2.5 py-1.5 border-2 border-transparent hover:border-[var(--color-ink)] transition-colors disabled:opacity-40"
      >
        ⋯
      </button>

      {pos && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Acciones de «${titulo}»`}
          className="menu-acciones"
          style={{
            top: pos.top,
            left: pos.left,
            width: ANCHO_MENU,
            transform: pos.top < (botonRef.current?.getBoundingClientRect().top ?? 0) ? "translateY(-100%)" : undefined,
          }}
        >
          <Link role="menuitem" href={`/admin/notas/${id}`} className={item}>
            Editar
          </Link>
          {estado === "publicada" && (
            <a
              role="menuitem"
              href={`/nota/${slug}`}
              target="_blank"
              rel="noreferrer"
              className={item}
            >
              Ver en el sitio ↗
            </a>
          )}
          {estado === "borrador" ? (
            <button
              role="menuitem"
              type="button"
              className={item}
              onClick={() =>
                correr(
                  () => cambiarEstadoNota(id, "publicar"),
                  { texto: "Publicada.", href: `/nota/${slug}`, hrefLabel: "Ver en el sitio" },
                )
              }
            >
              Publicar ahora
            </button>
          ) : (
            <button
              role="menuitem"
              type="button"
              className={item}
              onClick={() => {
                setPos(null);
                setConfirmacion("despublicar");
              }}
            >
              Despublicar
            </button>
          )}
          <button
            role="menuitem"
            type="button"
            className={item}
            onClick={() =>
              correr(
                () => toggleDestacada(id, !destacada),
                { texto: destacada ? "Ya no está destacada." : "Destacada en la portada. ★" },
              )
            }
          >
            {destacada ? "Quitar destacada" : "Destacar en portada"}
          </button>
          <button
            role="menuitem"
            type="button"
            className={item}
            onClick={() =>
              correr(
                () => duplicarNota(id),
                { texto: "Copia creada como borrador." },
              )
            }
          >
            Duplicar
          </button>
          {esAdmin && (
            <>
              <hr className="hairline my-1" />
              <button
                role="menuitem"
                type="button"
                className={`${item} text-[var(--color-river-red-deep)]`}
                onClick={() => {
                  setPos(null);
                  setConfirmacion("borrar");
                }}
              >
                Borrar
              </button>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        abierto={confirmacion === "despublicar"}
        titulo="Despublicar nota"
        descripcion={`«${titulo}» desaparece del sitio y vuelve a borradores. Los links que la apunten van a dar 404 hasta que la publiques de nuevo.`}
        confirmarLabel="Despublicar"
        pendiente={pendiente}
        onConfirmar={() =>
          correr(() => cambiarEstadoNota(id, "despublicar"), { texto: "Despublicada. Quedó en borradores." })
        }
        onCerrar={() => setConfirmacion(null)}
      />

      <ConfirmDialog
        abierto={confirmacion === "borrar"}
        titulo="Borrar nota"
        descripcion={`Borrar «${titulo}». Esta acción no se puede deshacer y las visitas registradas se pierden.`}
        confirmarLabel="Borrar nota"
        peligroso
        pendiente={pendiente}
        onConfirmar={() => correr(() => borrarNota(id), { texto: "Nota borrada." })}
        onCerrar={() => setConfirmacion(null)}
      />
    </>
  );
}
