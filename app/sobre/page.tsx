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
  Smartphone,
  Users,
  HandHeart,
  Award,
} from "lucide-react";
import PublicShell from "../_public/PublicShell";
import ImageSlot from "./ImageSlot";
import Timeline, { type Milestone } from "./Timeline";

export const metadata = {
  title: "Sobre nós",
  description:
    "Lunga — a plataforma que liga pacientes, médicos e clínicas privadas em Angola. Missão, visão, valores e o nosso percurso.",
};

const IMPACT = [
  { value: "500+", label: "Clínicas privadas em Angola" },
  { value: "21 / 21", label: "Províncias onde chegamos" },
  { value: "≈ 3 min", label: "Até falar com um médico" },
  { value: "5", label: "Perfis: paciente, médico, enfermagem, recepção, admin" },
];

const VALUES = [
  {
    icon: HeartPulse,
    title: "Para todos",
    desc: "Cuidar da saúde não devia depender de onde se vive. A Lunga funciona em 3G e em qualquer telemóvel.",
  },
  {
    icon: ShieldCheck,
    title: "Os seus dados são seus",
    desc: "Só você acede ao seu histórico. Protegidos pela lei desde o primeiro dia.",
  },
  {
    icon: Building2,
    title: "Feito em Angola",
    desc: "Pensado para Angola — Multicaixa Express, 21 províncias, redes lentas.",
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
    title: "Construímos a Lunga",
    desc: "Rede de médicos, telemedicina por vídeo, receitas digitais com QR, faturação Multicaixa e um sistema de gestão clínica completo — cinco perfis num só produto.",
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
    desc: "Levar a plataforma às 21 províncias, alargar a rede de clínicas e de farmácias parceiras, e continuar a simplificar o acesso à saúde.",
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
              A Lunga liga pacientes, médicos e clínicas privadas num só
              sítio — da marcação de consultas à telemedicina e à gestão
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
              <Link
                href="/parceria"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Sou uma clínica
              </Link>
            </div>
          </div>
        }
      />

      {/* ===== Quem somos (intro narrativo) ===== */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Section background — soft brand wash + corner orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/70 via-background to-emerald-50/70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-0 size-[480px] rounded-full bg-gradient-to-br from-sky-300/15 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 bottom-0 size-[480px] rounded-full bg-gradient-to-br from-emerald-300/15 to-transparent blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Brand showcase card (substitui a foto do médico) */}
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-white to-emerald-100 shadow-xl ring-1 ring-border">
                {/* Inner glow orbs */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-16 -top-16 size-72 rounded-full bg-gradient-to-br from-sky-400/30 to-transparent blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-16 -right-16 size-72 rounded-full bg-gradient-to-br from-emerald-400/30 to-transparent blur-3xl"
                />
                {/* Dot pattern texture */}
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-0 size-full text-foreground opacity-[0.06]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="sobre-card-dots"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="1" cy="1" r="1" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#sobre-card-dots)" />
                </svg>

                {/* Centered logo + brand atmosphere */}
                <div className="relative flex h-full flex-col items-center justify-center px-8 py-12">
                  <Image
                    src="/brand/logo-full.png"
                    alt="Lunga"
                    width={300}
                    height={300}
                    priority
                    className="h-28 w-auto sm:h-32"
                  />
                  <div className="mt-6 text-[10px] font-bold uppercase tracking-[0.32em] text-muted-foreground">
                    Saúde · Angola
                  </div>

                  {/* Subtle divider */}
                  <div className="mt-8 h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Bandeira angolana — pequeno toque de identidade */}
                  <div className="mt-8 flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                    <Image
                      src="/brand/angola-flag.png"
                      alt=""
                      width={26}
                      height={17}
                      className="rounded-[2px] shadow-sm ring-1 ring-border"
                    />
                    <span>República de Angola</span>
                  </div>
                </div>
              </div>

              {/* 21/21 floating card (mantido) */}
              <div className="pointer-events-none absolute -bottom-6 -right-6 hidden rounded-2xl border border-border bg-card p-5 shadow-xl ring-1 ring-black/5 sm:block">
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  21<span className="text-muted-foreground/50"> / 21</span>
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Províncias de Angola
                </div>
              </div>
            </div>

            {/* Narrativa */}
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Quem somos
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]">
                A Lunga nasceu de um problema simples:{" "}
                <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  a saúde devia ser fácil.
                </span>
              </h2>
              <div className="mt-7 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  Em Angola, há centenas de clínicas privadas a gerir marcações
                  em papel — e milhões de pacientes sem um sítio único para
                  encontrar o médico certo e ser atendidos.
                </p>
                <p>
                  Construímos a Lunga para mudar isto: uma só plataforma onde o
                  paciente marca, paga e fala com o médico; e onde a clínica
                  deixa o papel para trás — da recepção à farmácia.
                </p>
                <p className="text-foreground">
                  <strong className="font-semibold">
                    Feito em Angola, para Angola.
                  </strong>{" "}
                  Funciona em 3G, em qualquer telemóvel, com Multicaixa Express.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Missão & Visão (editorial — sem cards) ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            {/* Missão */}
            <div>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/30">
                  <Target className="size-5" />
                </span>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-400">
                  Missão
                </div>
              </div>
              <h2 className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
                Tornar a saúde mais fácil para qualquer angolano.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                No telemóvel que já tem, onde quer que esteja. E dar às
                clínicas ferramentas simples para cuidarem melhor.
              </p>
            </div>

            {/* Visão */}
            <div className="md:border-l md:border-border md:pl-16">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
                  <Compass className="size-5" />
                </span>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
                  Visão
                </div>
              </div>
              <h2 className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
                Onde toda a gente em Angola encontra médico.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Marca consulta, é atendida — e cada clínica trabalha sem
                papel, das marcações à farmácia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Valores (numerados, editorial) ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background via-background to-emerald-50/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/3 size-[420px] rounded-full bg-gradient-to-br from-emerald-300/15 to-sky-300/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              O que nos move
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Os nossos valores
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Três princípios que orientam tudo o que fazemos.
            </p>
          </div>

          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {VALUES.map((v, i) => (
              <div key={v.title} className="relative">
                {/* Número grande de fundo */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-4 left-0 select-none text-[5.5rem] font-bold leading-none tracking-tight text-primary/10"
                >
                  0{i + 1}
                </div>
                <div className="relative pt-8">
                  <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-sky-500/15 to-emerald-500/15 text-primary ring-1 ring-primary/20">
                    <v.icon className="size-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== O nosso compromisso ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/60 via-background to-emerald-50/60 dark:from-sky-500/5 dark:to-emerald-500/5"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/2 size-96 -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-300/20 to-emerald-300/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              O que prometemos
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              O que pode esperar de nós.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Quatro promessas simples.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <CommitCard
              gradient="from-sky-500 to-blue-600"
              icon={<Smartphone className="size-5" />}
              title="Funciona em qualquer telemóvel"
              desc="Android, iPhone, redes 3G. Mesmo na província."
            />
            <CommitCard
              gradient="from-emerald-500 to-teal-600"
              icon={<ShieldCheck className="size-5" />}
              title="Os seus dados são seus"
              desc="Só você acede. Protegidos pela lei desde o primeiro dia."
            />
            <CommitCard
              gradient="from-rose-500 to-pink-600"
              icon={<HandHeart className="size-5" />}
              title="Grátis para pacientes"
              desc="Marcar, falar com médico e ver receitas — sem pagar nada."
            />
            <CommitCard
              gradient="from-amber-500 to-orange-600"
              icon={<Users className="size-5" />}
              title="Feito com quem cuida"
              desc="Construído com médicos, enfermeiros e clínicas angolanas. Não foi copiado de fora."
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
            <Award className="size-4 text-primary" />
            <span>
              <strong className="font-semibold text-foreground">
                Conformidade RGPD
              </strong>{" "}
              · Encriptação ponta-a-ponta · Dados em servidores europeus
            </span>
          </div>
        </div>
      </section>

      {/* ===== A Nossa História ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-sky-50/50 via-background to-background"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 size-[420px] rounded-full bg-gradient-to-br from-sky-300/15 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
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
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background via-background to-emerald-50/40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 size-[420px] rounded-full bg-gradient-to-br from-emerald-300/15 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
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
                href="mailto:suporte@lunga.ao"
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
                    suporte@lunga.ao
                  </div>
                </div>
              </a>
              <Link
                href="/parceria"
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
              </Link>
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
              Junte-se à Lunga
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
              <Link
                href="/parceria"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Sou uma clínica
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function CommitCard({
  gradient,
  icon,
  title,
  desc,
}: {
  gradient: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-black/5`}
      >
        {icon}
      </span>
      <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}
