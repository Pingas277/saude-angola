"use client";

import { useActionState, useState } from "react";
import { mockPayMulticaixaAction, type PayState } from "../actions";

export default function MulticaixaForm({
  invoiceId,
  amount,
}: {
  invoiceId: string;
  amount: string;
}) {
  const [state, formAction, isPending] = useActionState<PayState, FormData>(
    mockPayMulticaixaAction,
    null
  );
  const [stage, setStage] = useState<"phone" | "confirm">("phone");
  const [phone, setPhone] = useState("");

  if (stage === "phone") {
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Número Multicaixa Express
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoFocus
            placeholder="+244 9XX XXX XXX"
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="mt-1 text-xs text-slate-500">
            Receberá uma notificação na aplicação Multicaixa Express para
            autorizar o pagamento de {amount}.
          </p>
        </div>

        <button
          type="button"
          disabled={!/^\+?244?\s?9\d{8}$/.test(phone.replace(/\s/g, ""))}
          onClick={() => setStage("confirm")}
          className="block w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continuar →
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <input type="hidden" name="phone" value={phone} />

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Para</span>
          <span className="font-medium text-slate-900">Saúde Angola</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-slate-500">Número</span>
          <span className="font-medium text-slate-900">{phone}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-slate-500">Valor</span>
          <span className="font-bold text-slate-900">{amount}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Ao confirmar, simulamos o pedido enviado à aplicação Multicaixa Express.
        Em produção, abriria a notificação no seu telemóvel para autorizar com
        PIN.
      </p>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setStage("phone")}
          disabled={isPending}
          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:flex-1"
        >
          Alterar número
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
        >
          {isPending ? "A confirmar pagamento…" : "Confirmar pagamento"}
        </button>
      </div>
    </form>
  );
}
