"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  updatePasswordAction,
  type UpdatePasswordState,
} from "../actions";

export default function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    UpdatePasswordState,
    FormData
  >(updatePasswordAction, null);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Nova palavra-passe
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="No mínimo 8 caracteres"
            className="block w-full rounded-xl border border-border bg-card pl-10 pr-10 py-2.5 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={
              showPassword
                ? "Esconder palavra-passe"
                : "Mostrar palavra-passe"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="password_confirm"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Confirmar palavra-passe
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password_confirm"
            name="password_confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Repita a nova palavra-passe"
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
            <Loader2 className="size-5 animate-spin" />A guardar…
          </>
        ) : (
          <>
            <ShieldCheck className="size-5" />
            Guardar e entrar
          </>
        )}
      </button>
    </form>
  );
}
