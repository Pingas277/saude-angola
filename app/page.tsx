import Link from "next/link";
import {
  ArrowRight,
  Check,
  Video,
  FileText,
  Pill,
  ShieldCheck,
  Stethoscope,
  CreditCard,
  Clock,
  Users,
  Search,
  MapPin,
  Star,
} from "lucide-react";
import Logo from "./_brand/Logo";
import ThemeToggle from "./_theme/ThemeToggle";
import { Reveal, Stagger, StaggerItem } from "./_motion/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// =============================================================================
// Saúde Angola · landing page — clinical-minimal
// Linear/Vercel-inspired: airy, hairline borders, one emerald accent, fully
// token-driven so it works in light and dark. No gradients/glows/heavy shadows.
// =============================================================================

const FEATURES = [
  {
    icon: Search,
    title: "Marketplace de médicos",
    desc: "Procure por especialidade, clínica ou nome. Veja preço, disponibilidade e marque online — em qualquer cidade de Angola.",
  },
  {
    icon: Video,
    title: "Telemedicina por vídeo",
    desc: "Sem deslocações. Triagem assistida por IA em segundos e consulta com médico licenciado em minutos.",
  },
  {
    icon: FileText,
    title: "Receitas digitais com QR",
    desc: "Receitas válidas em farmácias parceiras em Angola. PDF descarregável e código QR para verificação.",
  },
  {
    icon: Pill,
    title: "Histórico clínico unificado",
    desc: "Diagnósticos, prescrições, exames e sinais vitais — todos num passaporte de saúde digital seu.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos integrados",
    desc: "Multicaixa Express integrado. Comprovativo automático em PDF logo após o pagamento.",
  },
  {
    icon: Stethoscope,
    title: "Plataforma para clínicas",
    desc: "Gestão de equipa, agenda e faturação — substitua livros de marcações em papel pelo digital.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Procure",
    desc: "Pesquise por especialidade, clínica ou nome do médico. Filtre por província ou disponibilidade.",
  },
  {
    n: "02",
    title: "Marque",
    desc: "Escolha o horário e o tipo — presencial na clínica ou por vídeo. Pagamento via Multicaixa Express.",
  },
  {
    n: "03",
    title: "Consulte",
    desc: "Atendimento com o médico. Receita digital com QR e histórico clínico ficam no seu painel.",
  },
];

const PLANS = [
  {
    name: "Básico",
    price: "100.000",
    currency: "Kz",
    period: "/mês",
    desc: "Ideal para clínicas pequenas a iniciar a digitalização.",
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
    currency: "Kz",
    period: "/mês",
    desc: "Para clínicas estabelecidas que querem escalar operações.",
    features: [
      "Até 10 médicos",
      "Telemedicina B2C ilimitada",
      "Faturação Multicaixa Express",
      "Gestão de farmácia interna",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "500.000",
    currency: "Kz",
    period: "/mês",
    desc: "Para grupos hospitalares e redes de clínicas.",
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

const TESTIMONIALS = [
  {
    quote:
      "Pela primeira vez consigo gerir as marcações da clínica sem livros em papel. A faturação por Multicaixa Express simplificou tudo.",
    author: "Dr.ª Esperança Cardoso",
    role: "Diretora Clínica · Luanda",
    initials: "EC",
  },
  {
    quote:
      "Vivo no Huambo. Antes ia a Luanda para uma consulta de seguimento. Agora falo com o meu médico por vídeo e recebo a receita no telemóvel.",
    author: "Joaquim Mateus",
    role: "Paciente · Huambo",
    initials: "JM",
  },
  {
    quote:
      "A triagem com IA prioriza correctamente os casos urgentes. Atendo o que importa primeiro — uma poupança real de tempo no consultório.",
    author: "Dr. Manuel Silva",
    role: "Medicina Geral · Benguela",
    initials: "MS",
  },
];

const FAQ = [
  {
    q: "Preciso de instalar alguma aplicação?",
    a: "Não. A Saúde Angola funciona inteiramente no navegador — Chrome, Safari, Edge — em qualquer telemóvel, tablet ou computador. Funciona em ligações 3G/4G.",
  },
  {
    q: "As receitas digitais são reconhecidas em farmácias?",
    a: "Sim. Cada receita inclui um código QR único. As farmácias parceiras verificam a autenticidade no acto. Estamos a expandir a rede de parceiros em Luanda e nas províncias.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Pagamentos por Multicaixa Express, integrado nativamente. Confirma no telemóvel, recebe o comprovativo automaticamente em PDF. Em breve: cartão e transferência bancária.",
  },
  {
    q: "Os meus dados clínicos estão seguros?",
    a: "Sim. Cada utilizador acede apenas aos seus próprios dados (Row-Level Security ao nível da base de dados). Conformidade RGPD. Nunca partilhamos dados com terceiros sem consentimento.",
  },
  {
    q: "A minha clínica pode aderir?",
    a: "Sim. As subscrições começam em 100.000 Kz/mês com contrato anual e setup personalizado para a clínica. Para aderir, contacte a nossa equipa em suporte@saudeangola.ao — tratamos de tudo, do onboarding à formação.",
  },
  {
    q: "Há contrato anual? Posso cancelar?",
    a: "Sim, há contrato anual. Cobre o setup inicial, formação da equipa e suporte prioritário. As condições de renovação são acordadas com cada clínica antes de aderir.",
  },
];

const REGIONS = [
  "Luanda",
  "Benguela",
  "Huambo",
  "Huíla",
  "Cabinda",
  "Lunda Norte",
  "Bié",
];

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      {/* === Nav === */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="#marcar">Marcar consulta</NavLink>
            <NavLink href="#caracteristicas">Características</NavLink>
            <NavLink href="#precos">Preços</NavLink>
            <NavLink href="#faq">Perguntas</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/entrar"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Entrar
            </Link>
            <Link href="/registar" className={btnPrimary}>
              Começar
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* === Hero === */}
      <section className="border-b border-border">
        <Stagger className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <StaggerItem>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <span
                aria-hidden
                className="inline-block size-1.5 rounded-full bg-primary"
              />
              Marketplace de saúde · Angola
            </span>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Marque com <span className="text-primary">qualquer médico</span>,
              em qualquer clínica.
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              A primeira plataforma que junta médicos e clínicas privadas em
              Angola num só sítio. Procure por especialidade, escolha o
              profissional e marque online — sem telefonemas.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/registar" className={btnPrimary}>
                Começar gratuitamente
                <ArrowRight className="size-4" />
              </Link>
              <Link href="#marcar" className={btnOutline}>
                Procurar médicos
              </Link>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <TrustItem>Multicaixa Express integrado</TrustItem>
              <TrustItem>Receita com QR válida em farmácias</TrustItem>
              <TrustItem>Conformidade RGPD</TrustItem>
            </div>
          </StaggerItem>

          {/* === Hero product preview === */}
          <StaggerItem className="mx-auto mt-16 max-w-3xl">
            <div className="overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="ml-3 truncate text-[11px] text-muted-foreground">
                  saude-angola.vercel.app
                </span>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-[1.4fr_1fr]">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-primary">
                    Telemedicina · Disponível agora
                  </div>
                  <div className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
                    Falar com um médico
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      MS
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">
                        Dr. Manuel Silva
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        Medicina Geral · ★ 4,9
                      </div>
                    </div>
                    <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-primary">
                      ≈ 3 min
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Mini label="Consulta" value="15.000 Kz" />
                    <Mini label="Receita" value="QR + PDF" />
                    <Mini label="Pagamento" value="MCX" />
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-muted/40 p-5">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Triagem assistida
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      Urgência: Média
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      Cefaleia há 3 dias · Intensidade 6/10 · sem bandeiras
                      vermelhas. Recomenda-se consulta no próprio dia.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-border px-2 py-0.5 font-medium text-foreground">
                      Média
                    </span>
                    <span className="text-muted-foreground">
                      classificação IA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      {/* === Regions strip === */}
      <section className="border-b border-border bg-muted/30">
        <Reveal className="mx-auto max-w-6xl px-6 py-10 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Disponível em todas as 18 províncias de Angola
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {REGIONS.map((r) => (
              <span key={r} className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block size-1.5 rounded-full bg-primary/60"
                />
                {r}
              </span>
            ))}
            <span className="text-muted-foreground/60">+ 11 outras</span>
          </div>
        </Reveal>
      </section>

      {/* === Marketplace / Discovery === */}
      <section id="marcar" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Marketplace de saúde</SectionEyebrow>
            <SectionTitle>Encontre o seu médico.</SectionTitle>
            <SectionLede>
              Pesquise por especialidade, clínica ou nome. Compare
              disponibilidade e preços. Marque online — em qualquer cidade de
              Angola, sem fazer um único telefonema.
            </SectionLede>
          </Reveal>

          <Reveal className="mx-auto mt-14 max-w-3xl">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-border px-4 py-2.5">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Especialidade, clínica ou médico…
                  </span>
                </div>
                <span className={btnPrimary}>Pesquisar</span>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
                <FilterPill active>Medicina Geral</FilterPill>
                <FilterPill>Cardiologia</FilterPill>
                <FilterPill>Pediatria</FilterPill>
                <FilterPill>Ginecologia</FilterPill>
                <FilterPill>Dermatologia</FilterPill>
                <span className="inline-flex items-center px-3 py-1.5 text-xs text-muted-foreground">
                  + 24 especialidades
                </span>
              </div>

              <ul className="divide-y divide-border">
                <DoctorRow
                  initials="MS"
                  name="Dr. Manuel Silva"
                  specialty="Medicina Geral"
                  clinic="Clínica Demo"
                  city="Luanda"
                  rating="4.9"
                  price="15.000 Kz"
                  next="Hoje, 14:30"
                />
                <DoctorRow
                  initials="EC"
                  name="Dra. Esperança Cardoso"
                  specialty="Cardiologia"
                  clinic="Hospital Sagrada Esperança"
                  city="Luanda"
                  rating="4.8"
                  price="35.000 Kz"
                  next="Amanhã, 10:00"
                />
                <DoctorRow
                  initials="AM"
                  name="Dr. António Mateus"
                  specialty="Pediatria"
                  clinic="Clínica Multiperfil"
                  city="Benguela"
                  rating="4.7"
                  price="20.000 Kz"
                  next="Quarta, 09:15"
                  highlighted
                />
              </ul>
            </div>
          </Reveal>

          <Reveal
            className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground"
            delay={0.1}
          >
            <span className="inline-flex items-center gap-2">
              <Stethoscope className="size-4 text-primary" />
              Centenas de médicos verificados
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Em todas as 18 províncias
            </span>
            <span className="inline-flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              Pagamento por Multicaixa Express
            </span>
          </Reveal>
        </div>
      </section>

      {/* === Features === */}
      <section id="caracteristicas" className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Características</SectionEyebrow>
            <SectionTitle>Tudo o que precisa para a saúde digital.</SectionTitle>
            <SectionLede>
              Construído para a realidade angolana. Funciona em qualquer rede,
              em qualquer telemóvel, em qualquer província.
            </SectionLede>
          </Reveal>

          <Stagger className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem
                key={f.title}
                className="group bg-card p-7 transition-colors hover:bg-accent/40"
              >
                <div className="grid size-10 place-items-center rounded-lg border border-border bg-background text-primary">
                  <f.icon className="size-5" />
                </div>
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

      {/* === How it works === */}
      <section id="como-funciona" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>Como funciona</SectionEyebrow>
            <SectionTitle>Da triagem à receita em minutos.</SectionTitle>
            <SectionLede>
              Um fluxo simples, pensado para quem nunca usou uma aplicação de
              saúde. Sem jargão. Sem deslocações.
            </SectionLede>
          </Reveal>

          <Stagger className="mt-16 grid gap-6 lg:grid-cols-3">
            {STEPS.map((s) => (
              <StaggerItem
                key={s.n}
                className="rounded-xl border border-border bg-card p-7"
              >
                <span className="inline-grid size-10 place-items-center rounded-lg border border-border text-sm font-semibold text-primary">
                  {s.n}
                </span>
                <h3 className="mt-6 text-base font-semibold text-foreground">
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

      {/* === Stats === */}
      <section className="border-b border-border bg-muted/30">
        <Reveal className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-3">
            <Stat
              icon={<Clock className="size-5" />}
              value="≈ 3 min"
              label="Tempo médio até atendimento"
            />
            <Stat
              icon={<Users className="size-5" />}
              value="500+"
              label="Clínicas privadas em Angola"
            />
            <Stat
              icon={<ShieldCheck className="size-5" />}
              value="18 / 18"
              label="Províncias com cobertura"
            />
          </div>
        </Reveal>
      </section>

      {/* === Pricing === */}
      <section id="precos" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Preços para clínicas</SectionEyebrow>
            <SectionTitle>A partir de 100.000 Kz / mês.</SectionTitle>
            <SectionLede>
              Contrato anual com setup personalizado.{" "}
              <strong className="font-semibold text-foreground">
                Para aderir, fale connosco.
              </strong>{" "}
              Pacientes usam grátis.
            </SectionLede>
          </Reveal>

          <Stagger className="mt-16 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <StaggerItem
                key={p.name}
                className={
                  "relative rounded-xl border bg-card p-8 " +
                  (p.highlighted
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-border")
                }
              >
                {p.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
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
                  <span className="text-sm font-medium text-foreground">
                    {p.currency}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {p.period}
                  </span>
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
                  href={`mailto:suporte@saudeangola.ao?subject=Ades%C3%A3o%20ao%20plano%20${encodeURIComponent(p.name)}&body=Bom%20dia%2C%20gostar%C3%ADamos%20de%20aderir%20ao%20plano%20${encodeURIComponent(p.name)}.`}
                  className={
                    "mt-7 w-full " +
                    (p.highlighted ? btnPrimary : btnOutline)
                  }
                >
                  Falar com a equipa
                  <ArrowRight className="size-4" />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Hospital ou rede com necessidades específicas?{" "}
            <Link
              href="mailto:suporte@saudeangola.ao?subject=Plano%20personalizado"
              className="font-medium text-primary hover:underline"
            >
              Pedir proposta personalizada →
            </Link>
          </p>
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>Histórias reais</SectionEyebrow>
            <SectionTitle>Médicos e pacientes em Angola.</SectionTitle>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <StaggerItem
                as="figure"
                key={t.author}
                className="rounded-xl border border-border bg-card p-8"
              >
                <blockquote className="text-sm leading-relaxed text-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="grid size-10 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {t.initials}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {t.author}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </figcaption>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* === FAQ === */}
      <section id="faq" className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <Reveal className="text-center">
            <SectionEyebrow>Perguntas frequentes</SectionEyebrow>
            <SectionTitle>Tudo o que precisa de saber.</SectionTitle>
          </Reveal>

          <Accordion className="mt-12 space-y-3">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-lg border border-border bg-card px-5"
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

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Outra pergunta?{" "}
              <Link
                href="mailto:suporte@saudeangola.ao"
                className="font-medium text-primary hover:underline"
              >
                suporte@saudeangola.ao
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* === Final CTA === */}
      <section className="border-b border-border">
        <Reveal className="mx-auto max-w-6xl px-6 py-24">
          <div className="rounded-2xl border border-border bg-muted/40 px-6 py-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pronto para começar?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
              Crie a sua conta em menos de um minuto. Pacientes começam grátis.
              Clínicas têm 14 dias de teste do plano Padrão.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/registar" className={btnPrimary}>
                Começar gratuitamente
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/entrar" className={btnOutline}>
                Já tenho conta
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* === Footer === */}
      <footer className="bg-background">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size="md" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Plataforma digital de saúde para Angola — telemedicina e gestão
              clínica numa só app.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <span
                aria-hidden
                className="flex overflow-hidden rounded-sm border border-border"
              >
                <span
                  style={{ background: "#CD1126" }}
                  className="block h-3 w-2.5"
                />
                <span
                  style={{ background: "#000000" }}
                  className="block h-3 w-2.5"
                />
                <span
                  style={{ background: "#FCD116" }}
                  className="block h-3 w-2.5"
                />
              </span>
              <span>Feito em Angola</span>
            </div>
          </div>

          <FooterCol
            title="Produto"
            links={[
              { href: "#caracteristicas", label: "Características" },
              { href: "#como-funciona", label: "Como funciona" },
              { href: "#precos", label: "Preços" },
              { href: "/registar", label: "Criar conta" },
            ]}
          />
          <FooterCol
            title="Empresa"
            links={[
              { href: "/", label: "Sobre nós" },
              { href: "mailto:suporte@saudeangola.ao", label: "Contacto" },
              { href: "/", label: "Imprensa" },
              { href: "/", label: "Carreiras" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { href: "/", label: "Termos de Serviço" },
              { href: "/", label: "Política de Privacidade" },
              { href: "/", label: "RGPD" },
              { href: "/", label: "Cookies" },
            ]}
          />
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} Saúde Angola. Todos os direitos
              reservados.
            </span>
            <span>Luanda · Angola 🇦🇴</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

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
    <span className="text-xs font-medium uppercase tracking-wider text-primary">
      {children}
    </span>
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

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="size-3.5 text-primary" />
      {children}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-2.5 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto grid size-10 place-items-center rounded-lg border border-border text-primary">
        {icon}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
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

function FilterPill({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "bg-primary text-primary-foreground"
          : "border border-border text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </span>
  );
}

function DoctorRow({
  initials,
  name,
  specialty,
  clinic,
  city,
  rating,
  price,
  next,
  highlighted,
}: {
  initials: string;
  name: string;
  specialty: string;
  clinic: string;
  city: string;
  rating: string;
  price: string;
  next: string;
  highlighted?: boolean;
}) {
  return (
    <li
      className={
        "flex flex-wrap items-center gap-4 px-5 py-4 transition-colors " +
        (highlighted ? "bg-accent/40" : "hover:bg-accent/30")
      }
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="inline-flex items-center gap-0.5 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Star className="size-2.5 fill-current text-primary" />
            {rating}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{specialty}</span>
          <span aria-hidden className="text-border">·</span>
          <span>{clinic}</span>
          <span aria-hidden className="text-border">·</span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="size-3" />
            {city}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 text-right">
        <span className="text-sm font-semibold text-foreground">{price}</span>
        <span className="text-[11px] text-primary">próx.: {next}</span>
      </div>
      <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground">
        Marcar
        <ArrowRight className="size-3" />
      </span>
    </li>
  );
}
