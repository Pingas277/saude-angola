"use client";

import { useActionState } from "react";
import {
  saveDoctorProfileAction,
  type DoctorProfileState,
} from "./actions";

type Initial = {
  full_name: string;
  phone: string | null;
  medical_license: string | null;
  specialty: string | null;
};

export default function DoctorProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, isPending] = useActionState<
    DoctorProfileState,
    FormData
  >(saveDoctorProfileAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome completo" required>
          <input
            name="full_name"
            required
            defaultValue={initial.full_name}
            className={inputClass}
          />
        </Field>
        <Field label="Telemóvel">
          <input
            name="phone"
            type="tel"
            defaultValue={initial.phone ?? ""}
            placeholder="+244 9XX XXX XXX"
            className={inputClass}
          />
        </Field>
        <Field
          label="Cédula profissional"
          hint="Número da Ordem dos Médicos de Angola — aparece nas receitas emitidas."
        >
          <input
            name="medical_license"
            defaultValue={initial.medical_license ?? ""}
            placeholder="Ex.: OMA/12345"
            className={inputClass}
          />
        </Field>
        <Field label="Especialidade">
          <input
            name="specialty"
            defaultValue={initial.specialty ?? ""}
            placeholder="Ex.: Medicina Geral e Familiar"
            className={inputClass}
          />
        </Field>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A guardar…" : "Guardar perfil"}
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
