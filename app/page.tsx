import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Video,
  FileText,
  Pill,
  ShieldCheck,
  Stethoscope,
  CreditCard,
  Search,
  Smartphone,
  Building2,
  CalendarCheck,
  Sparkles,
  MapPin,
} from "lucide-react";
import Logo from "./_brand/Logo";
import DoctorSearch from "./_landing/DoctorSearch";
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
    icon: Search,
    n: "1",
    title: "Procure",
    desc: "Escolha a especialidade ou o nome do médico. Veja quem está disponível em Angola.",
  },
  {
    icon: CalendarCheck,
    n: "2",
    title: "Marque",
    desc: "Escolha o horário e pague no telemóvel com Multicaixa Express.",
  },
  {
    icon: Video,
    n: "3",
    title: "Consulte",
    desc: "Vai à clínica ou fala por vídeo. Recebe a receita digital no telemóvel.",
  },
];

const FEATURES = [
  {
    icon: Search,
    title: "Encontre o seu médico",
    desc: "Procure por especialidade, clínica, província ou nome. Marque em segundos.",
  },
  {
    icon: Video,
    title: "Consulta por vídeo",
    desc: "Sem deslocações. Fale com um médico licenciado em minutos.",
  },
  {
    icon: FileText,
    title: "Receita no telemóvel",
    desc: "Com código QR, válida nas farmácias. Sempre consigo.",
  },
  {
    icon: Pill,
    title: "Tudo num só sítio",
    desc: "Consultas, receitas, exames e faturas — sempre acessíveis.",
  },
  {
    icon: CreditCard,
    title: "Multicaixa Express",
    desc: "Pague no telemóvel. Recebe o comprovativo automaticamente.",
  },
  {
    icon: Stethoscope,
    title: "Sistema para clínicas",
    desc: "Equipa, agenda, faturação e farmácia — substitua o papel.",
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
    a: "Sim. As subscrições começam em 100.000 Kz/mês com contrato anual e setup personalizado. Contacte suporte@saudeangola.ao.",
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

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

const btnOnDark =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      {/* ============ Top nav ============ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="#como">Como funciona</NavLink>
            <NavLink href="#procurar">Procurar médico</NavLink>
            <NavLink href="#precos">Preços</NavLink>
            <NavLink href="#faq">Perguntas</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Entrar
            </Link>
            <Link href="/registar" className={btnPrimary}>
              Criar conta
              <ArrowRight className="size-4" />
            </Link>
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
                  src="/brand/logo-full.png"
                  alt="lunga"
                  width={420}
                  height={214}
                  priority
                  className="h-16 w-auto sm:h-20"
                />
              </StaggerItem>
              <StaggerItem>
                <div className="mt-7 flex justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                    <Sparkles className="size-3.5 text-primary" />
                    Bem-vindo à Lunga
                  </span>
                </div>
              </StaggerItem>
              <StaggerItem>
                <h1 className="mt-5 text-center text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-left lg:text-6xl">
                  Para todos.
                  <br />
                  Em{" "}
                  <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
                    toda a Angola
                  </span>
                  .
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 lg:text-left">
                  Saúde no telemóvel — de Luanda ao Cunene, da Lunda ao
                  Namibe. Um único sítio para encontrar médico, marcar
                  consulta e ser atendido.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link href="/registar" className={btnPrimary}>
                    Criar conta grátis
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/sobre" className={btnOutline}>
                    Conhecer a Lunga
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
                    Receita válida nas farmácias
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

      {/* ============ Hero (photo-forward) — Marque consultas ============ */}
      <section className="relative overflow-hidden">
        <Image
          src="/landing/serra-leba.jpg"
          alt="Serra da Leba, Angola"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-primary/40" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <Stagger>
            <StaggerItem>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur">
                <CalendarCheck className="size-3.5 text-primary-foreground/90" />
                Comece agora
              </span>
            </StaggerItem>
            <StaggerItem>
              <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Marque consultas.
                <br />
                Fale com médicos.
                <br />
                <span className="text-white/70">Tudo no telemóvel.</span>
              </h2>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Sem filas. Sem telefonemas. Encontre o médico certo, escolha
                o horário e receba tudo no seu painel.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/registar" className={btnPrimary}>
                  Criar conta grátis
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="mailto:suporte@saudeangola.ao?subject=Quero%20saber%20mais%20(cl%C3%ADnica)"
                  className={btnOnDark}
                >
                  Sou uma clínica
                </a>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* ============ Como funciona — 3 steps ============ */}
      <section id="como" className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Como funciona</SectionEyebrow>
            <SectionTitle>Três passos. Nada mais.</SectionTitle>
            <SectionLede>
              Sem filas, sem telefonemas, sem deslocações desnecessárias.
            </SectionLede>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <StaggerItem
                key={s.n}
                className="relative rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-3xl font-extrabold tracking-tight text-primary/20">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

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
            <DoctorSearch />
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
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>O que recebe</SectionEyebrow>
            <SectionTitle>Tudo o que precisa.</SectionTitle>
            <SectionLede>
              Pensado para a realidade angolana — funciona em qualquer
              telemóvel, em qualquer rede.
            </SectionLede>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <StaggerItem
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span
                  className="grid size-11 place-items-center rounded-xl"
                  style={{
                    background: i % 2 === 0 ? "rgba(47,116,196,0.12)" : "rgba(224,138,75,0.15)",
                    color: i % 2 === 0 ? "#2F74C4" : "#E08A4B",
                  }}
                >
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
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
                <a
                  href="mailto:suporte@saudeangola.ao?subject=Ades%C3%A3o%20de%20cl%C3%ADnica"
                  className={btnPrimary}
                >
                  Falar com a equipa
                  <ArrowRight className="size-4" />
                </a>
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
                  "relative rounded-2xl border bg-card p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md " +
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
                <a
                  href={`mailto:suporte@saudeangola.ao?subject=Ades%C3%A3o%20ao%20plano%20${encodeURIComponent(p.name)}`}
                  className={"mt-7 w-full " + (p.highlighted ? btnPrimary : btnOutline)}
                >
                  Falar com a equipa
                  <ArrowRight className="size-4" />
                </a>
              </StaggerItem>
            ))}
          </Stagger>
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
              { href: "#precos", label: "Preços" },
              { href: "/registar", label: "Criar conta" },
            ]}
          />
          <FooterCol
            title="Empresa"
            links={[
              { href: "/sobre", label: "Sobre nós" },
              { href: "mailto:suporte@saudeangola.ao", label: "Contacto" },
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
            saude-angola.vercel.app/painel
          </span>
        </div>

        <div className="p-5">
          {/* Mini header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-primary">
                Bom dia, Maria
              </div>
              <div className="mt-0.5 text-base font-semibold text-foreground">
                O seu painel
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground">
              <CalendarCheck className="size-3.5" />
              Marcar
            </span>
          </div>

          {/* KPI tiles */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <MiniKpi color="primary" label="Próx." value="14:30" />
            <MiniKpi color="amber" label="Receitas" value="3" />
            <MiniKpi color="sky" label="Exames" value="2" />
          </div>

          {/* Next appointment card */}
          <div className="mt-3 rounded-xl border border-border bg-background p-3.5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
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
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Confirmada
              </span>
            </div>
          </div>

          {/* Mini chart */}
          <div className="mt-3 rounded-xl border border-border bg-background p-3.5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Atividade · 7 dias
              </div>
              <ShieldCheck className="size-3.5 text-primary" />
            </div>
            <div className="mt-2 flex h-14 items-end gap-1.5">
              {[40, 70, 30, 90, 55, 80, 65].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 5
                        ? "linear-gradient(180deg, #2F74C4, #5C9CE0)"
                        : "rgba(47,116,196,0.35)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniKpi({
  color,
  label,
  value,
}: {
  color: "primary" | "amber" | "sky";
  label: string;
  value: string;
}) {
  const styles =
    color === "primary"
      ? "bg-primary/10 text-primary"
      : color === "amber"
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
        : "bg-sky-500/10 text-sky-600 dark:text-sky-400";
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className={"text-[9px] font-medium uppercase tracking-wider " + styles}>
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-foreground tabular-nums">
        {value}
      </div>
    </div>
  );
}
