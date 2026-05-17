"use client";

import { useActionState } from "react";
import { savePatientProfileAction, type ProfileState } from "./actions";
import { BLOOD_TYPES, BLOOD_TYPE_LABELS, GENDERS } from "@/lib/labels";

type Initial = {
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  gender: string | null;
  id_number: string | null;
  allergies: string[];
  chronic_conditions: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
};

export default function PerfilForm({ initial }: { initial: Initial }) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    savePatientProfileAction,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      <Section title="Informação pessoal">
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
        <Field label="Data de nascimento">
          <input
            name="date_of_birth"
            type="date"
            defaultValue={initial.date_of_birth ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Género">
          <select
            name="gender"
            defaultValue={initial.gender ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="BI ou NIF" hint="Bilhete de Identidade ou NIF — necessário para receitas válidas.">
          <input
            name="id_number"
            type="text"
            defaultValue={initial.id_number ?? ""}
            placeholder="Ex.: 005468391LA042"
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Informação clínica">
        <Field label="Tipo sanguíneo">
          <select
            name="blood_type"
            defaultValue={initial.blood_type ?? "unknown"}
            className={inputClass}
          >
            {BLOOD_TYPES.map((b) => (
              <option key={b} value={b}>
                {BLOOD_TYPE_LABELS[b]}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Alergias"
          hint="Separe por vírgulas ou linhas. Ex.: Penicilina, Amendoim"
          full
        >
          <textarea
            name="allergies"
            rows={2}
            defaultValue={initial.allergies.join(", ")}
            className={inputClass}
          />
        </Field>
        <Field
          label="Doenças crónicas"
          hint="Separe por vírgulas ou linhas. Ex.: Diabetes, Hipertensão"
          full
        >
          <textarea
            name="chronic_conditions"
            rows={2}
            defaultValue={initial.chronic_conditions.join(", ")}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Contacto de emergência">
        <Field label="Nome">
          <input
            name="emergency_contact_name"
            defaultValue={initial.emergency_contact_name ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Telemóvel">
          <input
            name="emergency_contact_phone"
            type="tel"
            defaultValue={initial.emergency_contact_phone ?? ""}
            placeholder="+244 9XX XXX XXX"
            className={inputClass}
          />
        </Field>
      </Section>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A guardar…" : "Guardar perfil"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-border bg-card p-6">
      <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </legend>
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

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
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
