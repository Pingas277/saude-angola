"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Loader2,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  addDependentAction,
  removeDependentAction,
  type DependentMutationState,
} from "./dependents-actions";

export type Dependent = {
  id: string;
  full_name: string | null;
  relationship: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  id_number: string | null;
};

const RELATIONSHIPS: Array<{ value: string; label: string }> = [
  { value: "filho", label: "Filho" },
  { value: "filha", label: "Filha" },
  { value: "mae", label: "Mãe" },
  { value: "pai", label: "Pai" },
  { value: "irmao", label: "Irmão" },
  { value: "irma", label: "Irmã" },
  { value: "conjuge", label: "Cônjuge" },
  { value: "tutelado", label: "Tutelado(a)" },
  { value: "outro", label: "Outro" },
];

const REL_LABEL: Record<string, string> = Object.fromEntries(
  RELATIONSHIPS.map((r) => [r.value, r.label])
);

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function DependentsSection({
  initial,
}: {
  initial: Dependent[];
}) {
  const [showForm, setShowForm] = useState(initial.length === 0);

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="size-4 text-primary" />
            Dependentes ({initial.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Filhos, tutelados ou outros familiares sem conta própria. Pode
            marcar consultas e ver receitas/exames em nome deles.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Adicionar
          </button>
        )}
      </header>

      {initial.length > 0 && (
        <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
          {initial.map((d) => (
            <DependentRow key={d.id} dep={d} />
          ))}
        </ul>
      )}

      {showForm && (
        <AddForm
          onCancel={initial.length > 0 ? () => setShowForm(false) : undefined}
          onDone={() => setShowForm(false)}
        />
      )}
    </section>
  );
}

// =============================================================================
// Row in the existing-dependents list
// =============================================================================

function DependentRow({ dep }: { dep: Dependent }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    DependentMutationState,
    FormData
  >(removeDependentAction, null);
  const [confirm, setConfirm] = useState(false);

  // After a successful delete, force the server component to re-fetch.
  if (state?.ok) {
    setTimeout(() => router.refresh(), 0);
  }

  const age = ageFromDob(dep.date_of_birth);
  const relLabel = dep.relationship
    ? REL_LABEL[dep.relationship] ?? dep.relationship
    : "—";

  return (
    <li className="flex flex-wrap items-center gap-4 px-4 py-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {initials(dep.full_name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">
          {dep.full_name ?? "—"}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3 text-rose-500" />
            {relLabel}
          </span>
          {age !== null && <span>{age} anos</span>}
          {dep.id_number && <span className="font-mono">BI {dep.id_number}</span>}
        </div>
      </div>

      {confirm ? (
        <form action={formAction} className="flex items-center gap-1.5">
          <input type="hidden" name="dependent_id" value={dep.id} />
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="rounded-md border border-border bg-card px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
            Remover
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-rose-300 hover:text-rose-600"
        >
          <Trash2 className="size-3" />
          Remover
        </button>
      )}

      {state?.error && (
        <div className="w-full text-xs text-destructive">{state.error}</div>
      )}
    </li>
  );
}

// =============================================================================
// Inline "add new dependent" form
// =============================================================================

function AddForm({
  onCancel,
  onDone,
}: {
  onCancel?: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    DependentMutationState,
    FormData
  >(addDependentAction, null);

  if (state?.ok) {
    setTimeout(() => {
      onDone();
      router.refresh();
    }, 0);
  }

  return (
    <form
      action={formAction}
      className="mt-5 rounded-xl border border-dashed border-border bg-background/50 p-4"
    >
      <header className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Plus className="size-4 text-primary" />
          Novo dependente
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome completo" required full>
          <input
            name="full_name"
            required
            placeholder="Ex.: Maria Pequena"
            className={inputClass}
          />
        </Field>
        <Field label="Relação" required>
          <div className="relative">
            <select
              name="relationship"
              required
              defaultValue=""
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="" disabled>
                Selecione…
              </option>
              {RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
        <Field label="Data de nascimento">
          <input name="date_of_birth" type="date" className={inputClass} />
        </Field>
        <Field label="Género">
          <div className="relative">
            <select
              name="gender"
              defaultValue=""
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="">—</option>
              <option value="female">Feminino</option>
              <option value="male">Masculino</option>
              <option value="other">Outro</option>
              <option value="prefer_not_to_say">Prefiro não dizer</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
        <Field label="Tipo sanguíneo">
          <div className="relative">
            <select
              name="blood_type"
              defaultValue="unknown"
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="unknown">Desconhecido</option>
              <option value="a_positive">A+</option>
              <option value="a_negative">A−</option>
              <option value="b_positive">B+</option>
              <option value="b_negative">B−</option>
              <option value="ab_positive">AB+</option>
              <option value="ab_negative">AB−</option>
              <option value="o_positive">O+</option>
              <option value="o_negative">O−</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
        <Field label="BI / Cédula (opcional)">
          <input
            name="id_number"
            placeholder="Crianças podem não ter ainda"
            className={`${inputClass} uppercase`}
          />
        </Field>
      </div>

      {state?.error && (
        <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />A guardar…
            </>
          ) : (
            "Adicionar dependente"
          )}
        </button>
      </div>
    </form>
  );
}

// =============================================================================
// Tiny field helper (matches PerfilForm style)
// =============================================================================

const inputClass =
  "block w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
