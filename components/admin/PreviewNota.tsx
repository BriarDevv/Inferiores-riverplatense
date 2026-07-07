"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { labelDivision, labelTipo, formatearFechaLarga } from "@/lib/constants";

interface PreviewNotaProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  bajada: string;
  tipo: string;
  division: string;
  formato: string;
  posterUrl: string;
  primicia: boolean;
  autor?: { nombre: string; avatar_url?: string };
  palabras: number;
  cuerpoHtml: string;
  /** Texto plano de notas viejas (el sitio lo muestra si no hay cuerpo Tiptap). */
  contenidoLegacy?: string;
}

const PALABRAS_POR_MINUTO = 200;

/**
 * Vista previa de la NOTA COMPLETA con la misma estructura y clases que
 * /nota/[slug]: overline, título, bajada, byline, poster y .article-prose.
 * Lo que se ve acá es lo que se publica. Usa <dialog> nativo: trap de foco,
 * Escape y backdrop vienen gratis.
 */
export default function PreviewNota({
  abierto,
  onCerrar,
  titulo,
  bajada,
  tipo,
  division,
  formato,
  posterUrl,
  primicia,
  autor,
  palabras,
  cuerpoHtml,
  contenidoLegacy,
}: PreviewNotaProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Fecha estable por apertura (la vista previa muestra "hoy").
  const [fechaHoy] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (!abierto) return;
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  if (!abierto) return null;

  const esVideo = formato === "short" || formato === "youtube";
  const minutos = Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO));

  return (
    <dialog
      ref={dialogRef}
      onClose={onCerrar}
      aria-label="Vista previa de la nota"
      className="fixed inset-0 z-[70] m-0 h-dvh w-screen max-h-none max-w-none overflow-y-auto p-0"
      style={{ background: "var(--color-paper)", color: "inherit" }}
    >
      {/* Barra de la vista previa */}
      <div className="sticky top-0 z-10 bg-[var(--color-ink)] text-white border-b-4 border-[var(--color-river-red)] px-5 py-3 flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
          Vista previa <span className="text-white/50">· así se ve en el sitio</span>
        </p>
        <button
          type="button"
          onClick={onCerrar}
          autoFocus
          className="font-sports uppercase tracking-[0.14em] text-sm px-4 py-1.5 border-2 border-white/80 hover:bg-[var(--color-river-red)] hover:border-[var(--color-river-red)] transition-colors"
        >
          ✕ Cerrar
        </button>
      </div>

      <article className="mx-auto max-w-[760px] px-6 lg:px-8 py-10 lg:py-14">
        {/* overline + primicia */}
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <p
            className="font-mono text-[0.7rem] uppercase tracking-[0.2em] flex items-center gap-2"
            style={{ color: "var(--color-river-red-deep)" }}
          >
            <span
              aria-hidden
              className="inline-block"
              style={{ width: "0.6rem", height: "0.6rem", background: "var(--color-river-red)" }}
            />
            {labelTipo(tipo as Parameters<typeof labelTipo>[0])} ·{" "}
            {labelDivision(division as Parameters<typeof labelDivision>[0])}
          </p>
          {primicia && <span className="primicia-badge">Lo contamos primero</span>}
        </div>

        {/* título */}
        <h1
          className="font-display leading-[0.98] mb-5"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.4rem)",
            letterSpacing: "-0.025em",
            color: "var(--color-ink)",
          }}
        >
          {titulo.trim() || "Título de la nota"}
        </h1>

        {/* bajada */}
        {bajada.trim() && (
          <p
            className="text-lg lg:text-xl leading-relaxed mb-7"
            style={{ color: "var(--color-neutral-700)" }}
          >
            {bajada}
          </p>
        )}

        {/* byline */}
        <div
          className="flex items-center gap-3 pb-6 mb-8"
          style={{ borderBottom: "2px solid var(--color-ink)" }}
        >
          {autor?.avatar_url && (
            <Image
              src={autor.avatar_url}
              alt=""
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full object-cover shrink-0"
              style={{ border: "2px solid var(--color-ink)" }}
            />
          )}
          <div>
            <p
              className="font-mono text-[0.7rem] uppercase tracking-[0.12em]"
              style={{ color: "var(--color-ink)" }}
            >
              {autor?.nombre ?? "Sin firma"}
            </p>
            <p
              className="font-mono text-[0.62rem] uppercase tracking-[0.1em]"
              style={{ color: "var(--color-neutral-500)" }}
            >
              {formatearFechaLarga(fechaHoy)}
              {!esVideo && ` · ${minutos} min de lectura`}
            </p>
          </div>
        </div>

        {/* poster */}
        {posterUrl ? (
          <figure
            className="mb-9 relative overflow-hidden"
            style={{
              border: "2px solid var(--color-ink)",
              boxShadow: "8px 8px 0 var(--color-ink)",
              background: "var(--color-ink)",
              aspectRatio: formato === "short" ? "9 / 16" : "16 / 9",
              maxWidth: formato === "short" ? "380px" : undefined,
              marginInline: formato === "short" ? "auto" : undefined,
            }}
          >
            <Image
              src={posterUrl}
              alt={titulo}
              fill
              sizes="(max-width: 768px) 100vw, 760px"
              unoptimized
              className="object-cover"
            />
          </figure>
        ) : (
          <div className="sin-poster aspect-video mb-9 flex items-center justify-center">
            <p className="font-mono text-[11px] uppercase tracking-widest text-black/40">
              Acá va la imagen principal
            </p>
          </div>
        )}

        {/* cuerpo: Tiptap, o el texto plano de notas viejas, o aviso */}
        {cuerpoHtml.trim() && cuerpoHtml !== "<p></p>" ? (
          <div className="article-prose" dangerouslySetInnerHTML={{ __html: cuerpoHtml }} />
        ) : contenidoLegacy?.trim() ? (
          <div className="article-prose">
            {contenidoLegacy
              .split(/\n\s*\n/)
              .flatMap((p) => (p.trim() ? [p.trim()] : []))
              .map((p, i) => (
                <p key={`${i}:${p.slice(0, 32)}`}>{p}</p>
              ))}
          </div>
        ) : (
          <p className="font-body text-black/40">
            El cuerpo de la nota todavía está vacío. Escribí en el editor y volvé a mirar.
          </p>
        )}
      </article>
    </dialog>
  );
}
