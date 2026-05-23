// Server-side Sentry config (Node runtime — RSC, route handlers, server
// actions, PDF generation). No-op when SENTRY_DSN is not set.

import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}
