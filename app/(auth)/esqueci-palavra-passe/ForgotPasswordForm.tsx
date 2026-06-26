"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import {
  requestPasswordResetAction,
  type ResetState,
} from "../actions";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ResetState, FormData>(
    requestPasswordResetAction,
    null
  );

  // Once Supabase has accepted the request, swap the form for a success
  // card. The action returns sent=true on both 'real email exists' and
  // 'no such account' so attackers can't enumerate users.
  if (state?.sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-900">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">
              Verifique a sua caixa de entrada
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-emerald-900/90">
              Se essa conta existir, enviámos um link para escolher uma nova
              palavra-passe. Pode demorar até 2 minutos a chegar. Não se
              esqueça de ver na <strong>pasta de Spam</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="o.seu@email.ao"
            className="block w-full rounded-xl border border-border bg-card pl-10 pr-3.5 py-2.5 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-base font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" />A enviar…
          </>
        ) : (
          <>
            <Mail className="size-5" />
            Enviar link de recuperação
          </>
        )}
      </button>
    </form>
  );
}
