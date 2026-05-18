import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Target,
  Compass,
  HeartPulse,
  ShieldCheck,
  Building2,
  Lightbulb,
  Layers,
  Rocket,
  MapPinned,
  Mail,
} from "lucide-react";
import PublicShell from "../_public/PublicShell";
import ImageSlot from "./ImageSlot";
import Timeline, { type Milestone } from "./Timeline";

export const metadata = {
  title: "Sobre nós",
  description:
    "ANGOLASAUDE — a plataforma que liga pacientes, médicos e clínicas privadas em Angola. Missão, visão, valores e o nosso percurso.",
};

const IMPACT = [
  { value: "500+", label: "Clínicas privadas em Angola" },
  { value: "18 / 18", label: "Províncias no nosso alcance" },
  { value: "≈ 3 min", label: "Até falar com um médico" },
  { value: "5", label: "Perfis: paciente, médico, enfermagem, recepção, admin" },
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

const HISTORY: Milestone[] = [
  {
    marker: "A ideia",
    title: "Um problema por resolver",
    desc: "Centenas de clínicas privadas em Angola a gerir marcações em papel; pacientes sem um sítio único para encontrar o médico certo e ser atendido.",
    icon: <Lightbulb className="size-4" />,
  },
  {
    marker: "A plataforma",
    title: "Construímos a ANGOLASAUDE",
    desc: "Marketplace de médicos, telemedicina por vídeo, receitas digitais com QR, faturação Multicaixa e um sistema de gestão clínica completo — cinco perfis num só produto.",
    icon: <Layers className="size-4" />,
  },
  {
    marker: "2026",
    title: "Lançamento",
    desc: "Disponível para pacientes (grátis) e para clínicas privadas que querem digitalizar as suas operações.",
    icon: <Rocket className="size-4" />,
  },
  {
    marker: "O caminho",
    title: "Cobertura em todo o país",
    desc: "Levar a plataforma às 18 províncias, alargar a rede de clínicas e de farmácias parceiras, e continuar a simplificar o acesso à saúde.",
    icon: <MapPinned className="size-4" />,
    upcoming: true,
  },
];

export default function SobrePage() {
  return (
    <PublicShell>
      {/* ===== Hero (photo-forward) ===== */}
      <ImageSlot
        src="sobre/angola-hero"
        alt="Angola"
        caption=""
        className="min-h-[460px] w-full border-0 sm:min-h-[560px]"
        overlay={
          <div className="mx-auto flex min-h-[460px] max-w-5xl flex-col justify-end px-6 py-16 sm:min-h-[560px] sm:py-20">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Sobre · Saúde digital em Angola
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Saúde para todos,
              <br />
              feita para Angola.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
              A ANGOLASAUDE liga pacientes, médicos e clínicas privadas num só
              sítio — do marketplace de consultas à telemedicina e à gestão
              clínica.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/registar"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Criar conta grátis
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="mailto:suporte@saudeangola.ao?subject=Quero%20saber%20mais%20(cl%C3%ADnica)"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Sou uma clínica
              </a>
            </div>
          </div>
        }
      />

      {/* ===== Missão & Visão ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-8">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Target className="size-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                Missão
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Tornar o acesso a cuidados de saúde de qualidade simples e
                disponível para qualquer angolano — onde quer que esteja, no
                telemóvel que já tem — e dar às clínicas as ferramentas
                digitais para crescerem e cuidarem melhor.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Compass className="size-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                Visão
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Ser a porta de entrada digital para a saúde em Angola — onde
                qualquer pessoa encontra, marca e é atendida, e onde cada
                clínica trabalha sem papel, das marcações à farmácia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Valores ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              O que nos move
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
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

      {/* ===== A Nossa História ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                O nosso percurso
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                A nossa história
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                De uma necessidade real em Angola a uma plataforma completa de
                saúde digital — e o caminho que ainda queremos percorrer.
              </p>
              <ImageSlot
                src="sobre/angola-2"
                alt="Angola"
                caption="Angola, de norte a sul."
                icon={<MapPinned className="size-5" />}
                className="mt-8 hidden aspect-[4/3] w-full shadow-sm lg:block"
              />
            </div>
            <Timeline items={HISTORY} />
          </div>
        </div>
      </section>

      {/* ===== Impacto ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-14 lg:grid-cols-4">
          {IMPACT.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Angola band ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <ImageSlot
              src="sobre/angola"
              alt="Paisagem de Angola"
              caption="De Luanda ao Cunene."
              icon={<MapPinned className="size-5" />}
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
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
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

      {/* ===== Contacto ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                Fale connosco
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Contacto
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                É paciente, profissional de saúde ou uma clínica que quer
                digitalizar-se? Estamos a um email de distância.
              </p>
            </div>
            <div className="space-y-3">
              <a
                href="mailto:suporte@saudeangola.ao"
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-foreground/15"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Suporte geral
                  </div>
                  <div className="text-sm text-muted-foreground">
                    suporte@saudeangola.ao
                  </div>
                </div>
              </a>
              <a
                href="mailto:suporte@saudeangola.ao?subject=Ades%C3%A3o%20de%20cl%C3%ADnica"
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-foreground/15"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Sou uma clínica
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pedir adesão e setup personalizado
                  </div>
                </div>
              </a>
              <div className="flex items-center gap-3 px-1 pt-1 text-xs text-muted-foreground">
                <Image
                  src="/brand/angola-flag.png"
                  alt="Bandeira de Angola"
                  width={18}
                  height={12}
                  className="rounded-[2px] ring-1 ring-border"
                />
                <span>Luanda · Angola</span>
              </div>
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
