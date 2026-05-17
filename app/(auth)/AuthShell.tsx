import Link from "next/link";
import Image from "next/image";
import { Video, FileText, CreditCard, ShieldCheck } from "lucide-react";
import Logo from "../_brand/Logo";
import ThemeToggle from "../_theme/ThemeToggle";

const FEATURES = [
  {
    icon: Video,
    title: "Telemedicina por vídeo",
    desc: "Fale com um médico licenciado em minutos.",
  },
  {
    icon: FileText,
    title: "Receitas digitais com QR",
    desc: "Válidas em farmácias parceiras.",
  },
  {
    icon: CreditCard,
    title: "Multicaixa Express",
    desc: "Pague e receba o comprovativo na hora.",
  },
  {
    icon: ShieldCheck,
    title: "Dados protegidos",
    desc: "Conformidade RGPD, acesso só seu.",
  },
];

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
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
          <Logo href="/" size="lg" subtitle="Saúde para todos" />

          <div className="max-w-md">
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              Plataforma de saúde · Angola
            </div>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-foreground">
              Toda a sua saúde,{" "}
              <span className="text-primary">num só sítio</span>.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Marque com qualquer médico, consulte por vídeo e guarde o seu
              histórico clínico — de Luanda ao Cunene.
            </p>

            <ul className="mt-8 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-primary">
                    <f.icon className="size-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {f.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {f.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Image
                src="/brand/angola-flag.png"
                alt="Bandeira de Angola"
                width={21}
                height={14}
                className="rounded-[2px] ring-1 ring-border"
              />
              <span>Feito em Angola</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                <strong className="font-semibold text-foreground">
                  ≈ 3 min
                </strong>{" "}
                até atendimento
              </span>
              <span>
                <strong className="font-semibold text-foreground">
                  18/18
                </strong>{" "}
                províncias
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* === Form panel (right) === */}
      <section className="relative flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center lg:hidden">
            <Logo href="/" size="md" />
          </div>

          <div>
            {eyebrow && (
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                {eyebrow}
              </div>
            )}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>

          <div className="mt-6 flex justify-center">
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
