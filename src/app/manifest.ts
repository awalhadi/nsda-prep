import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "প্রস্তুতি · NSDA Study",
    short_name: "প্রস্তুতি",
    description: "CBT&A Level 4 ও Web Design Level 3 — বাংলা সহায়তা, প্রশ্নচর্চা ও ব্যক্তিগত অগ্রগতি।",
    lang: "bn-BD",
    start_url: "/cbta",
    scope: "/",
    display: "standalone",
    background_color: "#f5f6fa",
    theme_color: "#4f46e5",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/study-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/study-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/study-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "আজকের পড়া", url: "/cbta" },
      { name: "প্রশ্নচর্চা", url: "/cbta/questions" },
      { name: "রিভিশন", url: "/cbta/revise" },
    ],
  };
}
