"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Last-line-of-defence error boundary for unhandled React render errors.
 * Sentry's Next.js SDK recommends this file so client render crashes are
 * reported (instrumentation-client.ts only catches runtime errors, not
 * React render errors).
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-AO">
      <body className="min-h-screen bg-background antialiased">
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
            Erro inesperado
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Algo correu mal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Já fomos notificados e vamos resolver. Recarregue a página, por
            favor.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/30"
          >
            Recarregar
          </button>
        </main>
      </body>
    </html>
  );
}
