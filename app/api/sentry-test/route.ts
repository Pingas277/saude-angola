// Diagnostic endpoint — visiting it sends a test event to Sentry and
// reports whether the DSN env var actually reached this runtime.
// Remove after confirming Sentry works.

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const dsnConfigured = !!(
    process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  );

  try {
    Sentry.captureException(new Error("Lunga · Sentry health check"));
    // Wait up to 3 s for the event to be flushed to Sentry before responding.
    await Sentry.flush(3000);
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        dsnConfigured,
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    dsnConfigured,
    message: dsnConfigured
      ? "Evento enviado ao Sentry. Verifique em sentry.io → Issues (até 1 min)."
      : "DSN NÃO configurado neste ambiente — a variável de ambiente NEXT_PUBLIC_SENTRY_DSN não chegou ao runtime.",
  });
}
