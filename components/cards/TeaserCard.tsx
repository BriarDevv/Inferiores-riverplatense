import Link from "next/link";
import Image from "next/image";
import type { Nota } from "@/lib/types";
import {
  formatearDuracion,
  labelDivision,
  labelTipo,
  youtubeThumb,
} from "@/lib/constants";
import CardAuthorMeta from "./CardAuthorMeta";

interface Props {
  nota: Nota;
}

const FORMATO_LABEL: Record<Nota["formato"], string> = {
  short: "Short",
  youtube: "Video",
  articulo: "Nota",
};

export default function TeaserCard({ nota }: Props) {
  const thumb =
    nota.formato === "youtube" && nota.youtube_id
      ? youtubeThumb(nota.youtube_id)
      : nota.poster_url;

  return (
    <Link
      href={`/nota/${nota.slug}`}
      // Filas simétricas SIN hueco interno: la card llena la celda (h-full)
      // y el sobrante lo absorbe la IMAGEN (grow + object-cover recorta),
      // nunca un vacío blanco entre el título y la firma.
      className="group brut-hover h-full flex flex-col"
      style={{ background: "var(--color-paper-pure)" }}
    >
      <div
        className="relative overflow-hidden grow"
        style={{
          aspectRatio: "4 / 3",
          background: "var(--color-ink)",
          borderBottom: "2px solid var(--color-ink)",
        }}
      >
        <Image
          src={thumb}
          alt={nota.titulo}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-[550ms] ease-out group-hover:scale-[1.025]"
        />

        {/* Format tag */}
        <div
          className="absolute top-0 left-0 px-2 py-1 text-[0.6rem] font-sports tabular-nums"
          style={{
            background: "var(--color-river-red)",
            color: "var(--color-paper-pure)",
            borderRight: "2px solid var(--color-ink)",
            borderBottom: "2px solid var(--color-ink)",
            letterSpacing: "0.12em",
          }}
        >
          {FORMATO_LABEL[nota.formato]}
        </div>

        {/* Duration pill */}
        {nota.duracion_seg && (
          <div
            className="absolute top-0 right-0 px-2 py-1 text-[0.65rem] font-mono tabular-nums"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-paper-pure)",
              borderLeft: "2px solid var(--color-ink)",
              borderBottom: "2px solid var(--color-ink)",
            }}
          >
            {formatearDuracion(nota.duracion_seg)}
          </div>
        )}
      </div>

      <div
        className="p-6 flex flex-col gap-3.5 shrink-0"
        style={{ borderTop: "2px solid var(--color-ink)" }}
      >
        <p
          className="text-[0.65rem] font-mono uppercase tracking-[0.14em]"
          style={{ color: "var(--color-river-red-deep)" }}
        >
          {labelTipo(nota.tipo)} · {labelDivision(nota.division)}
        </p>
        <h2
          className="font-display"
          style={{
            fontSize: "1.25rem",
            lineHeight: 1.2,
            letterSpacing: "-0.012em",
            color: "var(--color-neutral-900)",
          }}
        >
          {nota.titulo}
        </h2>
        <CardAuthorMeta autor={nota.autor} publicada_en={nota.publicada_en} />
      </div>
    </Link>
  );
}
