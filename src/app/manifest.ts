import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#efebe2",
    theme_color: "#c25f21",
    icons: [
      {
        src: "/images/researcher-hero.jpg",
        sizes: "1024x1024",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
