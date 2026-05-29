import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  FileText,
  Stethoscope,
  CreditCard,
  Smartphone,
  Building2,
  CalendarCheck,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import Logo from "./_brand/Logo";
import ActivityFeed from "./_landing/ActivityFeed";
import DoctorSearch from "./_landing/DoctorSearch";
import FeatureCard from "./_landing/FeatureCard";
import StepCard from "./_landing/StepCard";
import MobileNav from "./_landing/MobileNav";
import ContactForm from "./_public/ContactForm";
import AnimatedNumber from "./_ui/AnimatedNumber";
import PhoneMockup from "./_ui/PhoneMockup";
import { Reveal, Stagger, StaggerItem } from "./_motion/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// =============================================================================
// Lunga landing — photo-forward, simple words, dense visuals.
// =============================================================================

const STEPS = [
  {
    iconName: "search",
    n: "1",
    title: "Procure o médico",
    desc: "Veja médicos por especialidade ou nome — em toda a Angola.",
    chip: { icon: Stethoscope, label: "500+ médicos em rede" },
  },
  {
    iconName: "calendar-check",
    n: "2",
    title: "Marque o horário",
    desc: "Escolha o dia e a hora. Pague com Multicaixa Express.",
    chip: { icon: CreditCard, label: "Multicaixa Express" },
  },
  {
    iconName: "video",
    n: "3",
    title: "Seja atendido",
    desc: "Vai à clínica ou fala por vídeo. Recebe a receita no telemóvel.",
    chip: { icon: FileText, label: "Receita no telemóvel" },
  },
];

const FEATURES = [
  {
    iconName: "search",
    gradient: "from-sky-500 to-blue-600",
    title: "Encontre o seu médico",
    desc: "Procure por especialidade, clínica, província ou nome. Marque em segundos.",
    chip: "Por especialidade ou nome",
  },
  {
    iconName: "video",
    gradient: "from-emerald-500 to-teal-600",
    title: "Consulta por vídeo",
    desc: "Sem deslocações. Fale com um médico licenciado em minutos.",
    chip: "Pronta em ≈ 3 min",
  },
  {
    iconName: "file-text",
    gradient: "from-rose-500 to-pink-600",
    title: "Receita no telemóvel",
    desc: "Com código QR, válida nas farmácias. Sempre consigo.",
    chip: "QR para a farmácia",
  },
  {
    iconName: "layers",
    gradient: "from-amber-500 to-orange-600",
    title: "Tudo num só sítio",
    desc: "Consultas, receitas, exames e faturas — sempre acessíveis.",
    chip: "Histórico clínico",
  },
  {
    iconName: "credit-card",
    gradient: "from-violet-500 to-purple-600",
    title: "Multicaixa Express",
    desc: "Pague no telemóvel. Recebe o comprovativo automaticamente.",
    chip: "Pagamento instantâneo",
  },
  {
    iconName: "stethoscope",
    gradient: "from-indigo-500 to-sky-600",
    title: "Sistema para clínicas",
    desc: "Equipa, agenda, faturação e farmácia — substitua o papel.",
    chip: "Equipa + agenda + farmácia",
  },
];

const FAQ = [
  {
    q: "Preciso de instalar alguma aplicação?",
    a: "Não. Funciona no telemóvel, tablet ou computador — só precisa do navegador. Funciona em redes 3G.",
  },
  {
    q: "As receitas são reconhecidas nas farmácias?",
    a: "Sim. Cada receita tem um código QR único, verificável no acto pelas farmácias parceiras.",
  },
  {
    q: "Como pago a consulta?",
    a: "Por Multicaixa Express, no telemóvel. Recebe o comprovativo automaticamente em PDF.",
  },
  {
    q: "Os meus dados estão seguros?",
    a: "Sim. Cada utilizador acede apenas aos seus dados. Conformidade RGPD desde o primeiro dia.",
  },
  {
    q: "A minha clínica pode aderir?",
    a: "Sim. As subscrições começam em 100.000 Kz/mês com contrato anual e setup personalizado. Contacte suporte@lunga.ao.",
  },
];

const PLANS = [
  {
    name: "Básico",
    price: "100.000",
    desc: "Clínicas pequenas a começar a digitalização.",
    features: [
      "Até 3 médicos",
      "Marcações online",
      "Receitas digitais com QR",
      "Suporte por email",
    ],
    highlighted: false,
  },
  {
    name: "Padrão",
    price: "250.000",
    desc: "Clínicas estabelecidas que querem escalar.",
    features: [
      "Até 10 médicos",
      "Consultas por vídeo ilimitadas",
      "Faturação Multicaixa Express",
      "Gestão de farmácia interna",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "500.000",
    desc: "Grupos hospitalares e redes de clínicas.",
    features: [
      "Médicos ilimitados",
      "Multi-clínica",
      "API e integrações",
      "Relatórios avançados",
      "Gestor de conta dedicado",
    ],
    highlighted: false,
  },
];

// Explicit transition-property lists (Emil: never `transition-all`); press
// feedback (active:scale) makes every CTA feel tappable on mobile + desktop.
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[background-color,transform,box-shadow] duration-150 ease-out hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-[background-color,color,transform,border-color] duration-150 ease-out hover:bg-accent hover:text-accent-foreground hover:border-foreground/20 active:scale-[0.97]";

const btnOnDark =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-[background-color,transform,border-color] duration-150 ease-out hover:bg-white/20 hover:border-white/50 active:scale-[0.97]";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      {/* ============ Top nav ============ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="#como">Como funciona</NavLink>
            <NavLink href="#procurar">Procurar médico</NavLink>
            <NavLink href="#precos">Preços</NavLink>
            <NavLink href="/sobre">Sobre nós</NavLink>
            <NavLink href="#faq">Perguntas</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              Entrar
            </Link>
            <Link href="/registar" className={`${btnPrimary} hidden sm:inline-flex`}>
              Criar conta
              <ArrowRight className="size-4" />
            </Link>
            {/* Mobile: 3-dot menu, shown < md. Sheet contains all nav + auth. */}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ============ Intro hero — what is Lunga (NEW, top) ============ */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-emerald-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 size-[520px] rounded-full bg-gradient-to-br from-sky-300/30 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-32 size-[520px] rounded-full bg-gradient-to-br from-emerald-300/30 to-transparent blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left: brand intro */}
            <Stagger>
              <StaggerItem className="flex justify-center lg:justify-start">
                <Image
                  src="/brand/logo-full.svg"
                  alt="lunga"
                  width={420}
                  height={210}
                  priority
                  className="h-16 w-auto sm:h-20"
                />
              </StaggerItem>
              <StaggerItem>
                <div className="mt-7 flex justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                    <Sparkles className="size-3.5 text-primary" />
                    Saúde no telemóvel · Angola
                  </span>
                </div>
              </StaggerItem>
              <StaggerItem>
                <h1 className="mt-5 text-center text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-left lg:text-6xl">
                  Marque consultas
                  <br />
                  com médicos.
                  <br />
                  <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
                    Pelo telemóvel.
                  </span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 lg:text-left">
                  A Lunga liga-o aos médicos e às clínicas de Angola.
                  Sem filas. Sem chamadas. Em qualquer telemóvel.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link href="/registar" className={btnPrimary}>
                    Criar conta grátis
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link href="#como" className={btnOutline}>
                    Ver como funciona
                  </Link>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground lg:justify-start">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-600" />
                    Grátis para pacientes
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-600" />
                    21 províncias
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-600" />
                    Receita digital
                  </span>
                </div>
              </StaggerItem>
            </Stagger>

            {/* Right: phone mockup — what the app actually looks like */}
            <Reveal className="hidden lg:flex lg:justify-center">
              <PhoneMockup />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ Como funciona — 3-step process flow ============ */}
      <section
        id="como"
        className="relative overflow-hidden border-b border-border bg-muted/30"
      >
        {/* Decorative background — subtle brand-tinted ambience */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/50 via-transparent to-emerald-50/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/2 size-[480px] -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-200/20 to-emerald-200/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/3 size-[400px] rounded-full bg-gradient-to-br from-emerald-200/15 to-transparent blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Como funciona</SectionEyebrow>
            <SectionTitle>Três passos. É tudo.</SectionTitle>
            <SectionLede>
              Sem filas. Sem chamadas. Sem ir a lado nenhum.
            </SectionLede>
          </Reveal>

          {/* Process flow with connecting line */}
          <div className="relative mt-20">
            {/* Horizontal connector line — passes behind the icon badges (md+ only) */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[78px] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block"
            />

            <Stagger className="grid gap-14 md:grid-cols-3 md:gap-8">
              {STEPS.map((s) => {
                const ChipIcon = s.chip.icon;
                return (
                  <StaggerItem key={s.n}>
                    <StepCard
                      n={s.n}
                      iconName={s.iconName}
                      title={s.title}
                      desc={s.desc}
                      chipIcon={<ChipIcon className="size-3.5 text-primary" />}
                      chipLabel={s.chip.label}
                    />
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ============ Photo band — Serra da Leba (image-only divider) ============ */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-80">
        <Image
          src="/landing/serra-leba.jpg"
          alt="Serra da Leba, Angola"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/30"
        />
      </div>

      {/* ============ Procurar médico (live search) ============ */}
      <section id="procurar" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Médicos e clínicas</SectionEyebrow>
            <SectionTitle>Encontre o seu médico em segundos.</SectionTitle>
            <SectionLede>
              Procure por especialidade, clínica ou província. Marque online.
            </SectionLede>
          </Reveal>

          <Reveal className="mx-auto mt-12 max-w-3xl">
            {/* Live-activity badge above the widget — pulsing green dot
                + animated counter + three concrete mini-stats. */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-2xl border border-border bg-card px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="relative inline-flex size-2.5 items-center justify-center"
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50" />
                  <span className="relative size-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  <AnimatedNumber value={500} />+ médicos disponíveis em Angola
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />≈ 3 min para marcar
                </span>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />
                  21 províncias
                </span>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <span className="font-semibold text-foreground">24/7</span>
              </div>
            </div>

            <DoctorSearch />

            {/* Social-proof activity feed — cycles a fresh booking every
                ~4s. Pauses when the tab is hidden. */}
            <ActivityFeed />
          </Reveal>
        </div>
      </section>

      {/* ============ Stats band (animated, on photo) ============ */}
      <section className="relative overflow-hidden border-b border-border">
        <Image
          src="/landing/kalandula.jpg"
          alt="Quedas de Kalandula, Angola"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-black/70" />
        <Reveal className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-2 gap-8 text-center text-white sm:grid-cols-4">
            <StatBlock value={21} label="Províncias" suffix="/ 21" />
            <StatBlock value={500} label="Clínicas privadas" suffix="+" />
            <StatBlock value={3} label="Min. até atendimento" prefix="≈" />
            <StatBlock value={5} label="Perfis num só sistema" />
          </div>
        </Reveal>
      </section>

      {/* ============ Por dentro (product preview) ============ */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionEyebrow>Por dentro</SectionEyebrow>
              <SectionTitle>O seu painel de saúde, sempre consigo.</SectionTitle>
              <ul className="mt-6 space-y-3">
                {[
                  "Veja as suas próximas consultas",
                  "Descarregue receitas com QR para a farmácia",
                  "Pague faturas no telemóvel com Multicaixa Express",
                  "Aceda ao seu histórico clínico em qualquer lado",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" />
                    </span>
                    <span className="text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/registar" className={btnPrimary}>
                  Começar agora
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <DashboardMockup />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ Features grid ============ */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Decorative section background — same vocabulary as Como funciona */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/40 via-transparent to-emerald-50/40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/4 size-[460px] rounded-full bg-gradient-to-br from-sky-200/15 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-1/4 size-[420px] rounded-full bg-gradient-to-br from-emerald-200/15 to-violet-200/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>O que recebe</SectionEyebrow>
            <SectionTitle>Tudo o que precisa.</SectionTitle>
            <SectionLede>
              Pensado para a realidade angolana — funciona em qualquer
              telemóvel, em qualquer rede.
            </SectionLede>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title} className="h-full">
                <FeatureCard
                  iconName={f.iconName}
                  gradient={f.gradient}
                  title={f.title}
                  desc={f.desc}
                  chip={f.chip}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ For clinics ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-sm">
                <Image
                  src="/landing/medico.jpg"
                  alt="Médico com estetoscópio"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                    <Building2 className="size-3.5 text-primary" />
                    Para clínicas privadas em Angola
                  </span>
                </div>
              </div>
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <SectionEyebrow>Para clínicas</SectionEyebrow>
              <SectionTitle>Sem papel. Sem livros de marcações.</SectionTitle>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Um único sistema para a sua clínica — médicos, recepção,
                enfermagem e administração — com agenda, faturação Multicaixa
                Express e farmácia.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  "Marcações online",
                  "Receitas digitais",
                  "Faturação automática",
                  "Gestão de equipa",
                  "Farmácia interna",
                  "Painel de gestão",
                ].map((b) => (
                  <li
                    key={b}
                    className="inline-flex items-center gap-2 text-sm text-foreground"
                  >
                    <Check className="size-4 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/parceria" className={btnPrimary}>
                  Falar com a equipa
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="#precos" className={btnOutline}>
                  Ver preços
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ Pricing ============ */}
      <section id="precos" className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Preços para clínicas</SectionEyebrow>
            <SectionTitle>A partir de 100.000 Kz / mês.</SectionTitle>
            <SectionLede>
              Contrato anual com setup personalizado.{" "}
              <strong className="font-semibold text-foreground">
                Pacientes usam grátis.
              </strong>
            </SectionLede>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <StaggerItem
                key={p.name}
                className={
                  "relative rounded-2xl border bg-card p-8 shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md " +
                  (p.highlighted
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-border")
                }
              >
                {p.highlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                    <Sparkles className="size-3" />
                    Mais popular
                  </span>
                )}
                <div className="text-xs font-medium uppercase tracking-wider text-primary">
                  {p.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {p.price}
                  </span>
                  <span className="text-sm font-medium text-foreground">Kz</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-sm text-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/parceria"
                  className={"mt-7 w-full " + (p.highlighted ? btnPrimary : btnOutline)}
                >
                  Falar com a equipa
                  <ArrowRight className="size-4" />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-10 text-center">
            <Link
              href="/precos"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Ver comparação completa e perguntas frequentes
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <Reveal className="text-center">
            <SectionEyebrow>Perguntas frequentes</SectionEyebrow>
            <SectionTitle>O que precisa de saber.</SectionTitle>
          </Reveal>

          <Accordion className="mt-12 space-y-3">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-5 shadow-sm"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ Final CTA (photo + scrim) ============ */}
      <section className="relative overflow-hidden">
        <Image
          src="/landing/aldeia.jpg"
          alt="Comunidade angolana"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-primary/55 to-black/80" />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <Smartphone className="mx-auto size-10 text-white/70" />
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            A sua saúde, no seu telemóvel.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/85">
            Grátis para pacientes. Crie a sua conta em menos de um minuto.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/registar" className={btnPrimary}>
              Criar conta grátis
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/entrar" className={btnOnDark}>
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Fala connosco — contact form ============ */}
      <section
        id="contacto"
        className="relative overflow-hidden border-t border-border bg-background"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-emerald-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 size-[480px] rounded-full bg-gradient-to-br from-sky-300/25 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 size-[480px] rounded-full bg-gradient-to-br from-emerald-300/25 to-transparent blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl px-6 py-20 sm:py-24">
          <Reveal className="flex flex-col items-center text-center">
            <div className="rounded-2xl bg-white/95 px-6 py-4 shadow-xl shadow-black/10 ring-1 ring-white/40 backdrop-blur">
              <Image
                src="/brand/logo-full.svg"
                alt="lunga"
                width={220}
                height={110}
                className="h-12 w-auto sm:h-14"
              />
            </div>
            <div className="mt-6 text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              Fala connosco
            </div>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              Tem uma pergunta?{" "}
              <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
                Diga-nos.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Escreva-nos e respondemos ao seu email. Não inclua informação
              médica sensível aqui — para isso, use o painel da sua conta.
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <ContactForm
              source="sobre"
              title="Mensagem para a Lunga"
              description="Preencha o formulário e respondemos nos próximos dias úteis."
            />
          </Reveal>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="bg-background">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size="md" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Saúde digital para Angola — marque consultas, fale com médicos e
              receba receitas no telemóvel.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Image
                src="/brand/angola-flag.png"
                alt="Bandeira de Angola"
                width={21}
                height={14}
                className="rounded-[2px] ring-1 ring-border"
              />
              <span>Feito em Angola</span>
            </div>
          </div>
          <FooterCol
            title="Produto"
            links={[
              { href: "#como", label: "Como funciona" },
              { href: "#procurar", label: "Procurar médico" },
              { href: "/precos", label: "Preços" },
              { href: "/registar", label: "Criar conta" },
            ]}
          />
          <FooterCol
            title="Empresa"
            links={[
              { href: "/sobre", label: "Sobre nós" },
              { href: "#contacto", label: "Contacto" },
              { href: "/sobre", label: "Imprensa" },
              { href: "/sobre", label: "Carreiras" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { href: "/termos", label: "Termos de Serviço" },
              { href: "/privacidade", label: "Política de Privacidade" },
              { href: "/privacidade", label: "RGPD" },
              { href: "/privacidade", label: "Cookies" },
            ]}
          />
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} Lunga. Todos os direitos
              reservados.
            </span>
            <span className="inline-flex items-center gap-1.5">
              Luanda · Angola
              <Image
                src="/brand/angola-flag.png"
                alt="Bandeira de Angola"
                width={18}
                height={12}
                className="rounded-[2px] ring-1 ring-border"
              />
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ============ Helpers ============

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
      {children}
    </h2>
  );
}

function SectionLede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function StatBlock({
  value,
  label,
  prefix,
  suffix,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        {prefix}
        <AnimatedNumber value={value} />
        {suffix}
      </div>
      <div className="mt-1.5 text-xs font-medium uppercase tracking-wider text-white/80">
        {label}
      </div>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-foreground">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// A polished CSS mockup of the patient painel — simple, on-brand, no real
// screenshot needed and looks like our actual product.
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Soft glow */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-amber-400/10 blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="ml-2 truncate text-[10px] text-muted-foreground">
            lunga.ao/painel
          </span>
        </div>

        <div className="p-5">
          {/* Mini header — mirrors the real /painel layout */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-primary">
                Bom dia, Maria
              </div>
              <div className="mt-0.5 text-base font-semibold text-foreground">
                O seu painel de saúde
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground">
              <CalendarCheck className="size-3.5" />
              Marcar
            </span>
          </div>

          {/* Mini Passaporte de Saúde — centerpiece of the real /painel
              (HealthPassport component). Tiny version of the booklet cover. */}
          <div className="relative mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-950 p-3.5 text-white shadow-lg">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/10 blur-2xl"
            />
            <div className="pointer-events-none absolute inset-2 rounded-lg border border-amber-200/20" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-amber-100/85">
                  República de Angola
                </div>
                <div className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100/95">
                  Passaporte de Saúde
                </div>
                <div className="mt-2.5 font-mono text-sm font-bold uppercase tracking-wide">
                  Maria F.
                </div>
                <div className="mt-0.5 text-[9px] text-white/55">
                  Tipo sang. <strong className="text-white">O+</strong> · 21 anos
                </div>
              </div>
              <div className="shrink-0 rounded-md bg-white/95 px-2 py-1 font-mono text-[8px] font-black uppercase tracking-wider text-slate-900">
                lunga
              </div>
            </div>
          </div>

          {/* Next appointment — same layout as the spotlight on real /painel */}
          <div className="mt-3 rounded-xl border border-border bg-background p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium uppercase tracking-wider text-primary">
                Próxima consulta
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                Confirmada
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                MS
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">
                  Dr. Manuel Silva
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="size-3" />
                  Clínica Demo · Luanda
                </div>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-muted-foreground tabular-nums">
                Hoje · 14:30
              </span>
            </div>
          </div>

          {/* Stat cards row — mirrors GradientStatCard used on real /painel */}
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <MiniStat
              gradient="from-sky-500 to-blue-600"
              label="Próximas"
              value="2"
            />
            <MiniStat
              gradient="from-rose-500 to-pink-600"
              label="Receitas"
              value="3"
            />
            <MiniStat
              gradient="from-emerald-500 to-teal-600"
              label="Exames"
              value="2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  gradient,
  label,
  value,
}: {
  gradient: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${gradient} p-2.5 text-white shadow-sm`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-4 size-10 rounded-full bg-white/20 blur-xl"
      />
      <div className="relative text-[8px] font-semibold uppercase tracking-wider text-white/85">
        {label}
      </div>
      <div className="relative mt-1 text-lg font-bold tabular-nums">
        {value}
      </div>
    </div>
  );
}
