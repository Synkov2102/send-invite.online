import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — ${brand.tagline}`,
    short_name: brand.name,
    description:
      "Конструктор сайтов-приглашений на свадьбу с шаблонами, RSVP и публикацией по ссылке.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf7",
    theme_color: "#ff5f7f",
    lang: "ru",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
