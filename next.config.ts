import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Bundle TTF font files into the serverless trace for the PDF API routes.
  // Without this, fs.readFileSync on lib/fonts/*.ttf fails in production.
  outputFileTracingIncludes: {
    "/api/receita/[id]/pdf": ["./lib/fonts/**", "./public/brand/**"],
    "/api/fatura/[id]/pdf": ["./lib/fonts/**", "./public/brand/**"],
  },
};

export default nextConfig;
