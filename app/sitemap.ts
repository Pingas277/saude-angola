import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://saude-angola.vercel.app";

// Only public, indexable pages belong here. Authenticated routes (/painel,
// /medico, /clinica, /recepcao, /perfil) are gated by middleware and would
// just redirect to /entrar — no value indexing them.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/sobre", priority: 0.7, freq: "monthly" },
    { path: "/entrar", priority: 0.5, freq: "monthly" },
    { path: "/registar", priority: 0.8, freq: "monthly" },
    { path: "/privacidade", priority: 0.3, freq: "monthly" },
    { path: "/termos", priority: 0.3, freq: "monthly" },
  ];

  return pages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
