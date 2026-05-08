"use client";

import { useActionState } from "react";
import { bookAppointmentAction, type BookingState } from "./actions";

type Doctor = {
  id: string;
  full_name: string;
  clinic_name: string | null;
};

export default function MarcarForm({
  doctors,
  defaultDate,
}: {
  doctors: Doctor[];
  defaultDate: string;
}) {
  const [state, formAction, isPending] = useActionState<BookingState, FormData>(
    bookAppointmentAction,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Médico" required>
        <select name="doctor_id" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Selecione um médico
          </option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name}
              {d.clinic_name ? ` — ${d.clinic_name}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Data" required>
          <input
            name="date"
            type="date"
            required
            min={defaultDate}
            defaultValue={defaultDate}
            className={inputClass}
          />
        </Field>
        <Field label="Hora" required>
          <input
            name="time"
            type="time"
            required
            defaultValue="09:00"
            step={900}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Tipo de consulta" required>
        <div className="flex gap-3">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm has-checked:border-emerald-500 has-checked:bg-emerald-50">
            <input
              type="radio"
              name="appointment_type"
              value="in_person"
              defaultChecked
              className="text-emerald-600"
            />
            Presencial
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm has-checked:border-emerald-500 has-checked:bg-emerald-50">
            <input
              type="radio"
              name="appointment_type"
              value="telemedicine"
              className="text-emerald-600"
            />
            Telemedicina
          </label>
        </div>
      </Field>

      <Field label="Motivo da consulta" hint="Descreva sintomas ou o motivo da visita.">
        <textarea
          name="reason"
          rows={3}
          placeholder="Ex.: Dor de cabeça frequente há uma semana"
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
          disabled={isPending || doctors.length === 0}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A marcar…" : "Confirmar marcação"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

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
