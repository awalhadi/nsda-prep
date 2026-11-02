import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CBT&A Level 4 Exam Prep",
    short_name: "CBT&A Prep",
    description: "Learn every highlighted CBLM topic once, in simple English with Bangla help.",
    start_url: "/cbta",
    scope: "/",
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#0e7c5a",
    icons: [
      { src: "/icons/cbta-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/cbta-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
