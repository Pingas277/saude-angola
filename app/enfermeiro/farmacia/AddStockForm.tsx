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
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
      >
        + Adicionar medicamento
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-border bg-card p-5"
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
          className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/40"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60"
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
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2 sm:col-span-1" : ""}>
      <label className="mb-1 block text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
