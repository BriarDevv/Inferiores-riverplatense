import Link from "next/link";
import Image from "next/image";
import type { Nota } from "@/lib/types";
import { labelDivision, labelTipo } from "@/lib/constants";
import CardAuthorMeta from "./CardAuthorMeta";

interface Props {
  nota: Nota;
}

/**
 * Card grande para el slot wide del bento.
 * Imagen 16:9 arriba, título Newsreader grande, bajada + meta abajo.
 * Mismo lenguaje brutalist que NotaCard.
 */
export default function WideFeatureCard({ nota }: Props) {
  return (
    <Link
      href={`/nota/${nota.slug}`}
      className="group block h-full"
      style={{
        background: "var(--color-paper-pure)",
        border: "2px solid var(--color-ink)",
        boxShadow: "8px 8px 0 var(--color-ink)",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          background: "var(--color-ink)",
          borderBottom: "2px solid var(--color-ink)",
        }}
      >
        <Image
          src={nota.poster_url}
          alt={nota.titulo}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.025]"
        />
        <div
          className="absolute top-0 left-0 px-3 py-1.5 font-sports text-xs"
          style={{
            background: "var(--color-river-red)",
            color: "var(--color-paper-pure)",
            borderRight: "2px solid var(--color-ink)",
            borderBottom: "2px solid var(--color-ink)",
            letterSpacing: "0.14em",
          }}
        >
          {labelTipo(nota.tipo)}
        </div>
      </div>

      <div
        className="p-7 lg:p-8 flex flex-col gap-4"
        style={{ borderTop: "2px solid var(--color-ink)" }}
      >
        <p
          className="text-[0.7rem] font-mono uppercase tracking-[0.18em]"
          style={{ color: "var(--color-river-red-deep)" }}
        >
          {labelTipo(nota.tipo)} · {labelDivision(nota.division)}
        </p>
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(1.6rem, 2.4vw, 2.25rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.022em",
            color: "var(--color-ink)",
          }}
        >
          {nota.titulo}
        </h2>
        <p
          className="text-base leading-relaxed line-clamp-3 max-w-prose"
          style={{ color: "var(--color-neutral-700)" }}
        >
          {nota.bajada}
        </p>
        <CardAuthorMeta autor={nota.autor} publicada_en={nota.publicada_en} size="md" />
      </div>
    </Link>
  );
}
