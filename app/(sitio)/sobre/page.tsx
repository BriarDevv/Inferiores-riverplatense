import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getNotas, getSlugsDeJugadores } from "@/lib/notas";
import { AUTOR_PRINCIPAL } from "@/lib/mock-data";
import BackToHome from "@/components/layout/BackToHome";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Quién está detrás de Inferiores Riverplatense: periodismo dedicado a las divisiones formativas de River Plate, de la Novena a la Primera.",
};

export default async function SobrePage() {
  const notas = await getNotas();
  const jugadores = await getSlugsDeJugadores();
  const divisiones = new Set(notas.map((n) => n.division)).size;

  const stats = [
    { n: notas.length, label: "Notas publicadas" },
    { n: divisiones, label: "Divisiones cubiertas" },
    { n: jugadores.length, label: "Jugadores en seguimiento" },
  ];

  return (
    <main style={{ background: "var(--color-paper)" }}>
      <div className="mx-auto max-w-[880px] px-6 lg:px-8 py-10 lg:py-14">
        <BackToHome />

        {/* encabezado */}
        <header className="flex flex-col sm:flex-row items-start gap-7 mb-12">
          {AUTOR_PRINCIPAL.avatar_url && (
            <span
              className="relative inline-block shrink-0"
              style={{
                width: 132,
                height: 132,
                overflow: "hidden",
                border: "2px solid var(--color-ink)",
                boxShadow: "6px 6px 0 var(--color-river-red)",
              }}
            >
              <Image
                src={AUTOR_PRINCIPAL.avatar_url}
                alt={AUTOR_PRINCIPAL.nombre}
                fill
                sizes="132px"
                style={{ objectFit: "cover" }}
              />
            </span>
          )}
          <div className="min-w-0">
            <p
              className="font-mono text-[0.7rem] uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
              style={{ color: "var(--color-river-red-deep)" }}
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
              Quién escribe
            </p>
            <h1
              className="font-display leading-[0.95] mb-3"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                letterSpacing: "-0.03em",
                color: "var(--color-ink)",
              }}
            >
              {AUTOR_PRINCIPAL.nombre}
            </h1>
            <p
              className="font-mono text-[0.7rem] uppercase tracking-[0.14em]"
              style={{ color: "var(--color-neutral-500)" }}
            >
              Periodista · Inferiores de River Plate
            </p>
          </div>
        </header>

        {/* cuerpo */}
        <div className="article-prose" style={{ margin: 0, maxWidth: "none" }}>
          <p>
            Inferiores Riverplatense nació de una obsesión simple: contar lo que
            pasa en las formativas de River antes de que sea noticia en todos
            lados. De la Novena a la Primera, donde se forman los que algún día
            van a jugar en el Monumental.
          </p>
          <p>
            Acá no hay relleno de rumores de Twitter. Hay notas, entrevistas y
            crónicas hechas desde adentro: hablando con los pibes, con los
            entrenadores, con la gente del scouting. Mirando los partidos que casi
            nadie mira y siguiendo a los jugadores en el tiempo, no solo el día
            que debutan.
          </p>
          <p>
            Porque una cantera no se entiende con una foto. Se entiende con el
            proceso completo.
          </p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-6"
              style={{
                background: "var(--color-paper-pure)",
                border: "2px solid var(--color-ink)",
                boxShadow: "5px 5px 0 var(--color-ink)",
              }}
            >
              <p
                className="font-sports leading-none mb-2"
                style={{
                  fontSize: "2.8rem",
                  color: "var(--color-river-red-deep)",
                }}
              >
                {s.n}
              </p>
              <p
                className="font-mono text-[0.65rem] uppercase tracking-[0.14em]"
                style={{ color: "var(--color-neutral-700)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mt-12">
          <Link
            href="/contacto"
            className="font-sports inline-flex items-center gap-2 brut-cta-red"
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.12em",
              padding: "0.8rem 1.4rem",
              textDecoration: "none",
            }}
          >
            ¿Tenés un dato? Escribime
            <span aria-hidden style={{ fontSize: "1rem" }}>
              →
            </span>
          </Link>
          <Link
            href="/#newsletter"
            className="font-sports inline-flex items-center gap-2 brut-cta-ink"
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.12em",
              padding: "0.8rem 1.4rem",
              textDecoration: "none",
            }}
          >
            Suscribirme al newsletter
            <span aria-hidden style={{ fontSize: "1rem" }}>
              →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
