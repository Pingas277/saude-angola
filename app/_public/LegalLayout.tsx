import { AlertTriangle, ArrowUp, ScrollText } from "lucide-react";
import PublicShell from "./PublicShell";

/**
 * Server-rendered legal-document layout.
 *
 * Children should be a series of <Section id="…" title="…">…</Section>
 * blocks. The layout collects their (id, title) pairs into a sticky
 * sidebar TOC on lg+, and renders a single combined article column on
 * mobile. Sections get anchors so the TOC can deep-link.
 */
export function LegalLayout({
  title,
  intro,
  updated,
  toc,
  children,
}: {
  title: string;
  intro?: string;
  updated: string;
  toc: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <PublicShell>
      <article className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Documentos legais
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: {updated} · Aplicável em todo o território da
          República de Angola.
        </p>

        {intro && (
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-foreground">
            {intro}
          </p>
        )}

        {/* Preliminary notice */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-500 text-white shadow-sm">
            <AlertTriangle className="size-4" />
          </span>
          <span className="leading-relaxed">
            <strong className="font-bold">Documento preliminar.</strong>{" "}
            Sujeito a revisão por aconselhamento jurídico antes de ser
            considerado vinculativo. Em caso de dúvida, contacte-nos antes de
            agir.
          </span>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                <ScrollText className="size-3.5" />
                Índice
              </div>
              <nav className="mt-3">
                <ol className="space-y-1.5 text-sm">
                  {toc.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="group flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <span className="text-[10px] font-mono tabular-nums text-muted-foreground/60 group-hover:text-primary">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{s.label}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 space-y-10">
            {children}

            <div className="border-t border-border pt-8 text-center">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowUp className="size-3.5" />
                Voltar ao topo
              </a>
            </div>
          </div>
        </div>
      </article>
    </PublicShell>
  );
}

/* ─────────────────────────── Section ─────────────────────────── */

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

/* ─────────────────────────── DataTable ─────────────────────────── */

/** Tabular inventory used inside privacy policy ("What data, why, how long"). */
export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {rows.map((r, i) => (
            <tr key={i} className="align-top">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={
                    "px-4 py-3 " +
                    (j === 0
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground")
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Inline highlight box for important regulatory references. */
export function Callout({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "mt-3 rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed " +
        (tone === "warn"
          ? "border-amber-200 bg-amber-50/70 text-amber-900"
          : "border-sky-200 bg-sky-50/70 text-sky-900")
      }
    >
      {children}
    </div>
  );
}
