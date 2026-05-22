import {
  CalendarCheck,
  CreditCard,
  LineChart,
  Users,
} from "lucide-react";
import PublicShell from "../_public/PublicShell";
import ClinicSignupForm from "../_public/ClinicSignupForm";

export const metadata = {
  title: "Para clínicas",
  description:
    "Digitalize a sua clínica com a Lunga — agenda, faturação, equipa e telemedicina num só sistema. Peça uma demonstração.",
};

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: "Agenda sem papel",
    desc: "Marcações online, lembretes automáticos e a agenda de cada médico em tempo real.",
  },
  {
    icon: CreditCard,
    title: "Faturação Multicaixa",
    desc: "Emita faturas, receba por Multicaixa Express e acompanhe o que está por cobrar.",
  },
  {
    icon: Users,
    title: "Equipa organizada",
    desc: "Médicos, enfermagem, recepção e administração — cada um com o seu acesso.",
  },
  {
    icon: LineChart,
    title: "Tudo à vista",
    desc: "Consultas, receita, atividade por médico — num painel claro, atualizado ao segundo.",
  },
];

export default function ParceriaPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-emerald-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 size-[480px] rounded-full bg-gradient-to-br from-sky-300/25 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Para clínicas
          </div>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Digitalize a sua clínica{" "}
            <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
              num só sistema
            </span>
            .
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Agenda, faturação, equipa e telemedicina — sem papel, sem filas.
            Preencha o formulário e a equipa da Lunga contacta-o para uma
            demonstração.
          </p>
        </div>
      </section>

      {/* Benefits + form */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Benefits */}
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              O que a clínica ganha
            </h2>
            <ul className="mt-5 space-y-3">
              {BENEFITS.map((b) => (
                <li
                  key={b.title}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm">
                    <b.icon className="size-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {b.title}
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {b.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Como funciona:</strong>{" "}
              preenche o formulário → a equipa contacta-o → demonstração e
              setup → a clínica fica online. Os pacientes usam a Lunga
              gratuitamente.
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
              Pedir adesão
            </h2>
            <ClinicSignupForm />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
