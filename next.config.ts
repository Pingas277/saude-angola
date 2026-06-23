import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Bundle TTF font files into the serverless trace for the PDF API routes.
  // Without this, fs.readFileSync on lib/fonts/*.ttf fails in production.
  outputFileTracingIncludes: {
    "/api/receita/[id]/pdf": ["./lib/fonts/**", "./public/brand/**"],
    "/api/fatura/[id]/pdf": ["./lib/fonts/**", "./public/brand/**"],
    // OG image reads logo PNG from disk via fs at request time.
    "/opengraph-image": ["./public/brand/**"],
  },
  // Allow next/image to render SVGs (logo). Sandboxed via CSP so any
  // inline scripts inside an SVG (even one we control) can't execute.
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
};

// Wrap with Sentry. When SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN are not
// set, the wrapper still works for runtime capture; the source-map upload
// step is just skipped. In dev or without a DSN it's effectively a no-op.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
});
