"use client";

import { useActionState, useEffect, useRef } from "react";
import { addStaffAction, type AddStaffState } from "./actions";
import { ROLE_LABELS } from "@/lib/labels";

export default function AddStaffForm() {
  const [state, formAction, isPending] = useActionState<AddStaffState, FormData>(
    addStaffAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Email do utilizador
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="medico@exemplo.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Função
          </label>
          <select
            name="role"
            defaultValue="doctor"
            required
            className={inputClass}
          >
            <option value="doctor">{ROLE_LABELS.doctor}</option>
            <option value="nurse">{ROLE_LABELS.nurse}</option>
            <option value="receptionist">{ROLE_LABELS.receptionist}</option>
            <option value="admin">{ROLE_LABELS.admin}</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="h-[38px] w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isPending ? "A adicionar…" : "Adicionar"}
          </button>
        </div>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}
      {state?.ok && state.added && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.added.name} adicionado(a) como {ROLE_LABELS[state.added.role] ?? state.added.role}.
        </div>
      )}

      <p className="text-xs text-slate-500">
        O utilizador deve já ter conta em /registar. Se não tiver, peça-lhe para
        se registar primeiro.
      </p>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
