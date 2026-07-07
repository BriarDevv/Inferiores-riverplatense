import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /admin = panel privado; /auth = callback de login; /api = endpoints.
      // /ui NO va acá: está linkeado desde el footer, y con Disallow Google
      // nunca leería su meta noindex (quedaría "indexed though blocked").
      disallow: ["/admin", "/auth", "/api"],
    },
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`],
  };
}
