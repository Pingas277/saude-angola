"use client";

import { useActionState } from "react";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { loginAction, type AuthState } from "../actions";
import AuthField from "../_components/AuthField";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      <AuthField
        id="email"
        name="email"
        label="Email"
        icon={Mail}
        type="email"
        autoComplete="email"
        required
        placeholder="seu@email.com"
      />

      <div>
        <AuthField
          id="password"
          name="password"
          label="Palavra-passe"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
        <div className="mt-1.5 text-right">
          <a
            href="mailto:suporte@saudeangola.ao?subject=Recuperar%20palavra-passe"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Esqueceu a palavra-passe?
          </a>
        </div>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            A entrar…
          </>
        ) : (
          <>
            Entrar
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
