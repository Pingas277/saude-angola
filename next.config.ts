import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Server Actions ship with CSRF protection that rejects any request whose
  // Origin doesn't match the host on the request. We serve under both
  // lunga.ao and www.lunga.ao (Vercel redirects one to the other), so the
  // form might be rendered on www.lunga.ao but POST to lunga.ao mid-flight
  // — that gets rejected and the client sees the JSON parse error from
  // an HTML rejection page. Allowing both origins fixes login + every
  // other server action.
  // Server Actions ship with CSRF protection that rejects any request whose
  // Origin doesn't match the host. Since Vercel redirects between lunga.ao
  // and www.lunga.ao (preserving POST), the form might be rendered on one
  // host and submit to the other. We list every host we serve under.
  serverActions: {
    allowedOrigins: [
      "lunga.ao",
      "www.lunga.ao",
      "saude-angola.vercel.app",
      "lunga-app.vercel.app",
    ],
  },
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
