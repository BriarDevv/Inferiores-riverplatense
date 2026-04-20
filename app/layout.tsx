import type { Metadata } from "next";
import {
  Fraunces,
  Instrument_Serif,
  Newsreader,
  Playfair_Display,
  Anton,
  Bebas_Neue,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import LenisProvider from "@/components/layout/LenisProvider";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import "./globals.css";

/* === CURRENT (candidato por defecto) === */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-local",
  weight: ["400", "500", "700", "900"],
});

/* === CANDIDATOS PARA COMPARAR EN /ui === */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
  weight: ["400"],
  style: ["normal", "italic"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const anton = Anton({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
  weight: ["400"],
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
  weight: ["400"],
});

/* === BODY & MONO (estables, sin cambios) === */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-local",
  weight: ["400", "500", "600", "700"],
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-local",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Inferiores Riverplatense — Periodismo de la cantera de River",
  description:
    "Entrevistas, perfiles y crónicas de las divisiones formativas del Club Atlético River Plate.",
  openGraph: {
    title: "Inferiores Riverplatense",
    description:
      "Periodismo dedicado a las divisiones formativas de River Plate.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-AR"
      className={[
        fraunces.variable,
        instrumentSerif.variable,
        newsreader.variable,
        playfair.variable,
        anton.variable,
        bebas.variable,
        inter.variable,
        jbMono.variable,
      ].join(" ")}
    >
      <body
        style={{
          fontFamily: "var(--font-body-local), var(--font-body)",
        }}
      >
        <style>{`
          :root {
            /* Combo final: Newsreader (display) + Anton (sports / scores) + Inter (body) + JetBrains Mono */
            --font-display: var(--font-newsreader), Georgia, serif;
            --font-sports: var(--font-anton), Impact, "Arial Narrow", sans-serif;
            --font-body: var(--font-body-local), system-ui, sans-serif;
            --font-mono: var(--font-mono-local), ui-monospace, monospace;
          }
        `}</style>
        <LenisProvider>
          <Nav />
          <main className="pt-0">{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
