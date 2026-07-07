import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /ui = playground de diseño; /admin = panel privado
      disallow: ["/ui", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
