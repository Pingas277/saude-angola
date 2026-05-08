"use client";

import { useActionState } from "react";
import {
  saveClinicProfileAction,
  type ClinicProfileState,
} from "./actions";

const PROVINCES = [
  "Bengo","Benguela","Bie","Cabinda","Cuando Cubango","Cuanza Norte","Cuanza Sul",
  "Cunene","Huambo","Huila","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico",
  "Namibe","Uige","Zaire",
];

type Initial = {
  name: string;
  address: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  subscription_plan: string | null;
};

export default function ClinicProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, isPending] = useActionState<
    ClinicProfileState,
    FormData
  >(saveClinicProfileAction, null);

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="rounded-xl border border-slate-200 bg-white p-6">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Identificação
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome da clínica" required full>
            <input
              name="name"
              required
              defaultValue={initial.name}
              className={inputClass}
            />
          </Field>
          <Field label="Província">
            <select
              name="province"
              defaultValue={initial.province ?? ""}
              className={inputClass}
            >
              <option value="">—</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Plano de subscrição" hint="Apenas leitura — geriado pela Saúde Angola.">
            <input
              disabled
              defaultValue={initial.subscription_plan ?? "basic"}
              className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
            />
          </Field>
          <Field label="Morada" full>
            <input
              name="address"
              defaultValue={initial.address ?? ""}
              placeholder="Rua, bairro, município"
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-6">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Contactos
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Telefone">
            <input
              name="phone"
              type="tel"
              defaultValue={initial.phone ?? ""}
              placeholder="+244 9XX XXX XXX"
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              type="email"
              defaultValue={initial.email ?? ""}
              placeholder="contacto@clinica.ao"
              className={inputClass}
            />
          </Field>
          <Field
            label="Logo (URL)"
            hint="URL público de uma imagem PNG ou SVG. Aparece em receitas e faturas."
            full
          >
            <input
              name="logo_url"
              type="url"
              defaultValue={initial.logo_url ?? ""}
              placeholder="https://..."
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
          Clínica atualizada.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A guardar…" : "Guardar"}
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
  full,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
