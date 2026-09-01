import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kekulama Eco Cabana",
    short_name: "Kekulama",
    description: "Romantic Nature Sanctuary & Boutique Eco Lodge in Galle, Sri Lanka",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#2d4a3e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
