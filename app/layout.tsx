import type { Metadata, Viewport } from "next";
import {
  Newsreader,
  Anton,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

/* === Combo final del proyecto: Newsreader + Anton + Inter + JetBrains Mono === */
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const anton = Anton({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
  weight: ["400"],
});

/* === BODY & MONO === */
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

import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Inferiores Riverplatense — Periodismo de la cantera de River",
    template: "%s · Inferiores Riverplatense",
  },
  description:
    "Entrevistas, perfiles y crónicas de las divisiones formativas del Club Atlético River Plate.",
  applicationName: "Inferiores Riverplatense",
  publisher: "Inferiores Riverplatense",
  icons: { icon: "/logo.webp", apple: "/logo.webp" },
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "Inferiores Riverplatense" },
      ],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Preview grande = requisito práctico para aparecer bien en Discover.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Inferiores Riverplatense",
    description:
      "Periodismo dedicado a las divisiones formativas de River Plate.",
    type: "website",
    locale: "es_AR",
    siteName: "Inferiores Riverplatense",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inferiores Riverplatense",
    description:
      "Periodismo dedicado a las divisiones formativas de River Plate.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
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
        newsreader.variable,
        anton.variable,
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
        {children}
      </body>
    </html>
  );
}
