import type { MetadataRoute } from "next";
import { getSlugsDeJugadores, getTodasLasNotas } from "@/lib/notas";
import { getSlugsDeAutores } from "@/lib/autores";
import { hrefTipo } from "@/lib/secciones";
import type { Division, TipoNota } from "@/lib/types";

import { SITE_URL } from "@/lib/site";

// Mismo ISR que el sitio: las notas programadas entran solas al vencer.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const todas = await getTodasLasNotas();
  const notas: MetadataRoute.Sitemap = todas.map((n) => ({
    url: `${SITE_URL}/nota/${n.slug}`,
    lastModified: new Date(n.actualizada_en ?? n.publicada_en),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Landings de división y sección: solo las que tienen contenido
  // (las vacías llevan noindex y no pertenecen al sitemap).
  const ultimaPorDivision = new Map<Division, Date>();
  const ultimaPorTipo = new Map<TipoNota, Date>();
  for (const n of todas) {
    const t = new Date(n.actualizada_en ?? n.publicada_en);
    const d = ultimaPorDivision.get(n.division);
    if (!d || t > d) ultimaPorDivision.set(n.division, t);
    const p = ultimaPorTipo.get(n.tipo);
    if (!p || t > p) ultimaPorTipo.set(n.tipo, t);
  }
  const landingsDivision: MetadataRoute.Sitemap = [...ultimaPorDivision].map(
    ([division, lastModified]) => ({
      url: `${SITE_URL}/division/${division}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    }),
  );
  const landingsSeccion: MetadataRoute.Sitemap = [...ultimaPorTipo].map(
    ([tipo, lastModified]) => ({
      url: `${SITE_URL}${hrefTipo(tipo)}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    }),
  );

  const slugs = await getSlugsDeJugadores();
  const jugadores: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/jugador/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Solo firmas con cobertura publicada: un perfil sin notas no entra al
  // sitemap (misma regla que las landings vacías).
  const slugsConNotas = new Set(
    todas.flatMap((n) => (n.autor.slug ? [n.autor.slug] : [])),
  );
  const slugsAutores = (await getSlugsDeAutores()).filter((slug) =>
    slugsConNotas.has(slug),
  );
  const autores: MetadataRoute.Sitemap = slugsAutores.map((slug) => ({
    url: `${SITE_URL}/autor/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const ultima = todas.reduce(
    (max, n) => {
      const t = new Date(n.actualizada_en ?? n.publicada_en);
      return t > max ? t : max;
    },
    new Date(0),
  );

  return [
    { url: SITE_URL, lastModified: ultima, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "yearly", priority: 0.5 },
    ...landingsDivision,
    ...landingsSeccion,
    ...notas,
    ...jugadores,
    ...autores,
  ];
}
