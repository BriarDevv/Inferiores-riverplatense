import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TeaserCard from "@/components/cards/TeaserCard";
import BackToHome from "@/components/layout/BackToHome";
import { getAutorPorSlug, getSlugsDeAutores } from "@/lib/autores";
import { getNotasPorAutor } from "@/lib/notas";

import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/json-ld";

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
  if (!autor) return { title: "Firma no encontrada" };
  const notas = await getNotasPorAutor(autor.id);
  const desc =
    autor.bio ??
    `Notas, entrevistas y coberturas de ${autor.nombre} en Inferiores Riverplatense.`;
  return {
    title: `${autor.nombre} — ${autor.rol_publico ?? "Redacción"}`,
    description: desc,
    // Firma sin notas publicadas: fuera del índice hasta la primera
    // (misma regla que landings y hubs vacíos).
    ...(notas.length === 0 ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: `${SITE_URL}/autor/${autor.slug}` },
    openGraph: {
      title: autor.nombre,
      description: autor.bio ?? "Redacción de Inferiores Riverplatense.",
      type: "profile",
      ...(autor.foto_url ? { images: [autor.foto_url] } : {}),
    },
    twitter: {
      card: "summary",
      title: `${autor.nombre} — Inferiores Riverplatense`,
      description: desc,
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
  const redes = REDES_LINKS.flatMap((r) => {
    const handle = autor.redes[r.key];
    return handle ? [{ ...r, href: `${r.base}${handle.replace(/^@/, "")}` }] : [];
  });

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
      sameAs: redes.map((r) => r.href),
      worksFor: {
        "@type": "NewsMediaOrganization",
        "@id": `${SITE_URL}/#organizacion`,
        name: "Inferiores Riverplatense",
      },
    },
  };

  const jsonLdMigas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: autor.nombre },
    ],
  };

  return (
    <main style={{ background: "var(--color-paper)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLdMigas) }}
      />

      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-10 lg:py-14">
        <BackToHome />

        {/* Ficha del autor */}
        <header
          className="brut-frame-shadow-red bg-[var(--color-paper-pure)] p-7 md:p-10 mb-12 flex flex-col sm:flex-row gap-7 md:gap-10 items-start"
          data-anim="carga"
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
              {redes.map((r) => (
                <a
                  key={r.key}
                  href={r.href}
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
          <h2 id="h-cobertura" className="brut-label mb-6" data-anim="aparece">
            Toda su cobertura
          </h2>
          {notas.length === 0 ? (
            <p className="font-body text-black/50">Todavía no firmó notas.</p>
          ) : (
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              data-anim="grupo"
            >
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
