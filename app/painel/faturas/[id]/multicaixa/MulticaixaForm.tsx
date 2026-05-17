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
          <label className="mb-1 block text-sm font-medium text-foreground">
            Número Multicaixa Express
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoFocus
            placeholder="+244 9XX XXX XXX"
            className="block w-full rounded-md border border-border bg-card px-3 py-2.5 text-base shadow-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Receberá uma notificação na aplicação Multicaixa Express para
            autorizar o pagamento de {amount}.
          </p>
        </div>

        <button
          type="button"
          disabled={!/^\+?244?\s?9\d{8}$/.test(phone.replace(/\s/g, ""))}
          onClick={() => setStage("confirm")}
          className="block w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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

      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Para</span>
          <span className="font-medium text-foreground">Saúde Angola</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground">Número</span>
          <span className="font-medium text-foreground">{phone}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground">Valor</span>
          <span className="font-bold text-foreground">{amount}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Ao confirmar, simulamos o pedido enviado à aplicação Multicaixa Express.
        Em produção, abriria a notificação no seu telemóvel para autorizar com
        PIN.
      </p>

      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setStage("phone")}
          disabled={isPending}
          className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 disabled:opacity-60 sm:flex-1"
        >
          Alterar número
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
        >
          {isPending ? "A confirmar pagamento…" : "Confirmar pagamento"}
        </button>
      </div>
    </form>
  );
}
