import type { MetadataRoute } from "next";
import { getSlugsDeJugadores, getTodasLasNotas } from "@/lib/notas";
import { getSlugsDeAutores } from "@/lib/autores";

import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const todas = await getTodasLasNotas();
  const notas: MetadataRoute.Sitemap = todas.map((n) => ({
    url: `${SITE_URL}/nota/${n.slug}`,
    lastModified: new Date(n.actualizada_en ?? n.publicada_en),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const slugs = await getSlugsDeJugadores();
  const jugadores: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/jugador/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const slugsAutores = await getSlugsDeAutores();
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
    ...notas,
    ...jugadores,
    ...autores,
  ];
}
