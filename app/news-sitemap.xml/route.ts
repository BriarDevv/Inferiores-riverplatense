import { getTodasLasNotas } from "@/lib/notas";
import { SITE_URL } from "@/lib/site";
import { escXml } from "@/lib/xml";

/**
 * Sitemap de Google News: SOLO notas de las últimas 48 horas (regla de
 * Google; las más viejas viven en el sitemap general). Si no hay notas
 * recientes devuelve un urlset vacío, que es válido.
 */
const VENTANA_NEWS_MS = 48 * 60 * 60 * 1000;

export async function GET() {
  const todas = await getTodasLasNotas();
  const ahora = Date.now();
  const recientes = todas.filter(
    (n) => ahora - new Date(n.publicada_en).getTime() < VENTANA_NEWS_MS,
  );

  const items = recientes
    .map(
      (n) => `  <url>
    <loc>${SITE_URL}/nota/${n.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Inferiores Riverplatense</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${new Date(n.publicada_en).toISOString()}</news:publication_date>
      <news:title>${escXml(n.titulo)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Ventana corta: las noticias frescas tienen que aparecer rápido.
      "Cache-Control": "public, max-age=900",
    },
  });
}
