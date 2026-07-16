import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JuniorFlow AI",
    short_name: "JuniorFlow AI",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8f3",
    theme_color: "#14261f",
    icons: [
      {
        src: "/icons/juniorflow-ai-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/juniorflow-ai-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
