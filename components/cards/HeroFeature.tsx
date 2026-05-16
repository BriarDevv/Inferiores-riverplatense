import Link from "next/link";
import Image from "next/image";
import type { Nota } from "@/lib/types";
import { formatearFecha, labelDivision, labelTipo } from "@/lib/constants";

interface Props {
  nota: Nota;
}

export default function HeroFeature({ nota }: Props) {
  return (
    <article
      className="grid"
      style={{
        gridTemplateColumns: "1fr 1fr",
        border: "2px solid var(--color-ink)",
        boxShadow: "8px 8px 0 var(--color-ink)",
        background: "var(--color-paper-pure)",
      }}
    >
      <div className="flex flex-col p-10 lg:p-12">
        <p
          className="font-mono text-[0.7rem] uppercase tracking-[0.2em] mb-6 flex items-center gap-2"
          style={{ color: "var(--color-river-red)" }}
        >
          <span
            aria-hidden
            className="inline-block"
            style={{
              width: "0.6rem",
              height: "0.6rem",
              background: "var(--color-river-red)",
            }}
          />
          {labelTipo(nota.tipo)} · {labelDivision(nota.division)}
        </p>

        <h1
          className="font-display leading-[0.95] mb-6"
          style={{
            fontSize: "clamp(2.25rem, 3.4vw, 3.75rem)",
            letterSpacing: "-0.025em",
          }}
        >
          <Link
            href="/"
            style={{
              color: "var(--color-ink)",
              textDecoration: "none",
            }}
          >
            {nota.titulo}
          </Link>
        </h1>

        <p
          className="text-lg leading-relaxed mb-7 max-w-prose"
          style={{ color: "var(--color-neutral-700)" }}
        >
          {nota.bajada}
        </p>

        <div
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] flex items-center gap-3 flex-wrap mb-7"
          style={{ color: "var(--color-neutral-500)" }}
        >
          {nota.autor.avatar_url && (
            <span
              className="relative inline-block shrink-0"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9999px",
                overflow: "hidden",
                border: "2px solid var(--color-ink)",
              }}
            >
              <Image
                src={nota.autor.avatar_url}
                alt={nota.autor.nombre}
                fill
                sizes="32px"
                style={{ objectFit: "cover" }}
              />
            </span>
          )}
          <span>Por</span>
          <span style={{ color: "var(--color-ink)" }}>{nota.autor.nombre}</span>
          <span aria-hidden>·</span>
          <span>{formatearFecha(nota.publicada_en)}</span>
          {nota.formato !== "articulo" && (
            <>
              <span aria-hidden>·</span>
              <span style={{ color: "var(--color-river-red)" }}>
                {nota.formato === "short" ? "Video corto" : "Video"}
              </span>
            </>
          )}
        </div>

        <div className="mt-auto">
          <Link
            href="/"
            className="font-sports inline-flex items-center gap-2 brut-cta-ink"
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.12em",
              padding: "0.75rem 1.25rem",
              textDecoration: "none",
            }}
          >
            Leer la nota
            <span aria-hidden style={{ fontSize: "1rem" }}>
              →
            </span>
          </Link>
        </div>
      </div>

      <Link
        href="/"
        className="relative overflow-hidden group"
        style={{
          borderLeft: "2px solid var(--color-ink)",
          minHeight: "540px",
          background: "var(--color-ink)",
        }}
        aria-label={`Leer: ${nota.titulo}`}
      >
        <Image
          src={nota.poster_url}
          alt={nota.titulo}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
          style={{ objectFit: "cover" }}
        />
        <div
          className="absolute bottom-0 left-0 px-3 py-1.5 font-sports text-xs"
          style={{
            background: "var(--color-river-red)",
            color: "var(--color-paper-pure)",
            borderRight: "2px solid var(--color-ink)",
            borderTop: "2px solid var(--color-ink)",
            letterSpacing: "0.14em",
          }}
        >
          Nota destacada
        </div>
      </Link>
    </article>
  );
}

