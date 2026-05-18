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
      {/* === Brand panel (left) — photo-forward, hidden on mobile === */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col">
        <Image
          src="/sobre/angola-2.jpg"
          alt="Angola"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-primary/40" />
        <div className="relative flex flex-1 flex-col justify-between px-12 py-14">
          <Logo href="/" size="lg" variant="dark" subtitle="Saúde para todos" />

          <div className="max-w-md">
            <div className="text-xs font-medium uppercase tracking-wider text-white/80">
              Plataforma de saúde · Angola
            </div>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Toda a sua saúde,{" "}
              <span className="text-white/70">num só sítio</span>.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Marque com qualquer médico, consulte por vídeo e guarde o seu
              histórico clínico — de Luanda ao Cunene.
            </p>

            <ul className="mt-8 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur">
                    <f.icon className="size-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {f.title}
                    </div>
                    <div className="text-xs text-white/70">{f.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-6">
            <div className="flex items-center gap-2 text-xs text-white/75">
              <Image
                src="/brand/angola-flag.png"
                alt="Bandeira de Angola"
                width={21}
                height={14}
                className="rounded-[2px] ring-1 ring-white/20"
              />
              <span>Feito em Angola</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/75">
              <span>
                <strong className="font-semibold text-white">≈ 3 min</strong>{" "}
                até atendimento
              </span>
              <span>
                <strong className="font-semibold text-white">21/21</strong>{" "}
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
