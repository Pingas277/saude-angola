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

  // Security headers — applied to every response on every route.
  //
  // - HSTS forces clients to use https for a year (and pre-load eligible).
  //   Vercel already redirects http→https; HSTS pins it client-side.
  // - X-Content-Type-Options:nosniff stops browsers from guessing a
  //   different mime type than what we sent.
  // - X-Frame-Options:DENY stops third-party sites from embedding Lunga
  //   in an iframe (clickjacking protection). The Jitsi video iframe we
  //   embed ourselves is unaffected — that's our parent embedding their
  //   widget, not the other way around.
  // - Referrer-Policy:strict-origin-when-cross-origin keeps the path off
  //   the Referer header when navigating away.
  // - Permissions-Policy turns off APIs we don't use (camera/mic are
  //   re-allowed via iframe allow attr in the telemed sala).
  // - CSP is intentionally conservative: scripts only from same origin
  //   + Vercel + Sentry; images from anywhere (Supabase storage etc);
  //   connect to Supabase + Sentry + Anthropic. 'unsafe-inline' on
  //   styles because Tailwind generates them; tightening that needs a
  //   nonce roll-out we'll do separately.
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://*.vercel-scripts.com https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://api.anthropic.com https://*.vercel-insights.com",
      "frame-src 'self' https://meet.jit.si https://*.jit.si",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      // Public emergency card page — keep no-referrer + extra cache-control
      // so paramedics scanning from a phone get a fresh response.
      {
        source: "/e/:token",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
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
