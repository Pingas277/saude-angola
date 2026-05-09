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
import { Reveal, Stagger, StaggerItem } from "./_motion/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// =============================================================================
// Saúde Angola · A-grade SaaS landing page
// Inspired by the FinWise SaaS template (vercel.com/templates) — adapted for
// healthcare with our emerald primary + Angolan flag accent.
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

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">
      {/* === Floating nav === */}
      <div className="px-3 pt-4 sm:px-6">
        <header className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-md sm:px-7">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink href="#marcar">Marcar consulta</NavLink>
            <NavLink href="#caracteristicas">Características</NavLink>
            <NavLink href="#precos">Preços</NavLink>
            <NavLink href="#faq">Perguntas</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/registar"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Começar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>
      </div>

      {/* === Hero === */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-32 -z-10 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-72 -z-10 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "#FCD116" }}
        />

        <Stagger className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center sm:pt-28">
          <StaggerItem>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "#CD1126" }}
              />
              Marketplace de saúde · Angola
            </span>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Marque com{" "}
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                qualquer médico
              </span>
              , em qualquer clínica.
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              A primeira plataforma que junta médicos e clínicas privadas em Angola
              num só sítio. Procure por especialidade, escolha o profissional e
              marque online — sem telefonemas, sem deslocações para confirmar.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/registar"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 sm:w-auto"
              >
                Começar gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#marcar"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
              >
                Procurar médicos
              </Link>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <TrustItem>Multicaixa Express integrado</TrustItem>
              <TrustItem>Receita com QR válida em farmácias</TrustItem>
              <TrustItem>Conformidade RGPD</TrustItem>
            </div>
          </StaggerItem>

          {/* === Hero device card === */}
          <StaggerItem className="relative mx-auto mt-16 max-w-3xl">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[44px] bg-gradient-to-br from-emerald-200/50 via-white to-amber-100/30 opacity-70 blur-2xl"
            />
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-900/15">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-4 py-3 backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 truncate text-[11px] text-slate-400">
                  saude-angola.vercel.app
                </span>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    Telemedicina · Disponível agora
                  </div>
                  <div className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                    Falar com um médico
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-4 py-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                      MS
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900">
                        Dr. Manuel Silva
                      </div>
                      <div className="truncate text-xs text-slate-600">
                        Medicina Geral · ⭐ 4,9
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      ≈ 3 min
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-left">
                    <Mini label="Consulta" value="15.000 Kz" />
                    <Mini label="Receita" value="QR + PDF" />
                    <Mini label="Pagamento" value="MCX" />
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 p-5 text-left">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Triagem assistida
                    </div>
                    <div className="mt-1 text-base font-bold text-slate-900">
                      Urgência: Média
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Cefaleia há 3 dias · Intensidade 6/10 · sem bandeiras
                      vermelhas. Recomenda-se consulta no próprio dia.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                      Média
                    </span>
                    <span className="text-slate-500">classificação IA</span>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      {/* === Trust strip — regions === */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-10">
        <Reveal className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Disponível em todas as 18 províncias de Angola
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-600">
            {REGIONS.map((r) => (
              <span key={r} className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                />
                {r}
              </span>
            ))}
            <span className="text-slate-400">+ 11 outras</span>
          </div>
        </Reveal>
      </section>

      {/* === Marketplace / Discovery === */}
      <section
        id="marcar"
        className="relative overflow-hidden bg-white py-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl"
        />

        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Marketplace de saúde
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Encontre o seu médico.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Pesquise por especialidade, clínica ou nome. Compare disponibilidade
              e preços. Marque online — em qualquer cidade de Angola, sem fazer
              um único telefonema.
            </p>
          </Reveal>

          {/* === Mock search interface === */}
          <Reveal className="mx-auto mt-14 max-w-4xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-900/10">
              {/* Search bar */}
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 p-5">
                <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-500">
                    Especialidade, clínica ou médico…
                  </span>
                </div>
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm">
                  Pesquisar
                </span>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
                <FilterPill active>Medicina Geral</FilterPill>
                <FilterPill>Cardiologia</FilterPill>
                <FilterPill>Pediatria</FilterPill>
                <FilterPill>Ginecologia</FilterPill>
                <FilterPill>Dermatologia</FilterPill>
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-400">
                  + 24 especialidades
                </span>
              </div>

              {/* Doctor cards */}
              <ul className="divide-y divide-slate-100">
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

          {/* Discovery stats */}
          <Reveal
            className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-slate-600"
            delay={0.1}
          >
            <span className="inline-flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-emerald-600" />
              Centenas de médicos verificados
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Em todas as 18 províncias
            </span>
            <span className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Pagamento por Multicaixa Express
            </span>
          </Reveal>
        </div>
      </section>

      {/* === Features === */}
      <section id="caracteristicas" className="bg-slate-50/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Características
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Tudo o que precisa para a saúde digital.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Construído para a realidade angolana. Funciona em qualquer rede,
              em qualquer telemóvel, em qualquer província.
            </p>
          </Reveal>

          <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem
                key={f.title}
                className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70 transition group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-700">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* === How it works === */}
      <section
        id="como-funciona"
        className="relative overflow-hidden border-y border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Como funciona
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Da triagem à receita em minutos.
            </h2>
            <p className="mt-4 max-w-xl text-base text-slate-600">
              Um fluxo simples, pensado para quem nunca usou uma aplicação de
              saúde. Sem jargão. Sem deslocações.
            </p>
          </Reveal>

          <Stagger className="relative mt-16 grid gap-6 lg:grid-cols-3">
            {/* connecting line on desktop */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent lg:block"
            />
            {STEPS.map((s, i) => (
              <StaggerItem
                key={s.n}
                className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-base font-extrabold text-white shadow-md shadow-emerald-600/30">
                    {s.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="hidden text-emerald-300 lg:inline"
                    >
                      →
                    </span>
                  )}
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.desc}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* === Stats === */}
      <section className="bg-white py-20">
        <Reveal className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white sm:grid-cols-3 lg:p-14">
            <Stat icon={<Clock className="h-5 w-5" />} value="≈ 3 min" label="Tempo médio até atendimento" />
            <Stat icon={<Users className="h-5 w-5" />} value="500+" label="Clínicas privadas em Angola" />
            <Stat icon={<ShieldCheck className="h-5 w-5" />} value="18 / 18" label="Províncias com cobertura" />
          </div>
        </Reveal>
      </section>

      {/* === Pricing === */}
      <section
        id="precos"
        className="relative overflow-hidden bg-slate-50/50 py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Preços para clínicas
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              A partir de 100.000 Kz / mês.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Contrato anual com setup personalizado.{" "}
              <strong className="text-slate-900">
                Para aderir, fale connosco.
              </strong>{" "}
              Pacientes usam grátis.
            </p>
          </Reveal>

          <Stagger className="mt-16 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <StaggerItem
                key={p.name}
                className={
                  "relative rounded-3xl border p-8 transition " +
                  (p.highlighted
                    ? "border-emerald-300 bg-white shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-100 lg:scale-[1.02]"
                    : "border-slate-200 bg-white shadow-sm")
                }
              >
                {p.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                    Mais popular
                  </span>
                )}
                <div className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                  {p.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-5xl font-extrabold tracking-tight text-slate-900">
                    {p.price}
                  </span>
                  <span className="text-base font-semibold text-slate-700">
                    {p.currency}
                  </span>
                  <span className="text-sm text-slate-500">{p.period}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {p.desc}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`mailto:suporte@saudeangola.ao?subject=Ades%C3%A3o%20ao%20plano%20${encodeURIComponent(p.name)}&body=Bom%20dia%2C%20gostar%C3%ADamos%20de%20aderir%20ao%20plano%20${encodeURIComponent(p.name)}.`}
                  className={
                    "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition " +
                    (p.highlighted
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                      : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50")
                  }
                >
                  Falar com a equipa
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <p className="mt-10 text-center text-sm text-slate-500">
            Hospital ou rede com necessidades específicas?{" "}
            <Link
              href="mailto:suporte@saudeangola.ao?subject=Plano%20personalizado"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Pedir proposta personalizada →
            </Link>
          </p>
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Histórias reais
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Médicos e pacientes em Angola.
            </h2>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <StaggerItem
                as="figure"
                key={t.author}
                className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-8"
              >
                <blockquote className="text-base leading-relaxed text-slate-800">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {t.author}
                    </div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </figcaption>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* === FAQ === */}
      <section id="faq" className="border-y border-slate-100 bg-slate-50/40 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Perguntas frequentes
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Tudo o que precisa de saber.
            </h2>
          </Reveal>

          <Accordion className="mt-12 space-y-3">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-slate-200 bg-white px-6"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-600">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-600">
              Outra pergunta?{" "}
              <Link
                href="mailto:suporte@saudeangola.ao"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                suporte@saudeangola.ao
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* === Final CTA === */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 flex h-1.5"
        >
          <div style={{ background: "#CD1126" }} className="h-full flex-1" />
          <div style={{ background: "#FCD116" }} className="h-full flex-1" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "#FCD116" }}
        />

        <Reveal className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-300">
            Crie a sua conta em menos de um minuto. Pacientes começam grátis.
            Clínicas têm 14 dias de teste do plano Padrão.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registar"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400 sm:w-auto"
            >
              Começar gratuitamente
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/entrar"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:w-auto"
            >
              Já tenho conta
            </Link>
          </div>
        </Reveal>
      </section>

      {/* === Footer === */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo size="md" variant="dark" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Plataforma digital de saúde para Angola — telemedicina e
                gestão clínica numa só app.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                <span aria-hidden className="flex overflow-hidden rounded">
                  <span style={{ background: "#CD1126" }} className="block h-3 w-2.5" />
                  <span style={{ background: "#000000" }} className="block h-3 w-2.5" />
                  <span style={{ background: "#FCD116" }} className="block h-3 w-2.5" />
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
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Saúde Angola. Todos os direitos reservados.</span>
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
      className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-emerald-600" />
      {children}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white px-2.5 py-2">
      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-xs font-extrabold text-slate-900">
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
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white/10 text-emerald-300">
        {icon}
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-slate-400">
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
      <div className="text-xs font-bold uppercase tracking-widest text-slate-200">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-slate-400 transition hover:text-white"
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
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition " +
        (active
          ? "bg-emerald-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300")
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
        "flex flex-wrap items-center gap-4 px-5 py-4 transition " +
        (highlighted ? "bg-emerald-50/50" : "hover:bg-slate-50/60")
      }
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-sm font-bold text-white shadow-sm"
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{name}</span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
            {rating}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600">
          <span>{specialty}</span>
          <span aria-hidden className="text-slate-300">·</span>
          <span>{clinic}</span>
          <span aria-hidden className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {city}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 text-right">
        <span className="text-sm font-bold text-slate-900">{price}</span>
        <span className="text-[11px] text-emerald-700">próx.: {next}</span>
      </div>
      <span className="inline-flex items-center justify-center gap-1 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm">
        Marcar
        <ArrowRight className="h-3 w-3" />
      </span>
    </li>
  );
}

