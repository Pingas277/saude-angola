"use client";

import { useActionState, useState } from "react";
import {
  saveClinicProfileAction,
  type ClinicProfileState,
} from "./actions";
import {
  WEEKDAY_ORDER,
  WEEKDAY_SHORT_PT,
  coerceWorkingHours,
  type WorkingHours,
} from "@/lib/slots";

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
  working_hours: unknown;
};

export default function ClinicProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, isPending] = useActionState<
    ClinicProfileState,
    FormData
  >(saveClinicProfileAction, null);
  const [hours, setHours] = useState<WorkingHours>(() =>
    coerceWorkingHours(initial.working_hours)
  );

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="rounded-xl border border-border bg-card p-6">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
          <Field label="Plano de subscrição" hint="Apenas leitura — geriado pela Lunga.">
            <input
              disabled
              defaultValue={initial.subscription_plan ?? "basic"}
              className={`${inputClass} cursor-not-allowed bg-muted/40 text-muted-foreground`}
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

      <fieldset className="rounded-xl border border-border bg-card p-6">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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

      <fieldset className="rounded-xl border border-border bg-card p-6">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Horários de funcionamento
        </legend>
        <p className="mt-1 px-1 text-xs text-muted-foreground">
          As marcações só oferecem horas dentro destes horários, e os
          pacientes veem-nos na pesquisa.
        </p>

        {/* Serialised state — the action reads this. */}
        <input
          type="hidden"
          name="working_hours"
          value={JSON.stringify(hours)}
        />

        <div className="mt-4 space-y-2">
          {WEEKDAY_ORDER.map((d) => {
            const day = hours[d];
            const isOpen = !!day;
            return (
              <div
                key={d}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
              >
                <span className="w-10 shrink-0 text-sm font-semibold text-foreground">
                  {WEEKDAY_SHORT_PT[d]}
                </span>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) =>
                      setHours((h) => ({
                        ...h,
                        [d]: e.target.checked
                          ? { open: "08:00", close: "18:00" }
                          : null,
                      }))
                    }
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span
                    className={
                      isOpen ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {isOpen ? "Aberto" : "Fechado"}
                  </span>
                </label>
                {isOpen && day && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={day.open}
                      step={1800}
                      onChange={(e) =>
                        setHours((h) => ({
                          ...h,
                          [d]: { open: e.target.value, close: day.close },
                        }))
                      }
                      className="rounded-md border border-border bg-card px-2 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                    <span className="text-muted-foreground">–</span>
                    <input
                      type="time"
                      value={day.close}
                      step={1800}
                      onChange={(e) =>
                        setHours((h) => ({
                          ...h,
                          [d]: { open: day.open, close: e.target.value },
                        }))
                      }
                      className="rounded-md border border-border bg-card px-2 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

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
          Clínica atualizada.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A guardar…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

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
