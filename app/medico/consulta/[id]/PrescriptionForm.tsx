"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { issuePrescriptionAction, type RxState } from "./actions";

type MedRow = { key: number };

export type Encounter = {
  kind: "appointment" | "consultation";
  id: string;
};

export default function PrescriptionForm({
  encounter,
}: {
  encounter: Encounter;
}) {
  const [state, formAction, isPending] = useActionState<RxState, FormData>(
    issuePrescriptionAction,
    null
  );
  const [rows, setRows] = useState<MedRow[]>([{ key: 0 }]);
  const nextKey = useRef(1);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && state.prescriptionId) {
      formRef.current?.reset();
      setRows([{ key: nextKey.current++ }]);
      window.open(`/api/receita/${state.prescriptionId}/pdf`, "_blank", "noopener");
    }
  }, [state]);

  const hiddenName =
    encounter.kind === "appointment" ? "appointment_id" : "consultation_id";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name={hiddenName} value={encounter.id} />

      <div className="space-y-3">
        {rows.map((row, idx) => (
          <fieldset
            key={row.key}
            className="rounded-lg border border-slate-200 bg-slate-50/40 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Medicamento {idx + 1}
              </legend>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setRows((prev) => prev.filter((r) => r.key !== row.key))
                  }
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nome" className="sm:col-span-2">
                <input
                  name="med_name"
                  required={idx === 0}
                  placeholder="Ex.: Paracetamol 500mg"
                  className={inputClass}
                />
              </Field>
              <Field label="Dose">
                <input
                  name={`med_dosage_${idx}`}
                  placeholder="Ex.: 1 comprimido"
                  className={inputClass}
                />
              </Field>
              <Field label="Frequência">
                <input
                  name={`med_frequency_${idx}`}
                  placeholder="Ex.: 8/8 horas"
                  className={inputClass}
                />
              </Field>
              <Field label="Duração">
                <input
                  name={`med_duration_${idx}`}
                  placeholder="Ex.: 5 dias"
                  className={inputClass}
                />
              </Field>
              <Field label="Instruções">
                <input
                  name={`med_instructions_${idx}`}
                  placeholder="Ex.: Após as refeições"
                  className={inputClass}
                />
              </Field>
            </div>
          </fieldset>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { key: nextKey.current++ }])}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40"
      >
        + Adicionar medicamento
      </button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Validade da receita (dias)">
          <input
            name="expires_in_days"
            type="number"
            min={1}
            max={365}
            defaultValue={30}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notas para o paciente">
        <textarea
          name="notes"
          rows={2}
          placeholder="Ex.: Voltar à consulta em duas semanas"
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
      {state?.ok && state.prescriptionId && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Receita emitida com sucesso. O PDF foi aberto numa nova janela.{" "}
          <a
            href={`/api/receita/${state.prescriptionId}/pdf`}
            target="_blank"
            rel="noopener"
            className="font-semibold underline hover:text-emerald-900"
          >
            Descarregar PDF
          </a>
          .
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "A emitir…" : "Emitir receita"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
