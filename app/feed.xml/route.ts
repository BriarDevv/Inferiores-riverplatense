import { getTodasLasNotas } from "@/lib/notas";
import { renderCuerpo } from "@/lib/render-cuerpo";

import { SITE_URL } from "@/lib/site";
import { escXml } from "@/lib/xml";

/** Cierra CDATA de forma segura si el HTML llegara a contener "]]>". */
function cdata(html: string): string {
  return `<![CDATA[${html.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const notas = await getTodasLasNotas();

  const items = notas
    .map((n) => {
      const link = `${SITE_URL}/nota/${n.slug}`;
      const cuerpoHtml = renderCuerpo(n.cuerpo);
      const contenido = cuerpoHtml
        ? `\n      <content:encoded>${cdata(cuerpoHtml)}</content:encoded>`
        : "";
      return `    <item>
      <title>${escXml(n.titulo)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escXml(n.bajada)}</description>
      <author>${escXml(n.autor.nombre)}</author>
      <pubDate>${new Date(n.publicada_en).toUTCString()}</pubDate>
      <media:content url="${escXml(n.poster_url)}" medium="image" />${contenido}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
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
