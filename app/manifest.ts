import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inferiores Riverplatense",
    short_name: "Inferiores",
    description:
      "Periodismo dedicado a las divisiones formativas de River Plate.",
    start_url: "/",
    display: "browser",
    background_color: "#FAFAF7",
    theme_color: "#0A0A0A",
    icons: [{ src: "/logo.webp", sizes: "any", type: "image/webp" }],
  };
}
