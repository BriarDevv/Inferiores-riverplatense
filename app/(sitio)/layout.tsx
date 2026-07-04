import { Suspense } from "react";
import LenisProvider from "@/components/layout/LenisProvider";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SocialRail from "@/components/layout/SocialRail";

/** Layout del sitio público: masthead, redes, footer y smooth scroll. */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
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
