import Link from "next/link";
import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import PublicShell from "../_public/PublicShell";

export const metadata = {
  title: "Preços para clínicas",
  description:
    "Planos da Lunga para clínicas privadas em Angola. Pacientes usam grátis. A partir de 100.000 Kz/mês.",
};

type Plan = {
  name: string;
  price: string;
  desc: string;
  features: string[];
  highlighted: boolean;
};

const PLANS: Plan[] = [
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

// Comparison matrix — each row is a capability, each cell a plan value.
type Cell = boolean | string;
const COMPARISON: { label: string; cells: [Cell, Cell, Cell] }[] = [
  { label: "Médicos", cells: ["Até 3", "Até 10", "Ilimitados"] },
  { label: "Marcações online", cells: [true, true, true] },
  { label: "Receitas digitais com QR", cells: [true, true, true] },
  { label: "Histórico clínico do paciente", cells: [true, true, true] },
  { label: "Consultas por vídeo", cells: [false, "Ilimitadas", "Ilimitadas"] },
  { label: "Faturação Multicaixa Express", cells: [false, true, true] },
  { label: "Gestão de farmácia interna", cells: [false, true, true] },
  { label: "Atividade por médico", cells: [true, true, true] },
  { label: "Multi-clínica", cells: [false, false, true] },
  { label: "API e integrações", cells: [false, false, true] },
  { label: "Relatórios avançados", cells: [false, false, true] },
  {
    label: "Suporte",
    cells: ["Email", "Prioritário", "Gestor dedicado"],
  },
];

const FAQ = [
  {
    q: "Os pacientes pagam alguma coisa?",
    a: "Não. A Lunga é totalmente gratuita para pacientes — marcar, falar com médico, ver receitas e faturas. Só as clínicas pagam a subscrição.",
  },
  {
    q: "Posso mudar de plano depois?",
    a: "Sim. Pode subir ou descer de plano a qualquer momento, conforme a clínica cresce. A mudança aplica-se no ciclo de faturação seguinte.",
  },
  {
    q: "Há contrato mínimo?",
    a: "A adesão é feita com contrato anual e um setup personalizado para a sua clínica. Os detalhes são acertados na conversa de adesão.",
  },
  {
    q: "O que está incluído no setup?",
    a: "A equipa da Lunga cria a clínica no sistema, configura os médicos e a equipa, e acompanha os primeiros dias para garantir que tudo corre bem.",
  },
  {
    q: "Como são feitos os pagamentos?",
    a: "A subscrição mensal é acertada com a equipa da Lunga. Os pagamentos dos pacientes à clínica são processados por Multicaixa Express (planos Padrão e Premium).",
  },
  {
    q: "Os preços incluem impostos?",
    a: "Os valores indicados são a base da subscrição. Os impostos aplicáveis são confirmados no contrato de adesão.",
  },
];

export default function PrecosPage() {
  return (
    <PublicShell>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-emerald-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 size-[460px] rounded-full bg-gradient-to-br from-sky-300/25 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Preços para clínicas
          </div>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Um plano para cada{" "}
            <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
              tamanho de clínica
            </span>
            .
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Os pacientes usam a Lunga de graça. As clínicas pagam uma
            subscrição mensal — a partir de 100.000 Kz.
          </p>
        </div>
      </section>

      {/* ── Plan cards ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={
                "relative rounded-3xl border bg-card p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md " +
                (p.highlighted
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-border")
              }
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  <Sparkles className="size-3" />
                  Mais popular
                </span>
              )}
              <div className="text-xs font-bold uppercase tracking-wider text-primary">
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
                className={
                  "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all " +
                  (p.highlighted
                    ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/30 hover:shadow-lg"
                    : "border border-border bg-background text-foreground hover:bg-accent")
                }
              >
                Falar com a equipa
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Comparação
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              O que cada plano inclui
            </h2>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Funcionalidade
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.name}
                      className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-foreground"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON.map((row) => (
                  <tr key={row.label} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.label}
                    </td>
                    {row.cells.map((cell, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {cell === true ? (
                          <Check className="mx-auto size-4 text-emerald-600" />
                        ) : cell === false ? (
                          <Minus className="mx-auto size-4 text-muted-foreground/40" />
                        ) : (
                          <span className="text-xs font-semibold text-foreground">
                            {cell}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Todos os planos incluem acesso gratuito e ilimitado para os
            pacientes da clínica.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Perguntas frequentes
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Dúvidas sobre preços
          </h2>
        </div>
        <div className="mt-8 space-y-3">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {item.q}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Pronto para digitalizar a sua clínica?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Preencha o formulário de adesão e a equipa da Lunga contacta-o
            para uma demonstração e para escolher o plano certo.
          </p>
          <Link
            href="/parceria"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
          >
            Pedir adesão
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
