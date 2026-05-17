import Link from "next/link";
import Image from "next/image";
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
  Building2,
  MapPin,
  Quote,
} from "lucide-react";
import PublicShell from "../_public/PublicShell";
import ImageSlot from "./ImageSlot";

export const metadata = {
  title: "Sobre nós",
  description:
    "ANGOLASAUDE — a plataforma que liga pacientes, médicos e clínicas privadas em Angola. Conheça a missão, os produtos e como funciona.",
};

const IMPACT = [
  { value: "500+", label: "Clínicas privadas em Angola" },
  { value: "18 / 18", label: "Províncias com cobertura" },
  { value: "≈ 3 min", label: "Até falar com um médico" },
  { value: "5", label: "Perfis: paciente, médico, enfermagem, recepção, admin" },
];

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
    desc: "Médicos, recepção e enfermagem no mesmo sistema, sem papel.",
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
  {
    icon: Building2,
    title: "Feito em Angola",
    desc: "Pensado para a realidade angolana — do Multicaixa Express às 18 províncias.",
  },
];

export default function SobrePage() {
  return (
    <PublicShell>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              Sobre nós
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              Saúde digital, feita{" "}
              <span className="text-primary">para Angola</span>.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Marcar uma consulta, falar com um médico e ter as suas receitas
              não devia exigir filas nem deslocações entre províncias. Juntámos
              pacientes, médicos e clínicas privadas num só sítio.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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

          <ImageSlot
            src="sobre/equipa.jpg"
            alt="A equipa de saúde ANGOLASAUDE"
            caption="Cuidar de quem cuida — em qualquer ponto de Angola."
            icon={<HeartPulse className="size-5" />}
            className="aspect-[4/3] w-full shadow-sm"
          />
        </div>
      </section>

      {/* ===== Impact band ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-12 lg:grid-cols-4">
          {IMPACT.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-semibold tracking-tight text-foreground">
                {s.value}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Problem / Mission ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                O problema que resolvemos
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Angola tem centenas de clínicas privadas, a maioria ainda a
                gerir marcações em livros de papel. Para o paciente: telefonemas
                que não atendem, deslocações para confirmar uma hora, e um
                historial clínico espalhado — ou perdido.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Não existia um sítio único para encontrar o médico certo,
                marcar e ser atendido. Foi isso que construímos.
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

          <ImageSlot
            src="sobre/clinica.jpg"
            alt="Uma clínica parceira da ANGOLASAUDE"
            caption="Clínicas parceiras, do papel ao digital."
            icon={<Building2 className="size-5" />}
            className="mt-12 aspect-[16/7] w-full shadow-sm"
          />
        </div>
      </section>

      {/* ===== Values ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              O que nos move
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Os nossos valores
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
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

      {/* ===== Quote ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Quote className="mx-auto size-8 text-primary" />
          <blockquote className="mt-6 text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl">
            “Vivo no Huambo. Antes ia a Luanda para uma consulta de seguimento.
            Agora falo com o meu médico por vídeo e recebo a receita no
            telemóvel.”
          </blockquote>
          <div className="mt-6 text-sm text-muted-foreground">
            Joaquim Mateus · Paciente, Huambo
          </div>
        </div>
      </section>

      {/* ===== Two products ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              Uma plataforma, dois lados
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Para pacientes e para clínicas
            </h2>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-7">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Para pacientes
              </h3>
              <ul className="mt-5 space-y-5">
                {PATIENT.map((f) => (
                  <Feature key={f.title} {...f} />
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-7">
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

      {/* ===== Angola band ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <ImageSlot
              src="sobre/angola.jpg"
              alt="Paisagem de Angola"
              caption="De Luanda ao Cunene — saúde sem fronteiras internas."
              icon={<MapPin className="size-5" />}
              className="aspect-[4/3] w-full shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src="/brand/angola-flag.png"
                  alt="Bandeira de Angola"
                  width={28}
                  height={19}
                  className="rounded-[3px] ring-1 ring-border"
                />
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  Em todo o país
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                Construído para a realidade angolana
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Funciona em redes 3G, em telemóveis comuns, com pagamentos por
                Multicaixa Express e receitas válidas em farmácias parceiras.
                Tecnologia que se adapta a Angola — não o contrário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card px-6 py-14 text-center">
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
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}
