import Link from "next/link";
import Image from "next/image";
import type { Nota, Sujeto } from "@/lib/types";
import { labelDivision } from "@/lib/constants";

interface Props {
  sujeto: Sujeto;
  notas: Nota[];
}

/**
 * Card del hub de seguimiento de un jugador (tira "En la mira" en la home).
 * Imagen = última cobertura del jugador. Linkea a /jugador/[slug].
 * El Sujeto no tiene avatar propio; la foto es la de la nota más reciente.
 */
export default function JugadorCard({ sujeto, notas }: Props) {
  const count = notas.length;
  const poster = notas[0]?.poster_url;
  const desde = notas[notas.length - 1]?.publicada_en?.slice(0, 4);

  return (
    <Link
      href={`/jugador/${sujeto.slug}`}
      className="group brut-hover h-full flex flex-col"
      style={{ background: "var(--color-paper-pure)" }}
    >
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          aspectRatio: "4 / 3",
          background: "var(--color-ink)",
          borderBottom: "2px solid var(--color-ink)",
        }}
      >
        {poster && (
          <Image
            src={poster}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-[550ms] ease-out group-hover:scale-[1.04]"
          />
        )}
        <div
          className="absolute top-0 left-0 px-2 py-1 text-[0.6rem] font-sports"
          style={{
            background: "var(--color-river-red)",
            color: "var(--color-paper-pure)",
            borderRight: "2px solid var(--color-ink)",
            borderBottom: "2px solid var(--color-ink)",
            letterSpacing: "0.12em",
          }}
        >
          {sujeto.division ? labelDivision(sujeto.division) : "Jugador"}
        </div>
      </div>

      <div
        className="p-4 lg:p-5 flex flex-col gap-2 flex-1"
        style={{ borderTop: "2px solid var(--color-ink)" }}
      >
        <h2
          className="font-display leading-[1.1]"
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-0.015em",
            color: "var(--color-ink)",
          }}
        >
          {sujeto.nombre}
        </h2>
        <div
          className="mt-auto flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em]"
          style={{ color: "var(--color-neutral-500)" }}
        >
          <span
            className="font-sports"
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.04em",
              color: "var(--color-river-red-deep)",
            }}
          >
            {count} {count === 1 ? "nota" : "notas"}
          </span>
          {desde && (
            <>
              <span aria-hidden>·</span>
              <span>desde {desde}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
