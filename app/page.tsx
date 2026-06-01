import HeroFeature from "@/components/cards/HeroFeature";
import NotaCard from "@/components/cards/NotaCard";
import TeaserCard from "@/components/cards/TeaserCard";
import WideFeatureCard from "@/components/cards/WideFeatureCard";
import NoticiasList from "@/components/lists/NoticiasList";
import NewsletterBand from "@/components/layout/NewsletterBand";
import { getNotaDestacada, getNotas } from "@/lib/notas";
import { labelDivision, labelTipo } from "@/lib/constants";
import type { Division, Nota, TipoNota } from "@/lib/types";

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

    const descripcion = [
      tipo ? labelTipo(tipo) : null,
      division ? labelDivision(division) : null,
      tema && TEMAS[tema] ? TEMAS[tema].label : null,
      q ? `“${q}”` : null,
    ]
      .filter(Boolean)
      .join(" · ");

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
  const todas = await getNotas();
  const destacada = await getNotaDestacada();
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

  const entrevistaWide = tomar(libre(entrevistas) ?? libre(notasLong));
  const notaA = tomar(
    libre(notasLong, (n) => n.tipo === "perfil") ?? libre(notasLong) ?? libre(entrevistas),
  );
  const notaB = tomar(libre(notasLong) ?? libre(entrevistas));
  const notaC = tomar(libre(notasLong) ?? libre(entrevistas));

  // Teasers (3 cards bajo el hero) — agarra lo que no entra en bento
  const reserved = new Set(
    [entrevistaWide?.id, notaA?.id, notaB?.id, notaC?.id].filter(Boolean) as string[],
  );
  const teasers = restantes
    .filter(
      (n) =>
        n.formato !== "youtube" &&
        n.tipo !== "noticia" &&
        !reserved.has(n.id),
    )
    .slice(0, 3);

  return (
    <main style={{ background: "var(--color-paper)" }}>
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 lg:py-16">
        {/* === HERO === */}
        {destacada && (
          <section className="mb-14 lg:mb-16">
            <HeroFeature nota={destacada} />
          </section>
        )}

        {/* === TEASERS (3 cards bajo el hero) === */}
        {teasers.length > 0 && (
          <section className="mb-20 lg:mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {teasers.map((nota) => (
                <TeaserCard key={nota.id} nota={nota} />
              ))}
            </div>
          </section>
        )}

        {/* === BENTO: entrevista wide + 2 notas + columna de noticias === */}
        {(entrevistaWide || notaA || notaB || noticias.length > 0) && (
          <section className="mb-20 lg:mb-24">
            <header className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p
                  className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-2"
                  style={{ color: "var(--color-river-red-deep)" }}
                >
                  Esta semana
                </p>
                <h2
                  className="font-display leading-none"
                  style={{
                    fontSize: "clamp(1.75rem, 2.6vw, 2.5rem)",
                    letterSpacing: "-0.025em",
                    color: "var(--color-ink)",
                  }}
                >
                  Entrevistas, notas y noticias
                </h2>
              </div>
              <div
                aria-hidden
                style={{
                  flex: 1,
                  height: "2px",
                  background: "var(--color-ink)",
                  marginBottom: "0.5rem",
                }}
              />
            </header>

            <div className="bento">
              {entrevistaWide && (
                <div className="bento__wide">
                  <WideFeatureCard nota={entrevistaWide} />
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
              {noticias.length > 0 && (
                <div className="bento__noticias">
                  <NoticiasList notas={noticias} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* === NEWSLETTER === */}
        <NewsletterBand />
      </div>
    </main>
  );
}
