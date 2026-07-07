import type { Metadata } from "next";
import HeroFeature from "@/components/cards/HeroFeature";
import NotaCard from "@/components/cards/NotaCard";
import TeaserCard from "@/components/cards/TeaserCard";
import WideFeatureCard from "@/components/cards/WideFeatureCard";
import JugadorCard from "@/components/cards/JugadorCard";
import NoticiasList from "@/components/lists/NoticiasList";
import UltimasList from "@/components/lists/UltimasList";
import NewsletterBand from "@/components/layout/NewsletterBand";
import SobreAutorBand from "@/components/layout/SobreAutorBand";
import {
  getNotaDestacada,
  getNotas,
  getNotasPorSujeto,
  getSlugsDeJugadores,
  getSujetoPorSlug,
} from "@/lib/notas";
import { getAutorPrincipal } from "@/lib/autores";
import { labelDivision, labelTipo } from "@/lib/constants";
import type { Division, Nota, Sujeto, TipoNota } from "@/lib/types";

type SearchParams = { [key: string]: string | string[] | undefined };

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Temas editoriales: agrupan notas por tags reales.
 * "Traspasos" junta fichajes, préstamos, scouting y movimientos de plantel.
 * El matcheo real (sin acentos) vive en lib/notas.ts.
 */
const TEMAS: Record<string, { label: string; tags: string[] }> = {
  traspasos: {
    label: "Traspasos",
    tags: ["fichaje", "préstamo", "prestamo", "scouting", "movimientos", "traspaso"],
  },
};

/** Etiqueta legible de los filtros activos (título del modo filtrado). */
function labelFiltros(
  tipo?: TipoNota,
  division?: Division,
  tema?: string,
  q?: string,
): string {
  return [
    tipo ? labelTipo(tipo) : null,
    division ? labelDivision(division) : null,
    tema && TEMAS[tema] ? TEMAS[tema].label : null,
    q ? `“${q}”` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const tipo = first(sp.tipo) as TipoNota | undefined;
  const division = first(sp.division) as Division | undefined;
  const tema = first(sp.tema);
  const q = first(sp.q)?.trim();

  // Portada sin filtros = la URL canónica del sitio.
  if (!tipo && !division && !tema && !q) {
    return {
      alternates: {
        canonical: "/",
        types: {
          "application/rss+xml": [
            { url: "/feed.xml", title: "Inferiores Riverplatense" },
          ],
        },
      },
    };
  }

  // Vistas filtradas y búsqueda: navegables pero fuera del índice
  // (son recortes de la portada; indexarlas diluye el crawl budget).
  return {
    title: labelFiltros(tipo, division, tema, q),
    robots: { index: false, follow: true },
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const tipo = first(sp.tipo) as TipoNota | undefined;
  const division = first(sp.division) as Division | undefined;
  const tema = first(sp.tema);
  const q = first(sp.q)?.trim();

  // ===== MODO FILTRADO (búsqueda / sección / división / tema) =====
  const filtering = Boolean(tipo || division || tema || q);
  if (filtering) {
    const tags = tema && TEMAS[tema] ? TEMAS[tema].tags : undefined;
    const resultados = await getNotas({ tipo, division, tags, q });

    const descripcion = labelFiltros(tipo, division, tema, q);

    return (
      <main style={{ background: "var(--color-paper)" }}>
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 lg:py-16">
          <header className="mb-8 lg:mb-10">
            <p
              className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-2"
              style={{ color: "var(--color-river-red-deep)" }}
            >
              {q ? "Resultados de búsqueda" : "Filtro activo"}
            </p>
            <h1
              className="font-display leading-none mb-4"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                letterSpacing: "-0.03em",
                color: "var(--color-ink)",
              }}
            >
              {descripcion}
            </h1>
            <p
              className="font-mono text-xs uppercase tracking-[0.14em]"
              style={{ color: "var(--color-neutral-500)" }}
            >
              {resultados.length}{" "}
              {resultados.length === 1 ? "resultado" : "resultados"}
            </p>
          </header>

          {resultados.length > 0 ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              {resultados.map((nota) => (
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
                No hay notas para este filtro.
              </p>
              <p className="mt-2" style={{ color: "var(--color-neutral-500)" }}>
                Probá con otra búsqueda o volvé a la portada.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ===== PORTADA EDITORIAL (sin filtros) =====
  const [todas, destacada] = await Promise.all([getNotas(), getNotaDestacada()]);
  const restantes = destacada
    ? todas.filter((n) => n.id !== destacada.id)
    : todas;

  // Pools por tipo/formato
  const noticias = restantes.filter((n) => n.tipo === "noticia").slice(0, 6);
  const entrevistas = restantes.filter(
    (n) => n.tipo === "entrevista" && n.formato !== "youtube",
  );
  const notasLong = restantes.filter(
    (n) =>
      n.tipo !== "noticia" &&
      n.tipo !== "entrevista" &&
      n.formato !== "youtube",
  );
  // Bento slots — un Set incremental garantiza que ningún slot repita otro.
  const usados = new Set<string>();
  const tomar = (n?: Nota): Nota | undefined => {
    if (n) usados.add(n.id);
    return n;
  };
  const libre = (pool: Nota[], extra: (n: Nota) => boolean = () => true) =>
    pool.find((n) => !usados.has(n.id) && extra(n));

  // Bento: entrevista wide + columna de noticias + 3 notas + 3 teasers
  const entrevistaWide = tomar(libre(entrevistas) ?? libre(notasLong));
  const notaA = tomar(
    libre(notasLong, (n) => n.tipo === "perfil") ?? libre(notasLong) ?? libre(entrevistas),
  );
  const notaB = tomar(libre(notasLong) ?? libre(entrevistas));
  const notaC = tomar(libre(notasLong) ?? libre(entrevistas));

  // Teasers (fila inferior del bento) — lo que no entró en los slots
  const teasers = restantes
    .filter(
      (n) =>
        n.formato !== "youtube" &&
        n.tipo !== "noticia" &&
        !usados.has(n.id),
    )
    .slice(0, 3);

  // ===== BLOQUES INFERIORES =====
  // "En la mira" — jugadores con hub de seguimiento
  const jugadorSlugs = await getSlugsDeJugadores();
  const jugadores = (
    await Promise.all(
      jugadorSlugs.map(async (slug) => {
        const sujeto = await getSujetoPorSlug(slug);
        if (!sujeto) return null;
        const notasJugador = await getNotasPorSujeto(sujeto.id);
        return { sujeto, notas: notasJugador };
      }),
    )
  ).filter((x): x is { sujeto: Sujeto; notas: Nota[] } => x !== null);

  // "Más notas" — hilera de teasers típicos (notas que no entraron en el bento)
  const yaArriba = new Set<string>([
    ...(destacada ? [destacada.id] : []),
    ...noticias.map((n) => n.id),
    ...usados,
    ...teasers.map((n) => n.id),
  ]);
  const masNotas = restantes
    .filter(
      (n) =>
        n.formato !== "youtube" && n.tipo !== "noticia" && !yaArriba.has(n.id),
    )
    .slice(0, 3);

  // "Lo último" — recientes que no se mostraron arriba (ni en "Más notas")
  const mostradas = new Set<string>([
    ...yaArriba,
    ...masNotas.map((n) => n.id),
  ]);
  const ultimas = todas.filter((n) => !mostradas.has(n.id)).slice(0, 6);

  // Stats + firma para la banda del periodista
  const autorPrincipal = await getAutorPrincipal();
  const stats = {
    notas: todas.length,
    divisiones: new Set(todas.map((n) => n.division)).size,
    jugadores: jugadorSlugs.length,
  };

  return (
    <main style={{ background: "var(--color-paper)" }}>
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 lg:py-16">
        {/* === HERO full-width (nota destacada) === */}
        {destacada && (
          <section className="mb-12 lg:mb-16">
            <HeroFeature nota={destacada} />
          </section>
        )}

        {/* === BENTO: entrevista + noticias (derecha) + notas + teasers === */}
        {(entrevistaWide || noticias.length > 0 || notaA || notaB || notaC || teasers.length > 0) && (
          <section className="mb-20 lg:mb-24">
            <div className="bento">
              {entrevistaWide && (
                <div className="bento__wide">
                  <WideFeatureCard nota={entrevistaWide} />
                </div>
              )}
              {noticias.length > 0 && (
                <div className="bento__noticias">
                  <NoticiasList notas={noticias} />
                </div>
              )}
              {notaA && (
                <div className="bento__nota-a">
                  <NotaCard nota={notaA} variant="articulo" />
                </div>
              )}
              {notaB && (
                <div className="bento__nota-b">
                  <NotaCard nota={notaB} variant="articulo" />
                </div>
              )}
              {notaC && (
                <div className="bento__nota-c">
                  <NotaCard nota={notaC} variant="articulo" />
                </div>
              )}
              {teasers[0] && (
                <div className="bento__t1">
                  <TeaserCard nota={teasers[0]} />
                </div>
              )}
              {teasers[1] && (
                <div className="bento__t2">
                  <TeaserCard nota={teasers[1]} />
                </div>
              )}
              {teasers[2] && (
                <div className="bento__t3">
                  <TeaserCard nota={teasers[2]} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* === HILERA DE TEASERS típicos (sin título) === */}
        {masNotas.length > 0 && (
          <section className="mb-20 lg:mb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              {masNotas.map((nota) => (
                <TeaserCard key={nota.id} nota={nota} />
              ))}
            </div>
          </section>
        )}

        {/* === EN LA MIRA: jugadores en seguimiento === */}
        {jugadores.length > 0 && (
          <section className="mb-20 lg:mb-24">
            <p
              className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-6"
              style={{ color: "var(--color-river-red-deep)" }}
            >
              En la mira · jugadores que seguimos
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              {jugadores.map(({ sujeto, notas }) => (
                <JugadorCard key={sujeto.id} sujeto={sujeto} notas={notas} />
              ))}
            </div>
          </section>
        )}

        {/* === LO ÚLTIMO === */}
        {ultimas.length > 0 && (
          <section className="mb-20 lg:mb-24">
            <p
              className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-2"
              style={{ color: "var(--color-river-red-deep)" }}
            >
              Lo último
            </p>
            <UltimasList notas={ultimas} />
          </section>
        )}

        {/* === SOBRE EL PERIODISTA === */}
        {autorPrincipal && <SobreAutorBand autor={autorPrincipal} stats={stats} />}

        {/* === NEWSLETTER === */}
        <NewsletterBand />
      </div>
    </main>
  );
}
