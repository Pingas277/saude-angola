import { AlertTriangle } from "lucide-react";
import PublicShell from "./PublicShell";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-xs font-medium uppercase tracking-wider text-primary">
          Legal
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: {updated}
        </p>

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Documento preliminar. O conteúdo deve ser revisto por
            aconselhamento jurídico antes de ser considerado vinculativo.
          </span>
        </div>

        <div className="mt-10 space-y-8">{children}</div>
      </article>
    </PublicShell>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
