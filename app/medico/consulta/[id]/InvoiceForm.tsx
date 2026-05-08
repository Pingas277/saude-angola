"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import {
  createInvoiceAction,
  type InvoiceState,
} from "./actions";

export type Encounter = {
  kind: "appointment" | "consultation";
  id: string;
};

export default function InvoiceForm({
  encounter,
  defaultAmount,
}: {
  encounter: Encounter;
  defaultAmount?: number;
}) {
  const [state, formAction, isPending] = useActionState<
    InvoiceState,
    FormData
  >(createInvoiceAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const hiddenName =
    encounter.kind === "appointment" ? "appointment_id" : "consultation_id";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name={hiddenName} value={encounter.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Valor (AOA)" required>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="1"
            inputMode="decimal"
            required
            placeholder="Ex.: 15000"
            defaultValue={defaultAmount ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Validade (dias)">
          <input
            name="due_days"
            type="number"
            min="1"
            max="365"
            defaultValue={30}
            className={inputClass}
          />
        </Field>
        <Field label="Descrição (opcional)">
          <input
            name="description"
            placeholder="Ex.: Consulta de telemedicina"
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
      {state?.ok && state.invoiceId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <span>Fatura emitida com sucesso.</span>
          <Link
            href={`/api/fatura/${state.invoiceId}/pdf`}
            target="_blank"
            rel="noopener"
            className="font-semibold underline hover:text-emerald-900"
          >
            Descarregar comprovativo →
          </Link>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A emitir…" : "Emitir fatura"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}
