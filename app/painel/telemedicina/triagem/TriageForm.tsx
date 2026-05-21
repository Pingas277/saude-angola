"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Baby,
  Activity,
  Droplet,
  Heart,
  Loader2,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";
import { startConsultationAction, type TriageState } from "./actions";

type RedFlagKey =
  | "has_chest_pain"
  | "has_breathing"
  | "has_bleeding"
  | "has_fainting";
type NeutralKey = "has_fever" | "pregnancy";

const RED_FLAGS: { name: RedFlagKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: "has_chest_pain", label: "Dor no peito", icon: Heart },
  { name: "has_breathing", label: "Dificuldade em respirar", icon: Wind },
  { name: "has_bleeding", label: "Hemorragia", icon: Droplet },
  { name: "has_fainting", label: "Desmaio", icon: Zap },
];

const NEUTRAL_FLAGS: { name: NeutralKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: "has_fever", label: "Febre", icon: Thermometer },
  { name: "pregnancy", label: "Gravidez", icon: Baby },
];

export default function TriageForm() {
  const [state, formAction, isPending] = useActionState<TriageState, FormData>(
    startConsultationAction,
    null
  );

  const [severity, setSeverity] = useState<number | null>(null);

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden severity input — controlled by the segmented picker */}
      <input
        type="hidden"
        name="severity"
        value={severity ?? ""}
      />

      {/* ───── Motivo ───── */}
      <SectionCard
        eyebrow="01 · O motivo"
        title="O que se passa consigo?"
        subtitle="Descreva em poucas palavras."
      >
        <textarea
          name="chief_complaint"
          required
          rows={3}
          placeholder="Ex.: Dor de cabeça forte e febre desde ontem."
          className="block w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </SectionCard>

      {/* ───── Duração + intensidade ───── */}
      <SectionCard
        eyebrow="02 · Há quanto tempo"
        title="Quando começou e quão forte é?"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Há quantos dias começou?
            </label>
            <input
              name="duration_days"
              type="number"
              inputMode="numeric"
              min={0}
              max={365}
              placeholder="Ex.: 2"
              className="block w-32 rounded-xl border border-border bg-card px-3.5 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Intensidade da dor (0 = sem dor, 10 = insuportável)
            </label>
            <SeverityPicker value={severity} onChange={setSeverity} />
          </div>
        </div>
      </SectionCard>

      {/* ───── Sinais ───── */}
      <SectionCard
        eyebrow="03 · Sinais"
        title="Tem algum destes sintomas?"
        subtitle="Toque para selecionar os que tem agora."
      >
        <div className="space-y-3">
          {/* Red-flag row */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
              <AlertCircle className="size-3" />
              Sinais a comunicar com prioridade
            </div>
            <div className="grid grid-cols-2 gap-2">
              {RED_FLAGS.map((f) => (
                <RedFlagCheck
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  icon={f.icon}
                />
              ))}
            </div>
          </div>

          {/* Neutral row */}
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Outros
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NEUTRAL_FLAGS.map((f) => (
                <NeutralCheck
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  icon={f.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ───── Outros ───── */}
      <SectionCard
        eyebrow="04 · Mais informação"
        title="Quer dizer mais alguma coisa?"
        subtitle="Opcional — alergias, medicação, contexto."
      >
        <textarea
          name="additional_symptoms"
          rows={3}
          placeholder="Ex.: Alergia a penicilina · estou a tomar Losartan · cansaço extra."
          className="block w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </SectionCard>

      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-base font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            A entrar na sala…
          </>
        ) : (
          <>
            <Activity className="size-5" />
            Entrar na sala de espera
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function SectionCard({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </div>
        <h2 className="mt-1.5 text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function SeverityPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  const toneFor = (n: number) =>
    n <= 3
      ? "from-emerald-500 to-teal-500"
      : n <= 6
        ? "from-amber-500 to-orange-500"
        : "from-rose-500 to-pink-500";

  const label =
    value === null
      ? null
      : value <= 3
        ? "Ligeira"
        : value <= 6
          ? "Moderada"
          : "Severa";

  return (
    <div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={
              "h-9 rounded-md text-xs font-bold tabular-nums transition-all " +
              (value === n
                ? `bg-gradient-to-br ${toneFor(n)} text-white shadow-md scale-105`
                : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent")
            }
          >
            {n}
          </button>
        ))}
      </div>
      {value !== null && (
        <div className="mt-2 flex items-center justify-between text-[11px] font-medium">
          <span className="text-muted-foreground">Sem dor</span>
          <span
            className={
              "rounded-full px-2 py-0.5 font-bold uppercase tracking-wider " +
              (value <= 3
                ? "bg-emerald-100 text-emerald-700"
                : value <= 6
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700")
            }
          >
            {label} · {value}/10
          </span>
          <span className="text-muted-foreground">Insuportável</span>
        </div>
      )}
    </div>
  );
}

function RedFlagCheck({
  name,
  label,
  icon: Icon,
}: {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 rounded-xl border-2 border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground transition-all has-checked:border-rose-500 has-checked:bg-rose-50 has-checked:text-rose-900 has-checked:shadow-sm">
      <input type="checkbox" name={name} className="peer sr-only" />
      <span className="grid size-7 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors peer-checked:bg-gradient-to-br peer-checked:from-rose-500 peer-checked:to-pink-500 peer-checked:text-white group-has-checked:bg-gradient-to-br group-has-checked:from-rose-500 group-has-checked:to-pink-500 group-has-checked:text-white">
        <Icon className="size-3.5" />
      </span>
      {label}
    </label>
  );
}

function NeutralCheck({
  name,
  label,
  icon: Icon,
}: {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 rounded-xl border-2 border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground transition-all has-checked:border-sky-500 has-checked:bg-sky-50 has-checked:text-sky-900 has-checked:shadow-sm">
      <input type="checkbox" name={name} className="peer sr-only" />
      <span className="grid size-7 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-has-checked:bg-gradient-to-br group-has-checked:from-sky-500 group-has-checked:to-emerald-500 group-has-checked:text-white">
        <Icon className="size-3.5" />
      </span>
      {label}
    </label>
  );
}
