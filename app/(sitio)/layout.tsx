import AnimacionesSitio from "@/components/layout/AnimacionesSitio";
import LenisProvider from "@/components/layout/LenisProvider";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SocialRail from "@/components/layout/SocialRail";
import type { PartidoBarra } from "@/components/layout/Nav";
import { labelDivision } from "@/lib/constants";
import { getUltimaNota } from "@/lib/notas";
import {
  expiraPartido,
  formatearFechaPartido,
  getProximoPartido,
  partidoVigente,
} from "@/lib/partido";
import { hrefDivision } from "@/lib/secciones";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/json-ld";

/**
 * Identidad del sitio para buscadores: la organización (referenciada por
 * "@id" desde el JSON-LD de cada nota) + el sitio con su buscador interno.
 * sameAs (redes) queda pendiente hasta que haya handles reales.
 */
const JSONLD_SITIO = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsMediaOrganization",
      "@id": `${SITE_URL}/#organizacion`,
      name: "Inferiores Riverplatense",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.webp` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#sitio`,
      url: SITE_URL,
      name: "Inferiores Riverplatense",
      description:
        "Periodismo dedicado a las divisiones formativas de River Plate.",
      inLanguage: "es-AR",
      publisher: { "@id": `${SITE_URL}/#organizacion` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

/**
 * ISR de red de seguridad: sin cron, una nota PROGRAMADA cuya fecha llega no
 * tiene ninguna action que revalide — con esto, toda página pública se
 * rehornea a lo sumo una vez por hora y la nota aparece sola.
 */
export const revalidate = 3600;

/** Layout del sitio público: masthead, redes, footer y smooth scroll. */
export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  // La barra roja del Nav anuncia el próximo partido (si hay uno cargado y
  // vigente) y, si no, la última nota publicada (vienen ordenadas).
  const [ultima, partidoDb] = await Promise.all([
    getUltimaNota(),
    getProximoPartido(),
  ]);
  const partido: PartidoBarra | null =
    partidoDb && partidoVigente(partidoDb.fecha)
      ? {
          rival: partidoDb.rival,
          divisionLabel: labelDivision(partidoDb.division),
          href: hrefDivision(partidoDb.division),
          fechaLabel: formatearFechaPartido(partidoDb.fecha),
          expira: expiraPartido(partidoDb.fecha),
        }
      : null;

  return (
    <LenisProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(JSONLD_SITIO) }}
      />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      {/* Nav va SIN Suspense externo: su único useSearchParams vive aislado
          en TraspasosLink (con boundary propio y fallback idéntico). Un
          boundary acá haría que el header llegue por streaming-swap y
          empuje la página al aparecer (CLS). */}
      <Nav ultima={ultima} partido={partido} />
      <SocialRail />
      {/* overflow-x: clip corta cualquier barra horizontal espuria (p. ej. un
          overflow subpíxel transitorio durante las animaciones de entrada) sin
          crear scroll-container ni romper el sticky del nav (mismo patrón que
          el .admin-shell). El eje Y queda intacto. */}
      <div id="contenido" tabIndex={-1} className="overflow-x-clip">
        {children}
      </div>
      <Footer />
      <ScrollToTop />
      <AnimacionesSitio />
    </LenisProvider>
  );
}
