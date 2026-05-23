// Next.js instrumentation hook — loads Sentry server / edge config
// at runtime, depending on which runtime the request is being served on.
// onRequestError reports uncaught errors from RSC and route handlers.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
