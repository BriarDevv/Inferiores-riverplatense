import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getNotasPorSujeto,
  getSlugsDeJugadores,
  getSujetoPorSlug,
} from "@/lib/notas";
import { formatearFechaLarga, labelDivision, labelTipo } from "@/lib/constants";
import BackToHome from "@/components/layout/BackToHome";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getSlugsDeJugadores();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sujeto = await getSujetoPorSlug(slug);
  if (!sujeto) return { title: "Jugador no encontrado" };

  const desc =
    sujeto.bio ??
    `Todas las notas, entrevistas y noticias sobre ${sujeto.nombre} en las inferiores de River.`;
  return {
    title: sujeto.nombre,
    description: desc,
    alternates: { canonical: `${SITE_URL}/jugador/${slug}` },
    openGraph: {
      title: `${sujeto.nombre} — Inferiores Riverplatense`,
      description: desc,
      type: "profile",
    },
  };
}

export default async function JugadorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const sujeto = await getSujetoPorSlug(slug);
  if (!sujeto) notFound();

  const notas = await getNotasPorSujeto(sujeto.id);
  const desde = notas[notas.length - 1]?.publicada_en;
  const hayPrimicia = notas.some((n) => n.primicia);

  return (
    <main style={{ background: "var(--color-paper)" }}>
      <div className="mx-auto max-w-[860px] px-6 lg:px-8 py-10 lg:py-14">
        <BackToHome />

        {/* cabecera del jugador */}
        <header
          className="mb-12 pb-8"
          style={{ borderBottom: "2px solid var(--color-ink)" }}
        >
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
            Seguimiento · {sujeto.division ? labelDivision(sujeto.division) : "Jugador"}
          </p>
          <h1
            className="font-display leading-[0.95] mb-4"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
            }}
          >
            {sujeto.nombre}
          </h1>
          {sujeto.bio && (
            <p
              className="text-lg leading-relaxed max-w-prose mb-5"
              style={{ color: "var(--color-neutral-700)" }}
            >
              {sujeto.bio}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="font-sports px-3 py-1.5"
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                background: "var(--color-ink)",
                color: "var(--color-paper-pure)",
              }}
            >
              {notas.length} {notas.length === 1 ? "nota" : "notas"}
            </span>
            {desde && (
              <span
                className="font-mono text-[0.65rem] uppercase tracking-[0.14em]"
                style={{ color: "var(--color-neutral-500)" }}
              >
                Seguimiento desde {formatearFechaLarga(desde)}
              </span>
            )}
            {hayPrimicia && <span className="primicia-badge">Lo contamos primero</span>}
          </div>
        </header>

        {/* línea de tiempo */}
        <p
          className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-7"
          style={{ color: "var(--color-river-red-deep)" }}
        >
          La cobertura, en orden
        </p>

        <ol
          className="relative"
          style={{ borderLeft: "2px solid var(--color-ink)" }}
        >
          {[...notas].reverse().map((n) => (
            <li key={n.id} className="relative pl-7 pb-9 last:pb-0">
              {/* marcador */}
              <span
                aria-hidden
                className="absolute"
                style={{
                  left: "-9px",
                  top: "0.35rem",
                  width: "16px",
                  height: "16px",
                  background: n.primicia
                    ? "var(--color-river-red)"
                    : "var(--color-paper)",
                  border: "2px solid var(--color-ink)",
                }}
              />
              <p
                className="font-mono text-[0.62rem] uppercase tracking-[0.14em] mb-1.5 flex items-center gap-2"
                style={{ color: "var(--color-neutral-500)" }}
              >
                {formatearFechaLarga(n.publicada_en)}
                <span aria-hidden style={{ color: "var(--color-river-red-deep)" }}>
                  ·
                </span>
                <span style={{ color: "var(--color-river-red-deep)" }}>
                  {labelTipo(n.tipo)}
                </span>
                {n.primicia && (
                  <span
                    className="font-sports"
                    style={{
                      fontSize: "0.55rem",
                      letterSpacing: "0.12em",
                      color: "var(--color-river-red-deep)",
                    }}
                  >
                    ◆ PRIMICIA
                  </span>
                )}
              </p>
              <h2
                className="font-display leading-[1.12]"
                style={{
                  fontSize: "1.4rem",
                  letterSpacing: "-0.015em",
                  color: "var(--color-ink)",
                }}
              >
                <Link href={`/nota/${n.slug}`} className="link-underline">
                  {n.titulo}
                </Link>
              </h2>
              <p
                className="text-sm leading-snug mt-1.5 max-w-prose"
                style={{ color: "var(--color-neutral-700)" }}
              >
                {n.bajada}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
