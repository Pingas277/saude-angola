"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addStockItemAction, type StockState } from "./actions";

export default function AddStockForm() {
  const [state, formAction, isPending] = useActionState<StockState, FormData>(
    addStockItemAction,
    null
  );
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
      >
        + Adicionar medicamento
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Medicamento" wide>
          <input name="medication_name" required placeholder="Paracetamol 500mg" className={inputClass} />
        </Field>
        <Field label="Nome genérico">
          <input name="generic_name" placeholder="Paracetamol" className={inputClass} />
        </Field>
        <Field label="Quantidade">
          <input name="quantity" inputMode="numeric" placeholder="0" className={inputClass} />
        </Field>
        <Field label="Stock mínimo">
          <input name="minimum_stock" inputMode="numeric" placeholder="10" className={inputClass} />
        </Field>
        <Field label="Preço unit. (Kz)">
          <input name="unit_price" inputMode="decimal" placeholder="0" className={inputClass} />
        </Field>
        <Field label="Lote">
          <input name="batch_number" placeholder="—" className={inputClass} />
        </Field>
        <Field label="Validade">
          <input name="expiry_date" type="date" className={inputClass} />
        </Field>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
        >
          {isPending ? "A guardar…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2 sm:col-span-1" : ""}>
      <label className="mb-1 block text-xs font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
