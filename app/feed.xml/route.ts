import { getTodasLasNotas } from "@/lib/notas";

import { SITE_URL } from "@/lib/site";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const notas = await getTodasLasNotas();

  const items = notas
    .map((n) => {
      const link = `${SITE_URL}/nota/${n.slug}`;
      return `    <item>
      <title>${esc(n.titulo)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(n.bajada)}</description>
      <author>${esc(n.autor.nombre)}</author>
      <pubDate>${new Date(n.publicada_en).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Inferiores Riverplatense</title>
    <link>${SITE_URL}</link>
    <description>Notas, entrevistas y noticias de las divisiones formativas de River Plate.</description>
    <language>es-AR</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
