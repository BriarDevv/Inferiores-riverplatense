import { Suspense } from "react";
import LenisProvider from "@/components/layout/LenisProvider";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SocialRail from "@/components/layout/SocialRail";
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

/** Layout del sitio público: masthead, redes, footer y smooth scroll. */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(JSONLD_SITIO) }}
      />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
      <SocialRail />
      <div id="contenido" tabIndex={-1}>
        {children}
      </div>
      <Footer />
      <ScrollToTop />
    </LenisProvider>
  );
}
