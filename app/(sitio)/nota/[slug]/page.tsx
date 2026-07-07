import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TeaserCard from "@/components/cards/TeaserCard";
import ShareBar from "@/components/article/ShareBar";
import RegistrarVisita from "@/components/article/RegistrarVisita";
import AuthorBio from "@/components/article/AuthorBio";
import BackToHome from "@/components/layout/BackToHome";
import { getNotaPorSlug, getNotasRelacionadas, getTodasLasNotas } from "@/lib/notas";
import { renderCuerpo, textoDelCuerpo } from "@/lib/render-cuerpo";
import {
  formatearDuracion,
  formatearFechaLarga,
  labelDivision,
  labelTipo,
  tiempoLectura,
} from "@/lib/constants";

import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/json-ld";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const notas = await getTodasLasNotas();
  return notas.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const nota = await getNotaPorSlug(slug);
  if (!nota) return { title: "Nota no encontrada" };

  const url = `${SITE_URL}/nota/${nota.slug}`;
  return {
    title: nota.titulo,
    description: nota.bajada,
    alternates: { canonical: url },
    openGraph: {
      title: nota.titulo,
      description: nota.bajada,
      url,
      type: "article",
      publishedTime: nota.publicada_en,
      modifiedTime: nota.actualizada_en ?? nota.publicada_en,
      authors: [nota.autor.nombre],
      images: [{ url: nota.poster_url, alt: nota.titulo }],
    },
    twitter: {
      card: "summary_large_image",
      title: nota.titulo,
      description: nota.bajada,
      images: [nota.poster_url],
    },
  };
}

export default async function NotaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const nota = await getNotaPorSlug(slug);
  if (!nota) notFound();

  const relacionadas = await getNotasRelacionadas(nota, 3);
  const cuerpoHtml = renderCuerpo(nota.cuerpo);
  const parrafos = (nota.contenido ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const esVideo = nota.formato === "short" || nota.formato === "youtube";
  const jugadores = nota.sujetos.filter((s) => s.tipo === "jugador" && s.slug);
  const url = `${SITE_URL}/nota/${nota.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": nota.tipo === "noticia" ? "NewsArticle" : "Article",
    headline: nota.titulo,
    description: nota.bajada,
    image: [nota.poster_url],
    datePublished: nota.publicada_en,
    dateModified: nota.actualizada_en ?? nota.publicada_en,
    author: { "@type": "Person", name: nota.autor.nombre },
    publisher: { "@type": "Organization", name: "Inferiores Riverplatense" },
    mainEntityOfPage: url,
  };

  return (
    <main style={{ background: "var(--color-paper)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <RegistrarVisita slug={nota.slug} />

      <article className="mx-auto max-w-[760px] px-6 lg:px-8 py-10 lg:py-14">
        <BackToHome />

        {/* overline + primicia */}
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <p
            className="font-mono text-[0.7rem] uppercase tracking-[0.2em] flex items-center gap-2"
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
            {labelTipo(nota.tipo)} · {labelDivision(nota.division)}
          </p>
          {nota.primicia && (
            <span className="primicia-badge">Lo contamos primero</span>
          )}
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
          {nota.titulo}
        </h1>

        {/* standfirst */}
        <p
          className="text-lg lg:text-xl leading-relaxed mb-7"
          style={{ color: "var(--color-neutral-700)" }}
        >
          {nota.bajada}
        </p>

        {/* byline + compartir */}
        <div
          className="flex items-center justify-between gap-4 flex-wrap pb-6 mb-8"
          style={{ borderBottom: "2px solid var(--color-ink)" }}
        >
          <div className="flex items-center gap-3">
            {nota.autor.avatar_url && (
              <span
                className="relative inline-block shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "9999px",
                  overflow: "hidden",
                  border: "2px solid var(--color-ink)",
                }}
              >
                <Image
                  src={nota.autor.avatar_url}
                  alt=""
                  fill
                  sizes="40px"
                  style={{ objectFit: "cover" }}
                />
              </span>
            )}
            <div>
              <p
                className="font-mono text-[0.7rem] uppercase tracking-[0.12em]"
                style={{ color: "var(--color-ink)" }}
              >
                {nota.autor.slug ? (
                  <Link
                    href={`/autor/${nota.autor.slug}`}
                    className="hover:text-[var(--color-river-red-deep)] transition-colors underline decoration-transparent hover:decoration-current underline-offset-2"
                  >
                    {nota.autor.nombre}
                  </Link>
                ) : (
                  nota.autor.nombre
                )}
              </p>
              <p
                className="font-mono text-[0.62rem] uppercase tracking-[0.1em]"
                style={{ color: "var(--color-neutral-500)" }}
              >
                {formatearFechaLarga(nota.publicada_en)}
                {!esVideo &&
                  ` · ${tiempoLectura(nota.contenido || textoDelCuerpo(nota.cuerpo))} min de lectura`}
              </p>
            </div>
          </div>
          <ShareBar url={url} title={nota.titulo} />
        </div>

        {/* media */}
        <figure
          className="mb-9 relative overflow-hidden"
          style={{
            border: "2px solid var(--color-ink)",
            boxShadow: "8px 8px 0 var(--color-ink)",
            background: "var(--color-ink)",
            aspectRatio: nota.formato === "short" ? "9 / 16" : "16 / 9",
            maxWidth: nota.formato === "short" ? "380px" : undefined,
            marginInline: nota.formato === "short" ? "auto" : undefined,
          }}
        >
          <Image
            src={nota.poster_url}
            alt={nota.titulo}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 760px"
            style={{ objectFit: "cover" }}
          />
          {esVideo && (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  background: "var(--color-river-red)",
                  border: "2px solid var(--color-paper-pure)",
                  color: "var(--color-paper-pure)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          )}
          {nota.duracion_seg && (
            <span
              className="absolute bottom-0 right-0 px-2 py-1 font-mono text-[0.65rem] tabular-nums"
              style={{
                background: "var(--color-ink)",
                color: "var(--color-paper-pure)",
                borderLeft: "2px solid var(--color-paper-pure)",
                borderTop: "2px solid var(--color-paper-pure)",
              }}
            >
              {formatearDuracion(nota.duracion_seg)}
            </span>
          )}
        </figure>

        {/* cuerpo: primero el del editor visual (Tiptap), después el legacy del mock */}
        {cuerpoHtml ? (
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: cuerpoHtml }}
          />
        ) : parrafos.length > 0 ? (
          <div className="article-prose">
            {parrafos.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          <p
            className="article-prose"
            style={{ color: "var(--color-neutral-700)", fontStyle: "italic" }}
          >
            {esVideo
              ? "Mirá la nota completa en el video."
              : "Información en desarrollo."}
          </p>
        )}

        {/* sujetos (jugadores) → hub */}
        {jugadores.length > 0 && (
          <div
            className="mt-10 pt-6 flex items-center gap-3 flex-wrap"
            style={{ borderTop: "1px solid var(--color-neutral-200)" }}
          >
            <span
              className="font-mono text-[0.62rem] uppercase tracking-[0.16em]"
              style={{ color: "var(--color-neutral-500)" }}
            >
              En esta nota
            </span>
            {jugadores.map((s) => (
              <Link key={s.id} href={`/jugador/${s.slug}`} className="sujeto-chip">
                {s.nombre}
              </Link>
            ))}
          </div>
        )}

        {/* autor */}
        <div className="mt-10">
          <AuthorBio autor={nota.autor} />
        </div>
      </article>

      {/* relacionadas */}
      {relacionadas.length > 0 && (
        <section className="mx-auto max-w-[1100px] px-6 lg:px-8 pb-20">
          <header className="mb-7">
            <p
              className="font-mono text-[0.65rem] uppercase tracking-[0.22em]"
              style={{ color: "var(--color-river-red-deep)" }}
            >
              Seguí leyendo
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {relacionadas.map((n) => (
              <TeaserCard key={n.id} nota={n} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
