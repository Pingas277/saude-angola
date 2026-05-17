import Link from "next/link";
import { Check } from "lucide-react";
import Logo from "../_brand/Logo";
import ThemeToggle from "../_theme/ThemeToggle";

const TRUST = [
  "Triagem assistida por IA",
  "Receitas com QR válidas em farmácias",
  "Pagamentos via Multicaixa Express",
  "Histórico clínico sempre disponível",
];

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* === Brand panel (left) — hidden on mobile === */}
      <aside className="relative hidden border-r border-border bg-muted/40 lg:flex lg:flex-col">
        <div className="flex flex-1 flex-col justify-between px-12 py-14">
          <Logo href="/" size="lg" subtitle="Saúde digital · Angola" />

          <div>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
              A plataforma de saúde feita{" "}
              <span className="text-primary">para Angola</span>.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Telemedicina, gestão clínica e receitas digitais numa só app —
              acessível de Luanda ao Cunene.
            </p>

            <ul className="mt-8 space-y-3">
              {TRUST.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border text-primary">
                    <Check className="size-3" />
                  </span>
                  <span className="text-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              aria-hidden
              className="flex overflow-hidden rounded-sm border border-border"
            >
              <span style={{ background: "#CD1126" }} className="block h-3 w-2" />
              <span style={{ background: "#000000" }} className="block h-3 w-2" />
              <span style={{ background: "#FCD116" }} className="block h-3 w-2" />
            </span>
            <span>Feito em Angola · com orgulho</span>
          </div>
        </div>
      </aside>

      {/* === Form panel (right) === */}
      <section className="relative flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo href="/" size="md" />
          </div>

          <div className="rounded-xl border border-border bg-card p-8 sm:border-0 sm:bg-transparent sm:p-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Voltar à página inicial
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
