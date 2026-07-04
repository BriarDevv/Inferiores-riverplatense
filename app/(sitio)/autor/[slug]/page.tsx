import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TeaserCard from "@/components/cards/TeaserCard";
import BackToHome from "@/components/layout/BackToHome";
import { getAutorPorSlug, getSlugsDeAutores } from "@/lib/autores";
import { getNotasPorAutor } from "@/lib/notas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getSlugsDeAutores();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const autor = await getAutorPorSlug(slug);
  if (!autor) return {};
  return {
    title: `${autor.nombre} — ${autor.rol_publico ?? "Redacción"}`,
    description:
      autor.bio ??
      `Notas, entrevistas y coberturas de ${autor.nombre} en Inferiores Riverplatense.`,
    alternates: { canonical: `${SITE_URL}/autor/${autor.slug}` },
    openGraph: {
      title: autor.nombre,
      description: autor.bio ?? "Redacción de Inferiores Riverplatense.",
      type: "profile",
      ...(autor.foto_url ? { images: [autor.foto_url] } : {}),
    },
  };
}

const REDES_LINKS: Array<{
  key: "x" | "instagram" | "youtube";
  label: string;
  base: string;
}> = [
  { key: "x", label: "X", base: "https://x.com/" },
  { key: "instagram", label: "Instagram", base: "https://instagram.com/" },
  { key: "youtube", label: "YouTube", base: "https://youtube.com/" },
];

export default async function AutorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const autor = await getAutorPorSlug(slug);
  if (!autor) notFound();

  const notas = await getNotasPorAutor(autor.id);
  const url = `${SITE_URL}/autor/${autor.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: autor.nombre,
      jobTitle: autor.rol_publico ?? "Periodista",
      description: autor.bio,
      ...(autor.foto_url ? { image: autor.foto_url } : {}),
      url,
      sameAs: REDES_LINKS.filter((r) => autor.redes[r.key]).map(
        (r) => `${r.base}${autor.redes[r.key]!.replace(/^@/, "")}`,
      ),
      worksFor: { "@type": "Organization", name: "Inferiores Riverplatense" },
    },
  };

  return (
    <main style={{ background: "var(--color-paper)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10 lg:py-14">
        <BackToHome />

        {/* Ficha del autor */}
        <header
          className="brut-frame-shadow-red bg-[var(--color-paper-pure)] p-7 md:p-10 mb-12 flex flex-col sm:flex-row gap-7 md:gap-10 items-start"
        >
          {autor.foto_url ? (
            <Image
              src={autor.foto_url}
              alt={`Foto de ${autor.nombre}`}
              width={144}
              height={144}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover shrink-0"
              style={{ border: "2px solid var(--color-ink)" }}
            />
          ) : (
            <span
              aria-hidden
              className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-full bg-[var(--color-river-red)] text-white font-sports text-4xl flex items-center justify-center"
            >
              {autor.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </span>
          )}

          <div className="min-w-0">
            <p className="overline mb-2">{autor.rol_publico ?? "Redacción"}</p>
            <h1
              className="font-display font-bold leading-none mb-4"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", letterSpacing: "-0.02em" }}
            >
              {autor.nombre}
            </h1>
            {autor.bio && (
              <p className="font-body text-base md:text-lg leading-relaxed max-w-2xl mb-5" style={{ color: "var(--color-neutral-700)" }}>
                {autor.bio}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {REDES_LINKS.filter((r) => autor.redes[r.key]).map((r) => (
                <a
                  key={r.key}
                  href={`${r.base}${autor.redes[r.key]!.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="chip font-mono text-xs uppercase tracking-widest"
                >
                  {r.label}
                </a>
              ))}
              {autor.email_contacto && (
                <a
                  href={`mailto:${autor.email_contacto}`}
                  className="chip font-mono text-xs uppercase tracking-widest"
                >
                  Escribirle
                </a>
              )}
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-black/40 ml-auto">
                {notas.length} nota{notas.length === 1 ? "" : "s"} firmada{notas.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </header>

        {/* Sus notas */}
        <section aria-labelledby="h-cobertura">
          <div className="flex items-baseline justify-between mb-6">
            <h2 id="h-cobertura" className="brut-label">
              Toda su cobertura
            </h2>
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-widest text-[var(--color-river-red-deep)] hover:underline"
            >
              Volver a la portada
            </Link>
          </div>
          {notas.length === 0 ? (
            <p className="font-body text-black/50">Todavía no firmó notas.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {notas.map((n) => (
                <TeaserCard key={n.id} nota={n} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
