import Link from "next/link";
import {
  ArrowRight,
  Search,
  Video,
  FileText,
  Stethoscope,
  Users,
  CreditCard,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";
import PublicShell from "../_public/PublicShell";

export const metadata = {
  title: "Sobre nós",
  description:
    "ANGOLASAUDE — a plataforma que liga pacientes, médicos e clínicas privadas em Angola. Conheça a missão, os produtos e como funciona.",
};

const PATIENT = [
  {
    icon: Search,
    title: "Marketplace de médicos",
    desc: "Procure por especialidade, clínica ou nome e marque online, em qualquer província.",
  },
  {
    icon: Video,
    title: "Telemedicina",
    desc: "Triagem assistida e consulta por vídeo com médicos licenciados — sem deslocações.",
  },
  {
    icon: FileText,
    title: "Passaporte de saúde",
    desc: "Receitas com QR, exames, faturas e histórico clínico sempre consigo.",
  },
];

const CLINIC = [
  {
    icon: Users,
    title: "Gestão de equipa e agenda",
    desc: "Médicos, recepção e enfermagem a trabalhar no mesmo sistema, sem papel.",
  },
  {
    icon: CreditCard,
    title: "Faturação integrada",
    desc: "Multicaixa Express nativo, com comprovativo automático em PDF.",
  },
  {
    icon: Stethoscope,
    title: "Fluxo clínico completo",
    desc: "Triagem de enfermagem, consulta, receita digital e farmácia interna.",
  },
];

const VALUES = [
  {
    icon: HeartPulse,
    title: "Acesso para todos",
    desc: "Saúde de qualidade não devia depender de onde se vive. Funciona em 3G, em qualquer telemóvel.",
  },
  {
    icon: ShieldCheck,
    title: "Privacidade a sério",
    desc: "Cada utilizador acede apenas aos seus dados. Conformidade RGPD desde o primeiro dia.",
  },
];

export default function SobrePage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <div className="text-xs font-medium uppercase tracking-wider text-primary">
            Sobre nós
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Saúde digital, feita{" "}
            <span className="text-primary">para Angola</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            A ANGOLASAUDE nasceu de uma ideia simples: marcar uma consulta, falar
            com um médico e ter as suas receitas não devia exigir filas,
            telefonemas ou deslocações de uma província para outra. Juntamos
            pacientes, médicos e clínicas privadas num só sítio.
          </p>
        </div>
      </section>

      {/* Mission / problem */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              O problema que resolvemos
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Angola tem centenas de clínicas privadas, a maioria ainda a gerir
              marcações em livros de papel. Para o paciente, isso significa
              telefonemas que não atendem, deslocações para confirmar uma hora e
              um historial clínico espalhado por vários sítios — ou perdido.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Não existe um sítio único onde encontrar o médico certo, marcar e
              ser atendido. Foi isso que decidimos construir.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              A nossa missão
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Tornar o acesso a cuidados de saúde de qualidade simples e
              disponível para qualquer angolano — onde quer que esteja, no
              telemóvel que já tem. E dar às clínicas as ferramentas digitais
              para crescerem e cuidarem melhor dos seus pacientes.
            </p>
          </div>
        </div>
      </section>

      {/* Two products */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              Uma plataforma, dois lados
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Para pacientes e para clínicas.
            </h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Para pacientes
              </h3>
              <ul className="mt-5 space-y-5">
                {PATIENT.map((f) => (
                  <Feature key={f.title} {...f} />
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Para clínicas
              </h3>
              <ul className="mt-5 space-y-5">
                {CLINIC.map((f) => (
                  <Feature key={f.title} {...f} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-border bg-card p-7"
              >
                <span className="grid size-10 place-items-center rounded-lg border border-border text-primary">
                  <v.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-2xl border border-border bg-muted/40 px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Junte-se à ANGOLASAUDE
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Grátis para pacientes. As clínicas falam connosco para um setup
              personalizado.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/registar"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Criar conta grátis
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="mailto:suporte@saudeangola.ao?subject=Quero%20saber%20mais%20(cl%C3%ADnica)"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Sou uma clínica
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}
