"use client";

import { useActionState } from "react";
import { startConsultationAction, type TriageState } from "./actions";

export default function TriageForm() {
  const [state, formAction, isPending] = useActionState<TriageState, FormData>(
    startConsultationAction,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Motivo principal da consulta"
        hint="Descreva em poucas palavras o que está a sentir."
        required
      >
        <textarea
          name="chief_complaint"
          required
          rows={3}
          placeholder="Ex.: Dor de cabeça e febre desde ontem"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Há quantos dias começou?" hint="Aproximadamente.">
          <input
            name="duration_days"
            type="number"
            inputMode="numeric"
            min={0}
            max={365}
            className={inputClass}
          />
        </Field>
        <Field label="Intensidade (0-10)" hint="0 = sem dor, 10 = dor insuportável.">
          <input
            name="severity"
            type="number"
            inputMode="numeric"
            min={0}
            max={10}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Tem algum destes sinais?
        </legend>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Check name="has_chest_pain" label="Dor no peito" />
          <Check name="has_breathing" label="Dificuldade em respirar" />
          <Check name="has_bleeding" label="Hemorragia" />
          <Check name="has_fainting" label="Desmaio ou perda de consciência" />
          <Check name="has_fever" label="Febre" />
          <Check name="pregnancy" label="Gravidez" />
        </div>
      </fieldset>

      <Field label="Outros sintomas ou observações" hint="Opcional.">
        <textarea
          name="additional_symptoms"
          rows={3}
          placeholder="Ex.: Náuseas, alergia a penicilina, etc."
          className={inputClass}
        />
      </Field>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A iniciar…" : "Entrar na sala de espera →"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm has-checked:border-emerald-500 has-checked:bg-emerald-50">
      <input type="checkbox" name={name} className="text-emerald-600" />
      {label}
    </label>
  );
}
