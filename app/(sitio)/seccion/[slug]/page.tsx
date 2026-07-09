import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeaserCard from "@/components/cards/TeaserCard";
import { getNotas } from "@/lib/notas";
import { SECCIONES_LANDING } from "@/lib/secciones";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/json-ld";

type Params = { slug: string };

// Solo existen las secciones declaradas en SECCIONES_LANDING.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.keys(SECCIONES_LANDING).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const info = SECCIONES_LANDING[slug];
  if (!info) return {};
  const notas = await getNotas({ tipo: info.tipo });
  return {
    title: info.titulo,
    description: info.descripcion,
    alternates: { canonical: `/seccion/${slug}` },
    openGraph: {
      title: `${info.titulo} — Inferiores Riverplatense`,
      description: info.descripcion,
      url: `${SITE_URL}/seccion/${slug}`,
      type: "website",
      ...(notas[0] ? { images: [{ url: notas[0].poster_url, alt: info.titulo }] } : {}),
    },
    // Una sección sin notas todavía no le aporta nada al índice.
    ...(notas.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function SeccionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const info = SECCIONES_LANDING[slug];
  if (!info) notFound();

  const notas = await getNotas({ tipo: info.tipo });
  const url = `${SITE_URL}/seccion/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: info.titulo,
    description: info.descripcion,
    url,
    inLanguage: "es-AR",
    isPartOf: { "@id": `${SITE_URL}/#sitio` },
    ...(notas.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: notas.slice(0, 20).map((n, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/nota/${n.slug}`,
              name: n.titulo,
            })),
          },
        }
      : {}),
  };

  const jsonLdMigas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: info.titulo },
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

      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 lg:py-16">
        <header className="mb-8 lg:mb-10">
          <p
            className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-2"
            style={{ color: "var(--color-river-red-deep)" }}
          >
            Sección
          </p>
          <h1
            className="font-display leading-none mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
            }}
          >
            {info.titulo}
          </h1>
          <p
            className="text-lg leading-relaxed max-w-[720px] mb-4"
            style={{ color: "var(--color-neutral-700)" }}
          >
            {info.intro}
          </p>
          <p
            className="font-mono text-xs uppercase tracking-[0.14em]"
            style={{ color: "var(--color-neutral-500)" }}
          >
            {notas.length} {notas.length === 1 ? "nota" : "notas"}
          </p>
        </header>

        {notas.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {notas.map((nota) => (
              <TeaserCard key={nota.id} nota={nota} />
            ))}
          </section>
        ) : (
          <div
            className="brut-frame p-10 text-center"
            style={{ background: "var(--color-paper-pure)" }}
          >
            <p
              className="font-display"
              style={{ fontSize: "1.5rem", color: "var(--color-ink)" }}
            >
              Todavía no hay notas en esta sección.
            </p>
            <p className="mt-2" style={{ color: "var(--color-neutral-500)" }}>
              Mientras tanto, mirá lo último en la portada.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
