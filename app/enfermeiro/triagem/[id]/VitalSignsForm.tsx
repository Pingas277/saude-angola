"use client";

import { useActionState } from "react";
import { saveVitalSignsAction, type VitalsState } from "./actions";

export type VitalsDefaults = {
  temperature_c?: string;
  blood_pressure?: string;
  pulse_bpm?: string;
  respiratory_rate?: string;
  oxygen_saturation?: string;
  weight_kg?: string;
  height_cm?: string;
  notes?: string;
};

export default function VitalSignsForm({
  appointmentId,
  defaults,
}: {
  appointmentId: string;
  defaults?: VitalsDefaults;
}) {
  const [state, formAction, isPending] = useActionState<VitalsState, FormData>(
    saveVitalSignsAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="appointment_id" value={appointmentId} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Temperatura (°C)">
          <input
            name="temperature_c"
            inputMode="decimal"
            placeholder="36.5"
            defaultValue={defaults?.temperature_c}
            className={inputClass}
          />
        </Field>
        <Field label="Pressão arterial">
          <input
            name="blood_pressure"
            placeholder="120/80"
            defaultValue={defaults?.blood_pressure}
            className={inputClass}
          />
        </Field>
        <Field label="Pulso (bpm)">
          <input
            name="pulse_bpm"
            inputMode="numeric"
            placeholder="72"
            defaultValue={defaults?.pulse_bpm}
            className={inputClass}
          />
        </Field>
        <Field label="Freq. respiratória">
          <input
            name="respiratory_rate"
            inputMode="numeric"
            placeholder="16"
            defaultValue={defaults?.respiratory_rate}
            className={inputClass}
          />
        </Field>
        <Field label="SpO₂ (%)">
          <input
            name="oxygen_saturation"
            inputMode="numeric"
            placeholder="98"
            defaultValue={defaults?.oxygen_saturation}
            className={inputClass}
          />
        </Field>
        <Field label="Peso (kg)">
          <input
            name="weight_kg"
            inputMode="decimal"
            placeholder="70"
            defaultValue={defaults?.weight_kg}
            className={inputClass}
          />
        </Field>
        <Field label="Altura (cm)">
          <input
            name="height_cm"
            inputMode="decimal"
            placeholder="170"
            defaultValue={defaults?.height_cm}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Observações de enfermagem">
        <textarea
          name="notes"
          rows={3}
          placeholder="Queixa principal, estado geral, notas para o médico"
          defaultValue={defaults?.notes}
          className={inputClass}
        />
      </Field>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          Sinais vitais registados. O médico verá esta triagem na consulta.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A guardar…" : "Guardar triagem"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
