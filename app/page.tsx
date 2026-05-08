import Link from "next/link";
import Logo from "./_brand/Logo";

const FEATURES_PATIENT = [
  {
    title: "Telemedicina rápida",
    desc: "Consulta por vídeo com triagem automática em minutos. Sem deslocações, sem filas.",
  },
  {
    title: "Receitas digitais",
    desc: "Receitas com código QR válidas em qualquer farmácia parceira em Angola.",
  },
  {
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
    <main>
      {/* === Top nav === */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="hidden rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/registar"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* === Hero === */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-white">
        {/* decorative emerald glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-200 opacity-30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-10 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "#FCD116" }}
        />

        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: "#CD1126" }}
                />
                Feito para Angola
              </span>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Saúde digital ao alcance de{" "}
                <span className="bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                  todos os angolanos
                </span>
                .
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Telemedicina, receitas digitais e gestão clínica numa só
                plataforma. Para pacientes em Luanda ou no interior, e para
                clínicas que querem deixar o papel para trás.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/registar"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  Sou paciente — começar →
                </Link>
                <Link
                  href="#clinicas"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  Sou clínica
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span>Multicaixa Express integrado</span>
                <span aria-hidden>·</span>
                <span>Receita com QR válida em farmácias</span>
                <span aria-hidden>·</span>
                <span>RGPD-compatível</span>
              </div>
            </div>

            {/* === Hero card mockup === */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-emerald-200 via-emerald-100 to-amber-100 opacity-60 blur-xl"
              />
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-emerald-900/10">
                {/* Mock device top */}
                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-[11px] text-slate-400">
                    saudeangola.ao/painel
                  </span>
                </div>
                {/* Mock content */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                        Telemedicina
                      </div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        Falar agora com um médico
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                      Disponível
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                      Dr
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">
                        Dr. Manuel Silva
                      </div>
                      <div className="text-xs text-slate-600">
                        Medicina Geral · ⭐ 4,9
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-700">
                      ≈ 3 min
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg border border-slate-200 px-3 py-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Consulta</div>
                      <div className="text-sm font-bold text-slate-900">15.000 Kz</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 px-3 py-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Receita</div>
                      <div className="text-sm font-bold text-slate-900">PDF + QR</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 px-3 py-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Pagamento</div>
                      <div className="text-sm font-bold text-slate-900">MCX</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Patient features === */}
      <section className="border-t border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Para pacientes
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Cuide da sua saúde sem sair de casa
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Consulte um médico, receba a receita e o histórico clínico no
              telemóvel. Funciona em qualquer rede 3G/4G.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES_PATIENT.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  ✓
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
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

      {/* === Clinics CTA === */}
      <section
        id="clinicas"
        className="relative overflow-hidden bg-slate-900 py-20 text-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
        >
          <div className="flex h-full">
            <div style={{ background: "#CD1126" }} className="h-full flex-1" />
            <div style={{ background: "#FCD116" }} className="h-full flex-1" />
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                Para clínicas
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                A sua clínica, em digital, sem dor de cabeça.
              </h2>
              <p className="mt-3 max-w-xl text-base text-slate-300">
                Substitua agendas em papel, livros de marcações e recibos
                manuscritos por uma única plataforma. Comece com o plano
                Básico e evolua conforme cresce.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/registar"
                  className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-400"
                >
                  Falar com a equipa
                </Link>
                <Link
                  href="/entrar"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Entrar
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES_CLINIC.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <h3 className="text-base font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    {f.desc}
                  </p>
                </div>
              ))}
              <div
                className="col-span-2 rounded-xl border border-white/10 p-5"
                style={{ background: "rgba(252, 209, 22, 0.08)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-amber-200">
                      Subscrição mensal
                    </div>
                    <div className="mt-1 text-base text-white">
                      A partir de <span className="text-2xl font-bold">$50</span>{" "}
                      <span className="text-sm text-slate-400">/ mês</span>
                    </div>
                  </div>
                  <Link
                    href="/registar"
                    className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-200"
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
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 sm:flex-row sm:justify-between">
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
