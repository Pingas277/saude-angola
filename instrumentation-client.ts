// Browser-side Sentry config. Initialised on every page load.
// No-op when NEXT_PUBLIC_SENTRY_DSN is not set, so dev runs the same.

import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",

    // Sample only 10% of normal events in production; everything in dev.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // We don't ship Replay yet — keeps the bundle small.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

// Required by Sentry's Next.js SDK for client-side route-change instrumentation.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
