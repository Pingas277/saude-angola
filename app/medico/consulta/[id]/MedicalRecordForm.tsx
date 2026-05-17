"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveMedicalRecordAction, type RecordState } from "./actions";

export type Encounter = {
  kind: "appointment" | "consultation";
  id: string;
};

export type InitialVitals = {
  temp?: string;
  bp?: string;
  pulse?: string;
  weight?: string;
};

export default function MedicalRecordForm({
  encounter,
  initialVitals,
}: {
  encounter: Encounter;
  initialVitals?: InitialVitals;
}) {
  const [state, formAction, isPending] = useActionState<RecordState, FormData>(
    saveMedicalRecordAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const hiddenName =
    encounter.kind === "appointment" ? "appointment_id" : "consultation_id";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name={hiddenName} value={encounter.id} />

      <Field label="Diagnóstico">
        <input
          name="diagnosis"
          placeholder="Ex.: Hipertensão arterial"
          className={inputClass}
        />
      </Field>

      <Field label="Sintomas">
        <textarea
          name="symptoms"
          rows={2}
          placeholder="Ex.: Dor de cabeça, tonturas há 3 dias"
          className={inputClass}
        />
      </Field>

      <Field label="Notas clínicas">
        <textarea
          name="notes"
          rows={3}
          placeholder="Observações, plano terapêutico, recomendações"
          className={inputClass}
        />
      </Field>

      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Sinais vitais
          {initialVitals && (
            <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
              pré-preenchido pela triagem
            </span>
          )}
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Temp. (°C)">
            <input
              name="vital_temp"
              type="text"
              inputMode="decimal"
              placeholder="36.5"
              defaultValue={initialVitals?.temp}
              className={inputClass}
            />
          </Field>
          <Field label="Pressão arterial">
            <input
              name="vital_bp"
              type="text"
              placeholder="120/80"
              defaultValue={initialVitals?.bp}
              className={inputClass}
            />
          </Field>
          <Field label="Pulso (bpm)">
            <input
              name="vital_pulse"
              type="text"
              inputMode="numeric"
              placeholder="72"
              defaultValue={initialVitals?.pulse}
              className={inputClass}
            />
          </Field>
          <Field label="Peso (kg)">
            <input
              name="vital_weight"
              type="text"
              inputMode="decimal"
              placeholder="70"
              defaultValue={initialVitals?.weight}
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Registo clínico guardado.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A guardar…" : "Guardar registo"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
