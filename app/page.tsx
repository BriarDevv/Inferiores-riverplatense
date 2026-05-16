import HeroFeature from "@/components/cards/HeroFeature";
import NotaCard from "@/components/cards/NotaCard";
import TeaserCard from "@/components/cards/TeaserCard";
import WideFeatureCard from "@/components/cards/WideFeatureCard";
import NoticiasList from "@/components/lists/NoticiasList";
import NewsletterBand from "@/components/layout/NewsletterBand";
import { getNotaDestacada, getNotas } from "@/lib/notas";

export default async function HomePage() {
  const destacada = await getNotaDestacada();
  const todas = await getNotas({ orden: "recientes" });

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
  // Bento slots
  const entrevistaWide = entrevistas[0] ?? notasLong[0];
  const notaA =
    notasLong.find((n) => n.tipo === "perfil") ??
    notasLong[0] ??
    entrevistas[1];
  const notaB =
    notasLong.find((n) => n.tipo !== "perfil" && n.id !== notaA?.id) ??
    notasLong[1] ??
    entrevistas[2];
  const notaC =
    notasLong.find(
      (n) => n.id !== notaA?.id && n.id !== notaB?.id,
    ) ?? entrevistas.find((n) => n.id !== entrevistaWide?.id);

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
                  style={{ color: "var(--color-river-red)" }}
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
