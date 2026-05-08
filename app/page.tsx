import Link from "next/link";
import Logo from "./_brand/Logo";

const FEATURES_PATIENT = [
  {
    icon: "🎥",
    title: "Telemedicina rápida",
    desc: "Consulta por vídeo com triagem automática em minutos. Sem deslocações, sem filas.",
  },
  {
    icon: "💊",
    title: "Receitas digitais",
    desc: "Receitas com código QR válidas em qualquer farmácia parceira em Angola.",
  },
  {
    icon: "📋",
    title: "Histórico clínico",
    desc: "Todas as consultas, exames e medicamentos no mesmo sítio, sempre disponíveis.",
  },
];

const FEATURES_CLINIC = [
  {
    title: "Agenda e equipa",
    desc: "Marcações online, fila do dia, gestão de médicos, enfermeiros e recepção.",
  },
  {
    title: "Faturação",
    desc: "Faturas com pagamento por Multicaixa Express, comprovativos automáticos.",
  },
  {
    title: "Sem instalação",
    desc: "Tudo na nuvem. Funciona no telemóvel, tablet ou computador da clínica.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-gradient-to-b from-emerald-50/50 via-white to-white">
      {/* === Floating pill nav === */}
      <div className="px-2 pt-4 sm:px-4">
        <header className="mx-auto flex max-w-6xl items-center justify-between rounded-[36px] border border-emerald-100/60 bg-white/70 px-5 py-2.5 shadow-sm backdrop-blur-md sm:px-6">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="#pacientes">Pacientes</NavLink>
            <NavLink href="#clinicas">Clínicas</NavLink>
            <NavLink href="#precos">Preços</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/registar"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Criar conta →
            </Link>
          </div>
        </header>
      </div>

      {/* === Hero === */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-20 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "#FCD116" }}
        />

        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: "#CD1126" }}
                />
                Feito em Angola, para Angola
              </span>

              <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Saúde digital ao alcance de{" "}
                <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  todos os angolanos
                </span>
                .
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Telemedicina, receitas digitais e gestão clínica numa só
                plataforma. Para pacientes em Luanda ou no interior, e para
                clínicas que querem deixar o papel para trás.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/registar"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 hover:shadow-emerald-600/40"
                >
                  Sou paciente — começar →
                </Link>
                <Link
                  href="#clinicas"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Sou clínica
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                <TrustItem>Multicaixa Express</TrustItem>
                <TrustItem>QR válido em farmácias</TrustItem>
                <TrustItem>RGPD-compatível</TrustItem>
              </div>
            </div>

            {/* === Hero device card === */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[44px] bg-gradient-to-br from-emerald-200/50 via-white to-amber-100/40 opacity-70 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-900/15">
                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-4 py-3 backdrop-blur">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 truncate text-[11px] text-slate-400">
                    saude-angola.vercel.app/painel
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                        Telemedicina
                      </div>
                      <div className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                        Falar agora com um médico
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                      Disponível
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-4 py-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                      Dr
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">
                        Dr. Manuel Silva
                      </div>
                      <div className="text-xs text-slate-600">
                        Medicina Geral · ⭐ 4,9
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      ≈ 3 min
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Mini label="Consulta" value="15.000 Kz" />
                    <Mini label="Receita" value="QR + PDF" />
                    <Mini label="Pagamento" value="MCX" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Patient features === */}
      <section
        id="pacientes"
        className="relative border-t border-slate-100 bg-white py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Para pacientes
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Cuide da sua saúde sem sair de casa.
            </h2>
            <p className="mt-4 max-w-lg text-base text-slate-600">
              Consulte um médico, receba a receita e o histórico clínico no
              telemóvel. Funciona em qualquer rede 3G/4G.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES_PATIENT.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-emerald-50/30 p-7 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5"
              >
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-2xl shadow-sm ring-1 ring-amber-200/50"
                  style={{ background: "linear-gradient(135deg, #FCD116, #fef3c7)" }}
                >
                  {f.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Clinics dark CTA === */}
      <section
        id="clinicas"
        className="relative overflow-hidden bg-slate-900 py-24 text-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 flex h-1.5"
        >
          <div style={{ background: "#CD1126" }} className="h-full flex-1" />
          <div style={{ background: "#FCD116" }} className="h-full flex-1" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "#FCD116" }}
        />

        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-14 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                Para clínicas
              </span>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                A sua clínica em digital,{" "}
                <span className="text-emerald-300">sem dor de cabeça.</span>
              </h2>
              <p className="mt-4 max-w-xl text-base text-slate-300">
                Substitua agendas em papel, livros de marcações e recibos
                manuscritos por uma única plataforma. Comece com o plano básico
                e evolua conforme cresce.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/registar"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400"
                >
                  Falar com a equipa →
                </Link>
                <Link
                  href="/entrar"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Entrar
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES_CLINIC.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10"
                >
                  <h3 className="text-base font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {f.desc}
                  </p>
                </div>
              ))}
              <div
                id="precos"
                className="col-span-full overflow-hidden rounded-2xl border border-amber-300/20 p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(252,209,22,0.12), rgba(252,209,22,0.04))",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-amber-200">
                      Subscrição mensal
                    </div>
                    <div className="mt-1 text-base text-white">
                      A partir de{" "}
                      <span className="text-3xl font-extrabold">$50</span>{" "}
                      <span className="text-sm text-slate-400">/ mês</span>
                    </div>
                  </div>
                  <Link
                    href="/registar"
                    className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-200"
                    style={{ color: "#0f172a" }}
                  >
                    Ver planos →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 sm:flex-row sm:justify-between">
          <Logo size="sm" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Saúde Angola</span>
            <Link href="/entrar" className="hover:text-slate-900">
              Entrar
            </Link>
            <Link href="/registar" className="hover:text-slate-900">
              Criar conta
            </Link>
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
      <span
        aria-hidden
        className="inline-block h-1 w-1 rounded-full bg-emerald-500"
      />
      {children}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 px-2 py-2.5">
      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-extrabold text-slate-900">
        {value}
      </div>
    </div>
  );
}
